import {
  answerIsCorrect,
  escapeHtml,
  feedbackFor,
  inlineMarkdown,
  renderQuestion,
  selectExamFormatItems,
  shuffle,
} from "./engine.js";
import { loadStore, saveStore } from "./store.js";

const contentEl = document.querySelector("#simulacro-content");
const themeSelect = document.querySelector("#theme-select");
const state = {
  store: loadStore(), modules: [], cases: [], mode: null, items: [], answers: new Map(),
  case: null, selfScores: new Map(), timer: null, secondsLeft: 40 * 60, timerHidden: false,
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

function approvedCases(payload) {
  const list = Array.isArray(payload) ? payload : payload?.casos ?? payload?.items ?? [];
  return list.filter((item) => item?.tipo === "caso_integrador" && item?.estado === "aprobado" && item?.preguntas?.length === 8);
}

function renderIntro() {
  const caseNote = state.cases.length
    ? "Incluye un caso integrador aprobado para practicar la Parte II."
    : "El modo completo se habilitará cuando haya al menos un caso de práctica aprobado.";
  return `<section class="simulacro-page"><div class="simulacro-page__header"><p class="eyebrow">Hacer una prueba</p><h1>Elegí cómo querés practicar</h1><p>Los dos modos usan solamente ítems aprobados. Ninguno modifica el dominio de tus módulos.</p></div>
    <div class="simulacro-mode-grid">
      <article class="card"><h2>Prueba corta</h2><p>Diez preguntas mezcladas, con explicación inmediata. Es el modo que ya conocés.</p><button class="button button--primary" type="button" data-start-short>Empezar prueba corta</button></article>
      <article class="card card--accent"><p class="eyebrow">Nuevo</p><h2>Formato del final</h2><p>Parte I: 20 ítems. Parte II: un caso con 8 respuestas breves y autocorrección. Cronómetro sugerido de 40 minutos, ocultable.</p><p class="progress-note">${escapeHtml(caseNote)}</p><button class="button button--primary" type="button" data-start-final ${state.cases.length ? "" : "disabled"}>Practicar el formato completo</button></article>
    </div><div class="cluster"><a class="button button--quiet" href="index.html">Volver al inicio</a></div></section>`;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function stopTimer() {
  if (state.timer) window.clearInterval(state.timer);
  state.timer = null;
}

function updateTimer() {
  const timerEl = contentEl.querySelector("[data-final-timer]");
  if (!timerEl) return;
  timerEl.textContent = state.timerHidden ? "Cronómetro en curso (oculto)" : `Tiempo sugerido: ${formatTime(state.secondsLeft)}`;
}

function startTimer() {
  stopTimer();
  state.secondsLeft = 40 * 60;
  state.timerHidden = false;
  updateTimer();
  state.timer = window.setInterval(() => {
    state.secondsLeft -= 1;
    updateTimer();
    if (state.secondsLeft <= 0) {
      stopTimer();
      const notice = contentEl.querySelector("[data-final-notice]");
      if (notice) notice.innerHTML = '<p class="feedback feedback--error">Terminó el tiempo sugerido. Podés completar la práctica: el sitio no bloquea tus respuestas.</p>';
    }
  }, 1000);
}

function renderShortQuestions() {
  const questions = state.items.map((item, index) => `<div class="simulacro-question" data-simulacro-question="${escapeHtml(item.id)}"><p class="question__meta">Pregunta ${index + 1} de ${state.items.length} · Módulo ${escapeHtml(item.moduleNumber)}</p>${renderQuestion(item, { name: `simulacro-${index}` })}</div>`).join("");
  return `<section class="simulacro-page"><div class="simulacro-page__header"><p class="eyebrow">Prueba corta</p><h1>Respondé y revisá</h1><p>Podés avanzar en cualquier orden. Cada pregunta muestra su explicación después de responder.</p></div><div class="question-list">${questions}</div><div class="verification-actions"><button class="button button--primary" type="button" data-short-submit>Ver mi resultado</button><div data-short-result aria-live="polite"></div></div></section>`;
}

function shortResult() {
  const total = state.items.length;
  const correct = [...state.answers.values()].filter(Boolean).length;
  const score = total ? Math.round((correct / total) * 100) : 0;
  const subtopics = [...new Set(state.items.filter((item) => state.answers.get(item.id) === false).map((item) => item.subtema).filter(Boolean))];
  state.store.simulacros = [...(state.store.simulacros ?? []), { modo: "corto", fecha: new Date().toISOString(), total, correct, score, subtemasRevisar: subtopics }];
  saveStore(state.store);
  const review = subtopics.length ? `<p><strong>Volvé a mirar:</strong> ${subtopics.map(escapeHtml).join(", ")}</p>` : "<p>Respondés correctamente todas las preguntas.</p>";
  return `<div class="simulacro-result ${score >= 80 ? "simulacro-result--ok" : "simulacro-result--review"}"><h2>${score >= 80 ? "Muy bien: vas encaminado" : "Ya tenés un punto de partida"}</h2><p>Puntaje: <strong>${score}%</strong> (${correct}/${total}).</p>${review}<div class="cluster"><a class="button button--primary" href="repaso.html">Repasar lo pendiente</a><button class="button button--quiet" type="button" data-back-modes>Elegir otro modo</button></div></div>`;
}

function attachShortHandlers() {
  contentEl.querySelectorAll("[data-answer-button]").forEach((button) => {
    button.addEventListener("click", () => {
      const question = button.closest("[data-question-id]");
      const item = state.items.find((candidate) => candidate.id === question?.dataset.questionId);
      const selected = question?.querySelector("input:checked");
      const feedback = question?.querySelector(".question__feedback");
      if (!item || !feedback) return;
      if (!selected) {
        feedback.innerHTML = '<p class="feedback feedback--error">Elegí una opción antes de responder.</p>';
        return;
      }
      const correct = answerIsCorrect(item, selected.value);
      state.answers.set(item.id, correct);
      feedback.innerHTML = `<div class="feedback ${correct ? "" : "feedback--error"}"><strong>${correct ? "Correcto" : "Revisá este punto"}</strong><p>${inlineMarkdown(feedbackFor(item, correct))}</p></div>`;
      button.disabled = true;
      question.querySelectorAll("input").forEach((input) => { input.disabled = true; });
    });
  });
  contentEl.querySelector("[data-short-submit]")?.addEventListener("click", () => {
    const result = contentEl.querySelector("[data-short-result]");
    if (state.answers.size < state.items.length) {
      result.innerHTML = `<p class="feedback feedback--error">Respondé las ${state.items.length - state.answers.size} preguntas que faltan.</p>`;
      return;
    }
    result.innerHTML = shortResult();
    contentEl.querySelector("[data-short-submit]").disabled = true;
    attachBackHandler();
  });
}

function chooseShortItems() {
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

function renderFinalPartOne(warnings = []) {
  const warningHtml = warnings.length ? `<div class="feedback feedback--error"><strong>Ajuste del sorteo:</strong><ul>${warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}</ul></div>` : "";
  const questions = state.items.map((item, index) => `<div class="simulacro-question" data-final-question="${escapeHtml(item.id)}"><p class="question__meta">Pregunta ${index + 1} de 20 · ${escapeHtml(item.moduleId.toUpperCase())}</p>${renderQuestion(item, { name: `final-${index}` }).replace('data-answer-button', 'data-final-answer-button hidden')}</div>`).join("");
  return `<section class="simulacro-page"><div class="final-toolbar"><div><p class="eyebrow">Formato del final · Parte I</p><h1>20 ítems cerrados</h1></div><div class="timer-box"><strong data-final-timer>Tiempo sugerido: 40:00</strong><button class="button button--quiet" type="button" data-toggle-timer>Ocultar</button></div></div><p>Respondé todos los ítems. La corrección aparece recién al terminar esta parte.</p><div data-final-notice aria-live="polite"></div>${warningHtml}<div class="question-list">${questions}</div><div class="verification-actions"><button class="button button--primary" type="button" data-submit-part-one>Terminar Parte I y continuar al caso</button><div data-part-one-error aria-live="polite"></div></div></section>`;
}

function gradePartOne() {
  const perModule = {};
  let correct = 0;
  for (const [index, item] of state.items.entries()) {
    const container = contentEl.querySelector(`[data-final-question="${CSS.escape(item.id)}"]`);
    const selected = container?.querySelector("input:checked");
    const isCorrect = selected ? answerIsCorrect(item, selected.value) : false;
    state.answers.set(item.id, isCorrect);
    if (isCorrect) correct += 1;
    perModule[item.moduleId] ??= { total: 0, correct: 0, title: item.moduleTitle };
    perModule[item.moduleId].total += 1;
    if (isCorrect) perModule[item.moduleId].correct += 1;
    const feedback = container?.querySelector(".question__feedback");
    if (feedback) feedback.innerHTML = `<div class="feedback ${isCorrect ? "" : "feedback--error"}"><strong>${isCorrect ? "Correcto" : "Revisá este punto"}</strong><p>${inlineMarkdown(feedbackFor(item, isCorrect))}</p></div>`;
    container?.querySelectorAll("input").forEach((input) => { input.disabled = true; });
    const meta = container?.querySelector(".question__meta");
    if (meta) meta.textContent = `Pregunta ${index + 1} de 20 · ${item.moduleId.toUpperCase()}`;
  }
  return { correct, perModule };
}

function rubricText(question, score) {
  const rubric = question.rubrica ?? question.rúbrica ?? {};
  return rubric[String(score)] ?? rubric[score] ?? ({ 0: "No alcanza el criterio.", 1.25: "Alcanza parcialmente el criterio.", 2.5: "Alcanza el criterio completo." }[score]);
}

function renderCase(partOneResult) {
  const caseItem = state.case;
  const questions = caseItem.preguntas.map((question) => `<article class="final-case-question" data-case-question="${question.n}"><p class="question__meta">Pregunta ${question.n} de 8 · ${escapeHtml(question.eslabon)}</p><h3>${inlineMarkdown(question.enunciado)}</h3><label class="field-label" for="case-answer-${question.n}">Tu respuesta</label><textarea id="case-answer-${question.n}" rows="5" data-case-answer="${question.n}"></textarea></article>`).join("");
  contentEl.innerHTML = `<section class="simulacro-page"><div class="final-toolbar"><div><p class="eyebrow">Formato del final · Parte II</p><h1>${escapeHtml(caseItem.titulo)}</h1></div><div class="timer-box"><strong data-final-timer></strong><button class="button button--quiet" type="button" data-toggle-timer>${state.timerHidden ? "Mostrar" : "Ocultar"}</button></div></div><article class="card final-vignette"><h2>Caso integrador</h2><p>${inlineMarkdown(caseItem.vineta)}</p></article><div class="case-question-list">${questions}</div><div class="verification-actions"><button class="button button--primary" type="button" data-submit-case>Ver modelos y autocorregirme</button><div data-case-error aria-live="polite"></div></div></section>`;
  updateTimer();
  attachTimerToggle();
  contentEl.querySelector("[data-submit-case]")?.addEventListener("click", () => {
    const missing = caseItem.preguntas.filter((question) => !contentEl.querySelector(`[data-case-answer="${question.n}"]`)?.value.trim());
    if (missing.length) {
      contentEl.querySelector("[data-case-error]").innerHTML = `<p class="feedback feedback--error">Completá las ${missing.length} respuestas que faltan antes de ver la clave.</p>`;
      return;
    }
    stopTimer();
    renderSelfAssessment(partOneResult);
  });
}

function renderSelfAssessment(partOneResult) {
  const cards = state.case.preguntas.map((question) => `<article class="final-case-question" data-self-question="${question.n}"><p class="question__meta">Pregunta ${question.n} · ${escapeHtml(question.eslabon)}</p><h3>${inlineMarkdown(question.enunciado)}</h3><details open><summary>Respuesta modelo</summary><p>${inlineMarkdown(question.respuesta_modelo)}</p>${question.aceptables?.length ? `<p><strong>También es aceptable:</strong> ${question.aceptables.map(inlineMarkdown).join("; ")}</p>` : ""}${question.errores_cero?.length ? `<p><strong>Vale 0 cuando:</strong> ${question.errores_cero.map(inlineMarkdown).join("; ")}</p>` : ""}</details><div class="self-score" role="group" aria-label="Autocalificación de la pregunta ${question.n}">${[0, 1.25, 2.5].map((score) => `<button class="button button--quiet" type="button" data-self-score="${score}" title="${escapeHtml(rubricText(question, score))}">${String(score).replace(".", ",")} puntos</button>`).join("")}</div><p class="progress-note" data-rubric-note>Elegí el nivel que describe mejor tu respuesta.</p></article>`).join("");
  contentEl.innerHTML = `<section class="simulacro-page"><div class="simulacro-page__header"><p class="eyebrow">Autocorrección</p><h1>Compará cada respuesta con la clave</h1><p>Usá la rúbrica de 0, 1,25 y 2,5. El sitio suma tu valoración a los ${partOneResult.correct} puntos de la Parte I.</p></div><div class="case-question-list">${cards}</div><div class="verification-actions"><button class="button button--primary" type="button" data-finish-final>Calcular puntaje sobre 40</button><div data-self-error aria-live="polite"></div></div></section>`;
  contentEl.querySelectorAll("[data-self-score]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest("[data-self-question]");
      const n = Number(card.dataset.selfQuestion);
      const question = state.case.preguntas.find((item) => item.n === n);
      const score = Number(button.dataset.selfScore);
      state.selfScores.set(n, score);
      card.querySelectorAll("[data-self-score]").forEach((choice) => choice.classList.toggle("button--primary", choice === button));
      card.querySelector("[data-rubric-note]").textContent = rubricText(question, score);
    });
  });
  contentEl.querySelector("[data-finish-final]")?.addEventListener("click", () => {
    if (state.selfScores.size < 8) {
      contentEl.querySelector("[data-self-error]").innerHTML = `<p class="feedback feedback--error">Autocalificá las ${8 - state.selfScores.size} preguntas que faltan.</p>`;
      return;
    }
    renderFinalResult(partOneResult);
  });
}

function renderFinalResult(partOneResult) {
  const partTwo = [...state.selfScores.values()].reduce((sum, value) => sum + value, 0);
  const total = partOneResult.correct + partTwo;
  const moduleRows = Object.entries(partOneResult.perModule).map(([moduleId, result]) => `<li><strong>${moduleId.toUpperCase()}:</strong> ${result.correct}/${result.total} · <a href="modulo.html?m=${moduleId}">Repasar esto</a></li>`).join("");
  state.store.simulacros = [...(state.store.simulacros ?? []), {
    modo: "formato_final", fecha: new Date().toISOString(), total: 40,
    puntaje: total, parte1: partOneResult.correct, parte2: partTwo,
    porModulo: partOneResult.perModule, casoId: state.case.id,
  }];
  saveStore(state.store);
  contentEl.innerHTML = `<section class="simulacro-page"><div class="simulacro-result ${total >= 32 ? "simulacro-result--ok" : "simulacro-result--review"}"><p class="eyebrow">Resultado del formato completo</p><h1>${String(total).replace(".", ",")} / 40 puntos</h1><p><strong>Parte I:</strong> ${partOneResult.correct}/20. <strong>Parte II:</strong> ${String(partTwo).replace(".", ",")}/20.</p><h2>Desglose por tema</h2><ul>${moduleRows}</ul><div class="cluster"><a class="button button--primary" href="repaso.html">Repasar lo pendiente</a><button class="button button--quiet" type="button" data-back-modes>Elegir otro modo</button></div></div></section>`;
  attachBackHandler();
}

function attachTimerToggle() {
  contentEl.querySelector("[data-toggle-timer]")?.addEventListener("click", (event) => {
    state.timerHidden = !state.timerHidden;
    event.currentTarget.textContent = state.timerHidden ? "Mostrar" : "Ocultar";
    updateTimer();
  });
}

function startFinal() {
  state.mode = "final";
  state.answers = new Map();
  state.selfScores = new Map();
  state.case = shuffle(state.cases)[0];
  const selection = selectExamFormatItems(state.modules.filter((module) => module.id !== "m11"));
  state.items = selection.items;
  contentEl.innerHTML = renderFinalPartOne(selection.warnings);
  attachTimerToggle();
  startTimer();
  contentEl.querySelector("[data-submit-part-one]")?.addEventListener("click", () => {
    const unanswered = state.items.filter((item) => !contentEl.querySelector(`[data-final-question="${CSS.escape(item.id)}"] input:checked`));
    if (unanswered.length) {
      contentEl.querySelector("[data-part-one-error]").innerHTML = `<p class="feedback feedback--error">Respondé los ${unanswered.length} ítems que faltan.</p>`;
      return;
    }
    const result = gradePartOne();
    window.setTimeout(() => renderCase(result), 250);
  });
}

function startShort() {
  stopTimer();
  state.mode = "short";
  state.answers = new Map();
  state.items = chooseShortItems();
  contentEl.innerHTML = renderShortQuestions();
  attachShortHandlers();
}

function attachBackHandler() {
  contentEl.querySelector("[data-back-modes]")?.addEventListener("click", showModes);
}

function showModes() {
  stopTimer();
  state.mode = null;
  contentEl.innerHTML = renderIntro();
  contentEl.querySelector("[data-start-short]")?.addEventListener("click", startShort);
  contentEl.querySelector("[data-start-final]")?.addEventListener("click", startFinal);
}

async function fetchOptionalJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
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
  state.cases = approvedCases(await fetchOptionalJson("data/casos/practica.json"));
  showModes();
}

load().catch((error) => {
  contentEl.innerHTML = `<div class="empty-note">No se pudo cargar la prueba: ${escapeHtml(error.message)}</div>`;
});
