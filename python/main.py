import sys
from mlc_llm.interface.serve import serve
from mlc_llm.interface.convert_weight import convert_weight as convert_weight_mlc
from mlc_llm.support.auto_config import detect_config, detect_model_type
from mlc_llm.support.auto_weight import detect_weight
from mlc_llm.support.auto_device import detect_device
from mlc_llm.quantization import QUANTIZATION


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


def convert_weight(model_path: str):
    config = detect_config(model_path)
    model = detect_model_type("auto", config)
    source, source_format = detect_weight(
        weight_path=config.parent,
        config_json_path=config,
        weight_format="auto",
    )
    device = detect_device("auto")
    convert_weight_mlc(
        config=config,
        quantization=QUANTIZATION["q0f16"],
        model=model,
        device=device,
        source=source,
        source_format=source_format,
        output=f"{model_path}-q0f16-MLC",
    )


if __name__ == "__main__":
    # Get args
    args = sys.argv
    command = args[2]

    if command == "start_server":
        model_name = args[4]
        start_server(model_name)
    elif command == "convert_weight":
        model_path = args[4]
        convert_weight(model_path)
    else:
        sys.exit(1)
