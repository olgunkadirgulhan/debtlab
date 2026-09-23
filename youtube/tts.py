"""Kokoro TTS (open source, runs on CPU) + per-word timings for karaoke captions.

Each sentence is synthesized separately, so sentence boundaries are exact.
Inside a sentence, word times are spread by spoken length (e.g. "$16,250" is
long when spoken), which is accurate enough for highlighted captions and
avoids shipping a speech-recognition model.
"""
import os
import re
from pathlib import Path

import numpy as np
import soundfile as sf
from num2words import num2words

CACHE = Path(os.environ.get("DEBTLAB_CACHE", Path.home() / ".cache" / "debtlab")) / "kokoro"
MODEL_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
MODEL, VOICES = "kokoro-v1.0.onnx", "voices-v1.0.bin"
VOICE = os.environ.get("TTS_VOICE", "am_michael")
SPEED = float(os.environ.get("TTS_SPEED", "1.08"))
GAP = 0.18  # silence between sentences (s)

_kokoro = None


def _download():
    import requests

    CACHE.mkdir(parents=True, exist_ok=True)
    for name in (MODEL, VOICES):
        path = CACHE / name
        if path.exists() and path.stat().st_size > 1_000_000:
            continue
        print(f"[tts] downloading {name}")
        with requests.get(MODEL_URL + name, stream=True, timeout=300) as r:
            r.raise_for_status()
            tmp = path.with_suffix(".part")
            with tmp.open("wb") as f:
                for chunk in r.iter_content(1 << 20):
                    f.write(chunk)
            tmp.replace(path)


def _engine():
    global _kokoro
    if _kokoro is None:
        from kokoro_onnx import Kokoro

        _download()
        _kokoro = Kokoro(str(CACHE / MODEL), str(CACHE / VOICES))
    return _kokoro


def _num(s):
    s = s.replace(",", "")
    n = float(s)
    return num2words(int(n)) if n == int(n) else num2words(n)


def spoken(word):
    """How a display token is read aloud."""
    w = word
    w = re.sub(r"\$(\d[\d,]*(?:\.\d+)?)", lambda m: _num(m.group(1)) + " dollars", w)
    w = re.sub(r"(\d[\d,]*(?:\.\d+)?)%", lambda m: _num(m.group(1)) + " percent", w)
    w = re.sub(r"\d[\d,]*(?:\.\d+)?", lambda m: _num(m.group(0)), w)
    w = re.sub(r"\bAPR\b", "A.P.R.", w)
    return w


def split_sentences(text):
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return [p for p in parts if p]


def synthesize(script, out_wav):
    """Writes out_wav, returns (duration_s, words) with words=[{"text","start","end"}]."""
    k = _engine()
    audio, words, t = [], [], 0.0
    sr = 24000
    for sent in split_sentences(script):
        tokens = sent.split()
        speech = " ".join(spoken(tok) for tok in tokens)
        samples, sr = k.create(speech, voice=VOICE, speed=SPEED, lang="en-us")
        dur = len(samples) / sr
        weights = [max(1, len(re.sub(r"[^A-Za-z]", "", spoken(tok)))) + 2 for tok in tokens]
        total = sum(weights)
        cur = t
        for tok, w in zip(tokens, weights):
            d = dur * w / total
            words.append({"text": tok, "start": round(cur, 3), "end": round(cur + d, 3)})
            cur += d
        audio.append(samples)
        audio.append(np.zeros(int(GAP * sr), dtype=np.float32))
        t += dur + GAP
    data = np.concatenate(audio)
    sf.write(out_wav, data, sr)
    return len(data) / sr, words
