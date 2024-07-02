import asyncio
import json
import pytest
import json
import pytest
import pytest
from endpoints.sysinfo import sysinfo_generator, CHANGE_THRESHOLD
from models import RunningModel
from db import get_db_session
from unittest.mock import MagicMock
from tests.unit.data import ID


# Fixtures
@pytest.fixture(autouse=True)
def mock_memory(mocker):
    mocker.patch(
        "psutil.virtual_memory",
        return_value=MagicMock(total=100000000, available=100000000, wired=0),
    )
    mocker.patch(
        "tvm.runtime.device",
        return_value=MagicMock(
            available_global_memory=25387073536, total_global_memory=50774147072
        ),
    )


@pytest.mark.asyncio
async def test_ram_change_detection(set_os, mocker):
    if set_os == "Windows":
        with pytest.raises(ValueError):
            generator = sysinfo_generator()
            await generator.__anext__()
    else:
        if set_os == "Linux":
            mocker.patch("utils.get_devices", return_value=[{"type": "cuda", "id": 0}])

        # Start the sysinfo generator
        generator = sysinfo_generator()
        initial_data = await generator.__anext__()  # Get initial data

        initial_ram = json.loads(initial_data.split("data: ")[1].strip())["resources"]["available"][
            "ram"
        ]

        # simulate -5% change
        after_change = round(initial_ram * 0.95)
        mocker.patch(
            "psutil.virtual_memory",
            return_value=MagicMock(
                total=100000000, available=after_change, wired=100000000 - after_change
            ),
        )
        mocker.patch(
            "tvm.runtime.device",
            return_value=MagicMock(
                available_global_memory=after_change, total_global_memory=50774147072
            ),
        )
        updated_data = await generator.__anext__()

        # Parse the JSON data from the generator output
        updated_ram = json.loads(updated_data.split("data: ")[1].strip())["resources"]["available"][
            "ram"
        ]

        # Calculate the percentage change in RAM
        ram_change = abs(updated_ram - initial_ram) / initial_ram * 100

        # Assert that the RAM change is at least 2%
        assert ram_change >= CHANGE_THRESHOLD, f"RAM change should be at least {CHANGE_THRESHOLD}%"


@pytest.mark.asyncio
async def test_no_significant_ram_change_does_not_yield(set_os, mocker):
    if set_os == "Windows":
        with pytest.raises(ValueError):
            generator = sysinfo_generator()
            await generator.__anext__()
    else:
        if set_os == "Linux":
            mocker.patch("utils.get_devices", return_value=[{"type": "cuda", "id": 0}])

        # Start the sysinfo generator
        generator = sysinfo_generator()
        initial_data = await generator.__anext__()  # Get initial data

        initial_ram = json.loads(initial_data.split("data: ")[1].strip())["resources"]["available"][
            "ram"
        ]

        # simulate only 1% change
        after_change = round(initial_ram * 0.99)
        mocker.patch(
            "psutil.virtual_memory",
            return_value=MagicMock(
                total=100000000, available=after_change, wired=100000000 - after_change
            ),
        )
        mocker.patch(
            "tvm.runtime.device",
            return_value=MagicMock(
                available_global_memory=after_change, total_global_memory=50774147072
            ),
        )
        try:
            await asyncio.wait_for(generator.__anext__(), timeout=10)
            assert False, "Generator should not yield data for insignificant RAM change"
        except asyncio.TimeoutError:
            # Expected timeout since there should be no new data yielded
            assert True


@pytest.mark.asyncio
async def test_disk_change_detection(set_os, mocker):
    if set_os == "Windows":
        with pytest.raises(ValueError):
            generator = sysinfo_generator()
            await generator.__anext__()
    else:
        if set_os == "Linux":
            mocker.patch("utils.get_devices", return_value=[{"type": "cuda", "id": 0}])

        # Start the sysinfo generator
        generator = sysinfo_generator()
        initial_data = await generator.__anext__()  # Get initial data

        initial_disk = json.loads(initial_data.split("data: ")[1].strip())["resources"][
            "available"
        ]["disk"]

        # Simulate disk usage change
        after_change = round(initial_disk * 0.95)  # simulate -5% change
        mocker.patch(
            "psutil.disk_usage",
            return_value=MagicMock(
                total=500000000, used=after_change, free=500000000 - after_change
            ),
        )
        updated_data = await generator.__anext__()

        # Parse the JSON data from the generator output
        updated_disk = json.loads(updated_data.split("data: ")[1].strip())["resources"][
            "available"
        ]["disk"]

        # Calculate the percentage change in disk usage
        disk_change = abs(updated_disk - initial_disk) / initial_disk * 100

        assert (
            disk_change >= CHANGE_THRESHOLD
        ), f"Disk usage change should be at least {CHANGE_THRESHOLD}%"


@pytest.mark.asyncio
async def test_no_significant_disk_change_does_not_yield(set_os, mocker):
    if set_os == "Windows":
        with pytest.raises(ValueError):
            generator = sysinfo_generator()
            await generator.__anext__()
    else:
        if set_os == "Linux":
            mocker.patch("utils.get_devices", return_value=[{"type": "cuda", "id": 0}])

        # Start the sysinfo generator
        generator = sysinfo_generator()
        initial_data = await generator.__anext__()  # Get initial data

        initial_disk = json.loads(initial_data.split("data: ")[1].strip())["resources"][
            "available"
        ]["disk"]

        # simulate only 1% change
        after_change = round(initial_disk * 0.99)
        mocker.patch(
            "psutil.disk_usage",
            return_value=MagicMock(total=1000000, used=1000000, free=after_change),
        )
        try:
            await asyncio.wait_for(generator.__anext__(), timeout=10)
            assert False, "Generator should not yield data for insignificant disk change"
        except asyncio.TimeoutError:
            # Expected timeout since there should be no new data yielded
            assert True


@pytest.mark.asyncio
async def test_dont_return_model_if_null(set_os, mocker):
    if set_os == "Windows":
        with pytest.raises(ValueError):
            generator = sysinfo_generator()
            await generator.__anext__()
    else:
        # Add running models
        async with get_db_session() as session:
            session.add(
                RunningModel(
                    **{
                        "id": ID,
                        "instance": 1,
                        "name": "meta-llama/Meta-Llama-3-8B",
                        "size": 8000000000,
                        "pid": 1234,
                        "port": 8899,
                        "quantization": "INT4",
                    }
                )
            )
            session.add(
                RunningModel(
                    **{
                        "id": ID,
                        "instance": 1,
                        "name": "meta-llama/Meta-Llama-3-8B",
                        "size": 8000000000,
                        "pid": 1235,
                        "port": 8900,
                        "quantization": "INT4",
                    }
                )
            )
            await session.commit()

        # Mock
        def mock_get_model_memory_usage(pid):
            if pid == 1234:
                return None
            else:
                return 8000000000
        mocker.patch("endpoints.sysinfo.sysinfo.get_model_memory_usage", side_effect=mock_get_model_memory_usage)
        mocker.patch("endpoints.sysinfo.sysinfo.get_disk_usage", return_value=1000000)

        # Start the sysinfo generator
        generator = sysinfo_generator()
        initial_data = await generator.__anext__()

        # Assert that the first model is not returned
        structured_data = json.loads(initial_data.split("data: ")[1].strip())
        assert len(structured_data["resources"]["models"]) == 1, "Only one model should be returned"
