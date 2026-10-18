"""Aday modelleri tanımlar ve tekrarlı çapraz doğrulamayla karşılaştırır."""

import math
from collections.abc import Callable
from dataclasses import dataclass

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression, RidgeCV
from sklearn.model_selection import RepeatedKFold, cross_validate
from sklearn.pipeline import Pipeline, make_pipeline
from sklearn.preprocessing import OneHotEncoder, PolynomialFeatures, StandardScaler

TARGET = "brain_weight"
HEAD = ["head_size"]
FULL = ["head_size", "sex", "age_group"]
CATEGORICAL = ["sex", "age_group"]


def _encode(scale: bool) -> ColumnTransformer:
    # Kategorileri 0/1 sütunlarına çevir; drop="first" ile fazlalık sütun atılır
    numeric = StandardScaler() if scale else "passthrough"
    return ColumnTransformer(
        [
            ("num", numeric, ["head_size"]),
            ("cat", OneHotEncoder(drop="first"), CATEGORICAL),
        ]
    )


@dataclass(frozen=True)
class Candidate:
    name: str
    label: str
    features: list[str]
    build: Callable[[], object]


# Sıra = basitlik sırası; skorlar yakınsa listede önce gelen seçilir
CANDIDATES = [
    Candidate("linear_head", "Linear (head size)", HEAD, lambda: LinearRegression()),
    Candidate(
        "linear_full",
        "Linear (head size + sex + age)",
        FULL,
        lambda: make_pipeline(_encode(scale=False), LinearRegression()),
    ),
    Candidate(
        "poly_head",
        "Polynomial, degree 2 (head size)",
        HEAD,
        lambda: make_pipeline(StandardScaler(), PolynomialFeatures(2), LinearRegression()),
    ),
    Candidate(
        "ridge_full",
        "Ridge (head size + sex + age)",
        FULL,
        lambda: make_pipeline(_encode(scale=True), RidgeCV(alphas=np.logspace(-3, 3, 13))),
    ),
    Candidate(
        "random_forest_full",
        "Random Forest (head size + sex + age)",
        FULL,
        lambda: Pipeline(
            [
                ("encode", _encode(scale=False)),
                ("model", RandomForestRegressor(n_estimators=300, min_samples_leaf=5, random_state=0)),
            ]
        ),
    ),
]

# Karşılaştırma için referans: her zaman ortalamayı tahmin eden model
BASELINE = Candidate("baseline_mean", "Baseline (always the mean)", HEAD, lambda: DummyRegressor())


@dataclass(frozen=True)
class Score:
    name: str
    label: str
    mae: float
    mae_std: float
    rmse: float
    rmse_std: float
    r2: float
    r2_std: float
    folds: int


def evaluate(candidate: Candidate, df: pd.DataFrame, cv) -> Score:
    result = cross_validate(
        candidate.build(),
        df[candidate.features],
        df[TARGET],
        cv=cv,
        n_jobs=-1,
        scoring=("neg_mean_absolute_error", "neg_root_mean_squared_error", "r2"),
    )
    mae = -result["test_neg_mean_absolute_error"]
    rmse = -result["test_neg_root_mean_squared_error"]
    r2 = result["test_r2"]
    return Score(
        candidate.name,
        candidate.label,
        float(mae.mean()),
        float(mae.std()),
        float(rmse.mean()),
        float(rmse.std()),
        float(r2.mean()),
        float(r2.std()),
        len(mae),
    )


def compare_models(
    df: pd.DataFrame, n_splits: int = 10, n_repeats: int = 5, seed: int = 0
) -> list[Score]:
    """Bütün adayları (ve referans modeli) aynı bölmelerle değerlendirir."""
    # Aynı random_state = her model birebir aynı eğitim/test bölmeleriyle sınanır
    cv = RepeatedKFold(n_splits=n_splits, n_repeats=n_repeats, random_state=seed)
    return [evaluate(c, df, cv) for c in [*CANDIDATES, BASELINE]]


def select_model(scores: list[Score]) -> tuple[Score, str]:
    """Bir standart hata kuralı: en iyiye yeterince yakın olan en basit modeli seçer."""
    ranked = [s for s in scores if s.name != BASELINE.name]
    best = min(ranked, key=lambda s: s.mae)
    threshold = best.mae + best.mae_std / math.sqrt(best.folds)
    # ranked basitlik sırasında olduğu için eşiği geçen ilk model en basitidir
    chosen = next(s for s in ranked if s.mae <= threshold)
    if chosen is best:
        reason = f"{chosen.label} has the lowest cross-validated MAE ({chosen.mae:.1f} g)."
    else:
        reason = (
            f"{chosen.label} is within one standard error of the best model "
            f"({best.label}, MAE {best.mae:.1f} g vs {chosen.mae:.1f} g) and is simpler."
        )
    return chosen, reason
