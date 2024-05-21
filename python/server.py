from fastapi import FastAPI, WebSocket
from starlette.websockets import WebSocketDisconnect
from loguru import logger
import json
from verbs import sysinfo, get_model_state, download_model, convert_weights, launch_model, stop_model
from DownloadManager import DownloadManager
from db_manager import create_models_table

app = FastAPI()


async def execute_cmd(websocket, cmd, operation, *args, **kwargs):
    try:
        data = await operation(*args, **kwargs)
        response = {"cmd": cmd, "data": data}
    except Exception as e:
        logger.error(f"Error executing command {cmd}: {e}")
        response = {"cmd": cmd, "data": {}, "error": str(e)}

    await websocket.send_text(json.dumps(response))


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
                        await execute_cmd(websocket, cmd, lambda: {"status": "OK"})

                    case "SYSINFO":
                        logger.info(f"<-- SYSINFO")
                        await execute_cmd(websocket, "SYSINFO", sysinfo)

                    case "GET_MODEL_STATE":
                        logger.info(f"<-- GET_MODEL_STATE")
                        await execute_cmd(websocket, "GET_MODEL_STATE", get_model_state)

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

                        await execute_cmd(websocket, "DOWNLOAD_MODEL", download_model, model_name, websocket, download_manager)

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

                        await execute_cmd(websocket, "CONVERT_WEIGHTS", convert_weights, model_name, quant, websocket)

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

                        await execute_cmd(websocket, "LAUNCH_MODEL", launch_model, model_name)

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

                        await execute_cmd(websocket, "STOP_MODEL", stop_model, instance_id)

                    case _:
                        await websocket.send_text(json.dumps({
                            "cmd": cmd,
                            "data": {},
                            "error": "Invalid command"
                        }))

            except json.JSONDecodeError:
                logger.error(f"Invalid JSON, {data}; ignoring")
    except WebSocketDisconnect:
        logger.info("client disconnected")


if __name__ == "__main__":
    import uvicorn

    create_models_table()
    uvicorn.run(app, host="0.0.0.0", port=8899)
