from fastapi import FastAPI, WebSocket
from starlette.websockets import WebSocketDisconnect
from loguru import logger
import json
from verbs import sysinfo, get_model_state, download_model

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

                match cmd:
                    case "HEALTH":
                        logger.info(f"<-- HEALTH")
                        await websocket.send_text(json.dumps({"status": "OK"}))
                    case "SYSINFO":
                        logger.info(f"<-- SYSINFO")
                        info = sysinfo()
                        await websocket.send_text(json.dumps(info))
                    case "GET_MODEL_STATE":
                        logger.info(f"<-- GET_MODEL_STATE")
                        state = get_model_state()
                        await websocket.send_text(json.dumps(state))
                    case "DOWNLOAD_MODEL":
                        logger.info(f"<-- DOWNLOAD_MODEL")

                        app_data_path = data.get("app_data_path")
                        model_name = data.get("model_name")

                        if model_name is None or app_data_path is None:
                            await websocket.send_text(json.dumps({"error": "Missing arguments"}))
                            break

                        download_info = download_model(
                            app_data_path, model_name, websocket)
                        await websocket.send_text(json.dumps(download_info))
                    case _:
                        await websocket.send_text(json.dumps({"error": "Invalid command"}))

            except json.JSONDecodeError:
                logger.error(f"Invalid JSON, {data}; ignoring")
    except WebSocketDisconnect:
        logger.info("client disconnected")
