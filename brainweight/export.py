"""Seçilen doğrusal modeli tahmin aralığıyla birlikte JSON'a aktarır."""

import json
from dataclasses import asdict
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

from .models import CANDIDATES, TARGET, Score

SCHEMA_VERSION = 1
CONFIDENCE = 0.95

# Dışa aktarılabilen modeller ve tasarım matrisindeki terimleri (sabit terim hariç).
# "equals" olan terim 0/1 değişkenidir: sütun o değere eşitse 1.
TERMS = {
    "linear_head": [{"column": "head_size"}],
    "linear_full": [
        {"column": "head_size"},
        {"column": "sex", "equals": "male"},
        {"column": "age_group", "equals": "46+"},
    ],
}


class ExportError(ValueError):
    """Model JSON'a aktarılamıyorsa fırlatılır."""


def _row_vector(row, terms) -> np.ndarray:
    values = [1.0]
    for term in terms:
        value = row[term["column"]]
        values.append(float(value == term["equals"]) if "equals" in term else float(value))
    return np.array(values)


def fit_linear(df: pd.DataFrame, name: str) -> dict:
    """En küçük kareler ile modeli kurar; tahmin aralığı için gereken her şeyi döndürür."""
    if name not in TERMS:
        raise ExportError(f"Model '{name}' cannot be exported; supported: {', '.join(TERMS)}")
    terms = TERMS[name]

    X = np.vstack([_row_vector(row, terms) for row in df.to_dict("records")])
    y = df[TARGET].to_numpy(dtype=float)
    n, p = X.shape
    dof = n - p

    coefficients, *_ = np.linalg.lstsq(X, y, rcond=None)
    residuals = y - X @ coefficients
    # Artıkların standart sapması; serbestlik derecesine bölünür (yansız tahmin)
    sigma = float(np.sqrt(residuals @ residuals / dof))

    head = df["head_size"]
    return {
        "schema": SCHEMA_VERSION,
        "name": name,
        "label": next(c.label for c in CANDIDATES if c.name == name),
        "target": TARGET,
        "unit": "g",
        "terms": terms,
        "coefficients": coefficients.tolist(),
        "sigma": sigma,
        "dof": dof,
        "confidence": CONFIDENCE,
        # t dağılımının kritik değeri burada hesaplanır; tarayıcıda istatistik kütüphanesi gerekmez
        "t": float(stats.t.ppf((1 + CONFIDENCE) / 2, dof)),
        "xtx_inv": np.linalg.inv(X.T @ X).tolist(),
        "n": n,
        "training_range": {"head_size": [float(head.min()), float(head.max())]},
    }


def predict(model: dict, row: dict) -> tuple[float, float, float]:
    """Tahmin ve tahmin aralığını döndürür: (tahmin, alt sınır, üst sınır)."""
    x = _row_vector(row, model["terms"])
    mean = float(x @ np.array(model["coefficients"]))
    leverage = float(x @ np.array(model["xtx_inv"]) @ x)
    half_width = model["t"] * model["sigma"] * np.sqrt(1 + leverage)
    return mean, mean - half_width, mean + half_width


def metrics_document(
    scores: list[Score], chosen: Score, reason: str, cv: dict, rows: int
) -> dict:
    return {
        "schema": SCHEMA_VERSION,
        "dataset": {"name": "Gladstone (1905)", "rows": rows},
        "cv": cv,
        "selected": chosen.name,
        "reason": reason,
        "models": [asdict(s) for s in scores],
    }


def dataset_document(df: pd.DataFrame) -> dict:
    """Grafikteki noktalar: [baş hacmi, beyin ağırlığı] çiftleri."""
    points = df[["head_size", "brain_weight"]].to_numpy(dtype=float).tolist()
    return {"schema": SCHEMA_VERSION, "dataset": "Gladstone (1905)", "points": points}


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(data, indent=2, ensure_ascii=False) + "\n"
    path.write_text(text, encoding="utf-8", newline="\n")
