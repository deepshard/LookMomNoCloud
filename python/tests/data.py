import os

# IDs
ID = "ed8aee0b-8428-4c2f-9b8f-756c19ab57e9"
ID_2 = "b438d015-ad45-4e9a-9aba-2e290348b078"

# Request URLs
MODEL_URL = "https://huggingface.co/openai-community/gpt2"
HF_API_URL = "https://huggingface.co/api/models/openai-community/gpt2?"
HF_API_URL_1 = "https://huggingface.co/api/models/1?"
HF_API_URL_2 = "https://huggingface.co/api/models/2?"

FILE_ONE_URL = "https://huggingface.co/openai-community/gpt2/resolve/main/pytorch_model.bin"
FILE_TWO_URL = "https://huggingface.co/openai-community/gpt2/resolve/main/config.json"
FILE_THREE_URL = "https://huggingface.co/openai-community/gpt2/resolve/main/onnx/onnx_model.onnx"
FILE_FOUR_URL = "https://huggingface.co/openai-community/gpt2/resolve/main/tf_model/tf_model.pb"

# Mock models
MOCK_MODEL_1 = {
    "id": ID,
    "name": "test",
    "title": "test",
    "size": 1,
    "author": "test",
    "downloads": 1,
    "likes": 1,
    "intro": "test",
    "capabilities": "test",
    "risks": "test",
    "evalId": "test",
    "hfLink": HF_API_URL,
    "backgroundImage": "test",
}
MOCK_MODEL_2 = {
    "id": ID_2,
    "name": "test",
    "title": "test",
    "size": 1,
    "author": "test",
    "downloads": 1,
    "likes": 1,
    "intro": "test",
    "capabilities": "test",
    "risks": "test",
    "evalId": "test",
    "hfLink": HF_API_URL,
    "backgroundImage": "test",
}

# Mock API responses
MOCK_API_RESPONSE = {
    "siblings": [
        {
            "rfilename": "pytorch_model.bin",
        },
        {
            "rfilename": "config.json",
        },
        {
            "rfilename": "onnx/onnx_model.onnx",
        },
        {
            "rfilename": "tf_model/tf_model.pb",
        },
    ]
}
mocked_response_1 = [
    {"rfilename": "pytorch_model.bin"},
    {"rfilename": "config.json"},
    {"rfilename": "onnx/onnx_model.onnx"},
    {"rfilename": "tf_model/tf_model.tflite"},
    {"rfilename": "test.msgpack"},
    {"rfilename": "test.h5"},
]
mocked_response_2 = [{"rfilename": "xyz.safetensors"}, {"rfilename": "consolidated.safetensors"}]
MODELS = [
    {
        "id": "3fec7228-04de-485d-9f09-bde6e8ea350f",
        "name": "test",
        "title": "test",
        "size": 1,
        "author": "test",
        "downloads": 1,
        "likes": 1,
        "intro": "test",
        "capabilities": "test",
        "risks": "test",
        "evalId": "test",
        "hfLink": "openai-community/gpt2",
        "backgroundImage": "test",
    },
    {
        "id": "b438d015-ad45-4e9a-9aba-2e290348b078",
        "name": "test",
        "title": "test",
        "size": 1,
        "author": "test",
        "downloads": 1,
        "likes": 1,
        "intro": "test",
        "capabilities": "test",
        "risks": "test",
        "evalId": "test",
        "hfLink": "openai-community/gpt2",
        "backgroundImage": "test",
    },
    {
        "id": "e1b7a151-ad5a-4929-b9a2-20e42f629c4c",
        "name": "test",
        "title": "test",
        "size": 1,
        "author": "test",
        "downloads": 1,
        "likes": 1,
        "intro": "test",
        "capabilities": "test",
        "risks": "test",
        "evalId": "test",
        "hfLink": "openai-community/gpt2",
        "backgroundImage": "test",
    },
    {
        "id": "c081e038-a74c-4a7d-87d6-f36bbf7ff373",
        "name": "test",
        "title": "test",
        "size": 1,
        "author": "test",
        "downloads": 1,
        "likes": 1,
        "intro": "test",
        "capabilities": "test",
        "risks": "test",
        "evalId": "test",
        "hfLink": "openai-community/gpt2",
        "backgroundImage": "test",
    },
    {
        "id": "da05e829-9e9b-43d8-8c26-6141318700cb",
        "name": "test",
        "title": "test",
        "size": 1,
        "author": "test",
        "downloads": 1,
        "likes": 1,
        "intro": "test",
        "capabilities": "test",
        "risks": "test",
        "evalId": "test",
        "hfLink": "openai-community/gpt2",
        "backgroundImage": "test",
    },
]

# Mock file data
MOCK_FILE_ONE_DATA = os.urandom(1024)
MOCK_FILE_TWO_DATA = os.urandom(1024)
MOCK_FILE_THREE_DATA = os.urandom(1024)
MOCK_FILE_FOUR_DATA = os.urandom(1024)
MOCK_VALID_FILES = [
    {"file": "pytorch_model.bin", "data": os.urandom(1024)},
    {"file": "config.json", "data": os.urandom(1024)},
]
MOCK_FILES = [
    {"file_path": "file_one.bin", "data": os.urandom(1024)},
    {"file_path": "file_two.bin", "data": os.urandom(1024)},
    {"file_path": "sub_folder/file_three.bin", "data": os.urandom(1024)},
]
