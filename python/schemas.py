from dataclasses import dataclass
from enum import Enum


class ModelStatus(Enum):
    DOWNLOADING = "DOWNLOADING"
    INSTALL_QUEUE = "INSTALL_QUEUE"
    INSTALLING = "INSTALLING"
    RUNNING = "RUNNING"


class ModelQuantization(Enum):
    noquant = "noquant"
    int4 = "int4"
    int3 = "int3"


@dataclass
class ModelInfo:
    id: str
    name: str
    size: int
    status: ModelStatus
    pid: int = None
    port: int = None
    quantization: ModelQuantization = None
    progress: float = None
