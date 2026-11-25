import test from "node:test";
import assert from "node:assert/strict";
import {
  COHERENCE_CHAIN,
  MODULE_STEPS,
  advanceAdaptiveSession,
  approvedItems,
  createAdaptiveSession,
  renderQuestion,
  scoreVerification,
  selectExamFormatItems,
  shuffleOptionIndices,
  selectVerificationItems,
} from "../assets/js/engine.js";

test("la cadena de coherencia tiene nueve eslabones", () => {
  assert.deepEqual(COHERENCE_CHAIN.map((item) => item.label), [
    "Problema", "Preguntas", "Objetivos", "Hipótesis", "Variables",
    "Diseño", "Muestra", "Instrumentos", "Análisis",
  ]);
});

test("el formato del final selecciona 20 aprobados con reparto 14 OM y 6 V/F", () => {
  const modules = Array.from({ length: 10 }, (_, index) => {
    const id = `m${String(index + 1).padStart(2, "0")}`;
    return {
      id,
      number: index + 1,
      title: id,
      items: [
        ...Array.from({ length: 6 }, (__, itemIndex) => ({ id: `${id}-om-${itemIndex}`, estado: "aprobado", tipo: "opcion_multiple" })),
        ...Array.from({ length: index < 8 ? 2 : 0 }, (__, itemIndex) => ({ id: `${id}-vf-${itemIndex}`, estado: "aprobado", tipo: "verdadero_falso" })),
        { id: `${id}-draft`, estado: "revisar", tipo: "opcion_multiple" },
      ],
    };
  });
  const result = selectExamFormatItems(modules, { random: () => 0.37 });
  assert.equal(result.items.length, 20);
  assert.equal(result.items.filter((item) => item.tipo === "verdadero_falso").length, 6);
  assert.equal(result.items.some((item) => item.estado !== "aprobado"), false);
  const counts = Object.groupBy(result.items, (item) => item.moduleId);
  assert.deepEqual(Object.fromEntries(Object.entries(counts).map(([key, value]) => [key, value.length])), {
    m01: 2, m02: 1, m03: 2, m04: 2, m05: 3, m06: 3, m07: 3, m08: 2, m09: 1, m10: 1,
  });
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

test("la práctica adaptativa cambia dificultad y repite errores al final", () => {
  const items = Array.from({ length: 6 }, (_, index) => ({
    id: `a${index}`,
    estado: "aprobado",
    dificultad: index % 3 + 1,
    enunciado: `Ítem ${index}`,
    opciones: ["A", "B"],
  }));
  const rising = createAdaptiveSession(items, { count: 3, random: () => 0 });
  advanceAdaptiveSession(rising, rising.currentItem, true, "seguro");
  advanceAdaptiveSession(rising, rising.currentItem, true, "seguro");
  assert.equal(rising.currentDifficulty, 3);

  const repeating = createAdaptiveSession(items, { count: 2, random: () => 0 });
  advanceAdaptiveSession(repeating, repeating.currentItem, false, "adivine");
  advanceAdaptiveSession(repeating, repeating.currentItem, false, "adivine");
  assert.equal(repeating.currentItem.repeat, true);
  advanceAdaptiveSession(repeating, repeating.currentItem, true, "dudoso");
  assert.equal(repeating.currentItem.repeat, true);
});

test("cada pregunta ofrece declaración de seguridad", () => {
  const html = renderQuestion({ id: "q1", enunciado: "Pregunta", opciones: ["A", "B"], correcta: 0 }, { withConfidence: true });
  assert.equal((html.match(/data-confidence=/g) ?? []).length, 3);
  assert.equal((renderQuestion({ id: "q2", enunciado: "Diagnóstico", opciones: ["A", "B"], correcta: 0 }).match(/data-confidence=/g) ?? []).length, 0);
});
