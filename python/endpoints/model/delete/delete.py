import shutil
from python.utils import get_app_data_path


def delete_model_handler(model_id: str):
    model_path = get_app_data_path() / "models" / model_id
    shutil.rmtree(model_path)
