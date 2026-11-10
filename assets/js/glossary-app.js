import { escapeHtml } from "./engine.js";
import { loadStore, saveStore } from "./store.js";

const contentEl = document.querySelector("#glossary-content");
const themeSelect = document.querySelector("#theme-select");
const state = { store: loadStore(), cards: [], query: "", module: "todos" };

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  if (themeSelect) themeSelect.value = theme;
  state.store.theme = theme;
  saveStore(state.store);
}

function filteredCards() {
  const query = state.query.trim().toLocaleLowerCase("es");
  return state.cards.filter((card) => {
    if (state.module !== "todos" && card.modulo_id !== state.module) return false;
    if (!query) return true;
    return [card.frente, card.dorso, card.tag].join(" ").toLocaleLowerCase("es").includes(query);
  });
}

function renderCards() {
  const cards = filteredCards();
  const results = cards.map((card) => `<article class="glossary-card"><p class="card__meta">${escapeHtml(card.tag ?? "Concepto")} · Módulo ${escapeHtml(String(card.modulo_id ?? "").replace("m", ""))}</p><h2>${escapeHtml(card.frente ?? "Concepto")}</h2><details><summary>Ver explicación</summary><p>${escapeHtml(card.dorso ?? "")}</p></details><a class="glossary-card__link" href="modulo.html?m=${encodeURIComponent(card.modulo_id)}&step=conceptos">Repasarlo en el módulo</a></article>`).join("");
  const resultsEl = contentEl.querySelector("[data-glossary-results]");
  const countEl = contentEl.querySelector("[data-glossary-count]");
  if (countEl) countEl.textContent = `${cards.length} concepto${cards.length === 1 ? "" : "s"}`;
  if (resultsEl) resultsEl.innerHTML = results || `<div class="empty-note">No encontramos conceptos con esa búsqueda.</div>`;
}

function render() {
  const moduleIds = [...new Set(state.cards.map((card) => card.modulo_id))].sort();
  contentEl.innerHTML = `<section class="glossary-page"><div class="glossary-page__header"><p class="eyebrow">Glosario</p><h1>Buscá un concepto cuando lo necesites</h1><p>Encontrá explicaciones breves tomadas de las tarjetas de estudio del curso. Si querés practicar, abrí el concepto en su módulo.</p></div><div class="glossary-controls"><label for="glossary-search">Buscar por palabra</label><input id="glossary-search" type="search" placeholder="Ej.: constructo, muestra, hipótesis"><label for="glossary-module">Módulo</label><select id="glossary-module"><option value="todos">Todos los módulos</option>${moduleIds.map((id) => `<option value="${escapeHtml(id)}">Módulo ${escapeHtml(id.replace("m", ""))}</option>`).join("")}</select></div><p class="glossary-count" data-glossary-count></p><div class="glossary-grid" data-glossary-results></div></section>`;
  const search = contentEl.querySelector("#glossary-search");
  const module = contentEl.querySelector("#glossary-module");
  search.addEventListener("input", () => { state.query = search.value; renderCards(); });
  module.addEventListener("change", () => { state.module = module.value; renderCards(); });
  renderCards();
}

async function load() {
  setTheme(state.store.theme ?? "auto");
  themeSelect?.addEventListener("change", () => setTheme(themeSelect.value));
  const response = await fetch("data/banco/flipcards.json");
  state.cards = await response.json();
  render();
}

load().catch((error) => {
  contentEl.innerHTML = `<div class="empty-note">No se pudo cargar el glosario: ${escapeHtml(error.message)}</div>`;
});
