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
    return quant_path.exists() and len(os.listdir(quant_path)) > 0


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
    DEVICE_OPTIONS = ["cuda", "rocm", "vulkan"]

    devices = []
    for device_type in DEVICE_OPTIONS:
        cur_device = tvm.device(dev_type=device_type, dev_id=0)
        try:
            if cur_device.exist:
                devices.append(device_type)
        except Exception:
            continue

    if len(devices) == 0:
        raise ValueError("No GPUs found")

    return devices


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
        device_types = get_devices()

        # Handle NVIDIA GPUs
        if "cuda" in device_types or "vulkan" in device_types:
            command = "nvidia-smi --query-gpu=memory.free --format=csv"
            memory_free_info = (
                subprocess.check_output(command.split()).decode("ascii").split("\n")[1:]
            )
            print(memory_free_info)
            memory_free_values = [
                int(x.split()[0]) for i, x in enumerate(memory_free_info)
            ]
            total_gpu_memory = sum(memory_free_values) * 1024 * 1024
            return total_gpu_memory
        # Handle AMD GPUs
        elif "rocm" in device_types:
            command = "rocm-smi --showmeminfo vram"
            memory_info = (
                subprocess.check_output(command.split())
                .decode("ascii")
                .split("\n")[2:-2]
            )

            # Define the pattern to find memory usage
            total_mem_pattern = re.compile(r"VRAM Total Memory \(B\): (\d+)")
            used_mem_pattern = re.compile(r"VRAM Total Used Memory \(B\): (\d+)")

            free_memory = 0
            for i in range(len(memory_info) - 1):
                if i % 2 == 0:
                    total_mem = total_mem_pattern.search(memory_info[i])
                    used_mem = used_mem_pattern.search(memory_info[i + 1])
                    free_memory += int(total_mem.group(1)) - int(used_mem.group(1))

            return free_memory
        else:
            return 0
    else:
        raise ValueError(f"Unsupported system: {system}")
