from truffle_types import Model

data = [
    {
        "id": "1111-2222-3333-4444",
        "url": "https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3",
        "background_image": "",
        "author": "Mistral AI",
        "name": "Mistral-7B-Instruct-v0.3",
        "params": 7_000_000_000,
        "description": "Mistral AI's 7B parameter model for instruction following.",
    },
    {
        "id": "5555-6666-7777-8888",
        "url": "https://huggingface.co/openai/whisper-large-v3",
        "background_image": "",
        "author": "OpenAI",
        "name": "whisper-large-v3",
        "params": 1_540_000_000,
        "description": "OpenAI's 1.54B parameter model for automatic speech recognition.",
    }
]


def get_new() -> list[Model]:
    return [Model(**model) for model in data]
