from fastapi import FastAPI, WebSocket
import psutil
from starlette.websockets import WebSocketDisconnect
from fastapi.responses import StreamingResponse
import time
import os
import uuid
from .sysinfo import sysinfo_generator

app = FastAPI()

@app.get("/sysinfo", response_class=StreamingResponse)
async def sysinfo():
    response =  StreamingResponse(sysinfo_generator(), media_type="text/event-stream")
    response.headers['Content-Type'] = 'text/event-stream'
    response.headers['Cache-Control'] = 'no-cache'
    response.headers['Connection'] = 'keep-alive'
    return response


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
    uvicorn.run(app, host="0.0.0.0", port=8899)
