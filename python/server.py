from fastapi import FastAPI, WebSocket
from starlette.websockets import WebSocketDisconnect
from loguru import logger
import json
from verbs import sysinfo, get_model_state, download_model, convert_weights, launch_model, stop_model
from DownloadManager import DownloadManager

app = FastAPI()


@app.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            download_manager = DownloadManager()

            data = await websocket.receive_text()
            try:
                data = json.loads(data)
                cmd = data.get("cmd")
                data = data.get("data")

                match cmd:
                    case "HEALTH":
                        logger.info(f"<-- HEALTH")
                        await websocket.send_text(json.dumps({
                            "cmd": "HEALTH",
                            "data": {
                                "status": "OK"
                            }
                        }))
                    case "SYSINFO":
                        logger.info(f"<-- SYSINFO")
                        info = sysinfo()

                        try:
                            await websocket.send_text(json.dumps({
                                "cmd": "SYSINFO",
                                "data": info
                            }))
                        except Exception as e:
                            await websocket.send_text(json.dumps({
                                "cmd": "SYSINFO",
                                "data": {},
                                "error": str(e)
                            }))
                    case "GET_MODEL_STATE":
                        logger.info(f"<-- GET_MODEL_STATE")
                        state = get_model_state()
                        await websocket.send_text(json.dumps({
                            "cmd": "GET_MODEL_STATE",
                            "data": state
                        }))
                    case "DOWNLOAD_MODEL":
                        logger.info(f"<-- DOWNLOAD_MODEL")

                        model_name = data.get("model_name")

                        if model_name is None:
                            await websocket.send_text(json.dumps({
                                "cmd": "DOWNLOAD_MODEL",
                                "data": {},
                                "error": "Missing model name"
                            }))
                            break

                        try:
                            download_info = await download_model(
                                model_name, websocket, download_manager)
                            await websocket.send_text(json.dumps({
                                "cmd": "DOWNLOAD_MODEL",
                                "data": download_info
                            }))
                        except Exception as e:
                            logger.error(f"Error downloading model: {e}")
                            await websocket.send_text(json.dumps({
                                "cmd": "DOWNLOAD_MODEL",
                                "data": {},
                                "error": str(e)
                            }))
                    case "CONVERT_WEIGHTS":
                        logger.info(f"<-- CONVERT_WEIGHTS")

                        model_name = data.get("model_name")
                        quant = data.get("quant")

                        if model_name is None or quant is None:
                            await websocket.send_text(json.dumps({
                                "cmd": "CONVERT_WEIGHTS",
                                "data": {},
                                "error": "Missing arguments"
                            }))
                            break

                        try:
                            convert_info = await convert_weights(
                                model_name, quant, websocket)
                            await websocket.send_text(json.dumps({
                                "cmd": "CONVERT_WEIGHTS",
                                "data": convert_info
                            }))
                        except Exception as e:
                            await websocket.send_text(json.dumps({
                                "cmd": "CONVERT_WEIGHTS",
                                "data": {},
                                "error": str(e)
                            }))
                    case "LAUNCH_MODEL":
                        logger.info(f"<-- LAUNCH_MODEL")

                        model_name = data.get("model_name")

                        if model_name is None:
                            await websocket.send_text(json.dumps({
                                "cmd": "LAUNCH_MODEL",
                                "data": {},
                                "error": "Missing model name"
                            }))
                            break

                        try:
                            instance_info = await launch_model(model_name)
                            await websocket.send_text(json.dumps({
                                "cmd": "LAUNCH_MODEL",
                                "data": instance_info
                            }))
                        except Exception as e:
                            await websocket.send_text(json.dumps({
                                "cmd": "LAUNCH_MODEL",
                                "data": {},
                                "error": str(e)
                            }))
                    case "STOP_MODEL":
                        logger.info(f"<-- STOP_MODEL")
                        instance_id = data.get("instance_id")

                        if instance_id is None:
                            await websocket.send_text(json.dumps({
                                "cmd": "STOP_MODEL",
                                "data": {},
                                "error": "Missing instance ID"
                            }))
                            break

                        try:
                            stop_info = stop_model(instance_id)
                            await websocket.send_text(json.dumps({
                                "cmd": "STOP_MODEL",
                                "data": stop_info
                            }))
                        except Exception as e:
                            await websocket.send_text(json.dumps({
                                "cmd": "STOP_MODEL",
                                "data": {},
                                "error": str(e)
                            }))
                    case _:
                        await websocket.send_text(json.dumps({
                            "cmd": cmd,
                            "error": "Invalid command"
                        }))

            except json.JSONDecodeError:
                logger.error(f"Invalid JSON, {data}; ignoring")
    except WebSocketDisconnect:
        logger.info("client disconnected")


if __name__ == "__main__":
    import uvicorn
    import sqlite3

    # Create truffle.db if it doesn't exist and create a running_models table if it doesn't exist
    conn = sqlite3.connect("truffle.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS running_models (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            pid INTEGER NOT NULL,
            port INTEGER NOT NULL,
            quant TEXT NOT NULL,
            size INTEGER NOT NULL
        )
    """)
    conn.commit()
    conn.close()

    uvicorn.run(app, host="0.0.0.0", port=8899)
