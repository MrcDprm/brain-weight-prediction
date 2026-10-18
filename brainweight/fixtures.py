"""Python ile JavaScript'in aynı tahmini verdiğini sınamak için ortak test verisi üretir.

Kullanım: python -m brainweight.fixtures  (web/model.json okunur, web/tests/fixtures.json yazılır)
"""

import json
from pathlib import Path

from .export import predict, write_json

WEB_DIR = Path(__file__).resolve().parent.parent / "web"
MODEL_PATH = WEB_DIR / "model.json"
FIXTURES_PATH = WEB_DIR / "tests" / "fixtures.json"

# Veri aralığının içi, kenarları ve dışı
HEAD_SIZES = [1000, 2720, 3000, 3634, 4000, 4747, 5500, 8000]


def build_fixtures(model: dict) -> dict:
    cases = []
    for head_size in HEAD_SIZES:
        mean, low, high = predict(model, {"head_size": head_size})
        cases.append({"head_size": head_size, "mean": mean, "low": low, "high": high})
    return {"model": model["name"], "cases": cases}


def main() -> None:
    model = json.loads(MODEL_PATH.read_text(encoding="utf-8"))
    write_json(FIXTURES_PATH, build_fixtures(model))
    print(f"Wrote {FIXTURES_PATH}")


if __name__ == "__main__":
    main()
