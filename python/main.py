import sys
import shutil
from mlc_llm.interface.serve import serve
from mlc_llm.interface.convert_weight import convert_weight as convert_weight_mlc
from mlc_llm.support.auto_config import detect_config, detect_model_type
from mlc_llm.support.auto_weight import detect_weight
from mlc_llm.support.auto_device import detect_device
from mlc_llm.quantization import QUANTIZATION
from mlc_llm.interface.gen_config import gen_config
from pathlib import Path


def start_server(model_path: str):
    serve(
        model=model_path,
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


def convert_weight(model_path: str, conv_template: str, system_ram: str, model_size: str):
    system_ram = int(system_ram)
    model_size = int(model_size)

    config = detect_config(model_path)
    model = detect_model_type("auto", config)
    source, source_format = detect_weight(
        weight_path=config.parent,
        config_json_path=config,
        weight_format="auto",
    )
    device = detect_device("auto")

    # Get available quantization options from the model
    quantization_kinds = list(model.quantize.keys())
    quantization_options = [quantization for quantization in QUANTIZATION.values(
    ) if quantization.kind in quantization_kinds]

    quantization_compression = {
        "int3": 0.25,
        "int4": 0.33,
        "int8": 0.55
    }
    target_ram_usage = 0.66 * system_ram

    # Find the quantization option that is closest to the target RAM usage
    best_quantization = None
    best_ram_usage = 0
    for quantization in quantization_options:
        if quantization.kind == "no-quant":
            ram_usage = model_size
        else:
            ram_usage = quantization_compression[quantization.quantize_dtype] * model_size

        if ram_usage <= target_ram_usage and ram_usage > best_ram_usage:
            best_quantization = quantization
            best_ram_usage = ram_usage

    convert_weight_mlc(
        config=config,
        quantization=best_quantization,
        model=model,
        device=device,
        source=source,
        source_format=source_format,
        output=f"{model_path}-{best_quantization.name}-MLC",
    )
    gen_config(
        config=config,
        model=model,
        quantization=best_quantization,
        conv_template=conv_template,
        context_window_size=None,
        sliding_window_size=None,
        prefill_chunk_size=None,
        attention_sink_size=None,
        tensor_parallel_shards=None,
        max_batch_size=1,
        output=Path(f"{model_path}-{best_quantization.name}-MLC"),
    )

    # Delete the original model
    shutil.rmtree(model_path)
    return f"{model_path}-{best_quantization.name}-MLC"


if __name__ == "__main__":
    # Get args
    args = sys.argv
    command = args[2]

    if command == "start_server":
        model_name = args[4]
        start_server(model_name)
    elif command == "convert_weight":
        model_path = args[4]
        conv_template = args[6]
        system_ram = args[8]
        model_size = args[10]
        path = convert_weight(model_path, conv_template,
                              system_ram, model_size)
        print(path)
    else:
        sys.exit(1)
