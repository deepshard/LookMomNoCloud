import shutil
from loguru import logger
from utils import get_app_data_path


def delete_model_handler(model_id: str):
    model_path = get_app_data_path() / "models" / model_id
    logger.info(f"Deleting model at: {model_path}")
    shutil.rmtree(model_path)
