class DownloadManager:
    def __init__(self):
        self.current_downloads = {}

    def set_download(self, model_name, bytes_remaining):
        self.current_downloads[model_name] = bytes_remaining

    def clear_download(self, model_name):
        self.current_downloads.pop(model_name, None)

    def get_total_bytes_remaining(self):
        return sum(self.current_downloads.values())
