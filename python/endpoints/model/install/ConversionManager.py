class ConversionManager:
    """ Manages doing one conversion at a time. """

    def __init__(self):
        self.conversion_in_progress = False
        self.queue = []

    def is_models_turn(self, model_path: str) -> bool:
        return (
            self.conversion_in_progress == False and
            len(self.queue) != 0 and
            self.queue[0] == model_path
        )

    def add_to_queue(self, model_path: str):
        self.queue.append(model_path)

    def remove_from_queue(self):
        self.queue.pop(0)
        self.conversion_in_progress = True

    def complete_conversion(self):
        self.conversion_in_progress = False
