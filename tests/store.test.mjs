import test from "node:test";
import assert from "node:assert/strict";
import {
  STORAGE_KEY,
  createDefaultStore,
  getReviewQueue,
  loadStoreResult,
  migrateLegacyProgress,
  reviewPlan,
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

test("programa repaso espaciado y reinicia la caja si hay error", () => {
  const now = new Date("2026-11-10T12:00:00Z");
  const sure = reviewPlan({ correcto: true, seguridad: "seguro", caja: 0, now });
  assert.equal(sure.caja, 1);
  assert.equal(sure.nextReviewAt, "2026-11-11T12:00:00.000Z");
  const fifth = reviewPlan({ correcto: true, seguridad: "seguro", caja: 4, now });
  assert.equal(fifth.caja, 5);
  assert.equal(fifth.nextReviewAt, "2026-12-10T12:00:00.000Z");
  const uncertain = reviewPlan({ correcto: true, seguridad: "dudoso", caja: 3, now });
  assert.equal(uncertain.caja, 0);
  assert.equal(uncertain.nextReviewAt, now.toISOString());
  const error = reviewPlan({ correcto: false, seguridad: "adivine", caja: 3, now });
  assert.equal(error.caja, 0);
  assert.equal(error.nextReviewAt, now.toISOString());
});

test("la cola conserva el último error pendiente y excluye una respuesta corregida", () => {
  const store = createDefaultStore(["m01"]);
  store.responses.push(
    { id: "q1", modulo: "m01", correcto: false, seguridad: "adivine", revisar: true, fecha: "2026-11-10T10:00:00.000Z" },
    { id: "q1", modulo: "m01", correcto: true, seguridad: "seguro", revisar: true, fecha: "2026-11-10T11:00:00.000Z", nextReviewAt: "2026-11-11T11:00:00.000Z" },
    { id: "q2", modulo: "m01", correcto: false, seguridad: "dudoso", revisar: true, fecha: "2026-11-10T11:30:00.000Z", nextReviewAt: "2026-11-10T11:30:00.000Z" },
    { id: "q3", modulo: "m01", correcto: true, seguridad: null, revisar: false, fecha: "2026-11-10T11:45:00.000Z" },
  );
  const queue = getReviewQueue(store, new Date("2026-11-10T12:00:00Z"));
  assert.deepEqual(queue.map((item) => item.id), ["q2"]);
});
