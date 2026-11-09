export const COHERENCE_CHAIN = [
  { id: "problema", label: "Problema" },
  { id: "preguntas", label: "Preguntas" },
  { id: "objetivos", label: "Objetivos" },
  { id: "hipotesis", label: "Hipótesis" },
  { id: "variables", label: "Variables" },
  { id: "diseno", label: "Diseño" },
  { id: "muestra", label: "Muestra" },
  { id: "instrumentos", label: "Instrumentos" },
  { id: "analisis", label: "Análisis" },
];

export const MODULE_STEPS = [
  { id: "ubicacion", label: "Ubicación" },
  { id: "diagnostico", label: "Diagnóstico" },
  { id: "estudio", label: "Estudio" },
  { id: "conceptos", label: "Conceptos" },
  { id: "guiada", label: "Práctica guiada" },
  { id: "adaptativa", label: "Práctica adaptativa" },
  { id: "verificacion", label: "Dominio" },
  { id: "auditoria", label: "Autoauditoría" },
  { id: "cierre", label: "Cierre" },
];

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

export function shuffle(items, random = Math.random) {
  const copy = [...(items ?? [])];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

export function shuffleOptionIndices(options, random = Math.random) {
  return shuffle((options ?? []).map((_, index) => index), random);
}

export function approvedItems(items) {
  return (items ?? []).filter((item) => item?.estado === "aprobado");
}

function byDifficulty(items, difficulty, random) {
  return shuffle(items.filter((item) => Number(item.dificultad) === difficulty), random);
}

export function selectAdaptiveItems(items, count = 12, random = Math.random) {
  const approved = approvedItems(items);
  const preferred = byDifficulty(approved, 2, random);
  return [...preferred, ...shuffle(approved.filter((item) => Number(item.dificultad) !== 2), random)].slice(0, count);
}

export function selectVerificationItems(items, random = Math.random) {
  const approved = approvedItems(items);
  const selected = [];
  for (const [difficulty, amount] of [[1, 3], [2, 4], [3, 3]]) {
    selected.push(...byDifficulty(approved, difficulty, random).slice(0, amount));
  }
  if (selected.length < 10) {
    const selectedIds = new Set(selected.map((item) => item.id));
    selected.push(...shuffle(approved.filter((item) => !selectedIds.has(item.id)), random).slice(0, 10 - selected.length));
  }
  return shuffle(selected.slice(0, 10), random);
}

export function scoreVerification(items, answers) {
  const answerMap = answers instanceof Map
    ? answers
    : new Map((answers ?? []).map((answer) => [answer.id, answer]));
  const total = items?.length ?? 0;
  const answered = (items ?? []).filter((item) => answerMap.has(item.id)).length;
  const incorrectItems = (items ?? []).filter((item) => {
    const answer = answerMap.get(item.id);
    return !(typeof answer === "boolean" ? answer : answer?.correcto ?? answer?.correct);
  });
  const correct = total - incorrectItems.length;
  const score = total ? Math.round((correct / total) * 100) : 0;
  return {
    total,
    answered,
    correct,
    score,
    dominated: total > 0 && score >= 80,
    subtemasRevisar: [...new Set(incorrectItems.map((item) => item.subtema).filter(Boolean))],
  };
}

export function feedbackFor(item, correct) {
  const feedback = item?.feedback ?? {};
  if (correct) return feedback.correcta ?? feedback.correcto ?? feedback.correct ?? "La respuesta coincide con la clave del ítem.";
  return feedback.incorrecta ?? feedback.incorrecto ?? feedback.incorrect ?? "Revisá este concepto en la lectura del módulo.";
}

export function answerIsCorrect(item, answer) {
  if (!item) return false;
  if (item.tipo === "verdadero_falso") {
    const expected = String(item.correcta).toLowerCase();
    return String(answer).toLowerCase() === expected || Number(answer) === Number(item.correcta);
  }
  return Number(answer) === Number(item.correcta);
}

export function renderQuestion(item, { name = `answer-${item?.id}`, disabled = false, random = Math.random } = {}) {
  if (!item) return "";
  const options = Array.isArray(item.opciones) ? item.opciones : ["Verdadero", "Falso"];
  const controls = shuffleOptionIndices(options, random).map((originalIndex) => `
    <label class="question__option">
      <input type="radio" name="${escapeHtml(name)}" value="${originalIndex}" ${disabled ? "disabled" : ""}>
      <span>${inlineMarkdown(options[originalIndex])}</span>
    </label>`).join("");
  return `
    <article class="question" data-question-id="${escapeHtml(item.id)}">
      <p class="question__meta">${escapeHtml(item.subtema ?? "")} · dificultad ${escapeHtml(item.dificultad ?? "—")}</p>
      <h3>${inlineMarkdown(item.enunciado)}</h3>
      <div class="question__options">${controls}</div>
      <div class="question__actions"><button class="button button--primary" type="button" data-answer-button>Responder</button></div>
      <div class="question__feedback" aria-live="polite"></div>
    </article>`;
}

export function createSession(items, { count = 12, mode = "adaptativa", random = Math.random } = {}) {
  const selected = mode === "verificacion"
    ? selectVerificationItems(items, random)
    : selectAdaptiveItems(items, count, random);
  return { mode, items: selected, answers: [], startedAt: new Date().toISOString() };
}

export function stepFromQuery(value) {
  const index = MODULE_STEPS.findIndex((step) => step.id === value);
  return index >= 0 ? index : 0;
}
