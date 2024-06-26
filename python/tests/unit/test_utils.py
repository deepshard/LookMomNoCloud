import pytest
from unittest.mock import MagicMock
from truffle_types import Quantization
from utils import get_usable_memory, get_tensor_parallelism

# Test the utils logic
# Cases:
# - get_usable_memory
#   - Windows
#   - Mac
#   - single CUDA
#   - multiple CUDA
#   - single ROCM
#   - multiple ROCM
#   - single Vulkan
#   - multiple Vulkan
#   - single OpenCL
#   - multiple OpenCL
# - get_tensor_parallelism
#   - Mac
#   - no GPUs
#   - single GPU
#   - multiple GPUs


device_options = [
    [{"type": "cuda", "id": 0}],
    [{"type": "cuda", "id": 0}, {"type": "cuda", "id": 1}],
    [{"type": "rocm", "id": 0}],
    [{"type": "rocm", "id": 0}, {"type": "rocm", "id": 1}],
    [{"type": "vulkan", "id": 0}],
    [{"type": "vulkan", "id": 0}, {"type": "vulkan", "id": 1}],
    [{"type": "opencl", "id": 0}],
    [{"type": "opencl", "id": 0}, {"type": "opencl", "id": 1}],
]


@pytest.fixture(autouse=True)
def mock_tvm_device(mocker):
    mocker.patch("tvm.runtime.device", return_value=MagicMock(available_global_memory=25387073536))


def test_get_usable_memory(set_os, mocker):
    if set_os == "Windows":
        with pytest.raises(ValueError):
            get_usable_memory()

    if set_os == "Darwin":
        mocker.patch(
            "utils.psutil.virtual_memory", return_value=MagicMock(total=1000000000, wired=100000000)
        )
        assert get_usable_memory() == 900000000

    if set_os == "Linux":
        for device_set in device_options:
            mocker.patch("utils.get_devices", return_value=device_set)
            assert get_usable_memory() == len(device_set) * 25387073536


def test_get_tensor_parallelism_mac(set_os, mocker):
    if set_os == "Darwin":
        mocker.patch("utils.get_devices", return_value=[{"type": "metal", "id": 0}])
        mocker.patch("utils.get_model_size_info", return_value=(0, 10 * 1024 * 1024 * 1024))
        assert get_tensor_parallelism("model_weights_dir", Quantization.Q4F16_0) == 1


def test_get_tensor_parallelism_no_gpus(set_os, mocker):
    if set_os == "Linux":
        mocker.patch("utils.get_devices", return_value=[])
        mocker.patch("utils.get_model_size_info", return_value=(0, 10 * 1024 * 1024 * 1024))
        with pytest.raises(ValueError):
            get_tensor_parallelism("model_weights_dir", Quantization.Q4F16_0)


def test_get_tensor_parallelism_single_gpu(set_os, mocker):
    if set_os == "Linux":
        mocker.patch("utils.get_devices", return_value=[{"type": "cuda", "id": 0}])
        mocker.patch("utils.get_model_size_info", return_value=(0, 10 * 1024 * 1024 * 1024))
        assert get_tensor_parallelism("model_weights_dir", Quantization.Q4F16_0) == 1


def test_get_tensor_parallelism_multiple_gpus(set_os, mocker):
    if set_os == "Linux":
        # Case 1: 2 GPUs, model is 10GB
        mocker.patch(
            "utils.get_devices", return_value=[{"type": "cuda", "id": 0}, {"type": "cuda", "id": 1}]
        )
        mocker.patch("utils.get_model_size_info", return_value=(0, 10 * 1024 * 1024 * 1024))
        assert get_tensor_parallelism("model_weights_dir", Quantization.Q4F16_0) == 2

        # Case 2: 8 GPUs, model is 20GB
        mocker.patch(
            "utils.get_devices",
            return_value=[
                {"type": "cuda", "id": 0},
                {"type": "cuda", "id": 1},
                {"type": "cuda", "id": 2},
                {"type": "cuda", "id": 3},
                {"type": "cuda", "id": 4},
                {"type": "cuda", "id": 5},
                {"type": "cuda", "id": 6},
                {"type": "cuda", "id": 7},
            ],
        )
        mocker.patch("utils.get_model_size_info", return_value=(0, 20 * 1024 * 1024 * 1024))
        assert get_tensor_parallelism("model_weights_dir", Quantization.Q4F16_0) == 4

        # Case 3: 2 GPUs, model is 5GB
        mocker.patch(
            "utils.get_devices", return_value=[{"type": "cuda", "id": 0}, {"type": "cuda", "id": 1}]
        )
        mocker.patch("utils.get_model_size_info", return_value=(0, 5 * 1024 * 1024 * 1024))
        assert get_tensor_parallelism("model_weights_dir", Quantization.Q4F16_0) == 1

        # Case 4: 2 GPUs, model is 10GB
        mocker.patch(
            "utils.get_devices", return_value=[{"type": "cuda", "id": 0}, {"type": "cuda", "id": 1}]
        )
        mocker.patch("utils.get_model_size_info", return_value=(0, 10 * 1024 * 1024 * 1024))
        assert get_tensor_parallelism("model_weights_dir", Quantization.Q4F16_0) == 2

        # Case 5: 3 GPUs, model is 10GB
        mocker.patch(
            "utils.get_devices",
            return_value=[
                {"type": "cuda", "id": 0},
                {"type": "cuda", "id": 1},
                {"type": "cuda", "id": 2},
            ],
        )
        mocker.patch("utils.get_model_size_info", return_value=(0, 10 * 1024 * 1024 * 1024))
        assert get_tensor_parallelism("model_weights_dir", Quantization.Q4F16_0) == 2

        # Case 6: 8 GPUs, model is 70GB
        mocker.patch(
            "utils.get_devices",
            return_value=[
                {"type": "cuda", "id": 0},
                {"type": "cuda", "id": 1},
                {"type": "cuda", "id": 2},
                {"type": "cuda", "id": 3},
                {"type": "cuda", "id": 4},
                {"type": "cuda", "id": 5},
                {"type": "cuda", "id": 6},
                {"type": "cuda", "id": 7},
            ],
        )
        mocker.patch("utils.get_model_size_info", return_value=(0, 70 * 1024 * 1024 * 1024))
        assert get_tensor_parallelism("model_weights_dir", Quantization.Q4F16_0) == 8
