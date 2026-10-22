import os
import sys
import re
from pathlib import Path

# Add nvidia CUDA/cuDNN DLL paths for Windows
for p in sys.path:
    nvidia_dir = Path(p) / "nvidia"
    if nvidia_dir.exists():
        for sub in nvidia_dir.iterdir():
            bin_dir = sub / "bin"
            if bin_dir.exists():
                try:
                    os.add_dll_directory(str(bin_dir))
                except Exception:
                    pass
                os.environ["PATH"] = str(bin_dir) + os.pathsep + os.environ.get("PATH", "")

# Fix Windows SSL and IPv6 resolution issues
try:
    import truststore
    truststore.inject_into_ssl()
except Exception:
    pass

import socket
_orig_getaddrinfo = socket.getaddrinfo
def _ipv4_only_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    return _orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
socket.getaddrinfo = _ipv4_only_getaddrinfo

os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

from faster_whisper import WhisperModel

def extract_time_key(path):
    # Match patterns like '18_35' or '19_06' in filename
    match = re.search(r'(\d{1,2})_(\d{2})', path.name)
    if match:
        return (int(match.group(1)), int(match.group(2)))
    return (999, 999)

def main():
    audio_dir = Path("audio-prompts")
    if not audio_dir.exists():
        print(f"Directory {audio_dir} not found.")
        sys.exit(1)

    extensions = {".webm", ".m4a", ".mp3", ".wav", ".ogg", ".flac"}
    audio_files = [f for f in audio_dir.iterdir() if f.suffix.lower() in extensions]
    audio_files.sort(key=extract_time_key)

    print(f"Encontrados {len(audio_files)} arquivos de audio em ordem cronologica:")
    for idx, f in enumerate(audio_files, 1):
        print(f"  {idx}. {f.name}")

    print("\nCarregando modelo faster-whisper (large-v3) na GPU (CUDA)...")
    model = WhisperModel("large-v3", device="cuda", compute_type="float16")
    print("Modelo carregado com sucesso na GPU!\n")

    transcriptions = []

    for idx, audio_file in enumerate(audio_files, 1):
        print(f"\n[{idx}/{len(audio_files)}] Transcrevendo: {audio_file.name}...")
        segments, info = model.transcribe(
            str(audio_file),
            language="pt",
            beam_size=5,
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=500),
        )
        
        segment_texts = []
        for segment in segments:
            text = segment.text.strip()
            if text:
                segment_texts.append(text)
                print(f"   [{segment.start:.1f}s -> {segment.end:.1f}s]: {text}")
        
        full_text = " ".join(segment_texts).strip()
        transcriptions.append((audio_file.name, full_text))

        # Salvar arquivo txt individual com o mesmo nome do audio
        txt_file = audio_file.with_suffix(".txt")
        txt_file.write_text(full_text, encoding="utf-8")
        print(f"  --> Salvo individualmente em: {txt_file.name} ({len(full_text)} caracteres)")

    # Concatenar todas as transcricoes
    print("\nConcatenando todas as transcricoes...")
    combined_speech_paragraphs = []
    combined_with_metadata = []

    for name, text in transcriptions:
        if text:
            combined_speech_paragraphs.append(text)
            combined_with_metadata.append(f"=== {name} ===\n{text}\n")

    single_file_content = "\n\n".join(combined_speech_paragraphs)
    
    output_single = audio_dir / "transcricao_geral.txt"
    output_single.write_text(single_file_content, encoding="utf-8")
    print(f"Salvo arquivo consolidado em: {output_single}")

    root_single = Path("transcricao_geral.txt")
    root_single.write_text(single_file_content, encoding="utf-8")
    print(f"Salvo arquivo consolidado em: {root_single}")

    # Arquivo com marcadores de origem
    with_markers = "\n".join(combined_with_metadata)
    (audio_dir / "transcricao_geral_com_marcadores.txt").write_text(with_markers, encoding="utf-8")
    Path("transcricao_geral_com_marcadores.txt").write_text(with_markers, encoding="utf-8")

    print("\nTodas as transcricoes foram concluidas com sucesso!")

if __name__ == "__main__":
    main()
