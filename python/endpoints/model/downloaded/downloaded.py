import asyncio
import os
import re
import aiohttp
from models import RunningModel
from state import global_state_manager
from endpoints.model.install.install import (
    get_hf_repo_info,
    get_local_files,
    get_files_to_download,
)
from utils import get_app_data_path
from truffle_types import Model, ModelStatus
from constants import TRUFFLE_API_URL
from state import global_state_manager
from dotenv import load_dotenv

load_dotenv()


async def is_model_downloaded(model_id: str) -> bool:
    """Checks if a model is fully downloaded."""

    model_path = get_app_data_path() / "models" / model_id / "base"

    if not os.path.isdir(model_path):
        return False

    async with global_state_manager.session.get(
        f"{TRUFFLE_API_URL}/models/{model_id}",
        headers={"Authorization": f"Bearer {os.getenv('API_TOKEN')}"},
    ) as response:
        assert response.status == 200, f"Failed to fetch model {model_id}"
        model = await response.json()
        hf_link = model["hfLink"]
        files_to_download = await get_files_to_download(hf_link, model_path)

        return len(files_to_download) == 0


async def get_downloaded_models():
    """Returns a list of all downloaded models"""

    uuid_pattern = re.compile(
        r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
    )
    base_dir = get_app_data_path() / "models"

    # Get all local models that are either running or downloaded
    running_models = await RunningModel.get_all()
    downloaded_models = [
        {"id": model_id, "instance": None, "port": None}
        for model_id in os.listdir(base_dir)
        if uuid_pattern.match(model_id) and await is_model_downloaded(model_id)
    ]

    # Combine running and downloaded models
    all_models = {
        model.id: {"id": model.id, "instance": model.instance, "port": model.port} for model in running_models
    }
    all_models.update(
        {model["id"]: model for model in downloaded_models if model["id"] not in all_models}
    )

    tasks = [get_model_details(model) for model in all_models.values()]
    models = await asyncio.gather(*tasks)

    # Filter out None values if the model is not downloaded
    return [model for model in models if model is not None]


async def get_model_status(model_id):
    """Helper function to fetch model status."""
    model = await RunningModel.get_by_id(model_id)
    if model:
        return ModelStatus.RUNNING
    return ModelStatus.STOPPED


async def get_model_details(model):
    """Helper function to fetch model details if downloaded."""
    async with global_state_manager.session.get(
        f"{TRUFFLE_API_URL}/models/{model["id"]}",
        headers={"Authorization": f"Bearer {os.getenv('API_TOKEN')}"},
    ) as response:
        assert response.status == 200, f"Failed to fetch model {model["id"]}"
        model_data = await response.json()
        return Model(
            id=model_data["id"],
            name=model_data["name"],
            title=model_data["title"],
            size=model_data["size"],
            author=model_data["author"],
            downloads=model_data["downloads"],
            likes=model_data["likes"],
            intro=model_data["intro"],
            capabilities=model_data["capabilities"],
            risks=model_data["risks"],
            evalId=model_data["evalId"],
            hfLink=model_data["hfLink"],
            status=await get_model_status(model["id"]),
            backgroundImage=model_data["backgroundImage"],
            instance=model["instance"] if model["instance"] is not None else 0,
            port=model["port"] if model["port"] is not None else None,
            progress=0,
        )
