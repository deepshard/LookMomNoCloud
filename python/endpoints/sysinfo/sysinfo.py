import asyncio
import dataclasses
import json
from typing import List
from loguru import logger
import psutil
import os
import subprocess
import re
import platform
from models import RunningModel
from truffle_types import (
    ModelResourceDetails,
    SystemInfo,
    SystemResourceDetails,
    SystemResources,
)
from utils import (
    get_app_data_path,
    get_disk_usage,
    get_devices,
    get_usable_memory,
    get_total_memory,
)


CHANGE_THRESHOLD = 3


async def get_sysinfo() -> SystemInfo:
    models_data = await get_models_data()
    resources = SystemResources(
        available=SystemResourceDetails(
            ram=get_usable_memory(True),
            disk=psutil.disk_usage("/").free,
        ),
        models=models_data,
        total=SystemResourceDetails(
            ram=get_total_memory(),
            disk=psutil.disk_usage("/").total,
        ),
    )

    return SystemInfo(
        os="MAC" if os.name == "posix" else "LINUX",
        resources=resources,
    )


def mem_string_to_bytes(value: float, unit: str) -> int:
    if unit == "G":
        return int(value * 1024**3)
    elif unit == "M":
        return int(value * 1024**2)
    elif unit == "K":
        return int(value * 1024)
    else:
        return 0


def get_model_memory_usage(pid: int) -> int:
    system = platform.system()

    if system == "Darwin":
        result = subprocess.run(["vmmap", str(pid)], capture_output=True, text=True)
        output = result.stdout
        match = re.search(
            r"TOTAL\s+([\d\.]+)([MG])\s+([\d\.]+)([MG])\s+([\d\.]+)([MG])\s+([\d\.]+)([MG])", output
        )
        if match:
            # Get resident memory size
            res_memory_value = float(match.group(3))
            res_memory_unit = match.group(4)
            swap_memory_value = float(match.group(7))
            swap_memory_unit = match.group(8)

            # Convert to bytes
            res_mem = mem_string_to_bytes(res_memory_value, res_memory_unit)
            swap_mem = mem_string_to_bytes(swap_memory_value, swap_memory_unit)
            return res_mem + swap_mem
    elif system == "Linux":
        devices = get_devices()

        # Hierarchy is as follows:
        # - CUDA
        # - ROCM
        # - Vulkan
        # - OpenCL
        if any(device["type"] == "cuda" for device in devices):
            try:
                output = subprocess.check_output(
                    [
                        "nvidia-smi",
                        "--query-compute-apps=pid,used_memory",
                        "--format=csv,noheader,nounits",
                    ],
                    universal_newlines=True,
                )
                for line in output.split("\n"):
                    if line.strip():
                        gpu_pid, gpu_memory = map(int, line.split(","))
                        if gpu_pid == pid:
                            return gpu_memory * 1024 * 1024  # Convert MB to bytes
            except subprocess.CalledProcessError as e:
                logger.error(f"Failed to get CUDA memory usage: {e}")
                return 0
        elif any(device["type"] == "rocm" for device in devices):
            try:
                output = subprocess.check_output(
                    ["rocm-smi", "--showpidmeminfo"], universal_newlines=True
                )
                for line in output.split("\n"):
                    if str(pid) in line:
                        gpu_memory = int(line.split()[-2])
                        return gpu_memory * 1024 * 1024  # Convert MB to bytes
            except subprocess.CalledProcessError as e:
                logger.error(f"Failed to get ROCm memory usage: {e}")
                return 0
        elif any(device["type"] == "vulkan" for device in devices):
            pass  # Unsupported for now, we don't build wheels for it
        elif any(device["type"] == "opencl" for device in devices):
            pass  # Unsupported for now, we don't build wheels for it
        else:
            return 0
    else:
        return 0  # Unsupported operating system


async def get_models_data() -> List[ModelResourceDetails]:
    models = await RunningModel.get_all()
    final = []
    for model in models:
        memory_usage = get_model_memory_usage(model.pid)
        if not memory_usage or memory_usage == 0:
            continue

        final.append(
            ModelResourceDetails(
                id=model.id,
                ram=memory_usage,
                disk=get_disk_usage(get_app_data_path() / "models" / model.id),
            )
        )
    return final


async def sysinfo_generator():
    last_info = await get_sysinfo()
    yield f"data: {json.dumps(dataclasses.asdict(last_info))}\n\n"
    while True:
        await asyncio.sleep(3)
        current_info = await get_sysinfo()
        if needs_update(last_info, current_info):
            yield f"data: {json.dumps(dataclasses.asdict(current_info))}\n\n"
            last_info = current_info


def needs_update(last_info: SystemInfo, current_info: SystemInfo) -> bool:
    def percent_change(old: int, new: int) -> float:
        if old == 0:
            return float("inf")  # Avoid division by zero
        return abs(new - old) / old * 100

    ram_change = percent_change(
        last_info.resources.available.ram,
        current_info.resources.available.ram,
    )
    disk_change = percent_change(
        last_info.resources.available.disk,
        current_info.resources.available.disk,
    )

    return (
        ram_change >= CHANGE_THRESHOLD
        or disk_change >= CHANGE_THRESHOLD
        or last_info.resources.models != current_info.resources.models
    )
