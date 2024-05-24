import os
import asyncio
import pytest
from unittest.mock import patch, MagicMock
import shutil
from aioresponses import aioresponses
from python.endpoints.model.install import InstallationManager
from python.utils import get_app_data_path
from python.db import db

schema = {
    "type": "object",
    "properties": {
        "id": {"type": "string"},
        "instance": {"type": "integer"},
        "port": {"type": "integer"},
        "error": {"type": "string"},
    }
}


# Test the run endpoint logic
# Cases:
# - Quantization does not exist
# - Quantization exists
# - Multiple models requested
# - There is already an instance running
# - Model is not in a convertable format
# - There is not enough space to convert all of the models
# - Models are processed via the conversion queue
# - Not enough memory to quantize a model
# - Not enough memory to run a model
# - Gets instance count from DB

# Helpers
def clear_path(path):
    if os.path.exists():
        shutil.rmtree(path)


async def clear_db():
    await db.runningmodels.delete_many()


# Fixtures
