import pytest
from unittest.mock import patch, MagicMock
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


def test_get_usable_memory_windows():
    with patch("utils.platform.system", return_value="Windows"):
        with pytest.raises(ValueError):
            get_usable_memory()


def test_get_usable_memory_mac():
    with patch("utils.platform.system", return_value="Darwin"), patch(
        "utils.psutil.virtual_memory"
    ) as mock_virtual_memory:
        mock_virtual_memory.return_value.total = 1000000000
        mock_virtual_memory.return_value.wired = 100000000
        assert get_usable_memory() == 900000000


def test_get_usable_memory_single_cuda():
    with patch("utils.platform.system", return_value="Linux"), patch(
        "utils.get_devices", return_value=[{"type": "cuda", "id": 0}]
    ), patch(
        "tvm.runtime.device",
        return_value=MagicMock(available_global_memory=25387073536),
    ):
        assert get_usable_memory() == 25387073536


def test_get_usable_memory_multiple_cuda():
    with patch("utils.platform.system", return_value="Linux"), patch(
        "utils.get_devices",
        return_value=[{"type": "cuda", "id": 0}, {"type": "cuda", "id": 1}],
    ), patch(
        "tvm.runtime.device",
        return_value=MagicMock(available_global_memory=25387073536),
    ):
        assert get_usable_memory() == 50774147072


def test_get_usable_memory_single_rocm():
    with patch("utils.platform.system", return_value="Linux"), patch(
        "utils.get_devices", return_value=[{"type": "rocm", "id": 0}]
    ), patch(
        "tvm.runtime.device",
        return_value=MagicMock(available_global_memory=25387073536),
    ):
        assert get_usable_memory() == 25387073536


def test_get_usable_memory_multiple_rocm():
    with patch("utils.platform.system", return_value="Linux"), patch(
        "utils.get_devices",
        return_value=[{"type": "rocm", "id": 0}, {"type": "rocm", "id": 1}],
    ), patch(
        "tvm.runtime.device",
        return_value=MagicMock(available_global_memory=25387073536),
    ):
        assert get_usable_memory() == 50774147072


def test_get_usable_memory_single_vulkan():
    with patch("utils.platform.system", return_value="Linux"), patch(
        "utils.get_devices", return_value=[{"type": "vulkan", "id": 0}]
    ), patch(
        "tvm.runtime.device",
        return_value=MagicMock(available_global_memory=25387073536),
    ):
        assert get_usable_memory() == 25387073536


def test_get_usable_memory_multiple_vulkan():
    with patch("utils.platform.system", return_value="Linux"), patch(
        "utils.get_devices",
        return_value=[{"type": "vulkan", "id": 0}, {"type": "vulkan", "id": 1}],
    ), patch(
        "tvm.runtime.device",
        return_value=MagicMock(available_global_memory=25387073536),
    ):
        assert get_usable_memory() == 50774147072


def test_get_usable_memory_single_opencl():
    with patch("utils.platform.system", return_value="Linux"), patch(
        "utils.get_devices", return_value=[{"type": "opencl", "id": 0}]
    ), patch(
        "tvm.runtime.device",
        return_value=MagicMock(available_global_memory=25387073536),
    ):
        assert get_usable_memory() == 25387073536


def test_get_usable_memory_multiple_opencl():
    with patch("utils.platform.system", return_value="Linux"), patch(
        "utils.get_devices",
        return_value=[{"type": "opencl", "id": 0}, {"type": "opencl", "id": 1}],
    ), patch(
        "tvm.runtime.device",
        return_value=MagicMock(available_global_memory=25387073536),
    ):
        assert get_usable_memory() == 50774147072


def test_get_tensor_parallelism_mac():
    with patch("utils.get_devices", return_value=[{"type": "metal", "id": 0}]), patch(
        "utils.get_model_size_info", return_value=(0, 10 * 1024 * 1024 * 1024)
    ):
        assert get_tensor_parallelism("model_weights_dir", Quantization.Q4F16_0) == 1


def test_get_tensor_parallelism_no_gpus():
    with patch("utils.get_devices", return_value=[]), patch(
        "utils.get_model_size_info", return_value=(0, 10 * 1024 * 1024 * 1024)
    ):
        with pytest.raises(ValueError):
            get_tensor_parallelism("model_weights_dir", Quantization.Q4F16_0)


def test_get_tensor_parallelism_single_gpu():
    with patch("utils.get_devices", return_value=[{"type": "cuda", "id": 0}]), patch(
        "utils.get_model_size_info", return_value=(0, 10 * 1024 * 1024 * 1024)
    ):
        assert get_tensor_parallelism("model_weights_dir", Quantization.Q4F16_0) == 1


def test_get_tensor_parallelism_multiple_gpus():
    # Case 1: 2 GPUs, model is 10GB
    with patch(
        "utils.get_devices",
        return_value=[{"type": "cuda", "id": 0}, {"type": "cuda", "id": 1}],
    ), patch("utils.get_model_size_info", return_value=(0, 10 * 1024 * 1024 * 1024)):
        assert get_tensor_parallelism("model_weights_dir", Quantization.Q4F16_0) == 2

    # Case 2: 8 GPUs, model is 20GB
    with patch(
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
    ), patch("utils.get_model_size_info", return_value=(0, 20 * 1024 * 1024 * 1024)):
        assert get_tensor_parallelism("model_weights_dir", Quantization.Q4F16_0) == 4

    # Case 3: 2 GPUs, model is 5GB
    with patch(
        "utils.get_devices",
        return_value=[{"type": "cuda", "id": 0}, {"type": "cuda", "id": 1}],
    ), patch("utils.get_model_size_info", return_value=(0, 5 * 1024 * 1024 * 1024)):
        assert get_tensor_parallelism("model_weights_dir", Quantization.Q4F16_0) == 1

    # Case 4: 2 GPUs, model is 10GB
    with patch(
        "utils.get_devices",
        return_value=[{"type": "cuda", "id": 0}, {"type": "cuda", "id": 1}],
    ), patch("utils.get_model_size_info", return_value=(0, 10 * 1024 * 1024 * 1024)):
        assert get_tensor_parallelism("model_weights_dir", Quantization.Q4F16_0) == 2

    # Case 5: 3 GPUs, model is 10GB
    with patch(
        "utils.get_devices",
        return_value=[
            {"type": "cuda", "id": 0},
            {"type": "cuda", "id": 1},
            {"type": "cuda", "id": 2},
        ],
    ), patch("utils.get_model_size_info", return_value=(0, 10 * 1024 * 1024 * 1024)):
        assert get_tensor_parallelism("model_weights_dir", Quantization.Q4F16_0) == 2

    # Case 6: 8 GPUs, model is 70GB
    with patch(
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
    ), patch("utils.get_model_size_info", return_value=(0, 70 * 1024 * 1024 * 1024)):
        assert get_tensor_parallelism("model_weights_dir", Quantization.Q4F16_0) == 8
