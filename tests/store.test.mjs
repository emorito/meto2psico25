import test from "node:test";
import assert from "node:assert/strict";
import {
  STORAGE_KEY,
  createDefaultStore,
  loadStoreResult,
  migrateLegacyProgress,
  saveStore,
} from "../assets/js/store.js";

function memoryStorage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    value: (key) => values.get(key),
  };
}

test("migra moduloN a mNN y conserva solamente completed", () => {
  const store = migrateLegacyProgress({ modulo1: { completed: true, bestScore: 99 }, modulo2: { completed: false } });
  assert.equal(store.modules.m01.completed, true);
  assert.equal(store.modules.m01.domain, null);
  assert.equal(store.modules.m01.lastScore, null);
  assert.equal(store.modules.m02.completed, false);
});

test("lee v2 y maneja storage disponible", () => {
  const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify({ version: 2, freeReviewMode: true, modules: { m01: { completed: true } } }) });
  const result = loadStoreResult({ storage });
  assert.equal(result.migrated, false);
  assert.equal(result.store.modules.m01.completed, true);
  assert.equal(result.store.modules.m02.completed, false);
  assert.equal(result.store.freeReviewMode, true);
});

test("migra la clave antigua y escribe meto2.v2", () => {
  const storage = memoryStorage({ meto2_progress: JSON.stringify({ modules: { modulo3: { completed: true } } }) });
  const result = loadStoreResult({ storage });
  assert.equal(result.migrated, true);
  assert.equal(result.store.modules.m03.completed, true);
  assert.ok(storage.value(STORAGE_KEY));
});

test("funciona si localStorage lanza excepciones", () => {
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  const result = loadStoreResult({ storage: blocked });
  assert.equal(result.store.version, 2);
  assert.equal(saveStore(createDefaultStore(), { storage: blocked }), false);
});
