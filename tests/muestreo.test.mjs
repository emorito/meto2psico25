import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateEstimation,
  calculatePower,
  calculateHonestSample,
} from "../assets/js/muestreo/calculos.mjs";

test("proporción sin población finita", () => {
  const result = calculateEstimation({
    kind: "proportion", p: 0.5, marginOfError: 0.05, confidence: 0.95,
    designEffect: 1, responseRate: 1,
  });
  assert.equal(result.number, 385);
});

test("proporción con población finita", () => {
  const result = calculateEstimation({
    kind: "proportion", p: 0.5, marginOfError: 0.05, confidence: 0.95,
    population: 1200, designEffect: 1, responseRate: 1,
  });
  assert.equal(result.number, 292);
});

test("proporción con población finita, efecto de diseño y no respuesta", () => {
  const result = calculateEstimation({
    kind: "proportion", p: 0.5, marginOfError: 0.05, confidence: 0.95,
    population: 1200, designEffect: 1.5, responseRate: 0.6,
  });
  assert.equal(result.number, 730);
});

test("potencia para correlación", () => {
  const result = calculatePower({ design: "correlation", r: 0.3, alpha: 0.05, power: 0.8, source: "metaanálisis" });
  assert.equal(result.number, 85);
});

test("potencia para dos medias", () => {
  const result = calculatePower({ design: "means", d: 0.5, alpha: 0.05, power: 0.8, source: "estudio previo" });
  assert.equal(result.perGroup, 64);
});

test("potencia para dos proporciones", () => {
  const result = calculatePower({ design: "proportions", p1: 0.3, p2: 0.5, alpha: 0.05, power: 0.8, source: "piloto" });
  assert.equal(result.perGroup, 93);
});

test("muestra no probabilística no devuelve estimación", () => {
  const result = calculateHonestSample({ sampling: "no_probabilistico", purpose: "estimar", mode: "estimacion" });
  assert.equal(result.number, null);
});

test("estudio cualitativo no devuelve número", () => {
  const result = calculateHonestSample({ sampling: "cualitativo", purpose: "comprender", mode: "estimacion" });
  assert.equal(result.number, null);
});

test("potencia sin fuente del efecto no devuelve número", () => {
  const result = calculatePower({ design: "correlation", r: 0.3, alpha: 0.05, power: 0.8 });
  assert.equal(result.number, null);
});
