import os
import signal
from loguru import logger
from state import global_state_manager


async def stop_model_handler(model_id: str, instance: int):
    # Stop the model instance
    logger.info(f"Stopping model {model_id} instance {instance}")

    # Get the model instance from the database
    model_db_info = await global_state_manager.db.runningmodels.find_first(
        where={"id": model_id, "instance": instance}
    )
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
    await global_state_manager.db.runningmodels.delete_many(
        where={"id": model_id, "instance": instance}
    )
