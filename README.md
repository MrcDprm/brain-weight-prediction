English | [Türkçe](README.tr.md)

# Brain Weight Prediction

Estimate adult brain weight from head size, with an honest error margin. A Python pipeline compares several regression models with cross-validation, and a lightweight website serves the chosen model in the browser.

> **Status:** v1.0 in progress. This README is the project plan and will be completed before release.
>
> **Not a medical tool.** The model is trained on a historical dataset of adults and is for learning and demonstration only.

## Features

### Training pipeline (Python)
- Data validation: schema, value ranges and categories are checked before training.
- Model comparison with repeated 10-fold cross-validation: linear (head size only), linear (head size + sex + age group), polynomial, Ridge, Random Forest.
- Metrics reported as mean ± standard deviation: MAE, RMSE, R².
- Model selection prefers the simplest model when scores are practically equal; the reasoning is documented.
- Export to `model.json` (coefficients, data needed for a 95% prediction interval, training range) and `metrics.json`.
- Unit tests with pytest.

### Website
- Calculator: head size (cm³), sex and age group → predicted brain weight with a 95% prediction interval.
- Tape-measure mode: enter head length, width and height (cm); head size is computed with the Lee–Pearson formula, the same method used for the original dataset.
- Input validation and an "unreliable estimate" warning outside the training range.
- Chart: data points, regression line, prediction band and your input.
- Model page: comparison table, residual plot and a model card (data source, limitations, intended use).
- Turkish / English, dark / light theme.
- Predictions run in the browser from `model.json`; shared test fixtures check that Python and JavaScript give the same results.

## Dataset

237 adults, head size (cm³) and brain weight (g), grouped by sex and age group (20–46, 46+). Source: R. J. Gladstone, "A Study of the Relations of the Brain to the Size of the Head", *Biometrika*, 1905.

## Screenshots

_Coming soon._

## Tech Stack

- Python, pandas, NumPy, scikit-learn, pytest
- HTML, CSS, JavaScript (no framework, no build step), `node --test`
- Vercel

## Installation

_Coming soon._

## What I Learned

_Coming soon._

## Future Plans

- Batch prediction from an uploaded CSV file.
- Additional datasets.
- Bayesian regression for uncertainty estimates.
