import multiprocessing
import asyncio
import aiohttp
import json
from pathlib import Path
from loguru import logger
from mlc_llm.interface.serve import serve
from endpoints.model.stop import stop_model_handler
import endpoints.model.install.install as install
import endpoints.model.install.InstallationManager as InstallationManager
from endpoints.model.run.adaptive_quantization_decision import (
    get_score,
    get_adaptive_quantization_decision,
)
from utils import (
    get_app_data_path,
    find_port,
    does_quantization_exist,
    is_convertable_format,
    get_model_size_info,
    get_usable_memory,
    get_tensor_parallelism,
)
from db import db
from truffle_types import Quantization
from constants import TRUFFLE_API_URL


async def get_instances(model_ids: list[str]) -> list[int]:
    # Get all of the running models
    models = await db.runningmodels.find_many()

    # For each model ID, get the max instance number from the DB, increment it, then
    # add the number of instances from the model IDs array that will be starting before it
    instances = []
    for model_id in model_ids:
        # Filter models down to matching IDs
        matching_models = [model for model in models if model.id == model_id]

        # Get the max instance number for the model
        instances_to_run = [
            model for model in instances if model["model_id"] == model_id
        ]
        instance = (
            max([model.instance for model in matching_models], default=0)
            + 1
            + len(instances_to_run)
        )
        instances.append({"model_id": model_id, "instance": instance})

    return instances


async def get_model_info(model_id: str) -> dict:
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{TRUFFLE_API_URL}/models?id={model_id}") as response:
            assert response.status == 200, f"Failed to fetch model {model_id}"
            return await response.json()


async def get_gpu_memory_shares(configurations: list[str, Quantization]) -> list[float]:
    total_score = await get_score(configurations)
    return [
        (await get_score([configuration]) / total_score)
        for configuration in configurations
    ]


def serve_model(model_path: Path, mem_share: float, port: int, shards: int):
    # This is a wrapper around the base serve function to make it cleaner to spawn from
    # multiprocess.Process
    serve(
        model=str(model_path),
        device="auto",
        model_lib=str(model_path / "compilation.so"),
        mode="local",
        additional_models=[],  # Not relevant
        tensor_parallel_shards=shards,
        max_batch_size=1,
        # This lets the AsyncMLEngine determine the max sequence length based on vRAM
        max_total_sequence_length=None,
        prefill_chunk_size=None,  # This lets the AsyncMLEngine automatically determine
        max_history_size=None,  # Not relevant
        gpu_memory_utilization=mem_share,
        speculative_mode="disable",  # TODO: Decide if we want to enable this
        spec_draft_length=4,
        enable_tracing=False,
        host="127.0.0.1",
        port=port,
        allow_credentials=["*"],
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )


async def is_server_running(port: int, timeout: int = 120) -> bool:
    seconds_elapsed = 0
    url = f"http://localhost:{port}/v1/models"

    # Check if the server is running and the endpoints are accessible
    while seconds_elapsed < timeout:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    return response.status == 200
        except Exception as e:
            pass

        await asyncio.sleep(1)
        seconds_elapsed += 1

    return False


async def run_model(
    model_id: str, quantization: Quantization, mem_share: float, instance: int
) -> dict:
    # Identify the necessary info to launch the model
    model_path = get_app_data_path() / "models" / model_id / quantization.value
    model_info = await get_model_info(model_id)
    port = find_port()
    shards = get_tensor_parallelism(
        get_app_data_path() / "models" / model_id / "base",
        quantization,
    )

    # Start the model server as a separate process
    proc = multiprocessing.Process(
        target=serve_model, args=(model_path, mem_share, port, shards)
    )
    proc.start()

    # Wait for the server to start and be available
    server_ready = await is_server_running(port)
    if not server_ready:
        proc.terminate()
        raise RuntimeError(f"Server at port {port} did not start in time")

    # Add the model to the running models database
    await db.runningmodels.create(
        {
            "id": model_id,
            "instance": instance,
            "name": model_info["name"],
            "size": model_info["size"],
            "pid": proc.pid,
            "port": port,
            "quantization": quantization.value,
        }
    )

    return {
        "id": model_id,
        "status": "RUNNING",
        "instance": instance,
        "port": port,
        "error": None,
    }


async def kill_models(models: list[dict]):
    # Kill all of the running models and remove them from the database
    for model in models:
        await stop_model_handler(model["id"], model["instance"])


async def run_models_generator(
    model_ids: list[str], installation_manager: InstallationManager
):
    """
    Run the models with the given IDs. If any model fails to quantize or run, the generator
    will yield an error event and stop running the models from this request. It is an all-
    or-nothing operation. This is reasonable because if a user request multiple models at
    once (a pro feature), they likely have some use case requiring all models to be running.
    If one fails it is better to stop them all than force the user to manually stop the others.

    Args:
        model_ids (list[str]): The list of model IDs to run
        installation_manager (InstallationManager): The installation manager instance

    Yields:
        {
            "id": str,
            "status": str (ACKNOWLEDGED, INSTALLING, RUNNING)
            "instance": int,
            "port": int,
            "error": str
        }
    """

    for model_id in model_ids:
        acknowledgement_event = {
            "id": model_id,
            "status": "ACKNOWLEDGED",
            "instance": None,
            "port": None,
            "error": None,
        }
        yield f"data: {json.dumps(acknowledgement_event)}\n\n"

    # Determine optimal quantization for each model and determine its instance number
    logger.info("Determining optimal quantizations and instance numbers")
    configurations = await get_adaptive_quantization_decision(
        model_ids, installation_manager
    )
    quantizations = [config[1] for config in configurations]
    mem_shares = await get_gpu_memory_shares(configurations)
    instance_numbers = await get_instances(model_ids)

    # Identify the models that need to be converted and quantized and sum their compressed sizes
    logger.info("Identifying models that need to be converted and quantized")
    total_compressed_size = 0
    conversions = []

    # This creates an ordered set of model IDs and quantizations
    for model_id, quant in list(dict.fromkeys(zip(model_ids, quantizations)).keys()):
        weights_path = get_app_data_path() / "models" / model_id / "base"

        # Check if the model is in a convertable format
        if not is_convertable_format(weights_path):
            error_event = {
                "id": model_id,
                "status": "INSTALLING",
                "instance": None,
                "port": None,
                "error": "Model is not in a convertable format",
            }
            yield f"data: {json.dumps(error_event)}\n\n"
            return

        # Check if the quantization already exists
        if not does_quantization_exist(model_id, quant):
            _, compressed_size = get_model_size_info(weights_path, quant)
            total_compressed_size += compressed_size
            conversions.append(
                {
                    "model_id": model_id,
                    "quant": quant,
                    "compressed_size": compressed_size,
                }
            )

    # Check if there is enough disk space to convert and quantize the models
    # We check memory at time of conversion
    _, disk_space, bytes_remaining = install.get_space_check_info(installation_manager)
    if total_compressed_size + bytes_remaining > disk_space:
        logger.error("Not enough space to convert and quantize the models")
        error_event = {
            "id": None,
            "status": "INSTALLING",
            "instance": None,
            "port": None,
            "error": "Not enough space to convert and quantize the models",
        }
        yield f"data: {json.dumps(error_event)}\n\n"
        return

    # Add all of the conversions to the queue at once
    for conversion in conversions:
        model_path = get_app_data_path() / "models" / conversion["model_id"]
        installation_manager.add_to_conversion_queue(
            model_path, conversion["quant"], conversion["compressed_size"]
        )

    # Convert and quantize the models
    for i, conversion in enumerate(conversions):
        logger.info(
            f"""Converting, quantizing, and compiling model {
                conversion['model_id']}"""
        )
        model_id = conversion["model_id"]
        quant = conversion["quant"]
        model_path = get_app_data_path() / "models" / model_id
        weights_path = model_path / "base"
        quant_path = model_path / quant.value

        # Wait for the model to be the next in line for conversion in the global queue
        while not installation_manager.is_models_conversion_turn(model_path, quant):
            await asyncio.sleep(5)

        # Check if there is enough memory to convert and quantize the model
        model_size, _ = get_model_size_info(weights_path, quant)
        available_ram = get_usable_memory()
        if model_size > available_ram:
            logger.error(
                f"Not enough memory to convert and quantize the model {model_id}"
            )
            error_event = {
                "id": model_id,
                "status": "INSTALLING",
                "instance": None,
                "port": None,
                "error": "Not enough memory to convert and quantize the model",
            }
            yield f"data: {json.dumps(error_event)}\n\n"
            models_to_cancel = [
                {
                    "model_path": get_app_data_path()
                    / "models"
                    / canceled_conversion["model_id"],
                    "quantization": canceled_conversion["quant"],
                }
                for canceled_conversion in conversions[i:]
            ]
            installation_manager.cancel_conversions(models_to_cancel)
            return

        # Send quantization event
        quantization_event = {
            "id": model_id,
            "status": "INSTALLING",
            "instance": None,
            "port": None,
            "error": None,
        }
        yield f"data: {json.dumps(quantization_event)}\n\n"

        # Perform the conversion and quantization
        installation_manager.remove_from_conversion_queue()
        install.convert_quantize_compile(weights_path, quant_path, quant)
        installation_manager.complete_conversion()

    # Now that all missing quantizations have been created, run the models
    models_started = []
    for model_id, quant, mem_share, instance_obj in zip(
        model_ids, quantizations, mem_shares, instance_numbers
    ):
        logger.info(f"Running model {model_id}")
        instance = instance_obj["instance"]

        # Check if there is enough memory to run the model
        available_ram = get_usable_memory()
        model_path = get_app_data_path() / "models" / model_id
        weights_path = model_path / "base"
        model_size, _ = get_model_size_info(weights_path, quant)
        if model_size > available_ram:
            error_event = {
                "id": model_id,
                "status": "RUNNING",
                "instance": instance,
                "port": None,
                "error": "Not enough memory to run the model",
            }
            yield f"data: {json.dumps(error_event)}\n\n"
            await kill_models(models_started)
            return

        # Start the model server
        try:
            result = await run_model(model_id, quant, mem_share, instance)
            models_started.append(result)
            logger.info(f"Model {model_id} started on port {result['port']}")
            yield f"data: {json.dumps(result)}\n\n"
        except Exception as e:
            logger.error(f"Error running model {model_id}: {e}")
            error_event = {
                "id": model_id,
                "status": "RUNNING",
                "instance": instance,
                "port": None,
                "error": str(e),
            }
            yield f"data: {json.dumps(error_event)}\n\n"
            await kill_models(models_started)
            return

    return
