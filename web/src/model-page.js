// Model sayfası: karşılaştırma tablosu, seçim gerekçesi, artık grafiği ve model kartı.
import { el, niceStep, range } from "./chart.js";
import { formatNumber, t } from "./i18n.js";
import { $, initPage, loadJson } from "./page.js";
import { predict } from "./predict.js";

const BASELINE = "baseline_mean";
const M = { top: 14, right: 18, bottom: 54, left: 80 };

const modelName = (name) => t(`model_${name}`);
const plusMinus = (mean, std, digits) => `${formatNumber(mean, digits)} ± ${formatNumber(std, digits)}`;

function fillTable(metrics) {
  const rows = metrics.models.map((m) => {
    const tr = document.createElement("tr");
    if (m.name === metrics.selected) tr.className = "selected";
    if (m.name === BASELINE) tr.className = "baseline";

    const name = document.createElement("th");
    name.scope = "row";
    name.textContent = modelName(m.name);
    if (m.name === metrics.selected) {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = t("selectedTag");
      name.append(" ", tag);
    }
    tr.append(name);

    const cells = [
      ["num", plusMinus(m.mae, m.mae_std, 1)],
      ["num rmse", plusMinus(m.rmse, m.rmse_std, 1)],
      ["num", plusMinus(m.r2, m.r2_std, 3)],
    ];
    for (const [cls, text] of cells) {
      const td = document.createElement("td");
      td.className = cls;
      td.textContent = text;
      tr.append(td);
    }
    return tr;
  });
  $("results-body").replaceChildren(...rows);
}

function fillReason(metrics) {
  const candidates = metrics.models.filter((m) => m.name !== BASELINE);
  const best = candidates.reduce((a, b) => (b.mae < a.mae ? b : a));
  const chosen = metrics.models.find((m) => m.name === metrics.selected);
  $("reason").textContent =
    best.name === chosen.name
      ? t("reasonBest", { chosen: modelName(chosen.name), bestMae: formatNumber(best.mae, 1) })
      : t("reasonSimpler", {
          best: modelName(best.name),
          bestMae: formatNumber(best.mae, 1),
          chosen: modelName(chosen.name),
          diff: formatNumber(chosen.mae - best.mae, 1),
          se: formatNumber(best.mae_std / Math.sqrt(best.folds), 1),
        });
}

function fillCard(model, metrics) {
  const chosen = metrics.models.find((m) => m.name === metrics.selected);
  const [a, b] = model.coefficients;
  const [min, max] = model.training_range.head_size;
  const entries = [
    ["cardUseTerm", t("cardUse")],
    ["cardDataTerm", t("cardData")],
    ["cardMethodTerm", t("cardMethod", { dof: model.dof })],
    ["cardFormulaTerm", t("cardFormula", { a: formatNumber(a, 1), b: formatNumber(b, 4), sigma: formatNumber(model.sigma, 1) })],
    ["cardPerfTerm", t("cardPerf", { mae: formatNumber(chosen.mae, 1), r2: formatNumber(chosen.r2, 2) })],
    ["cardLimitsTerm", t("cardLimits", { min: formatNumber(min), max: formatNumber(max) })],
  ];
  $("model-card").replaceChildren(
    ...entries.flatMap(([term, text]) => {
      const dt = document.createElement("dt");
      dt.textContent = t(term);
      const dd = document.createElement("dd");
      dd.textContent = text;
      return [dt, dd];
    }),
  );
}

// Artık grafiği: sıfır çizgisi, ±t·σ bandı ve her kişinin artığı (milimetrik kâğıt üzerinde)
function drawResiduals(svg, model, points) {
  const W = Math.max(300, Math.round(svg.getBoundingClientRect().width) || 640);
  const H = Math.round(Math.min(Math.max(W * 0.5, 260), 380));
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.replaceChildren();

  const residuals = points.map(([x, y]) => [x, y - predict(model, { head_size: x }).mean]);
  const band = model.t * model.sigma;
  const xs = points.map((p) => p[0]);
  const xStep = niceStep(Math.max(...xs) - Math.min(...xs), 5);
  const x0 = Math.floor(Math.min(...xs) / xStep) * xStep;
  const x1 = Math.ceil(Math.max(...xs) / xStep) * xStep;
  const extent = Math.max(band, ...residuals.map(([, r]) => Math.abs(r)));
  const yStep = niceStep(2 * extent, 6);
  const y1 = Math.ceil(extent / yStep) * yStep;
  const y0 = -y1;

  const sx = (x) => M.left + ((x - x0) / (x1 - x0)) * (W - M.left - M.right);
  const sy = (y) => H - M.bottom - ((y - y0) / (y1 - y0)) * (H - M.top - M.bottom);
  const [left, right, top, bottom] = [sx(x0), sx(x1), sy(y1), sy(y0)];

  el("rect", { x: left, y: top, width: right - left, height: bottom - top, class: "paper" }, svg);
  for (const [div, cls] of [
    [5, "grid-minor"],
    [1, "grid-major"],
  ]) {
    const v = range(x0, x1, xStep / div).map((x) => `M${sx(x)} ${top}V${bottom}`);
    const h = range(y0, y1, yStep / div).map((y) => `M${left} ${sy(y)}H${right}`);
    el("path", { d: [...v, ...h].join(""), class: cls }, svg);
  }
  el("rect", { x: left, y: sy(band), width: right - left, height: sy(-band) - sy(band), class: "band" }, svg);
  el("line", { x1: left, y1: sy(0), x2: right, y2: sy(0), class: "fit" }, svg);
  for (const [x, r] of residuals) el("circle", { cx: sx(x), cy: sy(r), r: 2.6, class: "dot" }, svg);

  for (const x of range(x0, x1, xStep)) {
    el("text", { x: sx(x), y: bottom + 18, class: "tick", "text-anchor": "middle" }, svg).textContent = formatNumber(x);
  }
  for (const y of range(y0, y1, yStep)) {
    const label = y > 0 ? `+${formatNumber(y)}` : formatNumber(y);
    el("text", { x: left - 8, y: sy(y) + 4, class: "tick", "text-anchor": "end" }, svg).textContent = label;
  }
  el("text", { x: right, y: H - 8, class: "axis-title", "text-anchor": "end" }, svg).textContent = t("axisX");
  el(
    "text",
    { x: -top, y: 16, class: "axis-title", "text-anchor": "end", transform: "rotate(-90)" },
    svg,
  ).textContent = t("axisResidual");
}

async function main() {
  initPage();

  let model, data, metrics;
  try {
    [model, data, metrics] = await Promise.all(["model.json", "data.json", "metrics.json"].map(loadJson));
  } catch {
    $("load-error").textContent = t("loadError");
    return;
  }

  const svg = $("residual-chart");
  fillTable(metrics);
  fillReason(metrics);
  fillCard(model, metrics);
  $("residual-text").textContent = t("residualText", { band: formatNumber(model.t * model.sigma) });
  drawResiduals(svg, model, data.points);

  let width = svg.getBoundingClientRect().width;
  new ResizeObserver(() => {
    const next = svg.getBoundingClientRect().width;
    if (Math.round(next) !== Math.round(width)) {
      width = next;
      drawResiduals(svg, model, data.points);
    }
  }).observe(svg);
}

main();
