import os
import signal
from loguru import logger
from sqlalchemy import select
from models import RunningModel
from db import get_db_session


async def stop_model_handler(model_id: str, instance: int):
    # Stop the model instance
    logger.info(f"Stopping model {model_id} instance {instance}")

    # Get the model instance from the database
    async with get_db_session() as session:
        result = await session.scalars(
            select(RunningModel).where(
                RunningModel.id == model_id,
                RunningModel.instance == instance,
            )
        )
        model_db_info = result.first()
        if model_db_info is None:
            logger.error(
                f"""Model {model_id} instance {
                    instance} not found in database"""
            )
            raise ValueError(f"Model {model_id} instance {instance} not found")

        # Stop the model instance
        logger.info(f"Killing process with PID {model_db_info.pid}")
        os.kill(model_db_info.pid, signal.SIGTERM)

        # Remove the model instance from the database
        await session.delete(model_db_info)
        await session.commit()


async def stop_all_models():
    running_models = await RunningModel.get_all()
    for model in running_models:
        await stop_model_handler(model.id, model.instance)
    logger.info("All models stopped")