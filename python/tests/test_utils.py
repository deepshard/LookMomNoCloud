import pytest
from unittest.mock import patch, MagicMock
from utils import get_usable_memory

# Test the utils logic
# Cases:
# - get_usable_memory Windows
# - get_usable_memory Mac
# - get_usable_memory single CUDA
# - get_usable_memory multiple CUDA
# - get_usable_memory single ROCM
# - get_usable_memory multiple ROCM
# - get_usable_memory single Vulkan
# - get_usable_memory multiple Vulkan
# - get_usable_memory single OpenCL
# - get_usable_memory multiple OpenCL


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
