import { escapeHtml, MODULE_STEPS } from "./engine.js";
import { getReviewQueue, loadStore, saveStore } from "./store.js";

const contentEl = document.querySelector("#progress-content");
const themeSelect = document.querySelector("#theme-select");
const state = { store: loadStore(), modules: [] };

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  if (themeSelect) themeSelect.value = theme;
  state.store.theme = theme;
  saveStore(state.store);
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat("es-PY", { dateStyle: "medium" }).format(date);
}

function stepLabel(stepId) {
  return MODULE_STEPS.find((step) => step.id === stepId)?.label ?? "el módulo";
}

function moduleStatus(module, moduleState) {
  const domain = moduleState?.domain;
  if (domain?.dominated) {
    return {
      badge: "Módulo dominado",
      className: "badge--ok",
      detail: `Puntaje ${domain.score}% · ${formatDate(domain.fecha)}`,
      action: `<a class="button button--quiet" href="modulo.html?m=${encodeURIComponent(module.id)}&step=verificacion">Ver resultado</a>`,
    };
  }
  if (moduleState?.lastActivity?.stepId) {
    return {
      badge: "En progreso",
      className: "badge--accent",
      detail: `Quedaste en ${stepLabel(moduleState.lastActivity.stepId).toLowerCase()}${moduleState.lastActivity.updatedAt ? ` · ${formatDate(moduleState.lastActivity.updatedAt)}` : ""}`,
      action: `<a class="button button--primary" href="modulo.html?m=${encodeURIComponent(module.id)}&step=${encodeURIComponent(moduleState.lastActivity.stepId)}">Continuar</a>`,
    };
  }
  return {
    badge: "Todavía no empezado",
    className: "",
    detail: "Podés empezar por la ubicación del proyecto.",
    action: `<a class="button button--secondary" href="modulo.html?m=${encodeURIComponent(module.id)}">Empezar</a>`,
  };
}

function render() {
  const reviewCount = getReviewQueue(state.store).length;
  const dominated = state.modules.filter((module) => state.store.modules?.[module.id]?.domain?.dominated).length;
  const started = state.modules.filter((module) => state.store.modules?.[module.id]?.lastActivity).length;
  const latest = state.modules
    .map((module) => ({ module, activity: state.store.modules?.[module.id]?.lastActivity }))
    .filter(({ activity }) => activity?.updatedAt)
    .sort((a, b) => new Date(b.activity.updatedAt) - new Date(a.activity.updatedAt))[0];
  const continueLink = latest
    ? `modulo.html?m=${encodeURIComponent(latest.module.id)}&step=${encodeURIComponent(latest.activity.stepId)}`
    : "modulo.html?m=m01";
  const modules = state.modules.map((module) => {
    const status = moduleStatus(module, state.store.modules?.[module.id]);
    const domain = state.store.modules?.[module.id]?.domain;
    const review = domain?.subtemasRevisar?.length ? `<p class="progress-card__review"><strong>Para repasar:</strong> ${domain.subtemasRevisar.map((item) => escapeHtml(item)).join(", ")}</p>` : "";
    return `<article class="progress-card" data-progress-module="${escapeHtml(module.id)}"><div class="progress-card__top"><span class="badge">Módulo ${escapeHtml(module.number)}</span><span class="badge ${status.className}">${status.badge}</span></div><h2>${escapeHtml(module.title)}</h2><p class="muted">${escapeHtml(status.detail)}</p>${review}<div class="progress-card__action">${status.action}</div></article>`;
  }).join("");
  contentEl.innerHTML = `<section class="progress-page"><div class="progress-page__header"><p class="eyebrow">Mi progreso</p><h1>Sabé qué hiciste y qué sigue</h1><p>Este resumen se guarda en este dispositivo. No necesitás crear una cuenta.</p></div><div class="progress-summary"><article class="card"><span class="card__meta">Módulos dominados</span><strong>${dominated} de ${state.modules.length}</strong></article><article class="card"><span class="card__meta">Módulos empezados</span><strong>${started} de ${state.modules.length}</strong></article><article class="card"><span class="card__meta">Para repasar hoy</span><strong>${reviewCount}</strong></article></div><section class="progress-next card card--accent"><div><p class="eyebrow">Siguiente paso</p><h2>Seguí desde donde quedaste</h2><p class="muted">${latest ? `Módulo ${escapeHtml(latest.module.number)} · ${escapeHtml(stepLabel(latest.activity.stepId).toLowerCase())}` : "Todavía no registramos una actividad."}</p></div><div class="cluster"><a class="button button--primary" href="${continueLink}">Continuar</a>${reviewCount ? `<a class="button button--secondary" id="progress-review-link" href="repaso.html">Repasar ${reviewCount} ítems</a>` : ""}</div></section><section aria-labelledby="progress-modules-heading"><div class="progress-section-heading"><div><p class="eyebrow">Tus módulos</p><h2 id="progress-modules-heading">Un paso a la vez</h2></div><a class="button button--quiet" href="index.html">Volver al inicio</a></div><div class="progress-grid">${modules}</div></section><p class="progress-note">Si cambiás de navegador o dispositivo, este avance no se traslada automáticamente. Podés volver a este equipo para continuar.</p></section>`;
}

async function load() {
  setTheme(state.store.theme ?? "auto");
  themeSelect?.addEventListener("change", () => setTheme(themeSelect.value));
  const response = await fetch("data/modulos.json");
  state.modules = await response.json();
  render();
}

load().catch((error) => {
  contentEl.innerHTML = `<div class="empty-note">No se pudo cargar tu progreso: ${escapeHtml(error.message)}</div>`;
});
