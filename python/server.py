from fastapi import FastAPI, WebSocket
from starlette.websockets import WebSocketDisconnect
from loguru import logger
import json

app = FastAPI()

@app.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            try:
                data = json.loads(data)
                cmd = data["cmd"]
                if cmd == "SYSINFO":
                    logger.info(f"<-- SYSINFO")
                    await websocket.send_text("TEST")
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON, {data}; ignoring")
    except WebSocketDisconnect:
        logger.info("client disconnected")

