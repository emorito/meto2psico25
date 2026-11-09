import {
  COHERENCE_CHAIN,
  MODULE_STEPS,
  approvedItems,
  answerIsCorrect,
  createSession,
  escapeHtml,
  feedbackFor,
  inlineMarkdown,
  renderQuestion,
  stepFromQuery,
} from "./engine.js";
import { loadStore, saveStore } from "./store.js";
import { mountSamplingToolBlock } from "./muestreo/index.mjs";

const params = new URLSearchParams(window.location.search);
const moduleId = /^m\d{2}$/.test(params.get("m") ?? "") ? params.get("m") : "m05";
const requestedStep = stepFromQuery(params.get("step"));
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

function renderQuestionList(items, key, intro) {
  return `<div class="question-list"><p class="muted">${escapeHtml(intro)}</p>${items.map((item) => renderQuestion(item, { name: `${key}-${item.id}` })).join("")}</div>`;
}

function renderPractice() {
  const session = state.sessions.adaptativa ?? (state.sessions.adaptativa = createSession(state.items, { count: 12, mode: "adaptativa" }));
  return `<section class="module-step is-active">${renderStepHeader("Paso 6 · Práctica adaptativa", "Practicá con feedback inmediato", "Los ítems aprobados se intercalan y los errores quedan visibles para volver sobre ellos.")}${renderQuestionList(session.items, "adaptativa", "12 ítems del banco aprobado")}</section>`;
}

function renderVerification() {
  const session = state.sessions.verificacion ?? (state.sessions.verificacion = createSession(state.items, { mode: "verificacion" }));
  return `<section class="module-step is-active">${renderStepHeader("Paso 7 · Verificación de dominio", "Comprobá tu dominio", "El módulo se considera dominado con 80 % o más en esta verificación de 10 ítems.")}${renderQuestionList(session.items, "verificacion", "3 ítems de dificultad 1, 4 de dificultad 2 y 3 de dificultad 3")}</section>`;
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
  contentEl.querySelectorAll("[data-answer-button]").forEach((button) => {
    button.addEventListener("click", () => {
      const question = button.closest("[data-question-id]");
      const item = state.items.find((candidate) => candidate.id === question.dataset.questionId) ??
        state.sessions.adaptativa?.items.find((candidate) => candidate.id === question.dataset.questionId) ??
        state.sessions.verificacion?.items.find((candidate) => candidate.id === question.dataset.questionId);
      const selected = question.querySelector("input:checked");
      const feedback = question.querySelector(".question__feedback");
      if (!selected || !item) {
        feedback.innerHTML = `<p class="feedback feedback--error">Elegí una opción antes de responder.</p>`;
        return;
      }
      const correct = answerIsCorrect(item, selected.value);
      state.responses.set(`${state.activeStep}:${item.id}`, correct);
      feedback.innerHTML = `<div class="feedback ${correct ? "" : "feedback--error"}"><strong>${correct ? "Correcto" : "Revisá este punto"}</strong><p>${inlineMarkdown(feedbackFor(item, correct))}</p></div>`;
      button.disabled = true;
      question.querySelectorAll("input").forEach((input) => { input.disabled = true; });
      state.store.responses.push({ id: item.id, modulo: moduleId, correcto: correct, fecha: new Date().toISOString() });
      saveStore(state.store);
    });
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
