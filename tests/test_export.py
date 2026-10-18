import json

import numpy as np
import pytest

from brainweight.data import load_dataset
from brainweight.export import ExportError, fit_linear, metrics_document, predict, write_json
from brainweight.models import CANDIDATES, Score


@pytest.fixture(scope="module")
def df():
    return load_dataset()


@pytest.fixture(scope="module")
def model(df):
    return fit_linear(df, "linear_head")


@pytest.mark.parametrize("name", ["linear_head", "linear_full"])
def test_coefficients_match_scikit_learn(df, name):
    candidate = next(c for c in CANDIDATES if c.name == name)
    fitted = candidate.build().fit(df[candidate.features], df["brain_weight"])
    sample = df.iloc[:20]
    expected = fitted.predict(sample[candidate.features])
    exported = fit_linear(df, name)
    actual = [predict(exported, row)[0] for row in sample.to_dict("records")]
    assert np.allclose(actual, expected)


def test_unsupported_model_is_rejected(df):
    with pytest.raises(ExportError, match="random_forest_full"):
        fit_linear(df, "random_forest_full")


def test_interval_surrounds_prediction(model):
    mean, low, high = predict(model, {"head_size": 3600})
    assert low < mean < high
    # Aralık en az ±t·σ kadar geniştir
    assert high - mean >= model["t"] * model["sigma"]


def test_interval_widens_away_from_the_data_center(model):
    _, low_center, high_center = predict(model, {"head_size": 3634})
    _, low_edge, high_edge = predict(model, {"head_size": 4700})
    assert high_edge - low_edge > high_center - low_center


def test_about_95_percent_of_points_fall_inside(df, model):
    inside = 0
    for row in df.to_dict("records"):
        _, low, high = predict(model, row)
        inside += low <= row["brain_weight"] <= high
    assert 0.92 <= inside / len(df) <= 0.98


def test_model_metadata(model, df):
    assert model["n"] == len(df) == 237
    assert model["dof"] == 235
    assert model["training_range"]["head_size"] == [2720.0, 4747.0]
    assert model["t"] == pytest.approx(1.970, abs=1e-3)


def test_sex_indicator_shifts_prediction(df):
    full = fit_linear(df, "linear_full")
    male = predict(full, {"head_size": 3600, "sex": "male", "age_group": "20-46"})[0]
    female = predict(full, {"head_size": 3600, "sex": "female", "age_group": "20-46"})[0]
    assert male - female == pytest.approx(full["coefficients"][2])


def test_json_round_trip(tmp_path, model):
    score = Score("linear_head", "Linear", 56.7, 8.7, 71.8, 11.2, 0.6, 0.13, 50)
    metrics = metrics_document([score], score, "reason", {"n_splits": 10}, 237)
    for name, data in (("model.json", model), ("metrics.json", metrics)):
        path = tmp_path / "out" / name
        write_json(path, data)
        text = path.read_text(encoding="utf-8")
        assert text.endswith("}\n")
        assert json.loads(text) == data
