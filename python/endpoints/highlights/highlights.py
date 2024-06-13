import asyncio
import aiohttp
from truffle_types import Model, ModelStatus
from db import db
from constants import TRUFFLE_API_URL


async def get_highlights() -> list[Model]:
    async with aiohttp.ClientSession() as session:
        models = await db.runningmodels.find_many()
        tasks = []
        for model in models:
            task = fetch_model_data(session, model)
            tasks.append(task)
        if len(models) < 5:
            tasks.append(get_trending_models(session, 5 - len(models)))
            results = await asyncio.gather(*tasks)
            trending = results.pop()
            return results + trending
        else:
            return await asyncio.gather(*tasks)


async def get_trending_models(session, num: int) -> list[Model]:
    async with session.get(
        f"{TRUFFLE_API_URL}/models/trending?k={
            num}&filter=id,name,title,size,author,downloads,likes,intro,capabilities,risks,evalId,hfLink,bg_image_url"
    ) as response:
        print(response)
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
                hf_link=model["hfLink"],
                eval_id=model["evalId"],
                status=ModelStatus.NOT_DOWNLOADED,
                background_image=model["bg_image_url"],
                instance=0,
                progress=0,
            )
            for model in data
        ]


async def fetch_model_data(session, model):
    async with session.get(f"{TRUFFLE_API_URL}/models?id={model.id}&filter=id,name,title,size,author,downloads,likes,intro,capabilities,risks,evalId,hfLink,bg_image_url") as response:
        assert response.status == 200, f"Failed to fetch model data for {
            model.id}"
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
            hf_link=model_data["hfLink"],
            eval_id=model_data["evalId"],
            status=ModelStatus.RUNNING,
            background_image=model_data["backgroundImage"],
            instance=model.instance,
            progress=0,
        )
