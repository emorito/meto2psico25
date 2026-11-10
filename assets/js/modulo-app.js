import {
  COHERENCE_CHAIN,
  MODULE_STEPS,
  approvedItems,
  answerIsCorrect,
  advanceAdaptiveSession,
  createSession,
  escapeHtml,
  feedbackFor,
  inlineMarkdown,
  renderQuestion,
  scoreVerification,
  stepFromQuery,
} from "./engine.js";
import { loadStore, reviewPlan, saveStore, updateModule } from "./store.js";
import { mountSamplingToolBlock } from "./muestreo/index.mjs";

const params = new URLSearchParams(window.location.search);
const moduleId = /^m\d{2}$/.test(params.get("m") ?? "") ? params.get("m") : "m05";
const requestedStepId = params.get("step");
const requestedStep = requestedStepId ? stepFromQuery(requestedStepId) : null;
const state = {
  module: null,
  content: null,
  items: [],
  cards: [],
  activeStep: requestedStep,
  store: loadStore(),
  responses: new Map(),
  sessions: {},
};

const headerEl = document.querySelector("#module-header");
const navEl = document.querySelector("#module-nav");
const contentEl = document.querySelector("#module-step-content");
const statusEl = document.querySelector("#module-status");
const themeSelect = document.querySelector("#theme-select");

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  if (themeSelect) themeSelect.value = theme;
  state.store.theme = theme;
  saveStore(state.store);
}

function initializeTheme() {
  const theme = state.store.theme ?? "auto";
  setTheme(theme);
  themeSelect?.addEventListener("change", () => setTheme(themeSelect.value));
}

function moduleActiveChainId(id) {
  return {
    m01: "problema", m02: "problema", m03: "problema", m04: "problema",
    m05: "objetivos", m06: "variables", m07: "diseno", m08: "muestra",
    m09: "instrumentos", m10: "analisis", m11: "analisis",
  }[id] ?? "problema";
}

function renderHeader() {
  const module = state.module;
  headerEl.innerHTML = `
    <header class="module-v3__header">
      <div class="container">
        <div class="module-v3__meta">
          <span class="badge badge--accent">Módulo ${escapeHtml(module.number)}</span>
          <span class="badge">${escapeHtml(module.clase_2026 ?? "")}</span>
          <span class="badge badge--ok">Ciclo completo</span>
        </div>
        <h1>${inlineMarkdown(module.title)}</h1>
        <p class="module-v3__purpose">${inlineMarkdown(module.proposito ?? "")}</p>
      </div>
    </header>`;
}

function renderNav() {
  navEl.innerHTML = `<div class="container module-nav__inner">${MODULE_STEPS.map((step, index) => `
    <button type="button" data-step-index="${index}" aria-current="${index === state.activeStep ? "step" : "false"}">${index + 1}. ${escapeHtml(step.label)}</button>`).join("")}</div>`;
  navEl.querySelectorAll("[data-step-index]").forEach((button) => {
    button.addEventListener("click", () => showStep(Number(button.dataset.stepIndex)));
  });
}

function renderCoherenceChain() {
  const active = state.module.eslabon_cadena || moduleActiveChainId(moduleId);
  return `<div class="coherence-scroll" tabindex="0" aria-label="Cadena de coherencia; desplazate horizontalmente para ver los nueve eslabones"><ol class="coherence">${COHERENCE_CHAIN.map((link, index) => `
    <li class="coherence__item ${link.id === active ? "is-active" : ""}">
      <span class="coherence__circle">${index + 1}</span><span>${escapeHtml(link.label)}</span>
    </li>`).join("")}</ol></div>`;
}

function renderStepHeader(eyebrow, title, description) {
  return `<div class="module-step__header"><p class="eyebrow">${escapeHtml(eyebrow)}</p><h2>${escapeHtml(title)}</h2><p>${inlineMarkdown(description)}</p></div>`;
}

function renderUbicacion() {
  const outcomes = (state.module.resultados ?? []).map((result) => `<li>${inlineMarkdown(result)}</li>`).join("");
  const questions = (state.module.preguntas_orientadoras ?? []).map((question) => `<li>${inlineMarkdown(question)}</li>`).join("");
  return `<section class="module-step is-active">${renderStepHeader("Paso 1 · Ubicación", "Dónde estás en el proyecto", "La cadena ordena el proyecto sin convertirlo en una secuencia rígida.")}
    <div class="card stack"><div>${renderCoherenceChain()}</div><div><h3>Resultados de aprendizaje</h3><ul>${outcomes || "<li>Los resultados se cargarán con el contenido validado del módulo.</li>"}</ul></div>${questions ? `<div><h3>Preguntas orientadoras</h3><ul>${questions}</ul></div>` : ""}</div>
  </section>`;
}

function renderResources() {
  const resources = state.content.recursos ?? {};
  const groups = [
    ["Lecturas", resources.readings ?? []],
    ["Videos", resources.videos ?? []],
    ["Cuadernos", resources.notebooks ?? []],
  ];
  return groups.filter(([, list]) => list.length).map(([label, list]) => `<div><h3>${label}</h3><ul class="resource-list">${list.map((resource) => {
    const url = resource.url ?? (resource.videoId ? `https://www.youtube.com/watch?v=${resource.videoId}` : "#");
    return `<li><a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(resource.title ?? "Recurso")}${resource.description ? `<small>${escapeHtml(resource.description)}</small>` : ""}</a></li>`;
  }).join("")}</ul></div>`).join("");
}

function renderTable(block) {
  return `<div class="capsule__table"><table><thead><tr>${(block.headers ?? []).map((header) => `<th>${inlineMarkdown(header)}</th>`).join("")}</tr></thead><tbody>${(block.rows ?? []).map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function renderCapsuleBlock(block, index) {
  if (block.type === "herramienta") {
    return `<article class="capsule__block" data-tool-block="${escapeHtml(block.id)}"><p class="eyebrow">Herramienta</p><h3>${escapeHtml(block.title ?? block.id)}</h3><div class="tool-slot" id="tool-slot-${escapeHtml(block.id)}"></div></article>`;
  }
  if (block.type === "table") return `<article class="capsule__block"><h3>${inlineMarkdown(block.title ?? `Tabla ${index + 1}`)}</h3>${renderTable(block)}</article>`;
  if (block.type === "cards") return `<article class="capsule__block"><h3>${inlineMarkdown(block.title ?? `Conceptos ${index + 1}`)}</h3><div class="capsule__cards">${(block.items ?? []).map((item) => `<div class="capsule__card"><p class="card__meta">${inlineMarkdown(item.badge ?? "Concepto")}</p><h4>${inlineMarkdown(item.title ?? "")}</h4><p>${inlineMarkdown(item.text ?? "")}</p></div>`).join("")}</div></article>`;
  if (block.type === "checklist") return `<article class="capsule__block"><h3>${inlineMarkdown(block.title ?? "Lista de cotejo")}</h3><ul>${(block.items ?? []).map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul></article>`;
  return `<article class="capsule__block card--accent"><h3>${inlineMarkdown(block.title ?? "Idea clave")}</h3><p>${inlineMarkdown(block.text ?? "")}</p></article>`;
}

function renderStudy() {
  const blocks = state.content.capsula?.blocks ?? [];
  return `<section class="module-step is-active">${renderStepHeader("Paso 3 · Estudio", "Lectura, cápsula y herramientas", "Estudiá la síntesis y usá las herramientas cuando el diseño de tu estudio lo requiera.")}
    <div class="module-layout"><div class="capsule">${renderResources()}${blocks.map(renderCapsuleBlock).join("")}</div><aside class="module-sidebar card"><h3>Antes de seguir</h3><p class="muted">Intentá explicar el concepto con tus palabras y anotá qué supuesto todavía necesitás revisar.</p></aside></div>
  </section>`;
}

function renderConcepts() {
  return `<section class="module-step is-active">${renderStepHeader("Paso 4 · Conceptos clave", "Recuperación activa", "Mostrá la respuesta después de intentar definir cada concepto.")}
    <div class="capsule__cards">${state.cards.map((card) => `<details class="capsule__card"><summary>${inlineMarkdown(card.frente ?? card.front ?? "Concepto")}</summary><p>${inlineMarkdown(card.dorso ?? card.back ?? "")}</p><p class="card__meta">${escapeHtml(card.tag ?? "")}</p></details>`).join("")}</div>
  </section>`;
}

function renderCases() {
  const cases = state.content.casos?.miniCases ?? [];
  const simulation = state.content.casos?.simulation;
  const caseMarkup = cases.map((item) => `<details class="case"><summary>${escapeHtml(item.title)}</summary><div class="case__body"><p class="card__meta">${escapeHtml(item.context ?? "")}</p><p>${inlineMarkdown(item.scenario)}</p><h4>Pregunta</h4><p>${inlineMarkdown(item.question)}</p><details><summary>Pista y análisis</summary>${(item.hints ?? []).map((hint) => `<p>${inlineMarkdown(hint)}</p>`).join("")}<p>${inlineMarkdown(item.analysis ?? "")}</p></details></div></details>`).join("");
  const simulationMarkup = simulation ? `<details class="case"><summary>${escapeHtml(simulation.title ?? "Simulación")}</summary><div class="case__body"><p>${inlineMarkdown(simulation.context ?? "")}</p>${(simulation.steps ?? []).map((step) => `<details><summary>${escapeHtml(step.title ?? `Paso ${step.stepNumber}`)}</summary><p>${inlineMarkdown(step.prompt ?? "")}</p><ul>${(step.options ?? []).map((option) => `<li>${inlineMarkdown(option.text ?? option)}</li>`).join("")}</ul></details>`).join("")}</div></details>` : "";
  return caseMarkup + simulationMarkup;
}

function renderGallery() {
  const gallery = state.content.galeria_pseudocalculos ?? [];
  if (!gallery.length) return "";
  return `<div class="gallery-list"><h3>Galería de pseudocálculos</h3>${gallery.map((item) => `<article class="gallery-card"><h4>${escapeHtml(item.titulo ?? item.id)}</h4><details><summary>Lo que se escribió</summary><p>${inlineMarkdown(item.lo_que_se_escribio)}</p></details><details><summary>Diagnóstico</summary><p>${inlineMarkdown(item.diagnostico)}</p></details><details><summary>Corrección</summary><p>${inlineMarkdown(item.correccion)}</p></details></article>`).join("")}</div>`;
}

function renderGuided() {
  return `<section class="module-step is-active">${renderStepHeader("Paso 5 · Práctica guiada", "Del caso a la decisión", "Primero observá el razonamiento, después compará tu diagnóstico con el análisis docente.")}
    <div class="case-list">${renderCases()}</div>${renderGallery()}</section>`;
}

function renderQuestionList(items, key, intro, { withConfidence = false } = {}) {
  return `<div class="question-list"><p class="muted">${escapeHtml(intro)}</p>${items.map((item) => renderQuestion(item, { name: `${key}-${item.id}`, withConfidence })).join("")}</div>`;
}

function formatDomainDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("es-PY", { dateStyle: "medium" }).format(date);
}

function renderDomainResult(domain) {
  if (!domain) return "";
  const review = domain.subtemasRevisar?.length
    ? `<p><strong>Subtemas para repasar:</strong> ${domain.subtemasRevisar.map((item) => escapeHtml(item)).join(", ")}</p>`
    : "";
  const title = domain.dominated ? "Módulo dominado" : "Todavía no alcanza el dominio";
  const detail = domain.dominated
    ? "Superaste el umbral del 80 %."
    : "Hacé una nueva práctica y volvé a intentar la verificación.";
  return `<div class="domain-result ${domain.dominated ? "domain-result--ok" : "domain-result--review"}" aria-live="polite"><strong>${title}</strong><p>${escapeHtml(detail)} Puntaje: <strong>${escapeHtml(domain.score)} %</strong> (${escapeHtml(domain.correct)}/${escapeHtml(domain.total)}).${domain.fecha ? ` Fecha: ${escapeHtml(formatDomainDate(domain.fecha))}.` : ""}</p>${review}</div>`;
}

function renderPractice() {
  const session = state.sessions.adaptativa ?? (state.sessions.adaptativa = createSession(state.items, { count: 12, mode: "adaptativa" }));
  const current = session.currentItem ? [session.currentItem] : [];
  const progress = session.primaryServed >= session.targetCount && session.currentItem
    ? `Repaso de errores: quedan ${session.errorQueue.length + 1} · dificultad objetivo ${session.currentDifficulty}.`
    : session.primaryServed >= session.targetCount
      ? `Sesión completa: ${session.answers.length} respuestas, con errores reaparecidos al final.`
    : `Ítem ${session.primaryServed + 1} de ${session.targetCount} · dificultad objetivo ${session.currentDifficulty}.`;
  return `<section class="module-step is-active">${renderStepHeader("Paso 6 · Práctica adaptativa", "Practicá con feedback inmediato", "La dificultad sube después de dos aciertos seguidos, baja después de un error y los errores reaparecen al final de la sesión.")}${renderQuestionList(current, "adaptativa", progress, { withConfidence: true })}</section>`;
}

function renderVerification() {
  const session = state.sessions.verificacion ?? (state.sessions.verificacion = createSession(state.items, { mode: "verificacion" }));
  const previous = state.store.modules?.[moduleId]?.domain;
  return `<section class="module-step is-active">${renderStepHeader("Paso 7 · Verificación de dominio", "Comprobá tu dominio", "El módulo se considera dominado con 80 % o más en esta verificación de 10 ítems.")}${previous ? renderDomainResult(previous) : ""}${renderQuestionList(session.items, "verificacion", "3 ítems de dificultad 1, 4 de dificultad 2 y 3 de dificultad 3", { withConfidence: true })}<div class="verification-actions"><button class="button button--primary" type="button" data-verification-submit>Calificar verificación</button><div data-verification-result aria-live="polite"></div></div></section>`;
}

function renderDiagnosis() {
  const items = approvedItems(state.items).filter((item) => Number(item.dificultad) <= 2).slice(0, 3);
  return `<section class="module-step is-active">${renderStepHeader("Paso 2 · Diagnóstico", "Activá lo que ya sabés", "No tiene nota. Usá los errores para decidir a qué prestar atención durante el estudio.")}${renderQuestionList(items, "diagnostico", "Tres preguntas iniciales, sin puntaje")}</section>`;
}

function renderAudit() {
  const checks = state.content.autoauditoria ?? state.module.autoauditoria ?? [];
  if (!checks.length) return `<section class="module-step is-active">${renderStepHeader("Paso 8 · Autoauditoría", "Aplicalo a tu proyecto", "Esta versión del módulo todavía no trae una lista de cotejo específica.")}<div class="empty-note">La autoauditoría queda reservada para contenido validado por la cátedra.</div></section>`;
  return `<section class="module-step is-active">${renderStepHeader("Paso 8 · Autoauditoría", "Aplicalo a tu proyecto", "Marcá cada criterio cuando puedas responderlo con evidencia de tu propio proyecto.")}<ul class="audit-list">${checks.map((check, index) => `<li><label><input type="checkbox" data-audit-index="${index}" ${state.store.autoauditorias?.[moduleId]?.[index] ? "checked" : ""}><span>${inlineMarkdown(check)}</span></label></li>`).join("")}</ul></section>`;
}

function renderClosing() {
  const current = state.store.puntosTurbios?.find((item) => item.moduleId === moduleId)?.text ?? "";
  return `<section class="module-step is-active">${renderStepHeader("Paso 9 · Cierre", "El punto más turbio", "Escribí una línea sobre lo que quedó menos claro. Guardalo para orientar tu próximo repaso.")}<form class="closing-form"><label for="muddy-point">¿Qué te falta distinguir?</label><textarea id="muddy-point" name="muddy-point">${escapeHtml(current)}</textarea><button class="button button--primary" type="submit">Guardar cierre</button><p class="step-status" id="closing-status" aria-live="polite"></p></form></section>`;
}

function renderCurrentStep() {
  const renderers = [renderUbicacion, renderDiagnosis, renderStudy, renderConcepts, renderGuided, renderPractice, renderVerification, renderAudit, renderClosing];
  contentEl.innerHTML = renderers[state.activeStep]();
  if (state.activeStep === 2) mountTools();
  attachQuestionHandlers();
  attachVerificationHandler();
  attachAuditHandlers();
  attachClosingHandler();
  renderNav();
  contentEl.querySelector(".module-step")?.scrollIntoView({ block: "start" });
}

function mountTools() {
  const blocks = state.content.capsula?.blocks ?? [];
  blocks.filter((block) => block.type === "herramienta").forEach((block) => {
    const slot = document.querySelector(`#tool-slot-${CSS.escape(block.id)}`);
    if (!slot) return;
    mountSamplingToolBlock(slot, block, {
      content: state.content,
      onOpenCalculator: () => document.querySelector("[data-tool-block='calculadora-honesta']")?.scrollIntoView({ behavior: "smooth" }),
    });
  });
}

function attachQuestionHandlers() {
  contentEl.querySelectorAll("[data-question-id]").forEach((question) => {
    question.querySelectorAll("[data-confidence]").forEach((confidenceButton) => {
      confidenceButton.addEventListener("click", () => {
        question.dataset.confidence = confidenceButton.dataset.confidence;
        question.querySelectorAll("[data-confidence]").forEach((button) => {
          const selected = button === confidenceButton;
          button.classList.toggle("is-selected", selected);
          button.setAttribute("aria-pressed", String(selected));
        });
      });
    });
  });
  contentEl.querySelectorAll("[data-answer-button]").forEach((button) => {
    button.addEventListener("click", () => {
      const question = button.closest("[data-question-id]");
      const item = state.activeStep === 5
        ? state.sessions.adaptativa?.currentItem
        : state.items.find((candidate) => candidate.id === question.dataset.questionId) ??
          state.sessions.verificacion?.items.find((candidate) => candidate.id === question.dataset.questionId);
      const selected = question.querySelector("input:checked");
      const seguridad = question.dataset.confidence;
      const feedback = question.querySelector(".question__feedback");
      if (!selected || !item) {
        feedback.innerHTML = `<p class="feedback feedback--error">Elegí una opción antes de responder.</p>`;
        return;
      }
      if (question.querySelector("[data-confidence]") && !seguridad) {
        feedback.innerHTML = `<p class="feedback feedback--error">Declará tu seguridad antes de responder: seguro, dudoso o adiviné.</p>`;
        return;
      }
      const correct = answerIsCorrect(item, selected.value);
      state.responses.set(`${state.activeStep}:${item.id}`, correct);
      const session = state.activeStep === 5
        ? state.sessions.adaptativa
        : state.activeStep === 6
          ? state.sessions.verificacion
          : null;
      if (session) {
        if (state.activeStep === 5) {
          advanceAdaptiveSession(session, item, correct, seguridad);
        } else {
          session.answers = [...session.answers.filter((answer) => answer.id !== item.id), { id: item.id, correcto: correct, seguridad }];
        }
      }
      feedback.innerHTML = `<div class="feedback ${correct ? "" : "feedback--error"}"><strong>${correct ? "Correcto" : "Revisá este punto"}</strong><p>${inlineMarkdown(feedbackFor(item, correct))}</p></div>`;
      button.disabled = true;
      question.querySelectorAll("input").forEach((input) => { input.disabled = true; });
      question.querySelectorAll("[data-confidence]").forEach((confidenceButton) => { confidenceButton.disabled = true; });
      const previous = [...state.store.responses].reverse().find((response) => (response.modulo ?? response.moduleId) === moduleId && response.id === item.id);
      const fecha = new Date().toISOString();
      state.store.responses.push({
        id: item.id,
        modulo: moduleId,
        correcto: correct,
        seguridad: seguridad ?? null,
        revisar: state.activeStep === 5 || state.activeStep === 6 || !correct,
        fecha,
        ...reviewPlan({ correcto: correct, seguridad, caja: previous?.caja ?? 0, now: fecha }),
      });
      const nextActivity = state.activeStep === 5 ? state.sessions.adaptativa.currentItem : item;
      state.store = updateModule(state.store, moduleId, {
        currentStep: state.activeStep + 1,
        lastActivity: {
          kind: state.activeStep === 5 ? "practice" : state.activeStep === 6 ? "verification" : "diagnostic",
          stepId: MODULE_STEPS[state.activeStep].id,
          questionId: nextActivity?.id ?? item.id,
          updatedAt: fecha,
        },
      });
      if (state.activeStep === 5) {
        const next = state.sessions.adaptativa.currentItem;
        feedback.insertAdjacentHTML("beforeend", next
          ? `<p><button class="button button--secondary" type="button" data-adaptive-next>Continuar con el siguiente ítem</button></p>`
          : `<p><strong>Práctica completa.</strong> Los errores de esta sesión ya reaparecieron para que los revises.</p>`);
        feedback.querySelector("[data-adaptive-next]")?.addEventListener("click", () => renderCurrentStep());
      }
      saveStore(state.store);
    });
  });
}

function attachVerificationHandler() {
  const button = contentEl.querySelector("[data-verification-submit]");
  if (!button) return;
  button.addEventListener("click", () => {
    const session = state.sessions.verificacion;
    const result = scoreVerification(session.items, session.answers);
    const resultEl = contentEl.querySelector("[data-verification-result]");
    if (result.answered < result.total) {
      resultEl.innerHTML = `<p class="feedback feedback--error">Respondé los ${escapeHtml(result.total - result.answered)} ítems que faltan antes de calificar.</p>`;
      return;
    }
    const domain = { ...result, fecha: new Date().toISOString() };
    state.store = updateModule(state.store, moduleId, {
      completed: domain.dominated,
      domain,
      lastScore: domain.score,
    });
    saveStore(state.store);
    resultEl.innerHTML = renderDomainResult(domain);
    button.disabled = true;
  });
}

function attachAuditHandlers() {
  contentEl.querySelectorAll("[data-audit-index]").forEach((input) => {
    input.addEventListener("change", () => {
      state.store.autoauditorias ??= {};
      state.store.autoauditorias[moduleId] ??= {};
      state.store.autoauditorias[moduleId][input.dataset.auditIndex] = input.checked;
      saveStore(state.store);
    });
  });
}

function attachClosingHandler() {
  contentEl.querySelector(".closing-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = contentEl.querySelector("#muddy-point").value.trim();
    state.store.puntosTurbios = (state.store.puntosTurbios ?? []).filter((item) => item.moduleId !== moduleId);
    state.store.puntosTurbios.push({ moduleId, text, fecha: new Date().toISOString() });
    saveStore(state.store);
    contentEl.querySelector("#closing-status").textContent = "Cierre guardado en este dispositivo.";
  });
}

function showStep(index) {
  state.activeStep = Math.max(0, Math.min(MODULE_STEPS.length - 1, index));
  const url = new URL(window.location.href);
  url.searchParams.set("step", MODULE_STEPS[state.activeStep].id);
  window.history.replaceState({}, "", url);
  state.store = updateModule(state.store, moduleId, {
    currentStep: state.activeStep + 1,
    lastActivity: {
      kind: "module",
      stepId: MODULE_STEPS[state.activeStep].id,
      updatedAt: new Date().toISOString(),
    },
  });
  saveStore(state.store);
  renderCurrentStep();
}

async function load() {
  try {
    const [modulesResponse, bankResponse, contentResponse, cardsResponse] = await Promise.all([
      fetch("data/modulos.json"),
      fetch(`data/banco/${moduleId}.json`),
      fetch(`data/contenido/${moduleId}.json`),
      fetch("data/banco/flipcards.json"),
    ]);
    const modules = await modulesResponse.json();
    const bank = await bankResponse.json();
    state.module = modules.find((module) => module.id === moduleId);
    state.items = bank.items ?? [];
    state.content = await contentResponse.json();
    const cards = await cardsResponse.json();
    state.cards = cards.filter((card) => card.modulo_id === moduleId);
    if (!state.module) throw new Error(`No existe el módulo ${moduleId}.`);
    if (requestedStep === null) {
      const savedActivity = state.store.modules?.[moduleId]?.lastActivity;
      const savedStep = savedActivity?.stepId ?? MODULE_STEPS[(state.store.modules?.[moduleId]?.currentStep ?? 1) - 1]?.id;
      state.activeStep = stepFromQuery(savedStep);
    }
    initializeTheme();
    renderHeader();
    statusEl.textContent = `${approvedItems(state.items).length} ítems aprobados disponibles.`;
    renderCurrentStep();
  } catch (error) {
    statusEl.textContent = "No se pudo cargar el módulo.";
    contentEl.innerHTML = `<div class="empty-note">${escapeHtml(error.message)}</div>`;
  }
}

load();
