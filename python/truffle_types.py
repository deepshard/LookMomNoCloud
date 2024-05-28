from dataclasses import dataclass
from enum import Enum
from typing import List
from pydantic import BaseModel


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


# Request Schemas


class InstallRequest(BaseModel):
    url: str


class RunRequest(BaseModel):
    ids: List[str]


class StopRequest(BaseModel):
    id: str
    instance: int
