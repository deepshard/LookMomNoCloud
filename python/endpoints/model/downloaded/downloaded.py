import asyncio
import os

import aiohttp
from state import global_state_manager
from endpoints.model.install.install import (
    get_hf_repo_info,
    get_local_files,
    get_files_to_download,
)
from utils import get_app_data_path
from truffle_types import Model, ModelStatus
from constants import TRUFFLE_API_URL


async def is_model_downloaded(model_id: str) -> bool:
    """Checks if a model is fully downloaded."""

    model_path = get_app_data_path() / "models" / model_id / "base"

    if not os.path.isdir(model_path):
        return False

    async with aiohttp.ClientSession() as session:
        async with session.get(f"{TRUFFLE_API_URL}/models?id={model_id}") as response:
            assert response.status == 200, f"Failed to fetch model {model_id}"
            model = await response.json()
            hf_link = model["hfLink"]
            files_to_download = await get_files_to_download(hf_link, model_path)

            return len(files_to_download) == 0


async def get_downloaded_models():
    """Returns a list of all downloaded models"""

    base_dir = get_app_data_path() / "models"
    model_ids = os.listdir(base_dir)

    async with aiohttp.ClientSession() as session:
        tasks = [get_model_details(model_id, session) for model_id in model_ids]
        models = await asyncio.gather(*tasks)

    # Filter out None values if the model is not downloaded
    return [model for model in models if model is not None]


async def get_model_status(model_id):
    """Helper function to fetch model status."""
    model = await global_state_manager.db.runningmodels.find_first(
        where={"id": model_id}
    )
    if model:
        return ModelStatus.RUNNING
    return ModelStatus.STOPPED


async def get_model_details(model_id, session):
    """Helper function to fetch model details if downloaded."""
    downloaded = await is_model_downloaded(model_id)
    if downloaded:
        async with session.get(f"{TRUFFLE_API_URL}/models?id={model_id}") as response:
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
                hf_link=model["hfLink"],
                eval_id=model["evalId"],
                status=await get_model_status(model_id),
                background_image=model["backgroundImage"],
                instance=0,
                progress=0,
            )
    return None
