import os
import json
import platform
import psutil
import requests
from utils import get_repo_info


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
                "cmd": "SYSINFO",
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
                "error" string?
            }
    """

    # Get OS name
    os_name = platform.system()

    # Select PIDs for current running models
    # TODO: Implement this
    running_models = []

    # Check memory usage for each PID
    models = []
    try:
        for model in running_models:
            p = psutil.Process(model["pid"])
            ram_usage = p.memory_info().rss
            models.append({
                "id": model["id"],
                "ram_usage": ram_usage
            })
    except Exception as e:
        return {
            "cmd": "SYSINFO",
            "os": os_name,
            "ram_used": 0,
            "ram_total": 0,
            "disk_used": 0,
            "disk_total": 0,
            "models": [],
            "error": str(e)
        }

    # Get global memory usage
    memory_info = psutil.virtual_memory()
    ram_used = memory_info.used
    ram_total = memory_info.total

    # Get global disk usage
    disk_info = psutil.disk_usage("/")
    disk_used = disk_info.used
    disk_total = disk_info.total

    return {
        "cmd": "SYSINFO",
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
            {
                "cmd": "GET_MODEL_STATE",
                "models": [
                    {
                        "pid": number,
                        "port": number,
                        "id": UUID,
                        "name": string,
                        "quantization": "no-quant" | "int4" | "int3",
                        "size": number,
                        "status": "RUNNING" | "DOWNLOADING" | "QUEUED" | "INSTALLING" | "STOPPED"
                        "error": string?
                    }
                ]
            }
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

    return {
        "cmd": "GET_MODEL_STATE",
        "models": models
    }


async def download_model(app_data_path, model_name, websocket):
    """
        Downloads the model from HuggingFace

        Args:
            app_data_path: string
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
                "cmd": "DOWNLOAD_MODEL",
                "name": string,
                "path": string,
                "progress": number?
                "error": string?
            }
    """

    save_path = os.path.abspath(os.path.join(
        app_data_path, f"models/{model_name}/base"))
    base_url = f"https://huggingface.co/{model_name}"

    # Check if model is already downloaded or partially downloaded
    # TODO: Implement this
    fully_downloaded = False
    downloaded_files = []

    if fully_downloaded:
        return {
            "cmd": "DOWNLOAD_MODEL",
            "name": model_name,
            "path": save_path,
            "progress": 100,
            "error": None
        }

    # Push model to info table with status "DOWNLOADING"
    # TODO: Implement this

    # Identify size of the download
    files, total_size = await get_repo_info(base_url)
    free_space = psutil.disk_usage("/").free

    if total_size > free_space:
        return {
            "cmd": "DOWNLOAD_MODEL",
            "name": model_name,
            "path": None,
            "progress": None,
            "error": "Insufficient disk space"
        }

    # Download the model
    downloaded_bytes = 0
    last_progress = 0.0
    for file in files:
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
                        "name": model_name,
                        "path": save_path,
                        "progress": progress
                    }))

    # Update model status in info table to "QUEUED"
    # TODO: Implement this

    return {
        "cmd": "DOWNLOAD_MODEL",
        "name": model_name,
        "path": save_path,
        "progress": 100,
        "error": None
    }
