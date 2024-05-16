from fastapi import FastAPI, WebSocket
from starlette.websockets import WebSocketDisconnect
from loguru import logger
import json
from verbs import sysinfo, get_model_state, download_model, convert_weights

app = FastAPI()


@app.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            try:
                data = json.loads(data)
                cmd = data.get("cmd")

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

                        app_data_path = data.get("app_data_path")
                        model_name = data.get("model_name")

                        if model_name is None or app_data_path is None:
                            await websocket.send_text(json.dumps({
                                "cmd": "DOWNLOAD_MODEL",
                                "data": {},
                                "error": "Missing arguments"
                            }))
                            break

                        try:
                            download_info = download_model(
                                app_data_path, model_name, websocket)
                            await websocket.send_text(json.dumps({
                                "cmd": "DOWNLOAD_MODEL",
                                "data": download_info
                            }))
                        except Exception as e:
                            await websocket.send_text(json.dumps({
                                "cmd": "DOWNLOAD_MODEL",
                                "data": {},
                                "error": str(e)
                            }))
                    case "CONVERT_WEIGHTS":
                        logger.info(f"<-- CONVERT_WEIGHTS")

                        app_data_path = data.get("app_data_path")
                        model_name = data.get("model_name")
                        quant = data.get("quant")

                        if model_name is None or app_data_path is None or quant is None:
                            await websocket.send_text(json.dumps({
                                "cmd": "CONVERT_WEIGHTS",
                                "data": {},
                                "error": "Missing arguments"
                            }))
                            break

                        try:
                            convert_info = convert_weights(
                                app_data_path, model_name, quant, websocket)
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
    uvicorn.run(app, host="0.0.0.0", port=8899)
