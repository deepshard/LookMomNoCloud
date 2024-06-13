import asyncio
import json
import os
import httpx
import psutil
import pytest

import json
import httpx
import pytest
from jsonschema import validate, ValidationError
import subprocess
import pytest
from state import global_state_manager
from server import init_state
from endpoints.sysinfo import sysinfo_generator, CHANGE_THRESHOLD
from unittest.mock import patch, MagicMock


@pytest.mark.asyncio
async def test_ram_change_detection():
    # Start the sysinfo generator
    async with init_state():
        generator = sysinfo_generator()
        initial_data = await generator.__anext__()  # Get initial data

        initial_ram = json.loads(initial_data.split("data: ")[1].strip())["resources"][
            "available"
        ]["ram"]

        # simulate -5% change
        after_change = round(initial_ram * 0.95)

        with patch(
            "psutil.virtual_memory",
            return_value=MagicMock(total=100000000, available=after_change),
        ):
            # Get updated data
            updated_data = await generator.__anext__()

        # Parse the JSON data from the generator output
        updated_ram = json.loads(updated_data.split("data: ")[1].strip())["resources"][
            "available"
        ]["ram"]

        # Calculate the percentage change in RAM
        ram_change = abs(updated_ram - initial_ram) / initial_ram * 100

        # Assert that the RAM change is at least 2%
        assert (
            ram_change >= CHANGE_THRESHOLD
        ), f"RAM change should be at least {CHANGE_THRESHOLD}%"


@pytest.mark.asyncio
async def test_no_significant_ram_change_does_not_yield():
    # Start the sysinfo generator
    async with init_state():
        generator = sysinfo_generator()
        initial_data = await generator.__anext__()  # Get initial data

        initial_ram = json.loads(initial_data.split("data: ")[1].strip())["resources"][
            "available"
        ]["ram"]

        # simulate only 1% change
        after_change = round(initial_ram * 0.99)

        with patch(
            "psutil.virtual_memory",
            return_value=MagicMock(total=100000000, available=after_change),
        ):
            # Wait for 10 seconds to simulate no significant change detection
            # Attempt to get updated data
            try:
                updated_data = await asyncio.wait_for(generator.__anext__(), timeout=10)
                assert (
                    False
                ), "Generator should not yield data for insignificant RAM change"
            except asyncio.TimeoutError:
                # Expected timeout since there should be no new data yielded
                assert True


@pytest.mark.asyncio
async def test_disk_change_detection():
    # Start the sysinfo generator
    async with init_state():
        generator = sysinfo_generator()
        initial_data = await generator.__anext__()  # Get initial data

        initial_disk = json.loads(initial_data.split("data: ")[1].strip())["resources"][
            "available"
        ]["disk"]

        # Simulate disk usage change
        after_change = round(initial_disk * 0.95)  # simulate -5% change

        with patch(
            "psutil.disk_usage",
            return_value=MagicMock(
                total=500000000, used=after_change, free=500000000 - after_change
            ),
        ):
            # Get updated data
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
async def test_no_significant_disk_change_does_not_yield():
    # Start the sysinfo generator
    async with init_state():
        generator = sysinfo_generator()
        initial_data = await generator.__anext__()  # Get initial data

        initial_disk = json.loads(initial_data.split("data: ")[1].strip())["resources"][
            "available"
        ]["disk"]

        # simulate only 1% change
        after_change = round(initial_disk * 0.99)

        with patch(
            "psutil.disk_usage",
            return_value=MagicMock(total=1000000, used=1000000, free=after_change),
        ):
            # Wait for 10 seconds to simulate no significant change detection
            # Attempt to get updated data
            try:
                updated_data = await asyncio.wait_for(generator.__anext__(), timeout=10)
                assert (
                    False
                ), "Generator should not yield data for insignificant disk change"
            except asyncio.TimeoutError:
                # Expected timeout since there should be no new data yielded
                assert True
