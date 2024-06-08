import pytest
from unittest.mock import patch
from utils import get_usable_memory

# Test the utils logic
# Cases:
# - get_usable_memory Windows
# - get_usable_memory Mac
# - get_usable_memory single CUDA or Vulkan
# - get_usable_memory multiple CUDA or Vulkan
# - get_usable_memory single ROCM
# - get_usable_memory multiple ROCM


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


def test_get_usable_memory_single_cuda_or_vulkan():
    with patch("utils.platform.system", return_value="Linux"), patch(
        "utils.get_devices", return_value=["cuda"]
    ), patch("utils.subprocess.check_output") as mock_check_output:
        mock_check_output.return_value = b"memory.free [MiB]\n24211 MiB"

        assert get_usable_memory() == 25387073536


def test_get_usable_memory_multiple_cuda_or_vulkan():
    with patch("utils.platform.system", return_value="Linux"), patch(
        "utils.get_devices", return_value=["cuda", "vulkan"]
    ), patch("utils.subprocess.check_output") as mock_check_output:
        mock_check_output.return_value = b"memory.free [MiB]\n24211 MiB\n24211 MiB"

        assert get_usable_memory() == 50774147072


def test_get_usable_memory_single_rocm():
    with patch("utils.platform.system", return_value="Linux"), patch(
        "utils.get_devices", return_value=["rocm"]
    ), patch("utils.subprocess.check_output") as mock_check_output:
        mock_check_output.return_value = b"======================= ROCm System Management Interface =======================\n============================= Memory Usage (Bytes) =============================\nGPU[0]          : VRAM Total Memory (B): 1000\nGPU[0]          : VRAM Total Used Memory (B): 100\n================================================================================\n============================= End of ROCm SMI Log =============================="

        assert get_usable_memory() == 900


def test_get_usable_memory_multiple_rocm():
    with patch("utils.platform.system", return_value="Linux"), patch(
        "utils.get_devices", return_value=["rocm"]
    ), patch("utils.subprocess.check_output") as mock_check_output:
        mock_check_output.return_value = b"======================= ROCm System Management Interface =======================\n============================= Memory Usage (Bytes) =============================\nGPU[0]          : VRAM Total Memory (B): 1000\nGPU[0]          : VRAM Total Used Memory (B): 100\nGPU[1]          : VRAM Total Memory (B): 1500\nGPU[1]          : VRAM Total Used Memory (B): 200\n================================================================================\n============================= End of ROCm SMI Log =============================="

        assert get_usable_memory() == 2200
