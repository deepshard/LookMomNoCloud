import os
import platform
import socket
from pathlib import Path


def get_disk_usage(folder_path):
    total_size = 0
    with os.scandir(folder_path) as dir_entries:
        for entry in dir_entries:
            if entry.is_file():
                total_size += entry.stat().st_size
            elif entry.is_dir():
                total_size += get_disk_usage(entry.path)
    return total_size


def get_app_data_path():
    system = platform.system()

    if system == "Windows":
        return Path(os.getenv("APPDATA")) / "truffle-app"
    elif system == "Darwin":
        return Path(os.path.expanduser("~/Library/Application Support")) / "truffle-app"
    elif system == "Linux":
        return Path(os.path.expanduser("~/.config")) / "truffle-app"
    else:
        raise ValueError(f"Unsupported system: {system}")


def find_port(port=8899):
    """Find an open port."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        if s.connect_ex(("localhost", port)) == 0:
            return find_port(port + 1)
        return port
