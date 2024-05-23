import os
import platform
import subprocess
import requests
import asyncio
import aiohttp
import socket
from pathlib import Path
from loguru import logger


def get_disk_usage(folder_path):
    total_size = 0
    with os.scandir(folder_path) as dir_entries:
        for entry in dir_entries:
            if entry.is_file():
                total_size += entry.stat().st_size
            elif entry.is_dir():
                total_size += get_disk_usage(entry.path)
    return total_size


def get_app_data_path():
    system = platform.system()

    if system == "Windows":
        return Path(os.getenv("APPDATA")) / "truffle-app"
    elif system == "Darwin":
        return Path(os.path.expanduser("~/Library/Application Support")) / "truffle-app"
    elif system == "Linux":
        return Path(os.path.expanduser("~/.config")) / "truffle-app"
    else:
        raise ValueError(f"Unsupported system: {system}")


async def get_repo_info(model_name, repo_url, downloaded_files):
    logger.info(f"Getting repo info for {model_name}")
    if len(downloaded_files) > 0:
        logger.info(f"Already downloaded files: {downloaded_files}")
    response = requests.get(f"https://huggingface.co/api/models/{model_name}?")
    response.raise_for_status()
    logger.info(f"Repo info response: {response.json()}")

    # Get list of repo files
    data = response.json()
    files = data["siblings"]

    # Create an array of async HEAD requests to get the file sizes
    logger.info(f"Getting file sizes for {len(files)} files")

    async def get_file_size(file):
        async with aiohttp.ClientSession() as session:
            async with session.head(f"{repo_url}/resolve/main/{file}", allow_redirects=True) as response:
                return file, int(response.headers["Content-Length"])

    tasks = []
    for file in files:
        if not file["rfilename"]:
            raise ValueError(f"Missing rfilename for {file}")

        if file["rfilename"] in downloaded_files:
            continue

        tasks.append(get_file_size(file["rfilename"]))

    # Sum the file sizes
    total_size = 0
    for task in asyncio.as_completed(tasks):
        file, size = await task
        total_size += size

    return files, total_size


def get_conv_template(model_name):
    return "llama-3"


def get_quant_compression(quant):
    quantization_compression_table = {
        "int3": 0.25,
        "int4": 0.33,
        "int8": 0.55
    }
    return quantization_compression_table[quant]


def select_quantization(model_name, running_models):
    # TODO
    return "int4"


def is_convertable_format(weight_path):
    pytorch_json_path = os.path.join(
        weight_path, "pytorch_model.bin.index.json")
    pytorch_bin_path = os.path.join(weight_path, "pytorch_model.bin")
    safetensors_path = os.path.join(
        weight_path, "model.safetensors.index.json")
    safetensors_bin_path = os.path.join(weight_path, "model.safetensors")

    if (
        os.path.exists(pytorch_json_path) or
        os.path.exists(pytorch_bin_path) or
        os.path.exists(safetensors_path) or
        os.path.exists(safetensors_bin_path)
    ):
        return True


def check_process(pid):
    """Check if there's a process running with the given PID."""
    try:
        subprocess.check_output(["ps", "-p", str(pid)])
        return True
    except subprocess.CalledProcessError:
        return False


def check_port(pid, port):
    """Check if the correct process is using the given port."""
    try:
        result = subprocess.check_output(["lsof", "-i", f":{port}"])
        return str(pid) in result.decode("utf-8")
    except subprocess.CalledProcessError:
        return False


def find_port(port=8899):
    """Find an open port."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        if s.connect_ex(("localhost", port)) == 0:
            return find_port(port + 1)
        return port
