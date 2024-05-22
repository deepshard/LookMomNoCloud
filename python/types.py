from dataclasses import dataclass
from enum import Enum


class RepoType(Enum):
    HF = "HF"


class InstallStatus(Enum):
    DOWNLOADING = "DOWNLOADING"
    INSTALLING = "INSTALLING"
    DONE = "DONE"


class Quantization(Enum):
    INT8 = "INT8"
    INT4 = "INT4"
    INT3 = "INT3"


@dataclass
class InstallProgress:
    id: str
    status: InstallStatus
    progress: int = 0
    error: str = None


@dataclass
class FileInfo:
    file: str
    size: int
