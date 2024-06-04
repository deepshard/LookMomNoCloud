from truffle_types import Model, ModelStatus

data = [
    {
        "id": "aaaa-bbbb-cccc-dddd",
        "url": "https://huggingface.co/gradientai/Llama-3-8B-Instruct-Gradient-1048k",
        "status": ModelStatus.DOWNLOADING,
        "background_image": "https://images.unsplash.com/photo-1604079628040-94301bb21b91?q=80&w=2731&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "author": "Gradient AI",
        "name": "Llama-3-8B-Instruct-Gradient-1048k",
        "params": 8_030_000_000,
        "description": "Gradient AI's 8B parameter model for instruction following.",
        "instance": None,
        "progress": 64,
    },
    {
        "id": "eeee-ffff-gggg-hhhh",
        "url": "https://huggingface.co/microsoft/Phi-3-small-8k-instruct",
        "status": ModelStatus.INSTALLING,
        "background_image": "https://images.unsplash.com/photo-1569982175971-d92b01cf8694?q=80&w=3024&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
        "background_image": "https://images.unsplash.com/photo-1508614999368-9260051292e5?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
        "background_image": "https://images.unsplash.com/photo-1635776062360-af423602aff3?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
        "background_image": "https://images.unsplash.com/photo-1638742385167-96fc60e12f59?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
