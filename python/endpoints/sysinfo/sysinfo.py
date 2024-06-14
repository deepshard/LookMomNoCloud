import asyncio
import dataclasses
import json
from typing import List
from loguru import logger
import psutil
import time
import os

from sqlalchemy import select
from models import RunningModel
from truffle_types import (
    ModelResourceDetails,
    SystemInfo,
    SystemResourceDetails,
    SystemResources,
)

from utils import get_app_data_path, get_disk_usage
from db import get_db_session


CHANGE_THRESHOLD = 3


async def get_sysinfo() -> SystemInfo:
    models_data = await get_models_data()
    resources = SystemResources(
        available=SystemResourceDetails(
            ram=psutil.virtual_memory().available,
            disk=psutil.disk_usage("/").free,
        ),
        models=models_data,
        total=SystemResourceDetails(
            ram=psutil.virtual_memory().total,
            disk=psutil.disk_usage("/").total,
        ),
    )

    return SystemInfo(
        os="MAC" if os.name == "posix" else "LINUX",
        resources=resources,
    )


async def get_models_data() -> List[ModelResourceDetails]:
    models = await RunningModel.get_all()
    final = []
    for model in models:
        try:
            memory_info = psutil.Process(model.pid).memory_info()
            final.append(
                ModelResourceDetails(
                    id=model.id,
                    ram=memory_info.rss,
                    disk=get_disk_usage(get_app_data_path() / "models" / model.id),
                )
            )
        except psutil.NoSuchProcess:
            logger.warning("No process found with PID: {}".format(model.pid))
            continue
    return final


async def sysinfo_generator():
    last_info = await get_sysinfo()
    yield f"data: {json.dumps(dataclasses.asdict(last_info))}\n\n"
    while True:
        await asyncio.sleep(3)
        current_info = await get_sysinfo()
        if needs_update(last_info, current_info):
            yield f"data: {json.dumps(dataclasses.asdict(current_info))}\n\n"
            last_info = current_info


def needs_update(last_info: SystemInfo, current_info: SystemInfo) -> bool:
    def percent_change(old: int, new: int) -> float:
        if old == 0:
            return float("inf")  # Avoid division by zero
        return abs(new - old) / old * 100

    ram_change = percent_change(
        last_info.resources.available.ram,
        current_info.resources.available.ram,
    )
    disk_change = percent_change(
        last_info.resources.available.disk,
        current_info.resources.available.disk,
    )

    return ram_change >= CHANGE_THRESHOLD or disk_change >= CHANGE_THRESHOLD
