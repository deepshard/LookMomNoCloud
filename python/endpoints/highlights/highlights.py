from truffle_types import HighlightedModel, ModelStatus

data = [
    {
        "id": "aaaa-bbbb-cccc-dddd",
        "instance": None,
        "url": "https://huggingface.co/gradientai/Llama-3-8B-Instruct-Gradient-1048k",
        "status": ModelStatus.DOWNLOADING,
        "progress": 64,
        "background_image": "",
        "author": "Gradient AI",
        "name": "Llama-3-8B-Instruct-Gradient-1048k",
        "params": 8_030_000_000,
        "description": "Gradient AI's 8B parameter model for instruction following.",
    },
    {
        "id": "eeee-ffff-gggg-hhhh",
        "instance": None,
        "url": "https://huggingface.co/microsoft/Phi-3-small-8k-instruct",
        "status": ModelStatus.INSTALLING,
        "progress": 100,
        "background_image": "",
        "author": "Microsoft",
        "name": "Phi-3-small-8k-instruct",
        "params": 7_390_000_000,
        "description": "Microsoft's 7.39B parameter model for instruction following.",
    },
    {
        "id": "iiii-jjjj-kkkk-llll",
        "instance": None,
        "url": "https://huggingface.co/nvidia/Llama3-ChatQA-1.5-8B",
        "status": ModelStatus.STOPPED,
        "progress": 0,
        "background_image": "",
        "author": "NVIDIA",
        "name": "Llama3-ChatQA-1.5-8B",
        "params": 8_030_000_000,
        "description": "NVIDIA's 8B parameter model for chat-based question answering.",
    },
    {
        "id": "mmmm-nnnn-oooo-pppp",
        "instance": None,
        "url": "https://huggingface.co/meta-llama/Meta-Llama-3-8B",
        "status": ModelStatus.STOPPED,
        "progress": 0,
        "background_image": "",
        "author": "Meta Llama",
        "name": "Meta-Llama-3-8B",
        "params": 8_030_000_000,
        "description": "Meta Llama's 8B parameter model for general-purpose conversational AI.",
    },
    {
        "id": "qqqq-rrrr-ssss-tttt",
        "instance": None,
        "url": "https://huggingface.co/01-ai/Yi-1.5-34B-Chat",
        "status": ModelStatus.STOPPED,
        "progress": 0,
        "background_image": "",
        "author": "01 AI",
        "name": "Yi-1.5-34B-Chat",
        "params": 34_400_000_000,
        "description": "01 AI's 34.4B parameter model for chat-based question answering.",
    },
]


def get_highlights() -> list[HighlightedModel]:
    return [HighlightedModel(**model) for model in data]
