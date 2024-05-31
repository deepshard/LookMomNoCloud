import os
from endpoints.model.install.install import (
    get_hf_repo_info,
    get_local_files,
    get_files_to_download,
)
from utils import get_app_data_path
from truffle_types import Model, ModelStatus


async def is_model_downloaded(model_id: str) -> bool:
    """Checks if a model is fully downloaded."""

    model_path = get_app_data_path() / "models" / model_id / "base"

    if not os.path.isdir(model_path):
        return False

    # TODO: Look up model details via HF scraping API
    url = "https://huggingface.co/openai-community/gpt2"

    remote_files = await get_hf_repo_info("openai-community/gpt2")
    local_files = get_local_files(model_path)
    files_to_download = get_files_to_download(remote_files, local_files)

    return len(files_to_download) == 0


async def get_downloaded_models():
    """Returns a list of all downloaded models."""

    base_dir = get_app_data_path() / "models"
    models = []
    for model_id in os.listdir(base_dir):
        downloaded = await is_model_downloaded(model_id)
        if downloaded:
            # TODO: Look up model details via HF scraping API

            model = Model(
                id=model_id,
                url="https://huggingface.co/openai-community/gpt2",
                status=ModelStatus.STOPPED,  # TODO: Get actual status. Do we need a global status db?
                background_image="",
                author="OpenAI",
                name="GPT-2",
                params=137_000_000,
                description="OpenAI's 137M parameter model for text generation.",
                instance=None,
                progress=None,
            )
            models.append(model)

    return models
