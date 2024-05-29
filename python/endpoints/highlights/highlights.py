from truffle_types import Model, ModelStatus

data = [
    {
        "id": "aaaa-bbbb-cccc-dddd",
        "url": "https://huggingface.co/openai-community/gpt2",
        "status": ModelStatus.NOT_DOWNLOADED,
        "background_image": "",
        "author": "Open AI",
        "name": "gpt2",
        "params": 117_000_000,
        "description": "Open AI's 8B parameter model for instruction following.",
        "instance": None,
        "progress": 0,
    },
    {
        "id": "eeee-ffff-gggg-hhhh",
        "url": "https://huggingface.co/microsoft/Phi-3-small-8k-instruct",
        "status": ModelStatus.NOT_DOWNLOADED,
        "background_image": "",
        "author": "Microsoft",
        "name": "Phi-3-small-8k-instruct",
        "params": 7_390_000_000,
        "description": "Microsoft's 7.39B parameter model for instruction following.",
        "instance": None,
        "progress": 100,
    },
    {
        "id": "iiii-jjjj-kkkk-llll",
        "url": "https://huggingface.co/nvidia/Llama3-ChatQA-1.5-8B",
        "status": ModelStatus.STOPPED,
        "background_image": "",
        "author": "NVIDIA",
        "name": "Llama3-ChatQA-1.5-8B",
        "params": 8_030_000_000,
        "description": "NVIDIA's 8B parameter model for chat-based question answering.",
        "instance": None,
        "progress": None,
    },
    {
        "id": "mmmm-nnnn-oooo-pppp",
        "url": "https://huggingface.co/meta-llama/Meta-Llama-3-8B",
        "status": ModelStatus.NOT_DOWNLOADED,
        "background_image": "",
        "author": "Meta Llama",
        "name": "Meta-Llama-3-8B",
        "params": 8_030_000_000,
        "description": "Meta Llama's 8B parameter model for general-purpose conversational AI.",
        "instance": None,
        "progress": None,
    },
    {
        "id": "qqqq-rrrr-ssss-tttt",
        "url": "https://huggingface.co/01-ai/Yi-1.5-34B-Chat",
        "status": ModelStatus.NOT_DOWNLOADED,
        "background_image": "",
        "author": "01 AI",
        "name": "Yi-1.5-34B-Chat",
        "params": 34_400_000_000,
        "description": "01 AI's 34.4B parameter model for chat-based question answering.",
        "instance": None,
        "progress": None,
    },
]


def get_highlights() -> list[Model]:
    return [Model(**model) for model in data]
