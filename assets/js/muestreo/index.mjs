export * from "./calculos.mjs";
export * from "./arbol-muestreo.mjs";
export * from "./calculadora-honesta.mjs";

import { mountSamplingTree } from "./arbol-muestreo.mjs";
import { mountHonestCalculator } from "./calculadora-honesta.mjs";

export function mountSamplingToolBlock(container, block, options = {}) {
  if (block?.id === "arbol-muestreo") {
    return mountSamplingTree(container, {
      content: options.content,
      onOpenCalculator: options.onOpenCalculator,
    });
  }
  if (block?.id === "calculadora-honesta") {
    return mountHonestCalculator(container, { content: options.content });
  }
  throw new RangeError(`Herramienta de muestreo desconocida: ${block?.id ?? "(sin id)"}`);
}
