from verbs import get_model_state


class ModelManager:
    def __init__(self, websocket):
        self.websocket = websocket
        self.current_downloads = {}
        self.install_queue = []
        self.launch_queue = []

    def set_download(
        self,
        id,
        model_name,
        size,
        progress,
        bytes_remaining
    ):
        self.current_downloads[id] = {
            "id": id,
            "name": model_name,
            "size": size,
            "progress": progress,
            "bytes_remaining": bytes_remaining,
        }

    def clear_download(self, id):
        self.current_downloads.pop(id, None)

    def get_downloads_in_return_format(self):
        return [
            {
                "id": download["id"],
                "name": download["name"],
                "size": download["size"],
                "status": "DOWNLOADING",
                "pid": None,
                "port": None,
                "quant": None,
                "progress": download["progress"],
            }
            for download in self.current_downloads.values()
        ]

    def push_install(
        self,
        id,
        model_name,
        size,
        quant
    ):
        self.install_queue.append({
            "id": id,
            "name": model_name,
            "size": size,
            "quant": quant,
        })

    def pop_install(self):
        install = self.install_queue[0]
        self.install_queue = self.install_queue[1:]
        return install

    def push_launch(
        self,
        id,
        model_name,
        size,
        quant
    ):
        self.launch_queue.append({
            "id": id,
            "name": model_name,
            "size": size,
            "quant": quant,
        })

    def pop_launch(self):
        launch = self.launch_queue[0]
        self.launch_queue = self.launch_queue[1:]
        return launch

    def get_total_bytes_remaining(self):
        downloads_list = list(self.current_downloads.values())

        sum = 0
        for download in downloads_list:
            sum += download["bytes_remaining"]
        return sum

    def determine_quantizations():
        pass

    def check_for_quantization():
        pass

    async def download_model():
        pass

    async def install_model():
        pass

    async def request_launch():
        pass

    async def progress_launch():
        pass
