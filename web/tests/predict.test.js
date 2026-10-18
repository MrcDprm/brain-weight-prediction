import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { parseHeadSize, predict } from "../src/predict.js";

const read = (name) => JSON.parse(readFileSync(new URL(name, import.meta.url), "utf8"));
const model = read("../model.json");
const fixtures = read("./fixtures.json");

const close = (actual, expected) => Math.abs(actual - expected) < 1e-9 * Math.max(1, Math.abs(expected));

test("fixtures belong to the exported model", () => {
  assert.equal(fixtures.model, model.name);
});

for (const c of fixtures.cases) {
  test(`matches Python for head size ${c.head_size}`, () => {
    const result = predict(model, { head_size: c.head_size });
    assert.ok(close(result.mean, c.mean), `mean ${result.mean} vs ${c.mean}`);
    assert.ok(close(result.low, c.low), `low ${result.low} vs ${c.low}`);
    assert.ok(close(result.high, c.high), `high ${result.high} vs ${c.high}`);
  });
}

test("flags values outside the training range", () => {
  const [min, max] = model.training_range.head_size;
  assert.equal(predict(model, { head_size: min }).outOfRange, false);
  assert.equal(predict(model, { head_size: max }).outOfRange, false);
  assert.equal(predict(model, { head_size: min - 1 }).outOfRange, true);
  assert.equal(predict(model, { head_size: max + 1 }).outOfRange, true);
});

test("parses valid input with dot or comma decimals", () => {
  assert.deepEqual(parseHeadSize("3600"), { value: 3600 });
  assert.deepEqual(parseHeadSize("  3600 "), { value: 3600 });
  assert.deepEqual(parseHeadSize("3600,5"), { value: 3600.5 });
  assert.deepEqual(parseHeadSize("3600.5"), { value: 3600.5 });
});

test("rejects invalid input", () => {
  assert.deepEqual(parseHeadSize(""), { error: "empty" });
  assert.deepEqual(parseHeadSize(null), { error: "empty" });
  for (const text of ["abc", "-3600", "3e3", "3.600.000", "36 00", "Infinity"]) {
    assert.deepEqual(parseHeadSize(text), { error: "notNumber" }, text);
  }
  assert.deepEqual(parseHeadSize("999"), { error: "tooSmall" });
  assert.deepEqual(parseHeadSize("8001"), { error: "tooLarge" });
});
