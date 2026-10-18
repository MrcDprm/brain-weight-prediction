// Milimetrik kâğıt üzerinde saçılım grafiği: veri noktaları, regresyon doğrusu, %95 bandı
// ve kullanıcının değeri (kırmızı nokta + eksendeki aralık ayracı). Kütüphanesiz SVG.
import { predict } from "./predict.js";

const SVG = "http://www.w3.org/2000/svg";
const M = { top: 14, right: 18, bottom: 54, left: 80 };
const BASE_X = [2600, 4900];
const DURATION = 320;

export function el(tag, attrs = {}, parent) {
  const node = document.createElementNS(SVG, tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  parent?.append(node);
  return node;
}

// Okunur bir adım: 1, 2 ya da 5 × 10^n
export function niceStep(span, targetTicks) {
  const raw = span / targetTicks;
  const power = 10 ** Math.floor(Math.log10(raw));
  const factor = [1, 2, 5, 10].find((f) => f * power >= raw);
  return factor * power;
}

export function range(from, to, step) {
  const values = [];
  for (let v = Math.ceil(from / step) * step; v <= to + 1e-9; v += step) values.push(v);
  return values;
}

export function createChart(svg, { model, points, format, labels }) {
  // viewBox gerçek piksel genişliğine eşitlenir: yazılar telefonda da okunur boyutta kalır
  let W = 640;
  let H = 420;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const layers = {};
  let domainKey = "";
  let scale;
  let shown = null;
  let frame = 0;

  for (const name of ["paper", "band", "line", "points", "axes", "you"]) {
    layers[name] = el("g", { class: `chart-${name}` }, svg);
  }

  function measure() {
    W = Math.max(300, Math.round(svg.getBoundingClientRect().width) || 640);
    H = Math.round(Math.min(Math.max(W * 0.66, 300), 460));
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  }
  measure();

  function domainFor(value) {
    let [x0, x1] = BASE_X;
    if (value != null) {
      x0 = Math.min(x0, value - 150);
      x1 = Math.max(x1, value + 150);
    }
    const lowAt = (x) => predict(model, { head_size: x }).low;
    const highAt = (x) => predict(model, { head_size: x }).high;
    const ys = points.map((p) => p[1]);
    const yStep = niceStep(Math.max(...ys) - Math.min(...ys), 6);
    const y0 = Math.floor(Math.min(...ys, lowAt(x0), lowAt(x1)) / yStep) * yStep;
    const y1 = Math.ceil(Math.max(...ys, highAt(x0), highAt(x1)) / yStep) * yStep;
    return { x0, x1, y0, y1, xStep: niceStep(x1 - x0, 5), yStep };
  }

  function drawStatic(d) {
    const sx = (x) => M.left + ((x - d.x0) / (d.x1 - d.x0)) * (W - M.left - M.right);
    const sy = (y) => H - M.bottom - ((y - d.y0) / (d.y1 - d.y0)) * (H - M.top - M.bottom);
    scale = { sx, sy };
    for (const name of ["paper", "band", "line", "points", "axes"]) layers[name].replaceChildren();

    // Milimetrik kâğıt: her büyük adımın beşte biri ince, büyük adımlar kalın çizgi
    const left = sx(d.x0);
    const right = sx(d.x1);
    const top = sy(d.y1);
    const bottom = sy(d.y0);
    el("rect", { x: left, y: top, width: right - left, height: bottom - top, class: "paper" }, layers.paper);
    for (const [step, cls] of [
      [5, "grid-minor"],
      [1, "grid-major"],
    ]) {
      const xs = range(d.x0, d.x1, d.xStep / step).map((x) => `M${sx(x)} ${top}V${bottom}`);
      const ys = range(d.y0, d.y1, d.yStep / step).map((y) => `M${left} ${sy(y)}H${right}`);
      el("path", { d: [...xs, ...ys].join(""), class: cls }, layers.paper);
    }

    // %95 bandı: üst kenar soldan sağa, alt kenar sağdan sola
    const samples = Array.from({ length: 61 }, (_, i) => {
      const x = d.x0 + ((d.x1 - d.x0) * i) / 60;
      return [x, predict(model, { head_size: x })];
    });
    const upper = samples.map(([x, p]) => `${sx(x)},${sy(Math.min(p.high, d.y1))}`);
    const lower = samples.reverse().map(([x, p]) => `${sx(x)},${sy(Math.max(p.low, d.y0))}`);
    el("polygon", { points: [...upper, ...lower].join(" "), class: "band" }, layers.band);

    const a = predict(model, { head_size: d.x0 }).mean;
    const b = predict(model, { head_size: d.x1 }).mean;
    el("line", { x1: sx(d.x0), y1: sy(a), x2: sx(d.x1), y2: sy(b), class: "fit" }, layers.line);

    for (const [x, y] of points) el("circle", { cx: sx(x), cy: sy(y), r: 2.6, class: "dot" }, layers.points);

    // Eksen yazıları
    for (const x of range(d.x0, d.x1, d.xStep)) {
      const label = el("text", { x: sx(x), y: bottom + 18, class: "tick", "text-anchor": "middle" }, layers.axes);
      label.textContent = format(x);
    }
    for (const y of range(d.y0, d.y1, d.yStep)) {
      const label = el("text", { x: left - 8, y: sy(y) + 4, class: "tick", "text-anchor": "end" }, layers.axes);
      label.textContent = format(y);
    }
    const xTitle = el("text", { x: right, y: H - 8, class: "axis-title", "text-anchor": "end" }, layers.axes);
    xTitle.textContent = labels().axisX;
    const yTitle = el(
      "text",
      { x: -top, y: 16, class: "axis-title", "text-anchor": "end", transform: "rotate(-90)" },
      layers.axes,
    );
    yTitle.textContent = labels().axisY;
  }

  // Kullanıcının değeri: nokta, eksene uzanan kesikli çizgi ve aralık ayracı
  const leader = el("line", { class: "leader" }, layers.you);
  const bracket = el("path", { class: "bracket" }, layers.you);
  const dot = el("circle", { r: 6, class: "you" }, layers.you);

  function ensureDomain(value) {
    const d = domainFor(value);
    const key = [d.x0, d.x1, d.y0, d.y1].join();
    if (key !== domainKey) {
      domainKey = key;
      drawStatic(d);
    }
    return d;
  }

  function place(state) {
    const d = ensureDomain(state.value);
    const { sx, sy } = scale;
    const x = sx(state.value);
    const left = sx(d.x0) + 7;
    const yMean = sy(state.mean);
    const yLow = sy(Math.max(state.low, d.y0));
    const yHigh = sy(Math.min(state.high, d.y1));
    dot.setAttribute("cx", x);
    dot.setAttribute("cy", yMean);
    leader.setAttribute("x1", left);
    leader.setAttribute("x2", x);
    leader.setAttribute("y1", yMean);
    leader.setAttribute("y2", yMean);
    // Kumpas ayracı: dikey çizgi, uçlarda sağa bakan kısa çentikler
    bracket.setAttribute("d", `M${left + 8} ${yHigh}H${left}V${yLow}H${left + 8}M${left} ${yMean}H${left - 4}`);
  }

  function update(value) {
    cancelAnimationFrame(frame);
    if (value == null) {
      layers.you.setAttribute("hidden", "");
      ensureDomain(null);
      shown = null;
      return;
    }
    layers.you.removeAttribute("hidden");
    const target = { value, ...predict(model, { head_size: value }) };
    if (!shown || reduceMotion.matches) {
      shown = target;
      place(target);
      return;
    }
    const from = shown;
    const start = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - start) / DURATION);
      const ease = 1 - (1 - k) ** 3;
      shown = Object.fromEntries(
        ["value", "mean", "low", "high"].map((key) => [key, from[key] + (target[key] - from[key]) * ease]),
      );
      place(shown);
      if (k < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  }

  new ResizeObserver(() => {
    const before = W;
    measure();
    if (W !== before) relabel();
  }).observe(svg);

  /** Dil değişince ya da boyut değişince grafiği yeniden çizer. */
  function relabel() {
    domainKey = "";
    if (shown) place(shown);
    else ensureDomain(null);
  }

  return { update, relabel };
}
