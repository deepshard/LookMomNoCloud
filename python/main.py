import sys
from mlc_llm.interface.serve import serve


def start_server(model_name: str):
    serve(
        model=f"HF://{model_name}",
        device="auto",
        model_lib=None,
        mode="local",
        additional_models=None,
        max_batch_size=1,
        max_total_sequence_length=2048,
        prefill_chunk_size=None,
        max_history_size=None,
        gpu_memory_utilization=None,
        speculative_mode="disable",
        spec_draft_length=4,
        enable_tracing=False,
        host="127.0.0.1",
        port=8000,
        allow_credentials=["*"],
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )


if __name__ == "__main__":
    # Get args
    args = sys.argv
    command = args[2]

    if command == "start_server":
        model_name = args[4]
        start_server(model_name)
    else:
        sys.exit(1)
