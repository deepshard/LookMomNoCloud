import json
import httpx
import pytest

import json
import httpx
import pytest
from jsonschema import validate, ValidationError

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
async def test_sysinfo_endpoint():
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
                    

                    total += 1
                    if total == 3:
                        break