import aiohttp
from loguru import logger
from state.ModelManager import ModelManager


class GlobalStateManager:
    """
    Manages the global state of the application, including the database connection,
    aiohttp session, and the ModelManager.
    """

    def __init__(self):
        self.session = None
        self.model_manager = None
        self._headers = {"Authorization": f"Bearer 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"}

    async def launch(self):
        self.session = await aiohttp.ClientSession(
            headers=self._headers
        ).__aenter__()  # Properly handle session in async context
        self.model_manager = ModelManager(self.session)

    async def teardown(self):
        """Closes the aiohttp session and disconnects from the database on server shutdown."""
        if self.session:
            await self.session.close()


global_state_manager = GlobalStateManager()
