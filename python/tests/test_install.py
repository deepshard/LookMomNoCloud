import asyncio
import pytest

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
