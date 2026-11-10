import {
  answerIsCorrect,
  escapeHtml,
  feedbackFor,
  inlineMarkdown,
  renderQuestion,
} from "./engine.js";
import {
  getReviewQueue,
  loadStore,
  reviewPlan,
  saveStore,
  updateModule,
} from "./store.js";

const contentEl = document.querySelector("#review-content");
const themeSelect = document.querySelector("#theme-select");
const state = {
  store: loadStore(),
  queue: [],
  index: 0,
  modules: new Map(),
};

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  if (themeSelect) themeSelect.value = theme;
  state.store.theme = theme;
  saveStore(state.store);
}

function initializeTheme() {
  setTheme(state.store.theme ?? "auto");
  themeSelect?.addEventListener("change", () => setTheme(themeSelect.value));
}

function renderEmpty() {
  contentEl.innerHTML = `<section class="review-page"><div class="review-page__header"><p class="eyebrow">Repasar</p><h1>Por ahora no hay preguntas ni tarjetas pendientes</h1><p>Cuando una respuesta te salga mal, marques una tarjeta como dudosa o digas que no la sabías, aparecerá acá para volver a intentarla.</p></div><div class="card card--success"><h2>Podés seguir estudiando</h2><p>Elegí un módulo o hacé una prueba corta. El sitio va a guardar lo que necesites volver a practicar.</p><a class="button button--primary" href="index.html">Volver al inicio</a></div></section>`;
}

function renderCardQuestion(entry, card) {
  return `<section class="review-page"><div class="review-page__header"><p class="eyebrow">Repasar una tarjeta</p><h1>Intentá recordarlo</h1><p>${escapeHtml(state.modules.get(entry.modulo)?.title ?? `Módulo ${entry.modulo}`)} · tarjeta ${state.index + 1} de ${state.queue.length}</p><div class="review-progress" aria-label="Progreso del repaso"><span style="--progress: ${Math.round((state.index / state.queue.length) * 100)}%"></span></div></div><article class="review-card" data-card-id="${escapeHtml(card.id)}"><p class="question__meta">${escapeHtml(card.tag ?? "Concepto")}</p><h2>${escapeHtml(card.frente ?? card.front ?? "Concepto")}</h2><details><summary>Ver explicación</summary><p>${escapeHtml(card.dorso ?? card.back ?? "")}</p></details><div class="card-study-actions"><p class="muted">Después de intentar recordarlo, elegí cómo te fue:</p><div class="cluster"><button type="button" class="button button--quiet" data-review-card-rating="lo-sabía">Lo sabía</button><button type="button" class="button button--quiet" data-review-card-rating="dudé">Dudé</button><button type="button" class="button button--quiet" data-review-card-rating="no-lo-sabía">No lo sabía</button></div><div class="question__feedback" aria-live="polite"></div></div></article></section>`;
}

function renderCurrent() {
  const entry = state.queue[state.index];
  if (!entry) {
    contentEl.innerHTML = `<section class="review-page"><div class="review-page__header"><p class="eyebrow">Repasar</p><h1>Terminaste este repaso</h1><p>Las preguntas que resolviste bien y con seguridad volverán cuando corresponda. Las demás quedan pendientes.</p></div><div class="cluster"><a class="button button--primary" href="index.html">Volver al inicio</a><button class="button button--secondary" type="button" data-review-restart>Repasar de nuevo</button></div></section>`;
    contentEl.querySelector("[data-review-restart]")?.addEventListener("click", () => { state.index = 0; renderCurrent(); });
    return;
  }
  const moduleTitle = state.modules.get(entry.modulo)?.title ?? `Módulo ${entry.modulo}`;
  if (entry.kind === "card") {
    const card = entry.item;
    contentEl.innerHTML = renderCardQuestion(entry, card);
    attachCardAnswerHandler(entry, card);
    return;
  }
  const item = { ...entry.item, repeat: entry.repeated === true };
  contentEl.innerHTML = `<section class="review-page"><div class="review-page__header"><p class="eyebrow">Repasar lo que te salió mal</p><h1>Volvé a intentarlo</h1><p>${escapeHtml(moduleTitle)} · pregunta ${state.index + 1} de ${state.queue.length}</p><div class="review-progress" aria-label="Progreso del repaso"><span style="--progress: ${Math.round((state.index / state.queue.length) * 100)}%"></span></div></div>${renderQuestion(item, { name: `review-${item.id}-${state.index}`, withConfidence: true })}</section>`;
  attachAnswerHandler(entry, item);
}

function attachCardAnswerHandler(entry, card) {
  const cardEl = contentEl.querySelector("[data-card-id]");
  cardEl?.querySelectorAll("[data-review-card-rating]").forEach((button) => {
    button.addEventListener("click", () => {
      const rating = button.dataset.reviewCardRating;
      const fecha = new Date().toISOString();
      const plan = reviewPlan({
        correcto: rating === "lo-sabía",
        seguridad: rating === "lo-sabía" ? "seguro" : rating === "dudé" ? "dudoso" : "adivine",
        caja: entry.caja ?? 0,
        now: fecha,
      });
      state.store.leitner ??= {};
      state.store.leitner[entry.modulo] ??= {};
      state.store.leitner[entry.modulo][card.id] = { id: card.id, modulo: entry.modulo, ...plan, ultimaRespuesta: rating, fecha };
      state.store = updateModule(state.store, entry.modulo, {
        lastActivity: { kind: "review", stepId: "conceptos", questionId: card.id, updatedAt: fecha },
      });
      const saved = saveStore(state.store);
      const feedback = cardEl.querySelector(".question__feedback");
      if (feedback) feedback.innerHTML = `<p class="feedback ${rating === "lo-sabía" ? "" : "feedback--error"}">${saved ? (rating === "lo-sabía" ? "Guardado. Esta tarjeta volverá más adelante." : "Guardado. Esta tarjeta vuelve a la cola para que la intentes otra vez.") : "No se pudo guardar en este dispositivo."}</p>`;
      cardEl.querySelectorAll("[data-review-card-rating]").forEach((candidate) => { candidate.disabled = true; });
      if (rating !== "lo-sabía" && !entry.repeated) state.queue.push({ ...entry, repeated: true, caja: 0 });
      const nextButton = document.createElement("button");
      nextButton.type = "button";
      nextButton.className = "button button--secondary";
      nextButton.textContent = state.index + 1 < state.queue.length ? "Siguiente" : "Terminar repaso";
      nextButton.addEventListener("click", () => { state.index += 1; renderCurrent(); });
      feedback?.append(document.createElement("br"), nextButton);
    });
  });
}

function attachAnswerHandler(entry, item) {
  const question = contentEl.querySelector("[data-question-id]");
  if (!question) return;
  question.querySelectorAll("[data-confidence]").forEach((button) => {
    button.addEventListener("click", () => {
      question.dataset.confidence = button.dataset.confidence;
      question.querySelectorAll("[data-confidence]").forEach((candidate) => {
        const selected = candidate === button;
        candidate.classList.toggle("is-selected", selected);
        candidate.setAttribute("aria-pressed", String(selected));
      });
    });
  });
  question.querySelector("[data-answer-button]")?.addEventListener("click", () => {
    const selected = question.querySelector("input:checked");
    const seguridad = question.dataset.confidence;
    const feedback = question.querySelector(".question__feedback");
    if (!selected) {
      feedback.innerHTML = `<p class="feedback feedback--error">Elegí una opción antes de responder.</p>`;
      return;
    }
    if (!seguridad) {
      feedback.innerHTML = `<p class="feedback feedback--error">Decí cuánta seguridad tenés antes de responder.</p>`;
      return;
    }
    const correct = answerIsCorrect(item, selected.value);
    const fecha = new Date().toISOString();
    state.store.responses.push({
      id: item.id,
      modulo: entry.modulo,
      correcto: correct,
      seguridad,
      revisar: true,
      fecha,
      ...reviewPlan({ correcto: correct, seguridad, caja: entry.caja ?? 0, now: fecha }),
    });
    state.store = updateModule(state.store, entry.modulo, {
      lastActivity: { kind: "review", stepId: "adaptativa", questionId: item.id, updatedAt: fecha },
    });
    const saved = saveStore(state.store);
    feedback.innerHTML = `<div class="feedback ${correct ? "" : "feedback--error"}"><strong>${correct ? "Bien" : "Volvé a mirar esto"}</strong><p>${inlineMarkdown(feedbackFor(item, correct))}</p>${saved ? "" : "<p>Este navegador no pudo guardar el avance.</p>"}</div>`;
    question.querySelectorAll("input, button").forEach((control) => { control.disabled = true; });
    if ((!correct || seguridad !== "seguro") && !entry.repeated) state.queue.push({ ...entry, repeated: true, caja: 0 });
    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className = "button button--secondary";
    nextButton.textContent = state.index + 1 < state.queue.length ? "Siguiente pregunta" : "Terminar repaso";
    nextButton.addEventListener("click", () => { state.index += 1; renderCurrent(); });
    feedback.append(document.createElement("br"), nextButton);
  });
}

async function load() {
  initializeTheme();
  const rawQueue = getReviewQueue(state.store);
  const moduleIds = [...new Set(rawQueue.map((response) => response.modulo))];
  await Promise.all(moduleIds.map(async (moduleId) => {
    const [response, cardsResponse, modulesResponse] = await Promise.all([
      fetch(`data/banco/${moduleId}.json`),
      fetch("data/banco/flipcards.json"),
      fetch("data/modulos.json"),
    ]);
    const bank = await response.json();
    const cards = await cardsResponse.json();
    const modules = await modulesResponse.json();
    const module = modules.find((candidate) => candidate.id === moduleId);
    if (module) state.modules.set(moduleId, module);
    state.modules.set(`${moduleId}:items`, new Map((bank.items ?? []).map((item) => [item.id, item])));
    state.modules.set(`${moduleId}:cards`, new Map(cards.filter((card) => card.modulo_id === moduleId).map((card) => [card.id, card])));
  }));
  state.queue = rawQueue.map((response) => ({
    ...response,
    item: state.modules.get(`${response.modulo}:${response.kind === "card" ? "cards" : "items"}`)?.get(response.id),
  })).filter((entry) => entry.kind === "card" ? Boolean(entry.item) : entry.item?.estado === "aprobado");
  if (!state.queue.length) renderEmpty();
  else renderCurrent();
}

load().catch((error) => {
  contentEl.innerHTML = `<div class="empty-note">No se pudo cargar el repaso: ${escapeHtml(error.message)}</div>`;
});
