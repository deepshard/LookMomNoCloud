import asyncio
import json
import os
import httpx
import pytest

import json
import httpx
import pytest
from jsonschema import validate, ValidationError
import subprocess
import pytest
from ..sysinfo import sysinfo_generator, CHANGE_THRESHOLD

schema = {
    "type": "object",
    "properties": {
        "os": {"type": "string", "enum": ["MAC", "LINUX"]},
        "resources": {
            "type": "object",
            "properties": {
                "available": {
                    "type": "object",
                    "properties": {
                        "ram": {"type": "integer"},
                        "disk": {"type": "integer"}
                    },
                    "required": ["ram", "disk"]
                },
                "models": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "string", "format": "uuid"},
                            "disk": {"type": "integer"},
                            "ram": {"type": "integer"}
                        },
                        "required": ["id", "disk", "ram"]
                    }
                },
                "total": {
                    "type": "object",
                    "properties": {
                        "ram": {"type": "integer"},
                        "disk": {"type": "integer"}
                    },
                    "required": ["ram", "disk"]
                }
            },
            "required": ["available", "models", "total"]
        }
    },
    "required": ["os", "resources"]
}

@pytest.mark.asyncio
async def test_schema():
    total = 0
    async with httpx.AsyncClient(timeout=None) as client:
        async with client.stream("GET", "http://localhost:8899/sysinfo") as response:
            async for line in response.aiter_lines():
                if line == "":
                    pass
                else:
                    assert "data: {" in line
                    data = line.split("data: ")[1]
                    data = json.loads(data)
                    
                    # Validate the data against the schema
                    try:
                        validate(instance=data, schema=schema)
                    except ValidationError as e:
                        pytest.fail(f"JSON data did not validate against schema: {e}")
                    
                    break

@pytest.mark.asyncio
async def test_ram_change_detection():
    # Start the sysinfo generator
    generator = sysinfo_generator()
    initial_data = next(generator)  # Get initial data

    # Start stress-ng to use RAM
    stress_process = subprocess.Popen(['stress-ng', '--vm', '1', '--vm-bytes', '4G', '--timeout', '5s'])

    # Wait for stress-ng to start affecting RAM
    await asyncio.sleep(5)  

    # Get updated data
    updated_data = next(generator)

    # Stop stress-ng
    stress_process.terminate()
    stress_process.wait()

    # Parse the JSON data from the generator output
    initial_ram = json.loads(initial_data.split("data: ")[1].strip())['resources']['available']['ram']
    updated_ram = json.loads(updated_data.split("data: ")[1].strip())['resources']['available']['ram']

    # Calculate the percentage change in RAM
    ram_change = abs(updated_ram - initial_ram) / initial_ram * 100

    # Assert that the RAM change is at least 2%
    assert ram_change >= CHANGE_THRESHOLD, f"RAM change should be at least {CHANGE_THRESHOLD}%"

@pytest.mark.asyncio
async def test_disk_change_detection():
    # Start the sysinfo generator
    generator = sysinfo_generator()
    initial_data = next(generator)  # Get initial data

    # Create a large temporary file to increase disk usage
    temp_file_path = "/tmp/large_temp_file"
    # Remove the temporary file if it exists
    if os.path.exists(temp_file_path):
        os.remove(temp_file_path)
    with open(temp_file_path, "wb") as temp_file:
        temp_file.write(os.urandom(1024 * 1024 * 1024 * 4))  # Write 2 GB of random data

    # Wait for file system to update
    await asyncio.sleep(10)  # Adjust time as necessary for your system

    # Get updated data
    updated_data = next(generator)
    # Remove the temporary file
    os.remove(temp_file_path)

    # Parse the JSON data from the generator output
    initial_disk = json.loads(initial_data.split("data: ")[1].strip())['resources']['available']['disk']
    updated_disk = json.loads(updated_data.split("data: ")[1].strip())['resources']['available']['disk']

    # Calculate the percentage change in disk usage
    disk_change = abs(updated_disk - initial_disk) / initial_disk * 100

    print(initial_disk, updated_disk, updated_disk - initial_disk)

    assert disk_change >= CHANGE_THRESHOLD, f"Disk usage change should be at least {CHANGE_THRESHOLD}%"

