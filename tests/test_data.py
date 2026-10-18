import pandas as pd
import pytest

from brainweight.data import DataValidationError, load_dataset, validate

HEADER = "Cinsiyet,Yas_Araligi,Bas_cevresi(cm^3),Beyin_agirligi(gr)\n"


def write_csv(tmp_path, body):
    path = tmp_path / "data.csv"
    path.write_text(HEADER + body, encoding="utf-8")
    return path


def test_real_dataset_loads():
    df = load_dataset()
    assert len(df) == 237
    assert list(df.columns) == ["sex", "age_group", "head_size", "brain_weight"]
    assert set(df["sex"]) == {"male", "female"}
    assert set(df["age_group"]) == {"20-46", "46+"}


def test_codes_are_mapped(tmp_path):
    df = load_dataset(write_csv(tmp_path, "1,1,4000,1300\n2,2,3500,1200\n"))
    assert df["sex"].tolist() == ["male", "female"]
    assert df["age_group"].tolist() == ["20-46", "46+"]
    assert df["head_size"].dtype == float


def test_missing_column_is_rejected():
    raw = pd.DataFrame({"Cinsiyet": [1], "Yas_Araligi": [1], "Bas_cevresi(cm^3)": [4000]})
    with pytest.raises(DataValidationError, match="Missing columns"):
        validate(raw)


def test_missing_value_reports_row(tmp_path):
    with pytest.raises(DataValidationError, match=r"head_size.*rows 3"):
        load_dataset(write_csv(tmp_path, "1,1,4000,1300\n1,1,,1300\n"))


def test_non_numeric_value_is_rejected(tmp_path):
    with pytest.raises(DataValidationError, match="brain_weight"):
        load_dataset(write_csv(tmp_path, "1,1,4000,abc\n"))


def test_unknown_code_is_rejected(tmp_path):
    with pytest.raises(DataValidationError, match="sex.*unknown codes"):
        load_dataset(write_csv(tmp_path, "3,1,4000,1300\n"))


@pytest.mark.parametrize("row", ["1,1,100,1300\n", "1,1,4000,5000\n"])
def test_out_of_range_value_is_rejected(tmp_path, row):
    with pytest.raises(DataValidationError, match="outside"):
        load_dataset(write_csv(tmp_path, row))


def test_empty_file_is_rejected(tmp_path):
    path = tmp_path / "empty.csv"
    path.write_text("", encoding="utf-8")
    with pytest.raises(DataValidationError, match="empty"):
        load_dataset(path)


def test_header_only_is_rejected(tmp_path):
    with pytest.raises(DataValidationError, match="empty"):
        load_dataset(write_csv(tmp_path, ""))


def test_missing_file_is_rejected(tmp_path):
    with pytest.raises(DataValidationError, match="not found"):
        load_dataset(tmp_path / "nope.csv")
