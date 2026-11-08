const DEFAULT_ALPHA = 0.05;
const DEFAULT_POWER = 0.8;

// Aproximación inversa de la normal estándar de Peter John Acklam.
export function normalQuantile(probability) {
  if (!(probability > 0 && probability < 1)) {
    throw new RangeError("La probabilidad debe estar entre 0 y 1.");
  }

  const a = [
    -39.6968302866538,
    220.946098424521,
    -275.928510446969,
    138.357751867269,
    -30.6647980661472,
    2.50662827745924,
  ];
  const b = [
    -54.4760987982241,
    161.585836858041,
    -155.698979859887,
    66.8013118877197,
    -13.2806815528857,
  ];
  const c = [
    -0.00778489400243029,
    -0.322396458041136,
    -2.40075827716184,
    -2.54973253934373,
    4.37466414146497,
    2.93816398269878,
  ];
  const d = [
    0.00778469570904146,
    0.32246712907004,
    2.445134137143,
    3.75440866190742,
  ];
  const low = 0.02425;
  const high = 1 - low;

  if (probability < low) {
    const q = Math.sqrt(-2 * Math.log(probability));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (probability > high) {
    const q = Math.sqrt(-2 * Math.log(1 - probability));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  const q = probability - 0.5;
  const r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

function ceilPeople(value) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError("El resultado debe ser un número positivo.");
  }
  return Math.ceil(value);
}

function positiveNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    throw new RangeError(`${label} debe ser mayor que cero.`);
  }
  return number;
}

function probability(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 1) {
    throw new RangeError(`${label} debe estar entre 0 y 1.`);
  }
  return number;
}

function confidenceZ(confidence = 0.95) {
  return normalQuantile(0.5 + probability(confidence, "La confianza") / 2);
}

function responseAdjustment(value = 1) {
  const number = probability(value, "La tasa de respuesta");
  if (number <= 0) throw new RangeError("La tasa de respuesta debe ser mayor que cero.");
  return number;
}

export function calculateEstimation({
  kind = "proportion",
  p = 0.5,
  sigma,
  marginOfError,
  confidence = 0.95,
  population,
  designEffect = 1,
  responseRate = 1,
} = {}) {
  const error = positiveNumber(marginOfError, "El margen de error");
  const z = confidenceZ(confidence);
  const deff = positiveNumber(designEffect, "El efecto de diseño");
  const response = responseAdjustment(responseRate);
  const steps = [];
  let rawBase;

  if (kind === "proportion") {
    const proportion = probability(p, "p");
    rawBase = (z ** 2 * proportion * (1 - proportion)) / (error ** 2);
    steps.push({ id: "n0", label: "Precisión inicial (n₀)", raw: rawBase, value: ceilPeople(rawBase) });
  } else if (kind === "mean") {
    const standardDeviation = positiveNumber(sigma, "σ");
    rawBase = (z ** 2 * standardDeviation ** 2) / (error ** 2);
    steps.push({ id: "n0", label: "Precisión inicial (n₀)", raw: rawBase, value: ceilPeople(rawBase) });
  } else {
    throw new RangeError("El modo de estimación debe ser de proporción o de media.");
  }

  let current = steps[0].value;
  if (population !== undefined && population !== null && population !== "") {
    const size = positiveNumber(population, "N");
    const rawFinite = current / (1 + (current - 1) / size);
    current = ceilPeople(rawFinite);
    steps.push({ id: "n1", label: "Corrección por población finita (n₁)", raw: rawFinite, value: current });
  }

  const rawDesign = current * deff;
  current = ceilPeople(rawDesign);
  steps.push({ id: "n2", label: "Efecto de diseño (n₂)", raw: rawDesign, value: current });

  const rawResponse = current / response;
  current = ceilPeople(rawResponse);
  steps.push({ id: "n3", label: "Ajuste por tasa de respuesta (n₃)", raw: rawResponse, value: current });

  return {
    ok: true,
    mode: "estimacion",
    number: current,
    sampleSize: current,
    steps,
    warnings: p === 0.5 && kind === "proportion" ? ["p = 0,5 es el supuesto más conservador. Si tenés una estimación previa, usala."] : [],
  };
}

export function calculatePower({
  design = "correlation",
  effectSize,
  r,
  d,
  p1,
  p2,
  alpha = DEFAULT_ALPHA,
  power = DEFAULT_POWER,
  source,
  responseRate = 1,
} = {}) {
  if (!String(source ?? "").trim()) {
    return {
      ok: false,
      mode: "potencia",
      number: null,
      reason: "fuente_efecto",
      message: "El tamaño de efecto tiene que venir de la literatura o de un estudio piloto, no de una convención.",
    };
  }

  const alphaNumber = probability(alpha, "α");
  if (alphaNumber <= 0 || alphaNumber >= 1) throw new RangeError("α debe estar entre 0 y 1.");
  const powerNumber = probability(power, "La potencia");
  if (powerNumber <= 0 || powerNumber >= 1) throw new RangeError("La potencia debe estar entre 0 y 1.");
  const zAlpha = normalQuantile(1 - alphaNumber / 2);
  const zPower = normalQuantile(powerNumber);
  const response = responseAdjustment(responseRate);
  const sumZ = zAlpha + zPower;
  const steps = [];
  let rawPerGroup;
  let result;

  if (design === "correlation") {
    const correlation = Number(r ?? effectSize);
    if (!Number.isFinite(correlation) || correlation <= -1 || correlation >= 1 || correlation === 0) {
      throw new RangeError("r debe estar entre -1 y 1 y no puede ser cero.");
    }
    const fisherC = 0.5 * Math.log((1 + correlation) / (1 - correlation));
    const rawTotal = (sumZ / Math.abs(fisherC)) ** 2 + 3;
    const total = ceilPeople(rawTotal);
    steps.push({ id: "n", label: "Tamaño para correlación", raw: rawTotal, value: total });
    result = { number: ceilPeople(total / response), sampleSize: ceilPeople(total / response), total: ceilPeople(total / response) };
  } else if (design === "means" || design === "difference_means") {
    const effect = Number(d ?? effectSize);
    positiveNumber(effect, "d");
    rawPerGroup = (2 * sumZ ** 2) / effect ** 2 + zAlpha ** 2 / 4;
    const perGroup = ceilPeople(rawPerGroup);
    const adjusted = ceilPeople(perGroup / response);
    steps.push({ id: "n", label: "Tamaño por grupo", raw: rawPerGroup, value: perGroup });
    result = { number: adjusted, sampleSize: adjusted, perGroup: adjusted, total: adjusted * 2 };
  } else if (design === "proportions" || design === "difference_proportions") {
    const first = probability(p1, "p₁");
    const second = probability(p2, "p₂");
    if (first === second) throw new RangeError("p₁ y p₂ deben ser diferentes.");
    const mean = (first + second) / 2;
    const qMean = 1 - mean;
    const raw = (
      zAlpha * Math.sqrt(2 * mean * qMean) +
      zPower * Math.sqrt(first * (1 - first) + second * (1 - second))
    ) ** 2 / (first - second) ** 2;
    const perGroup = ceilPeople(raw);
    const adjusted = ceilPeople(perGroup / response);
    steps.push({ id: "n", label: "Tamaño por grupo", raw, value: perGroup });
    result = { number: adjusted, sampleSize: adjusted, perGroup: adjusted, total: adjusted * 2 };
  } else {
    return {
      ok: false,
      mode: "potencia",
      number: null,
      reason: "modelo",
      message: "Para modelos factoriales o de ecuaciones estructurales no hay una fórmula única.",
    };
  }

  return {
    ok: true,
    mode: "potencia",
    ...result,
    steps,
    warnings: ["Cálculo aproximado con la distribución normal. Para diseños más complejos usá G*Power."],
  };
}

export function calculateHonestSample({
  sampling = "probabilistico",
  purpose = "estimar",
  mode = "estimacion",
  ...parameters
} = {}) {
  if (sampling === "cualitativo") {
    return { ok: false, mode, number: null, reason: "cualitativo" };
  }
  if (purpose === "modelar") {
    return { ok: false, mode, number: null, reason: "modelo" };
  }
  if (mode === "estimacion" && sampling !== "probabilistico") {
    return {
      ok: false,
      mode,
      number: null,
      reason: "no_probabilistico",
      message: "Sin probabilidades de selección conocidas, el margen de error no tiene referente.",
    };
  }
  if (mode === "potencia") return calculatePower(parameters);
  return calculateEstimation(parameters);
}

export const calculateSampleSize = calculateHonestSample;
