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
    uuid_pattern = re.compile(
        r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
    )
    base_dir = get_app_data_path() / "models"

    # Get all local models that are either running or downloaded
    running_models = await RunningModel.get_all()
    downloaded_models = [
        {"id": model_id, "instance": None}
        for model_id in os.listdir(base_dir)
        if uuid_pattern.match(model_id) and await is_model_downloaded(model_id)
    ]

    # Combine running and downloaded models
    all_models = {
        model.id: {"id": model.id, "instance": model.instance} for model in running_models
    }
    all_models.update(
        {model["id"]: model for model in downloaded_models if model["id"] not in all_models}
    )

    # Fetch data for all running/downloaded models
    tasks = [fetch_model_data(model) for model in all_models.values()]

    # If we have less than 5 models, fetch trending models to pad the list
    if len(all_models) < 5:
        tasks.append(get_trending_models(5))

    results = await asyncio.gather(*tasks)

    # If we have less than 5 models, pad the list with trending models up to 5
    if len(all_models) < 5:
        trending_models = results.pop()
        results.extend(model for model in trending_models if model.id not in all_models)
        results = results[:5]

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
                evalId=model["evalId"],
                hfLink=model["hfLink"],
                status=ModelStatus.NOT_DOWNLOADED,
                backgroundImage=model["backgroundImage"],
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
            evalId=model_data["evalId"],
            hfLink=model_data["hfLink"],
            status=ModelStatus.RUNNING if model["instance"] is not None else ModelStatus.STOPPED,
            backgroundImage=model_data["backgroundImage"],
            instance=model["instance"] if model["instance"] is not None else 0,
            progress=0,
        )
