from fastapi import FastAPI, WebSocket
from starlette.websockets import WebSocketDisconnect
from loguru import logger
from DownloadManager import DownloadManager
from db_manager import create_models_table

app = FastAPI()


@app.get("/sysinfo")
async def sysinfo():
    pass


@app.get("/highlights")
async def highlights():
    pass


@app.post("/model/install")
async def install_model():
    pass


@app.post("/model/run")
async def run_model():
    pass


@app.post("/model/stop")
async def stop_model():
    pass


@app.delete("/model/{model_id}")
async def delete_model(model_id: str):
    pass

if __name__ == "__main__":
    import uvicorn

    create_models_table()
    uvicorn.run(app, host="0.0.0.0", port=8899)
