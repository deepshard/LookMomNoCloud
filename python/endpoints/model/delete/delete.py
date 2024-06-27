import shutil
import os
import signal
from loguru import logger
from models import RunningModel
from db import get_db_session
from utils import get_app_data_path


async def delete_model_handler(model_id: str):
    logger.info(f"Deleting model {model_id}")

    # Get the model instances from the database
    running_models = await RunningModel.get_all()
    async with get_db_session() as session:
        for model_instance in running_models:
            logger.info(f"Killing process with PID {model_instance.pid}")
            os.kill(model_instance.pid, signal.SIGTERM)

            # Remove the model instances from the database
            await session.delete(model_instance)

        await session.commit()

    model_path = get_app_data_path() / "models" / model_id
    logger.info(f"Deleting model at: {model_path}")
    shutil.rmtree(model_path)
