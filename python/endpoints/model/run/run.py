import os
import multiprocessing
import asyncio
import aiohttp
import json
import socket
from pathlib import Path
from loguru import logger
import signal
from enum import Enum
from mlc_llm.interface.serve import serve
from sqlalchemy import select
from db import get_db_session
from models import RunningModel
from state import global_state_manager
from endpoints.model.stop import stop_model_handler
from endpoints.model.install.install import convert_quantize_compile
from utils import (
    get_app_data_path,
    does_quantization_exist,
    is_convertable_format,
    get_model_size_info,
    get_usable_memory,
    get_tensor_parallelism,
)
from truffle_types import Quantization
from constants import TRUFFLE_API_URL
import sys
import subprocess


class Status(Enum):
    ACKNOWLEDGED = "ACKNOWLEDGED"
    INSTALLING = "INSTALLING"
    RUNNING = "RUNNING"
    STOPPED = "STOPPED"
    ERROR = "ERROR"


class ProgressEvent:
    def __init__(self, model_id: str, status: Status, instance: int, port: int, error: str = None):
        self.model_id = model_id
        self.status = status
        self.instance = instance
        self.port = port
        self.error = error

    def to_json(self):
        return json.dumps(
            {
                "id": self.model_id,
                "status": self.status.value,
                "instance": self.instance,
                "port": self.port,
                "error": self.error,
            }
        )

    def update(
        self,
        status: Status = None,
        instance: int = None,
        port: int = None,
        error: str = None,
    ):
        if status is not None:
            self.status = status
        if instance is not None:
            self.instance = instance
        if port is not None:
            self.port = port
        if error is not None:
            self.error = error

    def __str__(self):
        return f"data: {self.to_json()}\n\n"


def find_port(port: int = 8899) -> int:
    """Find an open port."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        if (
            s.connect_ex(("localhost", port)) == 0
            or port in global_state_manager.model_manager.run_queue
        ):
            return find_port(port + 1)
        return port


async def get_instances(model_ids: list[str]) -> list[int]:
    # Get all of the running models
    async with get_db_session() as session:
        models = (await session.scalars(select(RunningModel))).all()
        # For each model ID, get the max instance number from the DB, increment it, then
        # add the number of instances from the model IDs array that will be starting before it
        instances = []
        for model_id in model_ids:
            # Filter models down to matching IDs
            matching_models = [model for model in models if model.id == model_id]

            # Get the max instance number for the model
            instances_to_run = [model for model in instances if model["model_id"] == model_id]
            instance = (
                max([model.instance for model in matching_models], default=0)
                + 1
                + len(instances_to_run)
            )
            instances.append({"model_id": model_id, "instance": instance})

        return instances


async def get_model_info(model_id: str) -> dict:
    async with global_state_manager.session.get(
        f"{TRUFFLE_API_URL}/models/{model_id}",
    ) as response:
        assert response.status == 200, f"Failed to fetch model {model_id}"
        return await response.json()


def get_gpu_memory_shares(
    configurations: list[str, Quantization], model_sizes: dict
) -> list[float]:
    total_score = 0
    for model_id, quant in configurations:
        total_score += global_state_manager.model_manager.get_score(
            model_id, quant, model_sizes[model_id]
        )

    return [
        (
            0.85
            * (
                global_state_manager.model_manager.get_score(model_id, quant, model_sizes[model_id])
                / total_score
            )
        )
        for model_id, quant in configurations
    ]


def check_disk_space(size: int) -> bool:
    (
        _,
        disk_space,
        bytes_remaining,
    ) = global_state_manager.model_manager.get_space_check_info()
    if size + bytes_remaining < disk_space:
        return True

    raise ValueError("Not enough space")


def check_memory_space(weights_path: Path, quant: Quantization, run: bool) -> bool:
    model_size, _ = get_model_size_info(weights_path, quant)
    available_ram = get_usable_memory(run)

    if model_size < available_ram:
        return True

    raise ValueError("Not enough memory")


def cancel_models(conversions: list, i: int):
    # Cancel all conversions that have not yet been started
    models_to_cancel = [
        {
            "model_path": get_app_data_path() / "models" / canceled_conversion["model_id"],
            "quantization": canceled_conversion["quant"],
        }
        for canceled_conversion in conversions[i:]
    ]
    global_state_manager.model_manager.cancel_conversions(models_to_cancel)


def serve_model(model_path: Path, mem_share: float, port: int, shards: int):
    # This is a wrapper around the base serve function to make it cleaner to spawn from
    # multiprocess.Process

    # Set session ID to make the model process a group leader
    os.setsid()

    # Start the model server
    serve(
        model=str(model_path),
        device="auto",
        model_lib=str(model_path / "compilation.so"),
        mode="interactive",
        additional_models=[],  # Not relevant
        tensor_parallel_shards=shards,
        max_num_sequence=None,
        enable_debug=False,
        # This lets the AsyncMLEngine determine the max sequence length based on vRAM
        max_total_sequence_length=None,
        max_single_sequence_length=None,
        prefill_chunk_size=None,  # This lets the AsyncMLEngine automatically determine
        sliding_window_size=None,
        attention_sink_size=None,
        max_history_size=None,  # Not relevant
        gpu_memory_utilization=mem_share,
        speculative_mode="disable",  # TODO: Decide if we want to enable this
        spec_draft_length=4,
        prefix_cache_mode="disable",
        prefix_cache_max_num_recycling_seqs=None,
        enable_tracing=False,
        host="0.0.0.0",
        port=port,
        allow_credentials=["*"],
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )


async def is_server_running(port: int, timeout: int = 120) -> bool:
    seconds_elapsed = 0
    url = f"http://localhost:{port}/v1/models"
    logger.info(f"Checking if server is running at {url}")

    # Check if the server is running and the endpoints are accessible
    while seconds_elapsed < timeout:
        try:
            async with global_state_manager.session.get(url) as response:
                return response.status == 200
        except Exception as e:
            pass
        await asyncio.sleep(1)
        seconds_elapsed += 1
        logger.debug(f"Retry in 1 second. Elapsed time: {seconds_elapsed} seconds.")

    logger.error("Server did not start within the timeout period.")
    return False


async def run_model(
    model_id: str, quantization: Quantization, mem_share: float, instance: int, port: int
) -> ProgressEvent:
    # Identify the necessary info to launch the model
    model_path = get_app_data_path() / "models" / model_id / quantization.value
    model_info = await get_model_info(model_id)
    shards = get_tensor_parallelism(
        get_app_data_path() / "models" / model_id / "base",
        quantization,
    )

    # Start the model server as a separate process
    mlc_llm_path = Path(os.path.abspath(os.path.dirname(__file__))) / "mlc_llm_serve"
    proc = subprocess.Popen(
        [
            mlc_llm_path,
            model_path,
            "--model-lib",
            str(model_path / "compilation.so"),
            "--port",
            str(port),
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        start_new_session=True,
    )

    # Wait for the server to start and be available
    server_ready = await is_server_running(port)
    if not server_ready:
        proc.terminate()
        raise RuntimeError(f"Server at port {port} did not start in time")

    # Add the model to the running models database
    async with get_db_session() as session:
        session.add(
            RunningModel(
                id=model_id,
                instance=instance,
                name=model_info["name"],
                size=model_info["size"],
                pid=proc.pid,
                port=port,
                quantization=quantization.value,
            )
        )
        await session.commit()

    return ProgressEvent(model_id, Status.RUNNING, instance, port)


async def kill_models(models: list[ProgressEvent]):
    logger.info(f"Killing models: {models}")
    # Kill all of the running models and remove them from the database
    for model in models:
        await stop_model_handler(model.model_id, model.instance)


async def run_models_generator(model_ids: list[str]):
    """
    Run the models with the given IDs. If any model fails to quantize or run, the generator
    will yield an error event and stop running the models from this request. It is an all-
    or-nothing operation. This is reasonable because if a user request multiple models at
    once (a pro feature), they likely have some use case requiring all models to be running.
    If one fails it is better to stop them all than force the user to manually stop the others.

    Args:
        model_ids (list[str]): The list of model IDs to run

    Yields a string of the JSON representation of a ProgressEvent
    """

    for model_id in model_ids:
        acknowledgement_event = ProgressEvent(model_id, Status.ACKNOWLEDGED, None, None)
        yield str(acknowledgement_event)
        await asyncio.sleep(2)

    # Immediately reserve port numbers for the models
    ports = []
    for _ in model_ids:
        port = find_port()
        global_state_manager.model_manager.reserve_port(port)
        ports.append(port)

    # Determine optimal quantization for each model and determine its instance number
    logger.info("Determining optimal quantizations and instance numbers")
    try:
        model_sizes = {}
        for model_id in model_ids:
            model_sizes[model_id] = await global_state_manager.model_manager.get_model_size(
                model_id
            )

        configurations = (
            await global_state_manager.model_manager.get_adaptive_quantization_decision(model_ids)
        )
        quantizations = [config[1] for config in configurations]
        mem_shares = get_gpu_memory_shares(configurations, model_sizes)
        instance_numbers = await get_instances(model_ids)
    except Exception as e:
        error_event = ProgressEvent(None, Status.INSTALLING, None, None, str(e))
        yield str(error_event)
        global_state_manager.model_manager.clear_reserved_ports(ports)
        return

    # Identify the models that need to be converted and quantized and sum their compressed sizes
    logger.info("Identifying models that need to be converted and quantized")
    total_compressed_size = 0
    conversions = []

    # This creates an ordered set of model IDs and quantizations
    for model_id, quant in list(dict.fromkeys(zip(model_ids, quantizations)).keys()):
        weights_path = get_app_data_path() / "models" / model_id / "base"

        # Check if the model is in a convertable format
        if not is_convertable_format(weights_path):
            error_event = ProgressEvent(
                model_id,
                Status.INSTALLING,
                None,
                None,
                "Model is not in a convertable format",
            )
            yield str(error_event)
            global_state_manager.model_manager.clear_reserved_ports(ports)
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
    try:
        check_disk_space(total_compressed_size)
    except Exception as e:
        error_event = ProgressEvent(None, Status.INSTALLING, None, None, str(e))
        yield str(error_event)
        global_state_manager.model_manager.clear_reserved_ports(ports)
        return

    # Add all of the conversions to the queue at once to avoid weird space calculations
    # or allowing a secondary run request to interfere with an earlier one
    for conversion in conversions:
        model_path = get_app_data_path() / "models" / conversion["model_id"]
        global_state_manager.model_manager.add_to_conversion_queue(
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
        while not global_state_manager.model_manager.is_models_conversion_turn(model_path, quant):
            await asyncio.sleep(5)

        # Check if there is enough memory to convert and quantize the model
        try:
            check_memory_space(weights_path, quant, False)
        except Exception as e:
            # Cancel all conversions that have not yet been started
            cancel_models(conversions, i)
            error_event = ProgressEvent(model_id, Status.INSTALLING, None, None, str(e))
            yield str(error_event)
            global_state_manager.model_manager.clear_reserved_ports(ports)
            return

        # Send quantization event
        quantization_event = ProgressEvent(model_id, Status.INSTALLING, None, None)
        yield str(quantization_event)

        # Perform the conversion and quantization
        try:
            global_state_manager.model_manager.remove_from_conversion_queue()
            convert_quantize_compile(weights_path, quant_path, quant)
        except Exception as e:
            error_event = ProgressEvent(model_id, Status.INSTALLING, None, None, str(e))
            yield str(error_event)
            global_state_manager.model_manager.clear_reserved_ports(ports)
            return
        global_state_manager.model_manager.complete_conversion()

    # Now that all missing quantizations have been created, run the models
    models_started = []
    for model_id, quant, mem_share, instance_obj, port in zip(
        model_ids, quantizations, mem_shares, instance_numbers, ports
    ):
        logger.info(f"Running model {model_id}")
        instance = instance_obj["instance"]

        # Check if there is enough memory to run the model
        model_path = get_app_data_path() / "models" / model_id
        weights_path = model_path / "base"

        try:
            check_memory_space(model_path / quant.value, quant, True)
        except Exception as e:
            error_event = ProgressEvent(model_id, Status.RUNNING, instance, None, str(e))
            yield str(error_event)
            await kill_models(models_started)
            global_state_manager.model_manager.clear_reserved_ports(ports)
            return

        # Start the model server
        try:
            result = await run_model(model_id, quant, mem_share, instance, port)
            models_started.append(result)
            logger.info(f"Model {model_id} started on port {port}")
            yield str(result)
        except Exception as e:
            logger.error(f"Error running model {model_id}: {e}")
            import traceback

            logger.error(
                f"""Error running model {model_id}: {
                    e}\n{traceback.format_exc()}"""
            )
            error_event = ProgressEvent(model_id, Status.RUNNING, instance, None, str(e))
            yield str(error_event)
            await kill_models(models_started)
            global_state_manager.model_manager.clear_reserved_ports(ports)
            return

    logger.info("All models started successfully")
    global_state_manager.model_manager.clear_reserved_ports(ports)
    return
