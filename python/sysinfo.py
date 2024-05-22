import json
from loguru import logger
import psutil
import time
import os
import uuid

from .utils import get_app_data_path, get_disk_usage
from .db import db
import psutil


CHANGE_THRESHOLD = 2

async def get_sysinfo():
    models_data = await get_models_data() 
    data =  {
        "os": "MAC" if os.name == 'posix' else "LINUX",
        "resources": {
            "available": {
                "ram": psutil.virtual_memory().available,
                "disk": psutil.disk_usage('/').free
            },
            "models": models_data,
            "total": {
                "ram": psutil.virtual_memory().total,
                "disk": psutil.disk_usage('/').total
            }
        }
    }

    return data



async def get_models_data():
    models = await db.runningmodels.find_many()
    final = []
    for model in models:
        try:
            memory_info = psutil.Process(model.pid).memory_info()
            final.append({
                "id": model.id,
                "ram": memory_info.rss,
                "disk": get_disk_usage(get_app_data_path() / "models" / model.id)
            })
        except psutil.NoSuchProcess:
            logger.warning("No process found with PID: {}".format(model.pid))
            continue
    return final

async def sysinfo_generator():
    last_info = await get_sysinfo()
    yield f"data: {json.dumps(last_info)}\n\n"
    while True:
        time.sleep(3)
        current_info = await get_sysinfo()
        if needs_update(last_info, current_info):
            yield f"data: {json.dumps(current_info)}\n\n"
            last_info = current_info


def needs_update(last_info, current_info):
    def percent_change(old, new):
        if old == 0:
            return float('inf')  # Avoid division by zero
        return abs(new - old) / old * 100

    ram_change = percent_change(last_info['resources']['available']['ram'], current_info['resources']['available']['ram'])
    disk_change = percent_change(last_info['resources']['available']['disk'], current_info['resources']['available']['disk'])

    return ram_change >= CHANGE_THRESHOLD or disk_change >= CHANGE_THRESHOLD
