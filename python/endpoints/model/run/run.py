import multiprocessing
import asyncio
import aiohttp
from mlc_llm.interface.serve import serve
from python.utils import get_app_data_path, find_port
from python.db import db


async def get_instances(model_ids: list[str]) -> list[int]:
    models = await db.runningmodels.find_many()

    instances = []
    for model_id in model_ids:
        # Filter models down to matching IDs
        matching_models = [model for model in models if model.id == model_id]

        # Get the max instance number for the model
        instance = max(
            [model.instance for model in matching_models], default=0) + 1
        instances.append(instance)

    return instances


async def get_model_info(model_id: str) -> dict:
    # TODO: Properly implement this when the HF scraping API is ready
    return {
        "name": "meta-llama/Meta-Llama-3-8B",
        "size": 8000000000
    }


def adaptive_quantization_decision(model_ids: list[str]) -> list[str]:
    # NOTE: We will make this more sophisticated in the future
    quantization_compression_table = {
        "INT3": 0.25,
        "INT4": 0.33,
        "INT8": 0.55
    }
    return ["INT4" for _ in model_ids]


def serve_model(model_path: str, port: int):
    serve(
        model=model_path,
        device="auto",
        model_lib=None,
        mode="local",
        max_batch_size=1,
        max_total_sequence_length=2048,  # TODO: pull this from config
        prefill_chunk_size=None,  # TODO: look into this param
        max_history_size=None,  # TODO: look into this param
        gpu_memory_utilization=None,  # TODO: look into this param
        speculative_mode="disable",  # TODO: look into this param
        spec_draft_length=4,  # TODO: look into this param
        enable_tracing=False,  # TODO: look into this param
        host="127.0.0.1",
        port=port,
        allow_credentials=["*"],
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )


async def is_server_running(port: int, timeout: int = 60) -> bool:
    seconds_elapsed = 0
    url = f"http://localhost:{port}/v1/models"

    while seconds_elapsed < timeout:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    return response.status == 200
        except aiohttp.ClientConnectorError:
            pass

        await asyncio.sleep(1)
        seconds_elapsed += 1

    return False


async def run_model(model_id: str, instance: int, quantization: str) -> dict:
    model_path = get_app_data_path() / "models" / model_id / quantization
    model_info = get_model_info(model_id)
    port = find_port()

    proc = multiprocessing.Process(target=serve_model, args=(model_path, port))
    proc.start()

    server_ready = await is_server_running(port)
    if not server_ready:
        raise RuntimeError(f"Server at port {port} did not start in time")

    await db.runningmodels.create(
        {
            "id": model_id,
            "instance": instance,
            "name": model_info["name"],
            "size": model_info["size"],
            "pid": proc.pid,
            "port": port,
            "quantization": quantization
        }
    )

    return {
        "id": model_id,
        "instance": instance,
        "port": port,
    }


async def run_models(model_ids: list[str]) -> list[dict]:
    # Determine optimal quantization for each model and determine its instance number
    quantizations = adaptive_quantization_decision(model_ids)
    instance_numbers = get_instances(model_ids)

    # Run each model
    results = []
    for model_id, instance, quantization in zip(model_ids, instance_numbers, quantizations):
        result = await run_model(model_id, instance, quantization)
        results.append(result)

    return results
