import { answerIsCorrect, escapeHtml, feedbackFor, inlineMarkdown, renderQuestion, shuffle } from "./engine.js";
import { loadStore, saveStore } from "./store.js";

const contentEl = document.querySelector("#simulacro-content");
const themeSelect = document.querySelector("#theme-select");
const state = { store: loadStore(), modules: [], items: [], answers: new Map() };

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

function renderIntro() {
  return `<section class="simulacro-page"><div class="simulacro-page__header"><p class="eyebrow">Hacer una prueba</p><h1>Una prueba corta para practicar</h1><p>Son 10 preguntas mezcladas de los módulos. Esta prueba no cambia lo que ya aprendiste ni mueve preguntas al repaso.</p></div><div class="card card--accent"><h2>Cómo usarla</h2><ul><li>Elegí una opción en cada pregunta.</li><li>Respondé para ver una explicación breve.</li><li>Al final vas a ver tu resultado y qué temas conviene volver a mirar.</li></ul></div><div class="cluster"><button class="button button--primary" type="button" data-start-simulacro>Empezar la prueba</button><a class="button button--quiet" href="index.html">Volver al inicio</a></div></section>`;
}

function renderQuestions() {
  const questions = state.items.map((item, index) => `<div class="simulacro-question" data-simulacro-question="${escapeHtml(item.id)}"><p class="question__meta">Pregunta ${index + 1} de ${state.items.length} · Módulo ${escapeHtml(item.moduleNumber)}</p>${renderQuestion(item, { name: `simulacro-${index}` })}</div>`).join("");
  return `<section class="simulacro-page"><div class="simulacro-page__header"><p class="eyebrow">Prueba en curso</p><h1>Respondé y revisá</h1><p>Podés avanzar en cualquier orden. Cada pregunta muestra su explicación después de responder.</p></div><div class="question-list">${questions}</div><div class="verification-actions"><button class="button button--primary" type="button" data-simulacro-submit>Ver mi resultado</button><div data-simulacro-result aria-live="polite"></div></div></section>`;
}

function renderResult() {
  const total = state.items.length;
  const correct = [...state.answers.values()].filter(Boolean).length;
  const score = total ? Math.round((correct / total) * 100) : 0;
  const subtopics = [...new Set(state.items.filter((item) => state.answers.get(item.id) === false).map((item) => item.subtema).filter(Boolean))];
  state.store.simulacros = [...(state.store.simulacros ?? []), { fecha: new Date().toISOString(), total, correct, score, subtemasRevisar: subtopics }];
  saveStore(state.store);
  const review = subtopics.length ? `<p><strong>Volvé a mirar:</strong> ${subtopics.map((item) => escapeHtml(item)).join(", ")}</p>` : `<p>Respondés correctamente todas las preguntas de esta prueba.</p>`;
  return `<div class="simulacro-result ${score >= 80 ? "simulacro-result--ok" : "simulacro-result--review"}"><h2>${score >= 80 ? "Muy bien: vas encaminado" : "Ya tenés un punto de partida"}</h2><p>Puntaje: <strong>${score}%</strong> (${correct}/${total}).</p>${review}<div class="cluster"><a class="button button--primary" href="repaso.html">Repasar lo pendiente</a><a class="button button--quiet" href="progreso.html">Ver mi progreso</a></div></div>`;
}

function attachQuestionHandlers() {
  contentEl.querySelectorAll("[data-answer-button]").forEach((button) => {
    button.addEventListener("click", () => {
      const question = button.closest("[data-question-id]");
      const item = state.items.find((candidate) => candidate.id === question?.dataset.questionId);
      const selected = question?.querySelector("input:checked");
      const feedback = question?.querySelector(".question__feedback");
      if (!item || !feedback) return;
      if (!selected) {
        feedback.innerHTML = `<p class="feedback feedback--error">Elegí una opción antes de responder.</p>`;
        return;
      }
      const correct = answerIsCorrect(item, selected.value);
      state.answers.set(item.id, correct);
      feedback.innerHTML = `<div class="feedback ${correct ? "" : "feedback--error"}"><strong>${correct ? "Correcto" : "Revisá este punto"}</strong><p>${inlineMarkdown(feedbackFor(item, correct))}</p></div>`;
      button.disabled = true;
      question.querySelectorAll("input").forEach((input) => { input.disabled = true; });
    });
  });
}

function renderPractice() {
  contentEl.innerHTML = renderQuestions();
  attachQuestionHandlers();
  contentEl.querySelector("[data-simulacro-submit]")?.addEventListener("click", () => {
    const result = contentEl.querySelector("[data-simulacro-result]");
    if (state.answers.size < state.items.length) {
      result.innerHTML = `<p class="feedback feedback--error">Respondé las ${state.items.length - state.answers.size} preguntas que faltan.</p>`;
      return;
    }
    result.innerHTML = renderResult();
    contentEl.querySelector("[data-simulacro-submit]").disabled = true;
  });
}

function chooseItems() {
  const approved = state.modules.flatMap((module) => module.items.filter((item) => item.estado === "aprobado").map((item) => ({ ...item, moduleNumber: module.number })));
  const shuffled = shuffle(approved);
  const selected = [];
  const seenModules = new Set();
  for (const item of shuffled) {
    if (selected.length >= 10) break;
    if (!seenModules.has(item.moduleNumber)) {
      selected.push(item);
      seenModules.add(item.moduleNumber);
    }
  }
  for (const item of shuffled) {
    if (selected.length >= 10) break;
    if (!selected.some((candidate) => candidate.id === item.id)) selected.push(item);
  }
  return selected;
}

async function load() {
  initializeTheme();
  const modulesResponse = await fetch("data/modulos.json");
  const modules = await modulesResponse.json();
  state.modules = await Promise.all(modules.map(async (module) => {
    const response = await fetch(`data/banco/${module.id}.json`);
    const bank = await response.json();
    return { ...module, items: bank.items ?? [] };
  }));
  contentEl.innerHTML = renderIntro();
  contentEl.querySelector("[data-start-simulacro]")?.addEventListener("click", () => {
    state.items = chooseItems();
    renderPractice();
  });
}

load().catch((error) => {
  contentEl.innerHTML = `<div class="empty-note">No se pudo cargar la prueba: ${escapeHtml(error.message)}</div>`;
});
