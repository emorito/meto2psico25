import test from "node:test";
import assert from "node:assert/strict";
import {
  COHERENCE_CHAIN,
  MODULE_STEPS,
  approvedItems,
  scoreVerification,
  shuffleOptionIndices,
  selectVerificationItems,
} from "../assets/js/engine.js";

test("la cadena de coherencia tiene nueve eslabones", () => {
  assert.deepEqual(COHERENCE_CHAIN.map((item) => item.label), [
    "Problema", "Preguntas", "Objetivos", "Hipótesis", "Variables",
    "Diseño", "Muestra", "Instrumentos", "Análisis",
  ]);
});

test("el ciclo conserva nueve pasos", () => {
  assert.equal(MODULE_STEPS.length, 9);
  assert.equal(MODULE_STEPS.at(-1).id, "cierre");
});

test("solo selecciona ítems aprobados", () => {
  const items = [
    ...Array.from({ length: 10 }, (_, index) => ({ id: `a${index}`, estado: "aprobado", dificultad: (index % 3) + 1 })),
    { id: "draft", estado: "revisar", dificultad: 2 },
  ];
  const approved = approvedItems(items);
  assert.equal(approved.length, 10);
  assert.equal(selectVerificationItems(items, () => 0.4).some((item) => item.estado !== "aprobado"), false);
});

test("califica la verificación con umbral del 80 % y subtemas para repasar", () => {
  const items = Array.from({ length: 10 }, (_, index) => ({
    id: `v${index}`,
    subtema: index < 2 ? "muestra" : "instrumentos",
  }));
  const answers = items.map((item, index) => ({ id: item.id, correcto: index < 8 }));
  const result = scoreVerification(items, answers);
  assert.equal(result.score, 80);
  assert.equal(result.dominated, true);
  assert.deepEqual(result.subtemasRevisar, ["instrumentos"]);
  assert.equal(scoreVerification(items, answers.slice(0, 7)).answered, 7);
});

test("mezcla la posición de la respuesta correcta de forma uniforme", () => {
  const item = { opciones: ["A", "B", "C", "D"], correcta: 2 };
  let seed = 17;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const positions = Array.from({ length: 200 }, () => shuffleOptionIndices(item.opciones, random).indexOf(item.correcta));
  const counts = [0, 0, 0, 0];
  positions.forEach((position) => { counts[position] += 1; });
  assert.ok(counts.every((count) => count >= 35 && count <= 65), `distribución: ${counts.join(", ")}`);
});
