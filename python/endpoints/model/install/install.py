import os
import json
import aiohttp
from aiofiles import open as aiofiles_open
import asyncio
import psutil
from uuid import uuid4
from pathlib import Path
from loguru import logger
from mlc_llm.interface.convert_weight import convert_weight as convert_weight_mlc
from mlc_llm.support.auto_config import detect_config, detect_model_type
from mlc_llm.support.auto_weight import detect_weight
from mlc_llm.support.auto_device import detect_device
from mlc_llm.quantization import QUANTIZATION
from mlc_llm.interface.gen_config import gen_config as gen_config_mlc
from truffle_types import RepoType, FileInfo, Quantization
from utils import (
    get_app_data_path,
    does_quantization_exist,
    is_convertable_format,
    get_model_size_info,
    get_usable_memory,
)
from endpoints.model.install.InstallationManager import InstallationManager

HF_AUTH_HEADER = {"Authorization": f"Bearer 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"}


def get_url_type(url: str) -> RepoType:
    # TODO: Change this later when we may start accepting S3 URLs
    return RepoType.HF


def get_hf_name_for_url(url: str) -> str:
    url_parts = url.split("/")
    author = url_parts[-2]
    model_name = url_parts[-1]

    return f"{author}/{model_name}"


async def get_file_size_hf(url: str, file: str) -> tuple[str, int]:
    async with aiohttp.ClientSession(headers=HF_AUTH_HEADER) as session:
        async with session.head(
            f"{url}/resolve/main/{file}", allow_redirects=True
        ) as response:
            return file, int(response.headers["Content-Length"])


async def get_hf_repo_info(model_name: str) -> list[FileInfo]:
    # Query the HF API to get the requisite info
    url = f"https://huggingface.co/api/models/{model_name}?"
    async with aiohttp.ClientSession(headers=HF_AUTH_HEADER) as session:
        async with session.get(url) as response:
            response.raise_for_status()
            data = await response.json()

    # Get list of repo files
    files = data.get("siblings", [])
    if not files:
        raise ValueError(f"Could not find any files for {model_name}")

    tasks = []
    for file in files:
        if not file["rfilename"]:
            raise ValueError(f"Missing rfilename for {file}")

        tasks.append(
            get_file_size_hf(f"https://huggingface.co/{model_name}", file["rfilename"])
        )

    # Get the file sizes
    files_to_download = await asyncio.gather(*tasks)
    return [FileInfo(file=file, size=size) for file, size in files_to_download]


def get_local_files(directory: str) -> list[FileInfo]:
    files = []

    # Get all files, including in sub-directories
    for root, _, filenames in os.walk(directory):
        for filename in filenames:
            file_path = os.path.join(root, filename)
            size = os.path.getsize(file_path)

            relative_path = os.path.relpath(file_path, directory)
            files.append(FileInfo(file=relative_path, size=size))

    return files


def get_files_to_download(
    remote_files: list[FileInfo], local_files: list[FileInfo]
) -> list[FileInfo]:
    # Get the files that need to be downloaded
    remote_files_dict = {file.file: file.size for file in remote_files}
    local_files_dict = {file.file: file.size for file in local_files}

    files_to_download = []
    for file, size in remote_files_dict.items():
        if file not in local_files_dict or local_files_dict[file] < size:
            files_to_download.append(FileInfo(file=file, size=size))

    return files_to_download


async def get_repo_info(url: str) -> list[FileInfo]:
    # Get repo type
    repo_type = get_url_type(url)
    if repo_type == RepoType.HF:
        model_name = get_hf_name_for_url(url)
        return await get_hf_repo_info(model_name)
    else:
        raise ValueError(f"Unsupported repo type: {repo_type}")


def get_file_download_url(url: str, file: str) -> str:
    repo_type = get_url_type(url)
    if repo_type == RepoType.HF:
        return f"{url}/resolve/main/{file}"
    else:
        raise ValueError(f"Unsupported repo type: {repo_type}")


def get_conv_template(base_weights_path: str) -> str:
    # NOTE: We can replace this with a more sophisticated method later
    return "LM"


def get_base_quantization_decision(base_weights_path: str) -> Quantization:
    # TODO: Implement a more sophisticated method to determine the quantization later
    return Quantization.INT4


def get_quantization_object(quantization: Quantization, model):
    quantization_kinds = list(model.quantize.keys())
    quantization_options = [
        quant for quant in QUANTIZATION.values() if quant.kind in quantization_kinds
    ]

    if quantization.value == "INT8":
        filtered_quantization_options = [
            quant for quant in quantization_options if quant.kind == "no-quant"
        ]
        return filtered_quantization_options[0]
    else:
        filtered_quantization_options = []
        for quant in quantization_options:
            if quant.kind == "no-quant":
                continue
            if quant.quantize_dtype == quantization.value.lower():
                filtered_quantization_options.append(quant)
        return filtered_quantization_options[0]


def get_space_check_info(
    installation_manager: InstallationManager,
) -> tuple[int, int, int]:
    available_ram = get_usable_memory()
    disk_space = psutil.disk_usage("/").free
    bytes_remaining = installation_manager.get_total_bytes_remaining()
    return available_ram, disk_space, bytes_remaining


async def download_file(
    session: any,
    url: str,
    install_path: Path,
    file_info: FileInfo,
    progress_tracker: dict[str, int],
):
    file_path = os.path.join(install_path, file_info.file)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    async with session.get(url, allow_redirects=True, timeout=None) as response:
        response.raise_for_status()
        async with aiofiles_open(file_path, "wb") as f:
            async for chunk in response.content.iter_chunked(1024):
                await f.write(chunk)
                progress_tracker["downloaded_bytes"] += len(chunk)


def convert_and_quantize(
    base_weights_path: str, quant_weights_path: str, quantization: Quantization
):
    # Gather necessary info for conversion
    config = detect_config(base_weights_path)
    model = detect_model_type("auto", config)
    source, source_format = detect_weight(
        weight_path=config.parent,
        config_json_path=config,
        weight_format="auto",
    )
    device = detect_device("auto")
    conv_template = get_conv_template(base_weights_path)
    quantization_obj = get_quantization_object(quantization, model)

    # Convert and quantize
    logger.info(f"Converting weights for {base_weights_path}")
    convert_weight_mlc(
        config=config,
        quantization=quantization_obj,
        model=model,
        device=device,
        source=source,
        source_format=source_format,
        output=quant_weights_path,
    )

    # Generate config
    logger.info(f"Generating config for {base_weights_path}")
    gen_config_mlc(
        config=config,
        model=model,
        quantization=quantization_obj,
        conv_template=conv_template,
        context_window_size=None,
        sliding_window_size=None,
        prefill_chunk_size=None,
        attention_sink_size=None,
        tensor_parallel_shards=None,
        max_batch_size=1,
        output=Path(quant_weights_path),
    )


async def install_generator(
    model_id: str, model_url: str, installation_manager: InstallationManager
):
    """
    Downloads and installs a model from a given URL.

    - Downloads the model files if they don't exist locally
    - Converts the weights and quantizes them
    - Generates the Truffle config file

    Args:
        model_url (str): The URL to download the model from
        installation_manager (InstallationManager): The manager of global download and conversion state

    Yields:
        {
            "id": str,
            "status": str (ACKNOWLEDGED, DOWNLOADING, INSTALLING, STOPPED),
            "progress": int,
            "error": str (optional)
        }
    """

    logger.info(f"Starting install for {model_url}")
    progress_event = {
        "id": model_id,
        "status": "ACKNOWLEDGED",
        "progress": 0,
        "error": None,
    }
    yield f"data: {json.dumps(progress_event)}\n\n"

    model_dir = get_app_data_path() / "models" / model_id
    install_path = model_dir / "base"

    # Get files to download
    try:
        remote_files = await get_repo_info(model_url)
        local_files = get_local_files(install_path)
        files_to_download = get_files_to_download(remote_files, local_files)
        total_size = sum([file.size for file in files_to_download])
    except Exception as e:
        progress_event = {
            "id": model_id,
            "status": "DOWNLOADING",
            "progress": 0,
            "error": str(e),
        }
        yield f"data: {json.dumps(progress_event)}\n\n"
        return

    # Check that there is enough space to download the model
    _, disk_space, total_bytes_remaining = get_space_check_info(installation_manager)
    if total_size + total_bytes_remaining > disk_space:
        logger.error(f"Not enough space to download {model_dir}")
        progress_event = {
            "id": model_id,
            "status": "DOWNLOADING",
            "progress": 0,
            "error": "Not enough space to download the model",
        }
        yield f"data: {json.dumps(progress_event)}\n\n"
        return

    try:
        # Send initial progress event
        initial_progress = {
            "id": model_id,
            "status": "DOWNLOADING",
            "progress": 0,
            "error": None,
        }
        yield f"data: {json.dumps(initial_progress)}\n\n"

        # Mark as downloading and send to InstallSystemManager
        installation_manager.set_download(model_id, total_size)

        # Start downloading files
        logger.info(f"Downloading {len(files_to_download)} files")
        progress_tracker = {"downloaded_bytes": 0}
        last_progress = 0
        async with aiohttp.ClientSession(headers=HF_AUTH_HEADER) as session:
            tasks = [
                download_file(
                    session,
                    get_file_download_url(model_url, file.file),
                    install_path,
                    file,
                    progress_tracker,
                )
                for file in files_to_download
            ]
            download_tasks = asyncio.gather(*tasks)

            while not download_tasks.done():
                progress = int(100 * progress_tracker["downloaded_bytes"] / total_size)
                installation_manager.set_download(
                    model_id, total_size - progress_tracker["downloaded_bytes"]
                )

                # Send progress event
                if (progress - last_progress) >= 1:
                    last_progress = progress
                    progress_event = {
                        "id": model_id,
                        "status": "DOWNLOADING",
                        "progress": progress,
                        "error": None,
                    }
                    yield f"data: {json.dumps(progress_event)}\n\n"

                await asyncio.sleep(0.1)

            # Ensure that the download is complete
            await download_tasks

        # Clear download from InstallSystemManager
        installation_manager.clear_download(model_id)
    except Exception as e:
        logger.error(f"Failed to download {model_dir}: {str(e)}")
        progress_event = {
            "id": model_id,
            "status": "DOWNLOADING",
            "progress": 0,
            "error": str(e),
        }
        yield f"data: {json.dumps(progress_event)}\n\n"
        return

    # Mark as installing and send to InstallManager
    logger.info(
        f"""Downloaded {
            len(files_to_download)} files. Beginning weight conversion and quantization."""
    )

    # Return early if the quantization is alrady built
    quantization = get_base_quantization_decision(install_path)
    if does_quantization_exist(model_id, quantization):
        logger.info(f"Conversion and quantization already exists for {model_dir}")
        progress_event = {
            "id": model_id,
            "status": "STOPPED",
            "progress": 100,
            "error": None,
        }
        yield f"data: {json.dumps(progress_event)}\n\n"
        installation_manager.complete_conversion()
        return

    # Weight conversion and quantization process
    logger.info(f"Adding {model_dir} to the conversion queue")
    model_size, compressed_size = get_model_size_info(install_path, quantization)
    installation_manager.add_to_conversion_queue(
        model_dir, quantization, compressed_size
    )
    progress_event = {
        "id": model_id,
        "status": "INSTALLING",
        "progress": 100,
        "error": None,
    }
    yield f"data: {json.dumps(progress_event)}\n\n"

    while not installation_manager.is_models_conversion_turn(model_dir, quantization):
        logger.info(
            f"""Waiting for {model_dir} to be converted.\nCurrent conversion queue: {
                installation_manager.conversion_queue()}\nCurrent conversion in progress: {installation_manager.current_conversion}"""
        )
        await asyncio.sleep(5)

    logger.info(f"Model's turn to be converted.")
    installation_manager.remove_from_conversion_queue()
    await asyncio.sleep(3)

    # Check if the format is convertable
    if not is_convertable_format(install_path):
        logger.info(f"Unsupported model format for {model_dir}")
        progress_event = {
            "id": model_id,
            "status": "INSTALLING",
            "progress": 100,
            "error": f"Unsupported model format for {install_path}",
        }
        yield f"data: {json.dumps(progress_event)}\n\n"
        installation_manager.complete_conversion()
        return

    # Check that there is enough space and memory to convert and quantize the model
    logger.info(f"Checking space and memory for {model_dir}")
    available_ram, disk_space, bytes_remaining = get_space_check_info(
        installation_manager
    )
    if (compressed_size + bytes_remaining > disk_space) or (model_size > available_ram):
        logger.info(f"Not enough space or memory to convert and quantize {model_dir}")
        progress_event = {
            "id": model_id,
            "status": "INSTALLING",
            "progress": 100,
            "error": "Not enough space or memory to convert and quantize the model",
        }
        yield f"data: {json.dumps(progress_event)}\n\n"
        installation_manager.complete_conversion()
        return

    # Convert and quantize the model
    logger.info(f"Converting and quantizing {model_dir}")
    quant_path = model_dir / quantization.value
    convert_and_quantize(install_path, quant_path, quantization)

    logger.info(f"Conversion and quantization complete for {model_dir}")
    progress_event = {
        "id": model_id,
        "status": "STOPPED",
        "progress": 100,
        "error": None,
    }
    yield f"data: {json.dumps(progress_event)}\n\n"
    installation_manager.complete_conversion()
    return
