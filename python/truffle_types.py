from dataclasses import dataclass
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel
from typing import List, Dict, Literal
from uuid import UUID


class RepoType(Enum):
    HF = "HF"


class Quantization(Enum):
    Q0F16 = "q0f16"
    Q4F16_0 = "q4f16_0"
    Q4F16_1 = "q4f16_1"
    Q4F16_2 = "q4f16_2"
    Q4F16_FT = "q4f16_ft"
    Q3F16_0 = "q3f16_0"
    Q3F16_1 = "q3f16_1"


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


@dataclass
class Model:
    id: str
    name: str
    title: str
    size: int
    author: str
    downloads: int
    likes: int
    intro: str
    capabilities: str
    risks: str
    hf_link: str
    eval_id: str | None
    status: ModelStatus
    background_image: str
    instance: int
    progress: int


# Request Schemas
class InstallRequest(BaseModel):
    id: str
    url: str


class RunRequest(BaseModel):
    ids: List[str]


class StopRequest(BaseModel):
    id: str
    instance: int
