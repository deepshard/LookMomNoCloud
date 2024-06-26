import os
import re
import psutil
import platform
import socket
import subprocess
import tvm
from pathlib import Path
from truffle_types import FileInfo, Quantization


def get_disk_usage(folder_path: Path) -> int:
    total_size = 0
    with os.scandir(folder_path) as dir_entries:
        for entry in dir_entries:
            if entry.is_file():
                total_size += entry.stat().st_size
            elif entry.is_dir():
                total_size += get_disk_usage(entry.path)
    return total_size


def get_app_data_path() -> Path:
    system = platform.system()

    if system == "Windows":
        return Path(os.getenv("APPDATA")) / "truffle-app"
    elif system == "Darwin":
        return Path(os.path.expanduser("~/Library/Application Support")) / "truffle-app"
    elif system == "Linux":
        return Path(os.path.expanduser("~/.config")) / "truffle-app"
    else:
        raise ValueError(f"Unsupported system: {system}")


def does_quantization_exist(model_id: str, quantization: Quantization) -> bool:
    quant_path = get_app_data_path() / "models" / model_id / quantization.value
    chat_config_path = quant_path / "mlc-chat-config.json"
    ndarray_cache_path = quant_path / "ndarray-cache.json"
    tokenizer_config_path = quant_path / "tokenizer_config.json"
    tokenizer_path = quant_path / "tokenizer.json"
    shards = sum(1 for _ in quant_path.glob("params_shard_*.bin"))
    return (
        quant_path.exists()
        and chat_config_path.exists()
        and ndarray_cache_path.exists()
        and shards > 0
        and tokenizer_config_path.exists()
        and tokenizer_path.exists()
    )


def get_quantization_compression(quant: Quantization) -> float:
    # NOTE: We can replace this with a more sophisticated calculation later
    quantization_compression_table = {
        Quantization.Q0F16: 1,
        Quantization.Q4F16_0: 0.28,
        Quantization.Q4F16_1: 0.28,
        Quantization.Q4F16_2: 0.32,
        Quantization.Q4F16_FT: 0.25,
        Quantization.Q3F16_0: 0.23,
        Quantization.Q3F16_1: 0.23,
    }
    return quantization_compression_table[quant]


def is_convertable_format(base_weights_path: str) -> bool:
    pytorch_json_path = os.path.join(base_weights_path, "pytorch_model.bin.index.json")
    pytorch_bin_path = os.path.join(base_weights_path, "pytorch_model.bin")
    safetensors_path = os.path.join(base_weights_path, "model.safetensors.index.json")
    safetensors_bin_path = os.path.join(base_weights_path, "model.safetensors")

    if (
        os.path.exists(pytorch_json_path)
        or os.path.exists(pytorch_bin_path)
        or os.path.exists(safetensors_path)
        or os.path.exists(safetensors_bin_path)
    ):
        return True

    return False


def get_model_size_info(weights_path: Path, quantization: Quantization) -> tuple[int, float]:
    model_size = get_disk_usage(weights_path)
    compression_rate = get_quantization_compression(quantization)
    compressed_size = model_size * compression_rate
    return model_size, compressed_size


def get_devices() -> list[str]:
    DEVICE_OPTIONS = ["cuda", "rocm", "metal", "vulkan", "opencl"]

    devices = []
    for device_type in DEVICE_OPTIONS:
        for i in range(8):  # max 8 devices per type for now
            cur_device = tvm.device(dev_type=device_type, dev_id=i)
            try:
                if cur_device.exist:
                    devices.append({"type": device_type, "id": i})
            except Exception:
                continue

    return devices


def get_devices_available_memory(device_type: str, devices: list[any]) -> int:
    total_available = 0
    for device in [device for device in devices if device["type"] == device_type]:
        total_available += tvm.runtime.device(
            dev_type=device["type"], dev_id=device["id"]
        ).available_global_memory

    return total_available


def get_devices_total_memory(device_type: str, devices: list[any]) -> int:
    total_memory = 0
    for device in [device for device in devices if device["type"] == device_type]:
        total_memory += tvm.runtime.device(
            device_type=device["type"], dev_id=device["id"]
        ).total_global_memory

    return total_memory


def is_truffle_compatible(files: list[FileInfo]) -> bool:
    # files must contain one of the following:
    # - pytorch_model.bin.index.json
    # - pytorch_model.bin
    # - model.safetensors.index.json
    # - model.safetensors
    patterns = [
        "pytorch_model.bin.index.json",
        "pytorch_model.bin",
        "model.safetensors.index.json",
        "model.safetensors",
    ]
    for file in files:
        if any(file.file.endswith(pattern) for pattern in patterns):
            return True
    return False


def get_usable_memory(run: bool = False) -> int:
    """
    This is the memory that is currently available or could be quickly made available.
    That is, the maximum memory a new process could use without trigger an OOM error.
    """

    system = platform.system()
    mem = psutil.virtual_memory()
    if system == "Darwin":
        if run:
            return mem.available
        else:
            # macOS swaps to disk when memory is low, so we need to take that into account
            return mem.total - mem.wired
    elif system == "Linux":
        # Get devices
        devices = get_devices()

        # Heirarchy is as follows:
        # - CUDA
        # - ROCM
        # - Vulkan
        # - OpenCL
        if any(device["type"] == "cuda" for device in devices):
            return get_devices_available_memory("cuda", devices)
        elif any(device["type"] == "rocm" for device in devices):
            return get_devices_available_memory("rocm", devices)
        elif any(device["type"] == "vulkan" for device in devices):
            return get_devices_available_memory("vulkan", devices)
        elif any(device["type"] == "opencl" for device in devices):
            return get_devices_available_memory("opencl", devices)
        else:
            return 0
    else:
        raise ValueError(f"Unsupported system: {system}")


def get_total_memory() -> int:
    """This is the total amount of memory in the system."""

    system = platform.system()
    mem = psutil.virtual_memory()
    if system == "Darwin":
        return mem.total
    elif system == "Linux":
        # Get devices
        devices = get_devices()

        # Heirarchy is as follows:
        # - CUDA
        # - ROCM
        # - Vulkan
        # - OpenCL
        if any(device["type"] == "cuda" for device in devices):
            return get_devices_total_memory("cuda", devices)
        elif any(device["type"] == "rocm" for device in devices):
            return get_devices_total_memory("rocm", devices)
        elif any(device["type"] == "vulkan" for device in devices):
            return get_devices_total_memory("vulkan", devices)
        elif any(device["type"] == "opencl" for device in devices):
            return get_devices_total_memory("opencl", devices)
        else:
            return 0
    else:
        raise ValueError(f"Unsupported system: {system}")


def get_tensor_parallelism(model_weights_dir: str, quantization: Quantization) -> int:
    # Get the model size and the compressed size
    _, compressed_size = get_model_size_info(model_weights_dir, quantization)

    # Get number of devices (heirarchy is as follows: CUDA, ROCM, Vulkan, OpenCL)
    devices = get_devices()
    if any(device["type"] == "metal" for device in devices):
        return 1

    num_devices = 0
    if any(device["type"] == "cuda" for device in devices):
        num_devices = len([device for device in devices if device["type"] == "cuda"])
    elif any(device["type"] == "rocm" for device in devices):
        num_devices = len([device for device in devices if device["type"] == "rocm"])
    elif any(device["type"] == "vulkan" for device in devices):
        num_devices = len([device for device in devices if device["type"] == "vulkan"])
    elif any(device["type"] == "opencl" for device in devices):
        num_devices = len([device for device in devices if device["type"] == "opencl"])

    if num_devices == 0:
        raise ValueError("No devices found")

    if num_devices == 1:
        return 1

    # Identify the max number of devices that can be used such that the model isn't sharded into
    # less than 5GB per device
    shards = 1
    while compressed_size / shards > 5 * 1024 * 1024 * 1024 and shards < num_devices:
        shards += 1

    return shards


def get_db_path():
    return os.getenv(
        "DATABASE_URL",
        (
            f"sqlite+aiosqlite:///{str(get_app_data_path() / 'truffle.test.db')}"
            if os.getenv("ENV") == "dev"
            else f"sqlite+aiosqlite:///{str(get_app_data_path() / 'truffle.db')}"
        ),
    )
