import asyncio
import pytest
import shutil

from python.utils import get_app_data_path
from python.endpoints.model.install import install_generator

schema = {
    "type": "object",
    "properties": {
        "id": {"type": "string"},
        "status": {"type": "string", "enum": ["DOWNLOADING", "INSTALLING", "DONE"]},
        "progress": {"type": "integer"},
        "error": {"type": "string"},
    }
}


# Test the install endpoint logic
# Cases:
# - Install single model from scratch
# - Complete partial installation of single model
# - Skip download of already downloaded model
# - Model download doesn't block starting another download
# - Model download returns progress in expected format
# - Returns error if there is not enough space to download (single model)
# - Returns error if there is not enough space to download (with a model already in progress)
# - Converting and quantizing a model from scratch
# - Skips conversion and quantization of already converted model
# - Only converts and quantizes a single model at a time
# - Returns error if model weights are not in the expected format
# - Returns error if there is not enough space or memory to convert and quantize
# - Start of conversion and quantization returns status transition
# - Completion of conversion and quantization returns status transition


# Mock constants
MODEL_URL = "https://huggingface.co/meta-llama/Meta-Llama-3-8B"
HF_API_URL = "https://huggingface.co/api/models/meta-llama/Meta-Llama-3-8B"
FILE_ONE_URL = "https://huggingface.co/meta-llama/Meta-Llama-3-8B/resolve/main/pytorch_model.bin"
FILE_TWO_URL = "https://huggingface.co/meta-llama/Meta-Llama-3-8B/resolve/main/config.json"
MOCK_API_RESPONSE = {
    "siblings": [
        {
            "rfilename": "pytorch_model.bin",
        },
        {
            "rfilename": "config.json",
        },
    ]
}
MOCK_FILE_ONE_DATA = b'Mock binary data for testing'
MOCK_FILE_TWO_DATA = '{"key": "value"}'


# Helpers
def delete_directory(path):
    if path.exists():
        shutil.rmtree(path)


def clear_db():
    db_path = get_app_data_path() / "truffle_test.db"
    if db_path.exists():
        db_path.unlink()


# Set up testing utils
# Mock request responses


@pytest.mark.asyncio
async def test_install_single_model_from_scratch():
