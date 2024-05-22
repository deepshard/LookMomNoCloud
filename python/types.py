from dataclasses import dataclass
from enum import Enum


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
