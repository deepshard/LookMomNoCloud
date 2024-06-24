import pytest
import json
from utils import get_app_data_path, get_devices, get_usable_memory
from tests.integration.data import models
from models import RunningModel
import platform
import psutil
import tvm


def test_get_usable_memory():
    system = platform.system()

    if system == "Darwin":
        assert get_usable_memory(False) == (
            psutil.virtual_memory().total - psutil.virtual_memory().wired
        )
        assert get_usable_memory(True) == psutil.virtual_memory().available
    else:
        devices = get_devices()

        if len(devices) == 0:
            assert get_usable_memory(False) == 0
            assert get_usable_memory(True) == 0
        else:
            if any(device["type"] == "cuda" for device in devices):
                filtered_devices = [device for device in devices if device["type"] == "cuda"]
                memory = sum(
                    tvm.runtime.device(device["type"], device["id"]).available_global_memory
                    for device in filtered_devices
                )
                assert get_usable_memory(False) == memory
                assert get_usable_memory(True) == memory
            elif any(device["type"] == "rocm" for device in devices):
                filtered_devices = [device for device in devices if device["type"] == "rocm"]
                memory = sum(
                    tvm.runtime.device(device["type"], device["id"]).available_global_memory
                    for device in filtered_devices
                )
                assert get_usable_memory(False) == memory
                assert get_usable_memory(True) == memory
            elif any(device["type"] == "vulkan" for device in devices):
                filtered_devices = [device for device in devices if device["type"] == "vulkan"]
                memory = sum(
                    tvm.runtime.device(device["type"], device["id"]).available_global_memory
                    for device in filtered_devices
                )
                assert get_usable_memory(False) == memory
                assert get_usable_memory(True) == memory
            elif any(device["type"] == "opencl" for device in devices):
                filtered_devices = [device for device in devices if device["type"] == "opencl"]
                memory = sum(
                    tvm.runtime.device(device["type"], device["id"]).available_global_memory
                    for device in filtered_devices
                )
                assert get_usable_memory(False) == memory
                assert get_usable_memory(True) == memory
            else:
                assert get_usable_memory(False) == 0
                assert get_usable_memory(True) == 0
