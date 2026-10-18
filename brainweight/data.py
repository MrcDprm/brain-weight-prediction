"""Gladstone (1905) veri setini okur, doğrular ve okunur sütun adlarına çevirir."""

from pathlib import Path

import pandas as pd

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "gladstone-1905.csv"

# Ham dosyadaki sütun adı -> kodda kullanılan ad
RAW_COLUMNS = {
    "Cinsiyet": "sex",
    "Yas_Araligi": "age_group",
    "Bas_cevresi(cm^3)": "head_size",
    "Beyin_agirligi(gr)": "brain_weight",
}

SEX_CODES = {1: "male", 2: "female"}
AGE_GROUP_CODES = {1: "20-46", 2: "46+"}

# Fiziksel olarak makul aralıklar; dışındaki değer büyük ihtimalle veri hatasıdır
VALID_RANGES = {
    "head_size": (2000.0, 6000.0),  # cm³
    "brain_weight": (700.0, 2000.0),  # g
}


class DataValidationError(ValueError):
    """Veri dosyası beklenen biçimde değilse fırlatılır."""


def _rows(mask: pd.Series) -> str:
    # Hata mesajında dosyadaki satır numarasını göster (başlık 1. satır)
    numbers = [str(i + 2) for i in mask[mask].index[:5]]
    more = " ..." if mask.sum() > 5 else ""
    return ", ".join(numbers) + more


def validate(raw: pd.DataFrame) -> pd.DataFrame:
    """Ham tabloyu doğrular ve temiz bir kopya döndürür."""
    missing = [c for c in RAW_COLUMNS if c not in raw.columns]
    if missing:
        raise DataValidationError(f"Missing columns: {', '.join(missing)}")

    df = raw[list(RAW_COLUMNS)].rename(columns=RAW_COLUMNS)
    if df.empty:
        raise DataValidationError("Dataset is empty")

    for column in df.columns:
        values = pd.to_numeric(df[column], errors="coerce")
        bad = values.isna()
        if bad.any():
            raise DataValidationError(
                f"Column '{column}' has missing or non-numeric values (rows {_rows(bad)})"
            )
        df[column] = values.astype(float)

    for column, codes in (("sex", SEX_CODES), ("age_group", AGE_GROUP_CODES)):
        bad = ~df[column].isin(codes.keys())
        if bad.any():
            raise DataValidationError(
                f"Column '{column}' has unknown codes (rows {_rows(bad)})"
            )
        df[column] = df[column].astype(int).map(codes)

    for column, (low, high) in VALID_RANGES.items():
        bad = ~df[column].between(low, high)
        if bad.any():
            raise DataValidationError(
                f"Column '{column}' is outside {low:g}-{high:g} (rows {_rows(bad)})"
            )

    return df.reset_index(drop=True)


def load_dataset(path: Path = DATA_PATH) -> pd.DataFrame:
    """CSV dosyasını okuyup doğrulanmış tabloyu döndürür."""
    try:
        raw = pd.read_csv(path)
    except FileNotFoundError:
        raise DataValidationError(f"Dataset not found: {path}") from None
    except pd.errors.EmptyDataError:
        raise DataValidationError("Dataset is empty") from None
    return validate(raw)
