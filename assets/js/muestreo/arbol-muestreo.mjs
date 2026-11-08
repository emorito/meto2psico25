function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function treePayload(content) {
  return content?.arbol ?? content ?? {};
}

export function mountSamplingTree(container, { content, onOpenCalculator } = {}) {
  if (!container) throw new TypeError("Falta el contenedor del árbol de muestreo.");
  const tree = treePayload(content);
  const questions = tree.preguntas ?? {};
  const leaves = tree.hojas ?? {};
  const purposeOptions = tree.opciones_proposito ?? {};
  const history = [];
  let node = "cualitativo";

  function pathLabel() {
    return history.map((entry) => entry.label).join(" → ");
  }

  function leafMarkup(leafId) {
    const leaf = leaves[leafId] ?? {};
    const action = leaf.accion
      ? `<button type="button" class="sampling-tree__action" data-action="leaf-action">${escapeHtml(leaf.accion)}</button>`
      : "";
    return `
      <article class="sampling-tree__leaf" data-leaf="${escapeHtml(leafId)}">
        <p class="sampling-tree__eyebrow">Resultado</p>
        <h4>${escapeHtml(leaf.titulo)}</h4>
        <p>${inlineMarkdown(leaf.texto)}</p>
        ${leaf.fuente ? `<p class="sampling-tree__source">Fuente: ${inlineMarkdown(leaf.fuente)}</p>` : ""}
        ${action}
      </article>`;
  }

  function choicesMarkup() {
    if (node === "cualitativo") {
      return `<button type="button" data-answer="yes">Sí</button><button type="button" data-answer="no">No</button>`;
    }
    if (node === "marco") {
      return `<button type="button" data-answer="yes">Sí</button><button type="button" data-answer="no">No</button>`;
    }
    if (node === "aleatoria") {
      return `<button type="button" data-answer="yes">Sí</button><button type="button" data-answer="no">No</button>`;
    }
    return Object.entries(purposeOptions).map(([id, label]) =>
      `<button type="button" data-purpose="${escapeHtml(id)}">${escapeHtml(label)}</button>`
    ).join("");
  }

  function render() {
    const isLeaf = ["Q", "NP", "EST", "POT", "MOD"].includes(node);
    const question = questions[node] ?? "";
    container.innerHTML = `
      <section class="sampling-tree" aria-labelledby="sampling-tree-title">
        <div class="sampling-tree__head">
          <p class="sampling-tree__eyebrow">Herramienta de decisión</p>
          <h3 id="sampling-tree-title">Árbol de muestreo</h3>
          <p class="sampling-tree__path" aria-live="polite"><span>Camino:</span> ${escapeHtml(pathLabel() || "inicio")}</p>
        </div>
        ${isLeaf ? leafMarkup(node) : `
          <div class="sampling-tree__question" aria-live="polite">
            <p>${inlineMarkdown(question)}</p>
            <div class="sampling-tree__choices">${choicesMarkup()}</div>
          </div>`}
        ${history.length ? '<button type="button" class="sampling-tree__back" data-back>Volver</button>' : ""}
      </section>`;

    container.querySelectorAll("[data-answer]").forEach((button) => {
      button.addEventListener("click", () => {
        const answer = button.dataset.answer;
        history.push({ node, label: `${answer === "yes" ? "Sí" : "No"}` });
        if (node === "cualitativo") node = answer === "yes" ? "Q" : "marco";
        else if (node === "marco") node = answer === "yes" ? "aleatoria" : "NP";
        else if (node === "aleatoria") node = answer === "yes" ? "proposito" : "NP";
        render();
      });
    });
    container.querySelectorAll("[data-purpose]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.purpose;
        history.push({ node, label: button.textContent });
        node = id;
        render();
      });
    });
    container.querySelector("[data-back]")?.addEventListener("click", () => {
      const previous = history.pop();
      node = previous?.node ?? "cualitativo";
      render();
    });
    container.querySelector("[data-action='leaf-action']")?.addEventListener("click", () => {
      if (typeof onOpenCalculator === "function") onOpenCalculator(node);
    });
  }

  render();
  return {
    reset() {
      history.length = 0;
      node = "cualitativo";
      render();
    },
  };
}

export { inlineMarkdown };
