import os
import json
from aiofiles import open as aiofiles_open
import asyncio
from pathlib import Path
from loguru import logger
from enum import Enum
from mlc_llm.interface.convert_weight import convert_weight
from mlc_llm.interface.compile import compile
from mlc_llm.support.auto_config import detect_config, detect_model_type
from mlc_llm.support.auto_weight import detect_weight
from mlc_llm.interface.compiler_flags import OptimizationFlags, ModelConfigOverride
from mlc_llm.support.auto_device import detect_device
from mlc_llm.quantization import QUANTIZATION
from mlc_llm.interface.gen_config import gen_config
from mlc_llm.support.auto_target import detect_target_and_host
from state import global_state_manager
from truffle_types import RepoType, FileInfo, Quantization
from utils import (
    get_app_data_path,
    does_quantization_exist,
    get_model_size_info,
    get_usable_memory,
    get_tensor_parallelism,
    is_truffle_compatible,
)
from constants import TRUFFLE_API_URL


class Status(Enum):
    ACKNOWLEDGED = "ACKNOWLEDGED"
    DOWNLOADING = "DOWNLOADING"
    INSTALLING = "INSTALLING"
    STOPPED = "STOPPED"


class ProgressEvent:
    def __init__(self, model_id: str, status: Status, progress: int, error: str = None):
        self.model_id = model_id
        self.status = status
        self.progress = progress
        self.error = error

    def to_json(self):
        return json.dumps(
            {
                "id": self.model_id,
                "status": self.status.value,
                "progress": self.progress,
                "error": self.error,
            }
        )

    def update(self, status: Status = None, progress: int = None, error: str = None):
        if status is not None:
            self.status = status
        if progress is not None:
            self.progress = progress
        if error is not None:
            self.error = error

    def __str__(self):
        return f"data: {self.to_json()}\n\n"


def get_url_type(url: str) -> RepoType:
    # TODO: Change this later when we may start accepting S3 URLs
    return RepoType.HF


def get_hf_name_for_url(url: str) -> str:
    url_parts = url.split("/")
    author = url_parts[-2]
    model_name = url_parts[-1]

    return f"{author}/{model_name}"


async def get_file_size_hf(url: str, file: str) -> tuple[str, int]:
    async with global_state_manager.session.head(
        f"{url}/resolve/main/{file}", allow_redirects=True
    ) as response:
        return file, int(response.headers["Content-Length"])


def _is_convertable_file(file: str, ignore_patterns: list[str]) -> bool:
    return not any(
        file.endswith(pattern) or file.startswith(pattern) for pattern in ignore_patterns
    )


async def get_hf_repo_info(model_name: str) -> list[FileInfo]:
    # Query the HF API to get the requisite info
    url = f"https://huggingface.co/api/models/{model_name}?"
    async with global_state_manager.session.get(url) as response:
        response.raise_for_status()
        data = await response.json()

    # Get list of repo files
    files = data.get("siblings", [])
    if not files:
        raise ValueError(f"Could not find any files for {model_name}")

    base_ignore_patterns = ["tflite", "onnx", "msgpack", "txt", "ot", "h5"]

    # Check if there is a safetensor file. If so, exclude PyTorch bin files (redundant)
    contains_safetensor = any(file["rfilename"].endswith("safetensors") for file in files)
    if contains_safetensor:
        base_ignore_patterns.extend(["bin", "pth", "pt"])

    contains_consolidated_weights = any(
        file["rfilename"].endswith("consolidated.safetensors") for file in files
    )
    if contains_consolidated_weights:
        base_ignore_patterns.extend(["consolidated.safetensors"])

    # filter out files that are not convertable or redundant
    files = [
        file for file in files if _is_convertable_file(file["rfilename"], base_ignore_patterns)
    ]

    tasks = []
    for file in files:
        if not file["rfilename"]:
            raise ValueError(f"Missing rfilename for {file}")

        tasks.append(get_file_size_hf(f"https://huggingface.co/{model_name}", file["rfilename"]))

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


async def get_files_to_download(model_url: str, install_path: Path) -> list[FileInfo]:
    # Get the file sets
    remote_files = await get_repo_info(model_url)
    local_files = get_local_files(install_path)

    # Get the files that need to be downloaded
    remote_files_dict = {file.file: file.size for file in remote_files}
    local_files_dict = {file.file: file.size for file in local_files}

    files_to_download = []
    for file, size in remote_files_dict.items():
        if file not in local_files_dict or local_files_dict[file] < size:
            files_to_download.append(FileInfo(file=file, size=size))

    return files_to_download


def check_disk_space(size: int) -> bool:
    (
        _,
        disk_space,
        total_bytes_remaining,
    ) = global_state_manager.model_manager.get_space_check_info()
    if size + total_bytes_remaining < disk_space:
        return True

    raise ValueError("Not enough space")


def check_memory_space(size: int) -> bool:
    available_ram = get_usable_memory()
    if size < available_ram:
        return True

    raise ValueError("Not enough memory")


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


async def get_conv_template(model_id: str) -> str:
    async with global_state_manager.session.get(
        f"{TRUFFLE_API_URL}/models/{model_id}",
    ) as response:
        assert response.status == 200, f"Failed to fetch model {model_id}"
        model_details = await response.json()
        return model_details["convTemplate"]


async def get_base_quantization_decision(model_id: str) -> Quantization:
    quantization_options = (
        await global_state_manager.model_manager.get_adaptive_quantization_decision([model_id])
    )
    return quantization_options[0][1]


def get_quantization_object(quantization: Quantization, model):
    quantization_obj = QUANTIZATION[quantization.value]
    return quantization_obj


async def download_file(
    url: str,
    install_path: Path,
    file_info: FileInfo,
    progress_tracker: dict[str, int],
):
    file_path = os.path.join(install_path, file_info.file)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    logger.info(f"Downloading {file_info.file}...")

    async with global_state_manager.session.get(
        url, allow_redirects=True, timeout=None
    ) as response:
        response.raise_for_status()
        async with aiofiles_open(file_path, "wb") as f:
            async for chunk in response.content.iter_chunked(1024):
                await f.write(chunk)
                progress_tracker["downloaded_bytes"] += len(chunk)


async def download_files(
    model_id: str,
    model_url: str,
    install_path: Path,
    files_to_download: list[FileInfo],
    total_size: int,
    progress_event: ProgressEvent,
):
    # Start downloading files
    logger.info(f"Downloading {len(files_to_download)} files")
    progress_tracker = {"downloaded_bytes": 0}
    last_progress = 0
    tasks = [
        download_file(
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
        global_state_manager.model_manager.set_download(
            model_id, total_size - progress_tracker["downloaded_bytes"]
        )

        # Send progress event
        if (progress - last_progress) >= 1:
            last_progress = progress
            progress_event.update(progress=progress)
            yield progress_event

        await asyncio.sleep(0.1)

    # Ensure that the download is complete
    await download_tasks

    # Clear download from InstallSystemManager
    global_state_manager.model_manager.clear_download(model_id)


async def queue_conversion(
    model_dir: str,
    quantization: Quantization,
    install_path: Path,
    progress_event: ProgressEvent,
):
    # Weight conversion and quantization process
    logger.info(f"Adding {model_dir} to the conversion queue")
    _, compressed_size = get_model_size_info(install_path, quantization)
    global_state_manager.model_manager.add_to_conversion_queue(
        model_dir, quantization, compressed_size
    )
    progress_event.update(progress=100)
    yield progress_event

    while not global_state_manager.model_manager.is_models_conversion_turn(model_dir, quantization):
        logger.info(
            f"""Waiting for {model_dir} to be converted.\nCurrent conversion queue: {
                global_state_manager.model_manager.conversion_queue()}\nCurrent conversion in progress: {global_state_manager.model_manager.current_conversion}"""
        )
        await asyncio.sleep(5)

    logger.info(f"Model's turn to be converted.")
    global_state_manager.model_manager.remove_from_conversion_queue()
    await asyncio.sleep(3)


async def convert_quantize_compile(
    model_id: str, base_weights_path: Path, quant_weights_path: Path, quantization: Quantization
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
    conv_template = await get_conv_template(model_id)
    quantization_obj = get_quantization_object(quantization, model)
    target, build_func = detect_target_and_host("auto", "auto")
    shards = get_tensor_parallelism(base_weights_path, quantization)

    # Convert and quantize
    logger.info(f"Converting weights for {base_weights_path}")
    convert_weight(
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
    gen_config(
        config=config,
        model=model,
        quantization=quantization_obj,
        conv_template=conv_template,
        context_window_size=None,
        sliding_window_size=None,
        prefill_chunk_size=None,
        attention_sink_size=None,
        tensor_parallel_shards=shards,
        max_batch_size=1,
        output=quant_weights_path,
    )

    # Compile
    logger.info(f"Compiling model at {quant_weights_path}")
    compile_path = quant_weights_path / "compilation.so"
    with open(config, "r", encoding="utf-8") as config_file:
        config_file_compile = json.load(config_file)
    if not compile_path.exists():
        logger.info(f"Compiling model at {quant_weights_path}")
        try:
            compile(
                config=config_file_compile,
                quantization=quantization_obj,
                model_type=model,
                target=target,
                opt=OptimizationFlags.from_str("O2"),
                build_func=build_func,
                system_lib_prefix="auto",
                output=quant_weights_path / "compilation.so",
                overrides=ModelConfigOverride(
                    context_window_size=None,
                    sliding_window_size=None,
                    prefill_chunk_size=None,
                    attention_sink_size=None,
                    max_batch_size=1,
                    tensor_parallel_shards=shards,
                ),
                debug_dump=None,
            )
        except Exception as e:
            import traceback

            logger.error(f"Failed to compile model: {e}")
            logger.error(traceback.format_exc())
            raise e
    else:
        logger.info(
            f"""Already compiled. Skipping compilation for {
                quant_weights_path}"""
        )


async def install_generator(model_id: str, model_url: str):
    """
    Downloads and installs a model from a given URL.

    - Downloads the model files if they don't exist locally
    - Converts the weights and quantizes them
    - Generates the Truffle config file

    Args:
        model_id (str): The ID of the model
        model_url (str): The URL to download the model from

    Yields:
        {
            "id": str,
            "status": str (ACKNOWLEDGED, DOWNLOADING, INSTALLING, STOPPED),
            "progress": int,
            "error": str (optional)
        }
    """

    logger.info(f"Starting install for {model_url}")
    progress_event = ProgressEvent(model_id, Status.ACKNOWLEDGED, 0)
    yield str(progress_event)

    model_dir = get_app_data_path() / "models" / model_id
    install_path = model_dir / "base"

    # Get files to download
    logger.info(f"Gathering the set of files to download for {model_id}")
    try:
        files_to_download = await get_files_to_download(model_url, install_path)
        total_size = sum([file.size for file in files_to_download])
    except Exception as e:
        progress_event.update(status=Status.DOWNLOADING, error=str(e))
        yield str(progress_event)
        logger.error(f"Failed to get files to download: {str(e)}")
        return

    # Check if the model is Truffle compatible
    try:
        is_truffle_compatible(files_to_download)
    except Exception as e:
        progress_event.update(status=Status.DOWNLOADING, error=str(e))
        yield str(progress_event)
        logger.error(f"Model is not Truffle compatible: {str(e)}")
        return

    # Check that there is enough space to download the model
    try:
        check_disk_space(total_size)
    except Exception as e:
        progress_event.update(status=Status.DOWNLOADING, progress=100, error=str(e))
        yield str(progress_event)
        logger.error(f"Not enough space to download model: {str(e)}")
        return

    # Send initial downloading progress event
    logger.info(f"Starting download process for model {model_id}")
    progress_event.update(status=Status.DOWNLOADING, progress=0)
    yield str(progress_event)

    # Begin downloading the files
    logger.info(f"Downloading {len(files_to_download)} files")
    global_state_manager.model_manager.set_download(model_id, total_size)
    try:
        async for progress_event in download_files(
            model_id,
            model_url,
            install_path,
            files_to_download,
            total_size,
            progress_event,
        ):
            yield str(progress_event)
    except Exception as e:
        progress_event.update(status=Status.DOWNLOADING, error=str(e))
        yield str(progress_event)
        logger.error(f"Failed to download {model_dir}: {str(e)}")
        return

    # Mark as installing and send to InstallManager
    logger.info(f"Downloaded files. Beginning weight conversion and quantization process.")
    progress_event.update(status=Status.INSTALLING, progress=100)

    # Check if the quantization is already built
    try:
        quantization = await get_base_quantization_decision(model_id)
        if does_quantization_exist(model_id, quantization):
            logger.info(f"Conversion and quantization already exists for {model_dir}")
            progress_event.update(status=Status.STOPPED)
            yield str(progress_event)
            return
    except Exception as e:
        progress_event.update(error=str(e))
        yield str(progress_event)
        logger.error(f"Failed to get quantization decision: {str(e)}")
        return

    # Add conversion to the queue and wait for it to be ready for processing
    logger.info(f"Adding {model_dir} to the conversion queue")
    try:
        async for progress_event in queue_conversion(
            model_dir, quantization, install_path, progress_event
        ):
            yield str(progress_event)
    except Exception as e:
        progress_event.update(error=str(e))
        yield str(progress_event)
        global_state_manager.model_manager.complete_conversion()
        logger.error(f"Failed to queue conversion: {str(e)}")
        return

    # Check that there is enough space and memory to convert and quantize the model
    logger.info(f"Checking space and memory for {model_dir}")
    try:
        model_size, compressed_size = get_model_size_info(install_path, quantization)
        check_disk_space(compressed_size)
        check_memory_space(model_size)
    except Exception as e:
        progress_event.update(error=str(e))
        yield str(progress_event)
        global_state_manager.model_manager.complete_conversion()
        logger.error(f"Not enough space or memory for {model_dir}: {str(e)}")
        return

    # Convert and quantize the model
    logger.info(f"Converting and quantizing {model_dir}")
    try:
        quant_path = model_dir / quantization.value
        await convert_quantize_compile(model_id, install_path, quant_path, quantization)
    except Exception as e:
        progress_event.update(error=str(e))
        yield str(progress_event)
        global_state_manager.model_manager.complete_conversion()
        logger.error(f"Failed to convert and quantize {model_dir}: {str(e)}")
        return

    logger.info(f"Conversion, quantization, and compilation complete for {model_dir}")
    progress_event.update(status=Status.STOPPED)
    yield str(progress_event)
    global_state_manager.model_manager.complete_conversion()
    return
