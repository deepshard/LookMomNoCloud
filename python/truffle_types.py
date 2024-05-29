from dataclasses import dataclass
from enum import Enum
from typing import List
from pydantic import BaseModel
from typing import List, Dict, Literal
from uuid import UUID


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
class SystemResourceDetails:
    ram: int
    disk: int


@dataclass
class ModelResourceDetails:
    id: UUID
    disk: int
    ram: int


@dataclass
class SystemResources:
    available: SystemResourceDetails
    models: List[ModelResourceDetails]
    total: SystemResourceDetails


@dataclass
class SystemInfo:
    os: Literal["MAC", "LINUX"]
    resources: SystemResources


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


# Request Schemas
class InstallRequest(BaseModel):
    url: str


class RunRequest(BaseModel):
    ids: List[str]


class StopRequest(BaseModel):
    id: str
    instance: int
