import {
  calculateEstimation,
  calculatePower,
  calculateHonestSample,
} from "./calculos.mjs";
import { inlineMarkdown } from "./arbol-muestreo.mjs";

function calculatorPayload(content) {
  return content?.calculadora ?? content ?? {};
}

function field(label, name, type = "number", attributes = "") {
  return `<label class="honest-calculator__field">${label}<input name="${name}" type="${type}" ${attributes}></label>`;
}

export function mountHonestCalculator(container, { content, initialMode } = {}) {
  if (!container) throw new TypeError("Falta el contenedor de la calculadora honesta.");
  const texts = calculatorPayload(content);
  let sampling = "";
  let purpose = "";
  let mode = initialMode === "potencia" ? "potencia" : "estimacion";

  function render() {
    const qualitative = sampling === "cualitativo";
    const nonProbabilistic = sampling === "no_probabilistico";
    const noDesign = !sampling || !purpose;
    const estimationDisabled = nonProbabilistic || qualitative || purpose === "contrastar" || purpose === "modelar";
    const powerDisabled = qualitative || purpose === "estimar" || purpose === "modelar";
    const showFields = !noDesign && !qualitative && !(purpose === "modelar");
    const modeValue = mode === "potencia" && !powerDisabled ? "potencia" : "estimacion";
    mode = modeValue;

    container.innerHTML = `
      <section class="honest-calculator" aria-labelledby="honest-calculator-title">
        <p class="honest-calculator__eyebrow">Herramienta de cálculo</p>
        <h3 id="honest-calculator-title">Calculadora honesta</h3>
        <p>${inlineMarkdown(texts.aviso_inicial ?? "")}</p>
        <form class="honest-calculator__form">
          <label class="honest-calculator__field">Tipo de muestreo
            <select name="sampling">
              <option value="">Elegí una opción</option>
              <option value="probabilistico" ${sampling === "probabilistico" ? "selected" : ""}>Probabilístico</option>
              <option value="no_probabilistico" ${sampling === "no_probabilistico" ? "selected" : ""}>No probabilístico</option>
              <option value="cualitativo" ${sampling === "cualitativo" ? "selected" : ""}>Cualitativo</option>
            </select>
          </label>
          <label class="honest-calculator__field">Propósito
            <select name="purpose">
              <option value="">Elegí una opción</option>
              <option value="estimar" ${purpose === "estimar" ? "selected" : ""}>Estimar un valor</option>
              <option value="contrastar" ${purpose === "contrastar" ? "selected" : ""}>Contrastar una hipótesis</option>
              <option value="modelar" ${purpose === "modelar" ? "selected" : ""}>Ajustar un modelo</option>
              <option value="comprender" ${purpose === "comprender" ? "selected" : ""}>Comprender experiencias</option>
            </select>
          </label>
          ${!noDesign && !qualitative && purpose !== "modelar" ? `
            <fieldset class="honest-calculator__modes">
              <legend>Modo</legend>
              <label><input type="radio" name="mode" value="estimacion" ${modeValue === "estimacion" ? "checked" : ""} ${estimationDisabled ? "disabled" : ""}> Estimación</label>
              <label><input type="radio" name="mode" value="potencia" ${modeValue === "potencia" ? "checked" : ""} ${powerDisabled ? "disabled" : ""}> Potencia</label>
            </fieldset>` : ""}
          ${showFields && modeValue === "estimacion" && !estimationDisabled ? estimationFields() : ""}
          ${showFields && modeValue === "potencia" && !powerDisabled ? powerFields() : ""}
          ${qualitative ? `<aside class="honest-calculator__notice">${inlineMarkdown(texts.bloqueo_cualitativo ?? "")}${guideMarkup()}</aside>` : ""}
          ${nonProbabilistic && modeValue === "estimacion" ? `<aside class="honest-calculator__notice">${inlineMarkdown(texts.bloqueo_no_probabilistico ?? "")} <button type="button" data-gallery>Ver la galería de pseudocálculos</button></aside>` : ""}
          ${purpose === "modelar" ? `<aside class="honest-calculator__notice">${inlineMarkdown("No hay una fórmula única para este propósito; justificá el tamaño con la literatura del modelo.")}</aside>` : ""}
          <div class="honest-calculator__result" aria-live="polite"></div>
        </form>
      </section>`;

    const form = container.querySelector("form");
    form.querySelector('[name="sampling"]').addEventListener("change", (event) => {
      sampling = event.target.value;
      if (sampling === "cualitativo") purpose = "comprender";
      render();
    });
    form.querySelector('[name="purpose"]').addEventListener("change", (event) => {
      purpose = event.target.value;
      render();
    });
    form.querySelectorAll('[name="mode"]').forEach((input) => input.addEventListener("change", (event) => {
      mode = event.target.value;
      render();
    }));
    form.querySelector("[data-gallery]")?.addEventListener("click", () => {
      container.dispatchEvent(new CustomEvent("open-pseudocalculos", { bubbles: true }));
    });
    form.querySelector("[data-calculate]")?.addEventListener("click", (event) => {
      event.preventDefault();
      showResult(form, form.querySelector(".honest-calculator__result"));
    });
  }

  function estimationFields() {
    return `<fieldset class="honest-calculator__fields"><legend>Datos para estimar</legend>
      <label>Tipo de parámetro<select name="estimateKind"><option value="proportion">Proporción</option><option value="mean">Media</option></select></label>
      ${field("p", "p", "number", 'min="0" max="1" step="0.01" value="0.5"')}
      ${field("σ", "sigma", "number", 'min="0" step="0.01"')}
      ${field("Margen de error", "marginOfError", "number", 'min="0" step="0.001" value="0.05" required')}
      ${field("Nivel de confianza", "confidence", "number", 'min="0" max="1" step="0.01" value="0.95" required')}
      ${field("N (opcional)", "population", "number", 'min="1" step="1"')}
      ${field("Efecto de diseño", "designEffect", "number", 'min="0.01" step="0.01" value="1" required')}
      ${field("Tasa de respuesta", "responseRate", "number", 'min="0.01" max="1" step="0.01" value="1" required')}
      <button type="button" data-calculate>Calcular</button>
    </fieldset>`;
  }

  function powerFields() {
    return `<fieldset class="honest-calculator__fields"><legend>Datos para potencia</legend>
      <label>Diseño<select name="powerDesign"><option value="correlation">Correlación</option><option value="means">Dos medias independientes</option><option value="proportions">Dos proporciones independientes</option></select></label>
      ${field("r / d", "effectSize", "number", 'step="0.01" required')}
      ${field("p₁", "p1", "number", 'min="0" max="1" step="0.01"')}
      ${field("p₂", "p2", "number", 'min="0" max="1" step="0.01"')}
      ${field("α", "alpha", "number", 'min="0.001" max="0.999" step="0.001" value="0.05" required')}
      ${field("Potencia", "power", "number", 'min="0.01" max="0.999" step="0.01" value="0.8" required')}
      ${field("Fuente del tamaño de efecto", "source", "text", "required")}
      ${field("Tasa de respuesta", "responseRate", "number", 'min="0.01" max="1" step="0.01" value="1" required')}
      <button type="button" data-calculate>Calcular</button>
    </fieldset>`;
  }

  function guideMarkup() {
    if (!Array.isArray(texts.guia_cualitativa)) return "";
    return `<ul>${texts.guia_cualitativa.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`;
  }

  function showResult(form, resultContainer) {
    try {
      const data = new FormData(form);
      const result = mode === "estimacion"
        ? calculateEstimation({
          kind: data.get("estimateKind"), p: Number(data.get("p")), sigma: Number(data.get("sigma")),
          marginOfError: Number(data.get("marginOfError")), confidence: Number(data.get("confidence")),
          population: data.get("population"), designEffect: Number(data.get("designEffect")), responseRate: Number(data.get("responseRate")),
        })
        : calculatePower({
          design: data.get("powerDesign"), effectSize: Number(data.get("effectSize")),
          p1: Number(data.get("p1")), p2: Number(data.get("p2")), alpha: Number(data.get("alpha")),
          power: Number(data.get("power")), source: data.get("source"), responseRate: Number(data.get("responseRate")),
        });
      if (!result.ok) {
        resultContainer.innerHTML = `<p class="honest-calculator__error">${inlineMarkdown(result.message ?? texts.aviso_fuente_efecto ?? "No se puede calcular con estos datos.")}</p>`;
        return;
      }
      const steps = result.steps.map((step) => `<li>${step.label}: <strong>${step.value}</strong></li>`).join("");
      const warnings = result.warnings?.map((warning) => `<p>${inlineMarkdown(warning)}</p>`).join("") ?? "";
      resultContainer.innerHTML = `<h4>Resultado: ${result.number} personas${result.perGroup ? ` por grupo (total: ${result.total})` : ""}</h4><ol>${steps}</ol>${warnings}`;
    } catch (error) {
      resultContainer.innerHTML = `<p class="honest-calculator__error">${inlineMarkdown(error.message)}</p>`;
    }
  }

  render();
  return { reset: () => { sampling = ""; purpose = ""; mode = "estimacion"; render(); } };
}

export { calculateHonestSample };
