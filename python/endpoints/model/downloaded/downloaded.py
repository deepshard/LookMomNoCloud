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


async def get_downloaded_model_ids():
    base_dir = get_app_data_path() / "models"
    downloaded_models = os.listdir(base_dir)

    uuid_pattern = re.compile(
        r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
    )
    downloaded_models = [
        model_id
        for model_id in downloaded_models
        if uuid_pattern.match(model_id) and await is_model_downloaded(model_id)
    ]
    return downloaded_models


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
    downloaded_model_ids = await get_downloaded_model_ids()
    tasks = [get_model_details(model_id) for model_id in downloaded_model_ids]
    models = await asyncio.gather(*tasks)

    # Filter out None values if the model is not downloaded
    return [model for model in models if model is not None]


async def get_model_status(model_id):
    """Helper function to fetch model status."""
    model = await RunningModel.get_by_id(model_id)
    if model:
        return ModelStatus.RUNNING
    return ModelStatus.STOPPED


async def get_model_details(model_id):
    """Helper function to fetch model details if downloaded."""
    async with global_state_manager.session.get(
        f"{TRUFFLE_API_URL}/models/{model_id}",
        headers={"Authorization": f"Bearer {os.getenv('API_TOKEN')}"},
    ) as response:
        assert response.status == 200, f"Failed to fetch model {model_id}"
        model = await response.json()
        return Model(
            id=model["id"],
            name=model["name"],
            title=model["title"],
            size=model["size"],
            author=model["author"],
            downloads=model["downloads"],
            likes=model["likes"],
            intro=model["intro"],
            capabilities=model["capabilities"],
            risks=model["risks"],
            eval_id=model["evalId"],
            hf_link=model["hfLink"],
            status=await get_model_status(model_id),
            background_image=model["backgroundImage"],
            instance=0,
            progress=0,
        )
