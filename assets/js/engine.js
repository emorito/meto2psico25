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
  { id: "ubicacion", label: "Ubicá tu proyecto" },
  { id: "diagnostico", label: "Qué ya sabés" },
  { id: "estudio", label: "Estudiá" },
  { id: "conceptos", label: "Repasá conceptos" },
  { id: "guiada", label: "Práctica guiada" },
  { id: "adaptativa", label: "Practicá" },
  { id: "verificacion", label: "Verificá lo aprendido" },
  { id: "auditoria", label: "Aplicalo a tu proyecto" },
  { id: "cierre", label: "Cerrá la sesión" },
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

export function approvedReviewEntries(entries) {
  return (entries ?? []).filter((entry) => entry?.kind === "card" ? Boolean(entry.item) : entry?.item?.estado === "aprobado");
}

export const FINAL_MODULE_COUNTS = {
  m01: 2, m02: 1, m03: 2, m04: 2, m05: 3,
  m06: 3, m07: 3, m08: 2, m09: 1, m10: 1,
};

function normalizedItemType(item) {
  return item?.tipo === "verdadero_falso" ? "verdadero_falso" : "opcion_multiple";
}

function validFinalItem(item) {
  const expectedOptions = normalizedItemType(item) === "verdadero_falso" ? 2 : 4;
  return item?.estado === "aprobado"
    && Array.isArray(item.opciones)
    && item.opciones.length === expectedOptions;
}

export function selectExamFormatItems(modules, { counts = FINAL_MODULE_COUNTS, random = Math.random } = {}) {
  const moduleMap = new Map((modules ?? []).map((module) => [module.id, module]));
  const moduleIds = Object.keys(counts);
  const warnings = [];
  const selected = [];
  const selectedIds = new Set();
  let vfNeeded = 6;

  for (const [index, moduleId] of moduleIds.entries()) {
    const target = counts[moduleId];
    const module = moduleMap.get(moduleId);
    const approvedBank = approvedItems(module?.items ?? []);
    const bank = approvedBank.filter(validFinalItem);
    const rejected = approvedBank.length - bank.length;
    if (rejected > 0) warnings.push(`${moduleId}: ${rejected} ítem(s) aprobado(s) excluido(s) por cantidad inválida de opciones.`);
    const multipleChoice = shuffle(bank.filter((item) => normalizedItemType(item) === "opcion_multiple"), random);
    const trueFalse = shuffle(bank.filter((item) => normalizedItemType(item) === "verdadero_falso"), random);
    const takeVf = vfNeeded > 0 && trueFalse.length > 0 && index < 8 ? 1 : 0;
    const local = [...trueFalse.slice(0, takeVf), ...multipleChoice.slice(0, target - takeVf)];
    vfNeeded -= Math.min(takeVf, local.filter((item) => normalizedItemType(item) === "verdadero_falso").length);
    if (local.length < target) {
      const remainder = shuffle(bank.filter((item) => !local.some((chosen) => chosen.id === item.id)), random).slice(0, target - local.length);
      local.push(...remainder);
    }
    local.forEach((item) => {
      selected.push({ ...item, moduleId, moduleNumber: module?.number ?? Number(moduleId.slice(1)), moduleTitle: module?.title ?? moduleId });
      selectedIds.add(item.id);
    });
    if (local.length < target) warnings.push(`${moduleId} no alcanza ${target} ítems aprobados.`);
  }

  // Completa primero la proporción V/F y después cualquier faltante total,
  // tomando el módulo numéricamente más cercano al que tuvo la brecha.
  if (vfNeeded > 0) {
    const vfPool = shuffle((modules ?? []).flatMap((module) => approvedItems(module.items ?? []).filter(validFinalItem)
      .filter((item) => normalizedItemType(item) === "verdadero_falso" && !selectedIds.has(item.id))
      .map((item) => ({ ...item, moduleId: module.id, moduleNumber: module.number, moduleTitle: module.title }))), random);
    for (const replacement of vfPool.slice(0, vfNeeded)) {
      const replaceAt = selected.findIndex((item) => normalizedItemType(item) === "opcion_multiple" && counts[item.moduleId] > 1);
      if (replaceAt < 0) break;
      selectedIds.delete(selected[replaceAt].id);
      selected[replaceAt] = replacement;
      selectedIds.add(replacement.id);
      vfNeeded -= 1;
    }
  }

  const targetTotal = Object.values(counts).reduce((sum, value) => sum + value, 0);
  if (selected.length < targetTotal) {
    const pool = shuffle((modules ?? []).flatMap((module) => approvedItems(module.items ?? []).filter(validFinalItem)
      .filter((item) => !selectedIds.has(item.id))
      .map((item) => ({ ...item, moduleId: module.id, moduleNumber: module.number, moduleTitle: module.title }))), random);
    selected.push(...pool.slice(0, targetTotal - selected.length));
    warnings.push("Se completaron faltantes con módulos cercanos.");
  }

  const finalItems = shuffle(selected.slice(0, targetTotal), random);
  const vfCount = finalItems.filter((item) => normalizedItemType(item) === "verdadero_falso").length;
  if (vfCount !== 6) warnings.push(`La mezcla disponible quedó en ${targetTotal - vfCount} OM y ${vfCount} V/F.`);
  return { items: finalItems, warnings };
}

function byDifficulty(items, difficulty, random) {
  return shuffle(items.filter((item) => Number(item.dificultad) === difficulty), random);
}

export function selectAdaptiveItems(items, count = 12, random = Math.random) {
  const approved = approvedItems(items);
  const preferred = byDifficulty(approved, 2, random);
  return [...preferred, ...shuffle(approved.filter((item) => Number(item.dificultad) !== 2), random)].slice(0, count);
}

function nextAdaptiveItem(session) {
  if (session.primaryServed >= session.targetCount) {
    const error = session.errorQueue.shift();
    return error ? { ...error, repeat: true } : null;
  }
  const unused = session.bank.filter((item) => !session.usedIds.includes(item.id));
  const available = unused.length ? unused : session.bank;
  const preferred = available.filter((item) => Number(item.dificultad) === session.currentDifficulty);
  const choices = preferred.length ? preferred : available;
  const item = shuffle(choices, session.random)[0] ?? null;
  if (item && !session.usedIds.includes(item.id)) session.usedIds.push(item.id);
  return item;
}

export function createAdaptiveSession(items, { count = 12, random = Math.random } = {}) {
  const session = {
    mode: "adaptativa",
    bank: approvedItems(items),
    targetCount: count,
    primaryServed: 0,
    currentDifficulty: 2,
    correctStreak: 0,
    errorQueue: [],
    usedIds: [],
    items: [],
    answers: [],
    random,
    startedAt: new Date().toISOString(),
  };
  session.currentItem = nextAdaptiveItem(session);
  if (session.currentItem) session.items.push(session.currentItem);
  return session;
}

export function advanceAdaptiveSession(session, item, correct, seguridad) {
  if (!session || !item) return null;
  session.answers.push({ id: item.id, correcto: correct, seguridad });
  if (!item.repeat) {
    session.primaryServed += 1;
    if (correct) {
      session.correctStreak += 1;
      if (session.correctStreak >= 2) {
        session.currentDifficulty = Math.min(3, session.currentDifficulty + 1);
        session.correctStreak = 0;
      }
    } else {
      session.correctStreak = 0;
      session.currentDifficulty = Math.max(1, session.currentDifficulty - 1);
      session.errorQueue.push(item);
    }
  }
  session.currentItem = nextAdaptiveItem(session);
  if (session.currentItem) session.items.push(session.currentItem);
  return session.currentItem;
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

export function renderQuestion(item, { name = `answer-${item?.id}`, disabled = false, random = Math.random, withConfidence = false } = {}) {
  if (!item) return "";
  const options = Array.isArray(item.opciones) ? item.opciones : ["Verdadero", "Falso"];
  const controls = shuffleOptionIndices(options, random).map((originalIndex) => `
    <label class="question__option">
      <input type="radio" name="${escapeHtml(name)}" value="${originalIndex}" ${disabled ? "disabled" : ""}>
      <span>${inlineMarkdown(options[originalIndex])}</span>
    </label>`).join("");
  const confidence = withConfidence ? [
    ["seguro", "Seguro"],
    ["dudoso", "Dudoso"],
    ["adivine", "Adiviné"],
  ].map(([value, label]) => `<button type="button" class="confidence-button" data-confidence="${value}" aria-pressed="false">${label}</button>`).join("") : "";
  const repeatLabel = item.repeat ? " · reaparece por error" : "";
  return `
    <article class="question" data-question-id="${escapeHtml(item.id)}">
      <p class="question__meta">${item.repeat ? "Repaso de error · " : ""}${escapeHtml(item.subtema ?? "")} · dificultad ${escapeHtml(item.dificultad ?? "—")}${repeatLabel}</p>
      <h3>${inlineMarkdown(item.enunciado)}</h3>
      <div class="question__options">${controls}</div>
      ${withConfidence ? `<div class="question__confidence" role="group" aria-label="¿Qué tan segura es tu respuesta?">${confidence}</div>` : ""}
      <div class="question__actions"><button class="button button--primary" type="button" data-answer-button>Responder</button></div>
      <div class="question__feedback" aria-live="polite"></div>
    </article>`;
}

export function createSession(items, { count = 12, mode = "adaptativa", random = Math.random } = {}) {
  if (mode === "adaptativa") return createAdaptiveSession(items, { count, random });
  const selected = selectVerificationItems(items, random);
  return { mode, items: selected, answers: [], startedAt: new Date().toISOString() };
}

export function stepFromQuery(value) {
  const index = MODULE_STEPS.findIndex((step) => step.id === value);
  return index >= 0 ? index : 0;
}
