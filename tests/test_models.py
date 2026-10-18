import pytest
from sklearn.model_selection import KFold

from brainweight.data import load_dataset
from brainweight.models import BASELINE, CANDIDATES, Score, compare_models, evaluate, select_model


@pytest.fixture(scope="module")
def df():
    return load_dataset()


@pytest.fixture(scope="module")
def scores(df):
    return compare_models(df, n_splits=5, n_repeats=1)


def make_score(name, mae, mae_std=10.0, folds=50):
    return Score(name, name, mae, mae_std, 0.0, 0.0, 0.0, 0.0, folds)


def test_every_candidate_and_baseline_is_scored(scores):
    assert [s.name for s in scores] == [c.name for c in CANDIDATES] + [BASELINE.name]
    assert all(s.folds == 5 for s in scores)


def test_every_candidate_beats_the_baseline(scores):
    baseline = scores[-1]
    for score in scores[:-1]:
        assert score.mae < baseline.mae
        assert score.r2 > 0.4


def test_evaluation_is_reproducible(df):
    cv = KFold(n_splits=5, shuffle=True, random_state=1)
    assert evaluate(CANDIDATES[0], df, cv) == evaluate(CANDIDATES[0], df, cv)


def test_simpler_model_wins_when_close():
    # Eşik: 50 + 10 / sqrt(50) ≈ 51.4
    scores = [make_score("linear_head", 51.0), make_score("ridge_full", 50.0)]
    chosen, reason = select_model(scores)
    assert chosen.name == "linear_head"
    assert "simpler" in reason


def test_best_model_wins_when_clearly_better():
    scores = [make_score("linear_head", 60.0), make_score("ridge_full", 50.0)]
    chosen, reason = select_model(scores)
    assert chosen.name == "ridge_full"
    assert "lowest" in reason


def test_baseline_is_never_selected():
    scores = [make_score("linear_head", 60.0), make_score(BASELINE.name, 10.0)]
    chosen, _ = select_model(scores)
    assert chosen.name == "linear_head"
