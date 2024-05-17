class DownloadManager:
    def __init__(self):
        self.current_downloads = {}

    def set_download(
        self,
        model_name,
        path,
        progress,
        bytes_remaining
    ):
        self.current_downloads[model_name] = {
            "name": model_name,
            "path": str(path),
            "progress": progress,
            "bytes_remaining": bytes_remaining,
        }

    def clear_download(self, model_name):
        self.current_downloads.pop(model_name, None)

    def get_downloads_in_return_format(self):
        # Get a list of downloads without the bytes_remaining field
        return [
            {
                "name": download["name"],
                "path": download["path"],
                "progress": download["progress"],
            }
            for download in self.current_downloads.values()
        ]

    def get_total_bytes_remaining(self):
        downloads_list = list(self.current_downloads.values())

        sum = 0
        for download in downloads_list:
            sum += download["bytes_remaining"]
        return sum
