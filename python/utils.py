import os
import requests
import asyncio
import aiohttp


async def get_repo_info(repo_url, downloaded_files):
    response = requests.get(f"{repo_url}?")
    response.raise_for_status()

    # Get list of repo files
    data = response.json()["data"]
    files = data["siblings"]

    # Create an array of async HEAD requests to get the file sizes
    async def get_file_size(file):
        async with aiohttp.ClientSession() as session:
            async with session.head(f"{repo_url}/resolve/main/{file}") as response:
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
    # TODO
    pass


def get_quant_compression(quant):
    # TODO
    pass


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
