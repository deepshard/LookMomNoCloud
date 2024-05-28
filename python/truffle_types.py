from dataclasses import dataclass
from enum import Enum
from typing import List, Dict, Literal
from uuid import UUID


class RepoType(Enum):
    HF = "HF"


class Quantization(Enum):
    INT8 = "INT8"
    INT4 = "INT4"
    INT3 = "INT3"


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
