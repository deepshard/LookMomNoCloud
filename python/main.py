import os
import sys
import subprocess
import signal


def start_server(model_name: str):
    with open('server_output.log', 'w') as log_file:
        # Start the server
        proc = subprocess.Popen(
            ["mlc_llm", "serve", f"HF://{model_name}"],
            stdout=log_file, stderr=subprocess.STDOUT)
        return proc.pid


if __name__ == "__main__":
    # Get args
    args = sys.argv
    command = args[2]

    if command == "start_server":
        model_name = args[4]
        pid = start_server(model_name)
        print(pid)
    else:
        sys.exit(1)
