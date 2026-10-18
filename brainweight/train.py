"""Bütün eğitim hattını çalıştırır: yükle → karşılaştır → seç → dışa aktar.

Kullanım: python -m brainweight.train [--data CSV] [--out KLASÖR] [--repeats N]
"""

import argparse
import sys
from pathlib import Path

from . import __version__
from .data import DATA_PATH, DataValidationError, load_dataset
from .export import ExportError, fit_linear, metrics_document, write_json
from .models import Score, compare_models, select_model

WEB_DIR = Path(__file__).resolve().parent.parent / "web"
N_SPLITS = 10
SEED = 0


def format_table(scores: list[Score], chosen: Score) -> str:
    lines = [f"{'Model':<40} {'MAE (g)':>14} {'RMSE (g)':>10} {'R²':>14}"]
    for s in scores:
        mark = " *" if s.name == chosen.name else ""
        lines.append(
            f"{s.label + mark:<40} {s.mae:>7.1f} ± {s.mae_std:<4.1f} {s.rmse:>10.1f} "
            f"{s.r2:>7.3f} ± {s.r2_std:.3f}"
        )
    return "\n".join(lines)


def run(data_path: Path, out_dir: Path, repeats: int) -> None:
    df = load_dataset(data_path)
    print(f"brainweight {__version__}: {len(df)} rows, {N_SPLITS}-fold CV × {repeats}")

    scores = compare_models(df, n_splits=N_SPLITS, n_repeats=repeats, seed=SEED)
    chosen, reason = select_model(scores)
    model = fit_linear(df, chosen.name)
    cv = {"method": "RepeatedKFold", "n_splits": N_SPLITS, "n_repeats": repeats, "seed": SEED}

    write_json(out_dir / "model.json", model)
    write_json(out_dir / "metrics.json", metrics_document(scores, chosen, reason, cv, len(df)))

    print()
    print(format_table(scores, chosen))
    print(f"\nSelected: {reason}")
    print(f"Wrote {out_dir / 'model.json'} and {out_dir / 'metrics.json'}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Train and export the brain weight model.")
    parser.add_argument("--data", type=Path, default=DATA_PATH, help="dataset CSV file")
    parser.add_argument("--out", type=Path, default=WEB_DIR, help="output folder for the JSON files")
    parser.add_argument("--repeats", type=int, default=5, help="cross-validation repeats (default 5)")
    args = parser.parse_args(argv)

    if args.repeats < 1:
        parser.error("--repeats must be at least 1")
    try:
        run(args.data, args.out, args.repeats)
    except (DataValidationError, ExportError) as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
