import json

from brainweight.fixtures import FIXTURES_PATH, MODEL_PATH, build_fixtures


def test_fixtures_are_up_to_date():
    # Model yeniden eğitilip fixtures.json güncellenmezse JS testleri eski değerlerle çalışır
    model = json.loads(MODEL_PATH.read_text(encoding="utf-8"))
    saved = json.loads(FIXTURES_PATH.read_text(encoding="utf-8"))
    assert saved == build_fixtures(model), "Run: python -m brainweight.fixtures"
