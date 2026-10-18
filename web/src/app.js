// Hesaplayıcı sayfası: girdiyi doğrular, tahmini gösterir, grafiği günceller.
import { createChart } from "./chart.js";
import { formatNumber, t } from "./i18n.js";
import { $, initPage, loadJson } from "./page.js";
import { HARD_LIMITS, parseHeadSize, predict } from "./predict.js";

const ERROR_KEYS = { empty: "errEmpty", notNumber: "errNotNumber", tooSmall: "errTooSmall", tooLarge: "errTooLarge" };

function fillModelTexts(model, metrics) {
  const [a, b] = model.coefficients;
  const [min, max] = model.training_range.head_size;
  const chosen = metrics.models.find((m) => m.name === metrics.selected);
  $("how1").textContent = t("how1", {
    a: formatNumber(a, 1),
    b: formatNumber(b, 4),
    per100: formatNumber(b * 100),
  });
  $("how3").textContent = t("how3", { mae: formatNumber(chosen.mae) });
  $("data1").textContent = t("data1", { min: formatNumber(min), max: formatNumber(max) });
}

function render(model, chart) {
  const input = $("head-size");
  const parsed = parseHeadSize(input.value);
  const error = $("head-size-error");
  const warning = $("result-warning");

  if (parsed.error) {
    error.textContent = t(ERROR_KEYS[parsed.error], {
      min: formatNumber(HARD_LIMITS.min),
      max: formatNumber(HARD_LIMITS.max),
    });
    input.setAttribute("aria-invalid", "true");
    $("result-mean").textContent = "–";
    $("result-interval").textContent = "";
    $("result-note").hidden = true;
    warning.hidden = true;
    chart.update(null);
    return;
  }

  error.textContent = "";
  input.removeAttribute("aria-invalid");
  $("result-note").hidden = false;
  const result = predict(model, { head_size: parsed.value });
  $("result-mean").textContent = formatNumber(result.mean);
  $("result-interval").textContent = t("interval", {
    low: formatNumber(result.low),
    high: formatNumber(result.high),
  });
  const [min, max] = model.training_range.head_size;
  warning.textContent = t("outOfRange", { min: formatNumber(min), max: formatNumber(max) });
  warning.hidden = !result.outOfRange;
  chart.update(parsed.value);
}

async function main() {
  let onLangChange = () => {};
  initPage(() => onLangChange());

  let model, data, metrics;
  try {
    [model, data, metrics] = await Promise.all(["model.json", "data.json", "metrics.json"].map(loadJson));
  } catch {
    $("head-size-error").textContent = t("loadError");
    return;
  }

  const chart = createChart($("chart"), {
    model,
    points: data.points,
    format: (value) => formatNumber(value),
    labels: () => ({ axisX: t("axisX"), axisY: t("axisY") }),
  });
  const refresh = () => render(model, chart);

  fillModelTexts(model, metrics);
  refresh();
  $("head-size").addEventListener("input", refresh);
  onLangChange = () => {
    fillModelTexts(model, metrics);
    chart.relabel();
    refresh();
  };
}

main();
