import os
import re
import psutil
import platform
import socket
import subprocess
import tvm
from pathlib import Path
from truffle_types import Quantization


def get_disk_usage(folder_path: str) -> int:
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


def find_port(port: int = 8899) -> int:
    """Find an open port."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        if s.connect_ex(("localhost", port)) == 0:
            return find_port(port + 1)
        return port


def does_quantization_exist(model_id: str, quantization: Quantization) -> bool:
    quant_path = get_app_data_path() / "models" / model_id / quantization.value
    mlc_chat_config_path = quant_path / "mlc-chat-config.json"
    ndarray_cache_path = quant_path / "ndarray-cache.json"
    tokenizer_config_path = quant_path / "tokenizer_config.json"
    tokenizer_path = quant_path / "tokenizer.json"
    shards = sum(1 for _ in quant_path.glob("params_shard_*.bin"))
    return (
        quant_path.exists()
        and mlc_chat_config_path.exists()
        and ndarray_cache_path.exists()
        and shards > 0
        and tokenizer_config_path.exists()
        and tokenizer_path.exists()
    )


def get_quantization_compression(quant: Quantization) -> float:
    # NOTE: We can replace this with a more sophisticated calculation later
    quantization_compression_table = {
        Quantization.INT3: 0.25,
        Quantization.INT4: 0.33,
        Quantization.INT8: 0.55,
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


def get_model_size_info(
    weights_path: str, quantization: Quantization
) -> tuple[int, float]:
    model_size = get_disk_usage(weights_path)
    compression_rate = get_quantization_compression(quantization)
    compressed_size = model_size * compression_rate
    return model_size, compressed_size


def get_devices() -> list[str]:
    DEVICE_OPTIONS = ["cuda", "rocm", "metal", "vulkan", "opencl"]

    devices = []
    for device_type in DEVICE_OPTIONS:
        i = 0
        while True:
            cur_device = tvm.device(dev_type=device_type, dev_id=i)
            try:
                if cur_device.exist:
                    devices.append({"type": device_type, "id": i})
            except Exception:
                continue

    return devices


def get_devices_memory(device_type: str, devices: list[any]) -> int:
    total_available = 0
    for device in [device for device in devices if device["type"] == device_type]:
        total_available += tvm.runtime.device(
            device_type=device["type"], dev_id=device["id"]
        ).available_global_memory

    return total_available


def get_usable_memory() -> int:
    """
    This is the memory that is currently available or could be quickly made available.
    That is, the maximum memory a new process could use without trigger an OOM error.
    """
    system = platform.system()
    mem = psutil.virtual_memory()
    if system == "Darwin":
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
            return get_devices_memory("cuda", devices)
        elif any(device["type"] == "rocm" for device in devices):
            return get_devices_memory("rocm", devices)
        elif any(device["type"] == "vulkan" for device in devices):
            return get_devices_memory("vulkan", devices)
        elif any(device["type"] == "opencl" for device in devices):
            return get_devices_memory("opencl", devices)
        else:
            return 0
    else:
        raise ValueError(f"Unsupported system: {system}")
