import aiohttp
from loguru import logger
from state.ModelManager import ModelManager
from db import db


class GlobalStateManager:
    """
    GlobalStateManager is a class that manages the global state of the application.
    It is responsible for managing the database connection, the aiohttp session, and the ModelManager.
    """

    def __init__(self):
        self.db = db
        self.session = aiohttp.ClientSession()
        self.model_manager = ModelManager(self.session)

    async def launch(self):
        if not db.is_connected():
            logger.info(f"Connecting to DB at: {db._datasource}")
            await db.connect()

    async def teardown(self):
        """Kill the aiohttp session and disconnect from the database on server shutdown."""

        await self.session.close()

        if db.is_connected():
            await db.disconnect()


global_state_manager = GlobalStateManager()
