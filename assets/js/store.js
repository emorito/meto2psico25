const DEFAULT_MODULE_IDS = Array.from({ length: 11 }, (_, index) => `m${String(index + 1).padStart(2, "0")}`);
export const STORAGE_KEY = "meto2.v2";
export const LEGACY_STORAGE_KEYS = ["meto2_progress", "meto2_progress_2026"];
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30];

function moduleState() {
  return {
    completed: false,
    domain: null,
    currentStep: 1,
    lastActivity: null,
    steps: {},
    lastScore: null,
  };
}

export function createDefaultStore(moduleIds = DEFAULT_MODULE_IDS) {
  return {
    version: 2,
    theme: "auto",
    freeReviewMode: false,
    modules: Object.fromEntries(moduleIds.map((id) => [id, moduleState()])),
    responses: [],
    leitner: {},
    autoauditorias: {},
    puntosTurbios: [],
    simulacros: [],
  };
}

function storageOrNull(storage) {
  if (storage !== undefined) return storage;
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

export function safeRead(storage, key) {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function safeWrite(storage, key, value) {
  try {
    storage?.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function parseObject(raw) {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    return value && typeof value === "object" ? value : null;
  } catch {
    return null;
  }
}

function normalizeModuleId(value, moduleIds) {
  const raw = String(value ?? "").toLowerCase();
  const match = raw.match(/(?:m|modulo|module)[_ -]?(\d{1,2})/);
  if (!match) return null;
  const id = `m${String(Number(match[1])).padStart(2, "0")}`;
  return moduleIds.includes(id) ? id : null;
}

function copyV2(raw, base) {
  if (!raw || typeof raw !== "object") return base;
  if (typeof raw.theme === "string" && ["auto", "light", "dark"].includes(raw.theme)) base.theme = raw.theme;
  if (typeof raw.freeReviewMode === "boolean") base.freeReviewMode = raw.freeReviewMode;
  for (const key of ["responses", "puntosTurbios", "simulacros"]) {
    if (Array.isArray(raw[key])) base[key] = raw[key];
  }
  for (const key of ["leitner", "autoauditorias"]) {
    if (raw[key] && typeof raw[key] === "object") base[key] = raw[key];
  }
  if (raw.modules && typeof raw.modules === "object") {
    for (const id of Object.keys(base.modules)) {
      if (raw.modules[id] && typeof raw.modules[id] === "object") {
        base.modules[id] = { ...base.modules[id], ...raw.modules[id] };
        if (!base.modules[id].steps || typeof base.modules[id].steps !== "object") base.modules[id].steps = {};
      }
    }
  }
  return base;
}

export function migrateLegacyProgress(raw, moduleIds = DEFAULT_MODULE_IDS) {
  const base = createDefaultStore(moduleIds);
  const source = raw?.modules ?? raw?.modulos ?? raw?.progress ?? raw;
  if (!source || typeof source !== "object") return base;
  for (const [key, value] of Object.entries(source)) {
    const id = normalizeModuleId(key, moduleIds);
    if (!id || !value || typeof value !== "object") continue;
    // La migración conserva solamente completed; no convierte ese dato en dominio.
    base.modules[id].completed = value.completed === true;
  }
  return base;
}

export function loadStoreResult({ storage, moduleIds = DEFAULT_MODULE_IDS, legacyKeys = LEGACY_STORAGE_KEYS } = {}) {
  const target = storageOrNull(storage);
  const base = createDefaultStore(moduleIds);
  const current = parseObject(safeRead(target, STORAGE_KEY));
  if (current?.version === 2) {
    return { store: copyV2(current, base), migrated: false, persisted: Boolean(target) };
  }

  for (const key of legacyKeys) {
    const legacy = parseObject(safeRead(target, key));
    if (!legacy) continue;
    const migrated = migrateLegacyProgress(legacy, moduleIds);
    const persisted = safeWrite(target, STORAGE_KEY, JSON.stringify(migrated));
    return { store: migrated, migrated: true, persisted };
  }
  return { store: base, migrated: false, persisted: Boolean(target) };
}

export function loadStore(options = {}) {
  return loadStoreResult(options).store;
}

export function saveStore(store, { storage } = {}) {
  const target = storageOrNull(storage);
  const payload = JSON.stringify({ ...store, version: 2 });
  return safeWrite(target, STORAGE_KEY, payload);
}

export function updateModule(store, moduleId, patch) {
  if (!store?.modules?.[moduleId]) return store;
  return {
    ...store,
    modules: {
      ...store.modules,
      [moduleId]: { ...store.modules[moduleId], ...patch },
    },
  };
}

export function reviewPlan({ correcto, seguridad, caja = 0, now = new Date() } = {}) {
  const isCorrect = correcto === true;
  const isCertain = seguridad === "seguro";
  const advances = isCorrect && isCertain;
  const nextBox = advances
    ? Math.min(REVIEW_INTERVALS_DAYS.length, Number(caja) + 1)
    : 0;
  const days = advances ? REVIEW_INTERVALS_DAYS[Math.max(0, nextBox - 1)] : 0;
  const next = new Date(now);
  next.setDate(next.getDate() + days);
  return { caja: nextBox, nextReviewAt: next.toISOString() };
}

export function getReviewQueue(store, now = new Date()) {
  const latest = new Map();
  for (const response of store?.responses ?? []) {
    const moduleId = response.modulo ?? response.moduleId;
    if (!moduleId || !response.id) continue;
    latest.set(`${moduleId}:${response.id}`, { ...response, modulo: moduleId });
  }
  for (const [moduleId, cards] of Object.entries(store?.leitner ?? {})) {
    for (const [cardId, card] of Object.entries(cards ?? {})) {
      if (!card || !card.nextReviewAt) continue;
      latest.set(`${moduleId}:${cardId}`, {
        ...card,
        id: card.id ?? cardId,
        modulo: moduleId,
        kind: "card",
        revisar: true,
      });
    }
  }
  const timestamp = new Date(now).getTime();
  return [...latest.values()]
    .filter((response) => response.revisar !== false)
    .filter((response) => response.kind === "card" || response.correcto !== true || response.seguridad !== "seguro")
    .filter((response) => !response.nextReviewAt || new Date(response.nextReviewAt).getTime() <= timestamp)
    .sort((a, b) => new Date(a.nextReviewAt ?? 0).getTime() - new Date(b.nextReviewAt ?? 0).getTime());
}
