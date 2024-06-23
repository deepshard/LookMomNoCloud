import os
import re
import asyncio
from state import global_state_manager
from truffle_types import Model, ModelStatus
from constants import TRUFFLE_API_URL
from state import global_state_manager
from models import RunningModel
from endpoints.model.downloaded.downloaded import get_all_local_models, get_model_details
from utils import get_app_data_path
from dotenv import load_dotenv

load_dotenv()


async def get_highlights() -> list[Model]:
    all_models = await get_all_local_models()

    # Fetch data for all running/downloaded models
    tasks = [get_model_details(model) for model in all_models.values()]

    # If we have less than 5 models, fetch trending models to pad the list
    if len(all_models) < 5:
        tasks.append(get_trending_models(5))

    results = await asyncio.gather(*tasks)

    # If we have less than 5 models, pad the list with trending models up to 5
    if len(all_models) < 5:
        trending_models = results.pop()
        results.extend(model for model in trending_models if model.id not in all_models)
        results = results[:5]

    return results


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
                port=None,
                progress=0,
            )
            for model in data
        ]
