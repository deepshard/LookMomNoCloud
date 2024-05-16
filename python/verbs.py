import os
import json
import platform
import psutil
import shutil
import requests
from loguru import logger
from mlc_llm.interface.convert_weight import convert_weight as convert_weight_mlc
from mlc_llm.support.auto_config import detect_config, detect_model_type
from mlc_llm.support.auto_weight import detect_weight
from mlc_llm.support.auto_device import detect_device
from mlc_llm.quantization import QUANTIZATION
from mlc_llm.interface.gen_config import gen_config as gen_config_mlc
from pathlib import Path
from utils import get_app_data_path, get_repo_info, get_conv_template, get_quant_compression, select_quantization, is_convertable_format


def sysinfo():
    """
        Returns the system information

        - Get OS name
        - Select PIDs for current running models
        - Check memory usage for each PID
        - Get global memory usage
        - Get total global system memory
        - Get global disk usage
        - Get total global disk space

        Returns:
            {
                "os": "MAC" | "LINUX",
                "ram_used": number,
                "ram_total": number,
                "disk_used": number,
                "disk_total": number,
                "models": [
                    {
                        "id": UUID,
                        "ram_usage": number
                    }
                ]
            }
    """

    # Get OS name
    os_name = platform.system()

    # Select PIDs for current running models
    # TODO: Implement this
    running_models = []

    # Check memory usage for each PID
    models = []
    for model in running_models:
        p = psutil.Process(model["pid"])
        ram_usage = p.memory_info().rss
        models.append({
            "id": model["id"],
            "ram_usage": ram_usage
        })

    # Get global memory usage
    memory_info = psutil.virtual_memory()
    ram_used = memory_info.total - memory_info.available
    ram_total = memory_info.total

    # Get global disk usage
    disk_info = shutil.disk_usage("/")
    disk_used = disk_info.used
    disk_total = disk_info.total

    return {
        "os": os_name,
        "ram_used": ram_used,
        "ram_total": ram_total,
        "disk_used": disk_used,
        "disk_total": disk_total,
        "models": models
    }


def get_model_state():
    """
        Returns the states of all models in the system

        - Select all models from info table
        - Validate all processes are still in the expected state
        - Return the states of all models

        Returns:
            [
                {
                    "pid": number,
                    "port": number,
                    "id": UUID,
                    "name": string,
                    "quantization": "no-quant" | "int4" | "int3",
                    "size": number,
                    "status": "RUNNING" | "DOWNLOADING" | "QUEUED" | "INSTALLING" | "STOPPED"
                }
            ]
    """

    # Select all models from info table
    models = []

    # Validate all processes are still in the expected state
    for model in models:
        try:
            p = psutil.Process(model["pid"])
            if p.status() == psutil.STATUS_ZOMBIE:
                model["status"] = "STOPPED"
        except psutil.NoSuchProcess:
            model["status"] = "STOPPED"

    return models


async def download_model(model_name, websocket):
    """
        Downloads the model from HuggingFace

        Args:
            model_name: string
            websocket: WebSocket

        - Check if model is already downloaded or partially downloaded
        - Push model to info table with status "DOWNLOADING"
        - Identify size of the download
        - Download the model
        - Update model status in info table to "QUEUED"
        - Return the download information

        Returns:
            {
                "name": string,
                "path": string,
                "progress": number?
            }
    """

    save_path = os.path.abspath(os.path.join(
        get_app_data_path(), f"models/{model_name}/base"))
    base_url = f"https://huggingface.co/{model_name}"

    # Check if model is already downloaded or partially downloaded
    # TODO: Implement this
    fully_downloaded = False
    downloaded_files = []

    if fully_downloaded:
        return {
            "name": model_name,
            "path": save_path,
            "progress": 100
        }

    # Push model to info table with status "DOWNLOADING"
    # TODO: Implement this

    # Identify size of the download
    logger.info(f"Getting info for {model_name}")
    files, total_size = await get_repo_info(base_url, downloaded_files)
    logger.info(f"Downloading {model_name} with size {total_size} bytes")

    free_space = psutil.disk_usage("/").free
    if total_size > free_space:
        raise ValueError("Insufficient disk space")

    # Download the model
    downloaded_bytes = 0
    last_progress = 0.0
    for file in files:
        logger.info(f"Downloading {file['rfilename']}")

        url = f"{base_url}/resolve/main/{file['rfilename']}"
        response = requests.get(url, stream=True)
        response.raise_for_status()

        with open(os.path.join(save_path, file["rfilename"]), "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                downloaded_bytes += len(chunk)

                progress = downloaded_bytes / total_size * 100

                if progress - last_progress >= 0.01:
                    last_progress = progress
                    await websocket.send_text(json.dumps({
                        "cmd": "DOWNLOAD_MODEL",
                        "data": {
                            "name": model_name,
                            "path": save_path,
                            "progress": progress
                        }
                    }))

    # Update model status in info table to "QUEUED"
    # TODO: Implement this

    return {
        "name": model_name,
        "path": save_path,
        "progress": 100
    }


async def convert_weights(model_name, quant, websocket):
    """
        Converts the weights of the model to the selected quantization
        in Truffle format

        Args:
            model_name: string
            quant: "no-quant" | "int4" | "int3"
            websocket: WebSocket

        - Check if model already has desired quantization built
        - Update model status in info table to "INSTALLING"
        - Identify necessary info for conversion
        - Convert model
        - Update model status in info table to "STOPPED"

        Returns:
            {
                "name": string,
                "path": string,
                "quant": "no-quant" | "int4" | "int3",
                "status": "IN_PROGRESS" | "FINISHED",
            }
    """

    # Check if model already has desired quantization built
    quant_path = os.path.abspath(os.path.join(
        get_app_data_path(), f"models/{model_name}/{quant}"))
    if os.path.exists(quant_path):
        return {
            "name": model_name,
            "path": quant_path,
            "quant": quant,
            "status": "FINISHED"
        }

    # Check that the base weights exist
    base_path = os.path.abspath(os.path.join(
        get_app_data_path(), f"models/{model_name}/base"))
    if not os.path.exists(base_path):
        raise ValueError("Base weights not found")

    # Check that base weights are in a valid convertable format
    if not is_convertable_format(base_path):
        raise ValueError("Invalid base weights format")

    # Check that there is enough space and memory to convert the weights
    system_ram = psutil.virtual_memory().total
    disk_space = psutil.disk_usage("/").free
    model_size = sum(os.path.getsize(os.path.join(base_path, f))
                     for f in os.listdir(base_path))
    compression_rate = get_quant_compression(quant)
    if ((model_size * compression_rate) > disk_space) or model_size > system_ram:
        raise ValueError("Insufficient disk space or memory")

    # Update model status in info table to "INSTALLING"
    # TODO: Implement this

    # Identify necessary info for conversion
    config = detect_config(base_path)
    model = detect_model_type("auto", config)
    source, source_format = detect_weight(
        weight_path=config.parent,
        config_json_path=config,
        weight_format="auto",
    )
    device = detect_device("auto")
    conv_template = get_conv_template(model_name)

    # Convert model
    await websocket.send_text(json.dumps({
        "cmd": "CONVERT_WEIGHTS",
        "data": {
            "name": model_name,
            "path": None,
            "quant": quant,
            "status": "IN_PROGRESS"
        }
    }))
    convert_weight_mlc(
        config=config,
        quantization=quant,  # TODO: fix this to actually pull the quantization object
        model=model,
        device=device,
        source=source,
        source_format=source_format,
        output=quant_path
    )
    gen_config_mlc(
        config=config,
        model=model,
        quantization=quant,  # TODO: fix this to actually pull the quantization object
        conv_template=conv_template,
        context_window_size=None,
        sliding_window_size=None,
        prefill_chunk_size=None,
        attention_sink_size=None,
        tensor_parallel_shards=None,
        max_batch_size=1,
        output=Path(quant_path),
    )
