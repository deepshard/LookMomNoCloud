from dataclasses import dataclass
from enum import Enum


class RepoType(Enum):
    HF = "HF"


class Quantization(Enum):
    INT8 = "INT8"
    INT4 = "INT4"
    INT3 = "INT3"


class ModelStatus(Enum):
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
    background_image: str
    author: str
    name: str
    params: int
    description: str


@dataclass
class HighlightedModel(Model):
    instance: int
    status: ModelStatus
    progress: int
