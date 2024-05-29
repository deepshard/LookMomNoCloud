from dataclasses import dataclass
from enum import Enum


class RepoType(Enum):
    HF = "HF"


class Quantization(Enum):
    INT8 = "INT8"
    INT4 = "INT4"
    INT3 = "INT3"


class ModelStatus(Enum):
    NOT_DOWNLOADED = "NOT_DOWNLOADED"
    DOWNLOADING = "DOWNLOADING"
    INSTALLING = "INSTALLING"
    RUNNING = "RUNNING"
    STOPPED = "STOPPED"


@dataclass
class FileInfo:
    file: str
    size: int


@dataclass
class Model:
    id: str
    url: str
    status: ModelStatus
    background_image: str
    author: str
    name: str
    params: int
    description: str
    instance: int
    progress: int
