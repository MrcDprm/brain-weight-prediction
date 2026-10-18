import json

import pytest

from brainweight.train import main


def test_pipeline_writes_both_files(tmp_path, capsys):
    assert main(["--out", str(tmp_path), "--repeats", "1"]) == 0

    model = json.loads((tmp_path / "model.json").read_text(encoding="utf-8"))
    metrics = json.loads((tmp_path / "metrics.json").read_text(encoding="utf-8"))
    assert model["name"] == metrics["selected"]
    assert metrics["cv"]["n_repeats"] == 1
    assert len(metrics["models"]) == 6

    data = json.loads((tmp_path / "data.json").read_text(encoding="utf-8"))
    assert len(data["points"]) == 237
    assert all(len(point) == 2 for point in data["points"])

    output = capsys.readouterr().out
    assert "Selected:" in output
    assert " *" in output


def test_invalid_data_returns_error(tmp_path, capsys):
    bad = tmp_path / "bad.csv"
    bad.write_text("a,b\n1,2\n", encoding="utf-8")
    assert main(["--data", str(bad), "--out", str(tmp_path)]) == 1
    assert "Missing columns" in capsys.readouterr().err
    assert not (tmp_path / "model.json").exists()


def test_repeats_must_be_positive(tmp_path):
    with pytest.raises(SystemExit):
        main(["--out", str(tmp_path), "--repeats", "0"])
