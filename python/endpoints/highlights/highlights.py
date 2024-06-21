import os
import re
import asyncio
from state import global_state_manager
from truffle_types import Model, ModelStatus
from constants import TRUFFLE_API_URL
from state import global_state_manager
from models import RunningModel
from endpoints.model.downloaded.downloaded import is_model_downloaded
from utils import get_app_data_path
from dotenv import load_dotenv


load_dotenv()


async def get_highlights() -> list[Model]:
    base_dir = get_app_data_path() / "models"
    running_models = [
        {"id": model.id, "instance": model.instance} for model in (await RunningModel.get_all())
    ]
    downloaded_models = [{"id": model_id, "instance": None} for model_id in os.listdir(base_dir)]

    uuid_pattern = re.compile(
        r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
    )
    downloaded_models = [
        model_id
        for model_id in downloaded_models
        if uuid_pattern.match(model_id["id"]) and await is_model_downloaded(model_id["id"])
    ]

    # Dedupe model IDs
    for model in downloaded_models:
        if model["id"] in [running_model["id"] for running_model in running_models]:
            continue

        running_models.append(model)

    tasks = []
    for model in running_models:
        task = fetch_model_data(model)
        tasks.append(task)

    tasks.append(get_trending_models(5))
    results = await asyncio.gather(*tasks)
    trending = results.pop()

    # If trending model is already downloaded or running, do not append to results
    for model in trending:
        if model.id in [result.id for result in results]:
            continue

        results.append(model)

    return results[:5]


async def get_trending_models(num: int) -> list[Model]:
    async with global_state_manager.session.get(
        f"{TRUFFLE_API_URL}/models/trending?k={num}",
        headers={"Authorization": f"Bearer {os.getenv('API_TOKEN')}"},
    ) as response:
        assert response.status == 200, f"Failed to fetch trending models"
        data = await response.json()
        return [
            Model(
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
                status=ModelStatus.NOT_DOWNLOADED,
                background_image=model["backgroundImage"],
                instance=0,
                progress=0,
            )
            for model in data
        ]


async def fetch_model_data(model):
    async with global_state_manager.session.get(
        f"{TRUFFLE_API_URL}/models/{model['id']}",
        headers={"Authorization": f"Bearer {os.getenv('API_TOKEN')}"},
    ) as response:
        assert response.status == 200, f"Failed to fetch model data for {model['id']}"
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
            eval_id=model_data["evalId"],
            hf_link=model_data["hfLink"],
            status=ModelStatus.RUNNING if model["instance"] is not None else ModelStatus.STOPPED,
            background_image=model_data["backgroundImage"],
            instance=model["instance"] if model["instance"] is not None else 0,
            progress=0,
        )
