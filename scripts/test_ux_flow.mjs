import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 8995;
const CDP_PORT = 9227;
const OUTPUT = path.join(ROOT, "capturas", "v3", "ux");
fs.mkdirSync(OUTPUT, { recursive: true });

const server = http.createServer((request, response) => {
  const relative = decodeURIComponent(request.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
  const filePath = path.resolve(ROOT, relative);
  if (!filePath.startsWith(`${ROOT}${path.sep}`) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    response.writeHead(404).end("Not found");
    return;
  }
  const ext = path.extname(filePath);
  const type = {
    ".html": "text/html", ".css": "text/css", ".js": "application/javascript",
    ".mjs": "application/javascript", ".json": "application/json", ".svg": "image/svg+xml",
  }[ext] ?? "application/octet-stream";
  response.writeHead(200, { "Content-Type": type });
  fs.createReadStream(filePath).pipe(response);
});

await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "meto2-ux-"));
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${profile}`,
  "--no-first-run", "--no-default-browser-check", "--disable-background-networking",
  "--disable-extensions", "--mute-audio", "about:blank",
], { stdio: "ignore" });

async function waitForCdp() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error("Chrome CDP no respondió.");
}

async function openPage(url, width, height) {
  const response = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  const target = await response.json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map();
  let messageId = 0;
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(message.error); else resolve(message.result);
  };
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++messageId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 500 });
  await send("Page.addScriptToEvaluateOnNewDocument", { source: "Math.random = () => 0.42;" });
  await send("Page.navigate", { url });
  await new Promise((resolve) => setTimeout(resolve, 900));
  return { send, socket };
}

async function evaluate(page, expression) {
  const result = await page.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  return result.result?.value;
}

async function waitFor(page, expression, attempts = 40) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await evaluate(page, expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`La condición del navegador no se cumplió: ${expression}`);
}

async function setTheme(page, theme) {
  await evaluate(page, `(() => { document.documentElement.setAttribute("data-theme", "${theme}"); const select = document.querySelector("#theme-select"); if (select) select.value = "${theme}"; })()`);
  await new Promise((resolve) => setTimeout(resolve, 250));
}

async function capture(page, name) {
  const image = await page.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  fs.writeFileSync(path.join(OUTPUT, name), Buffer.from(image.data, "base64"));
}

try {
  await waitForCdp();
  const page = await openPage(`http://127.0.0.1:${PORT}/modulo.html?m=m05&step=adaptativa`, 375, 900);
  await setTheme(page, "light");
  const interaction = await evaluate(page, `(() => {
    const confidence = document.querySelector('[data-confidence="dudoso"]');
    const option = document.querySelector('input[type="radio"]');
    const answer = document.querySelector('[data-answer-button]');
    if (!confidence || !option || !answer) return { ok: false };
    confidence.click(); option.click(); answer.click();
    return { ok: true };
  })()`);
  if (!interaction?.ok) throw new Error("No se pudo completar la interacción adaptativa.");
  await new Promise((resolve) => setTimeout(resolve, 250));
  const saved = await evaluate(page, `(() => {
    const store = JSON.parse(localStorage.getItem("meto2.v2") || "null");
    const module = store?.modules?.m05;
    return { responses: store?.responses?.length || 0, step: module?.lastActivity?.stepId, question: module?.lastActivity?.questionId };
  })()`);
  if (!saved || saved.responses < 1 || saved.step !== "adaptativa" || !saved.question) throw new Error(`Persistencia incompleta: ${JSON.stringify(saved)}`);
  await capture(page, "m05_adaptativa_mobile_375_light.png");

  await page.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/index.html` });
  await waitFor(page, `Boolean(document.querySelector("#hero-continue-btn")?.getAttribute("href")?.includes("m=m05"))`);
  const continuation = await evaluate(page, `({ href: document.querySelector("#hero-continue-btn")?.getAttribute("href"), review: document.querySelector("#hero-review-btn")?.style.display })`);
  if (!continuation?.href?.includes("m=m05") || !continuation.href.includes("step=adaptativa")) throw new Error(`Continuidad incorrecta: ${JSON.stringify(continuation)}`);

  await page.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/progreso.html` });
  await waitFor(page, `Boolean(document.querySelector("[data-progress-module]"))`);
  const progress = await evaluate(page, `({ modules: document.querySelectorAll("[data-progress-module]").length, href: document.querySelector('[data-progress-module="m05"] a')?.getAttribute("href") })`);
  if (progress.modules !== 11 || !progress.href?.includes("m=m05")) throw new Error(`Progreso incompleto: ${JSON.stringify(progress)}`);
  await setTheme(page, "light");
  await capture(page, "progreso_mobile_375_light.png");
  await setTheme(page, "dark");
  await capture(page, "progreso_mobile_375_dark.png");
  await page.send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await setTheme(page, "light");
  await capture(page, "progreso_desktop_1280_light.png");
  await setTheme(page, "dark");
  await capture(page, "progreso_desktop_1280_dark.png");

  await page.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/glosario.html` });
  await waitFor(page, `Boolean(document.querySelector("[data-glossary-results] .glossary-card"))`);
  const glossary = await evaluate(page, `({ cards: document.querySelectorAll("[data-glossary-results] .glossary-card").length, count: document.querySelector("[data-glossary-count]")?.textContent })`);
  if (glossary.cards < 1 || !glossary.count?.includes("concepto")) throw new Error(`Glosario incompleto: ${JSON.stringify(glossary)}`);
  await page.send("Emulation.setDeviceMetricsOverride", { width: 375, height: 900, deviceScaleFactor: 1, mobile: true });
  await setTheme(page, "light");
  await capture(page, "glosario_mobile_375_light.png");
  await setTheme(page, "dark");
  await capture(page, "glosario_mobile_375_dark.png");
  await page.send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await setTheme(page, "light");
  await capture(page, "glosario_desktop_1280_light.png");
  await setTheme(page, "dark");
  await capture(page, "glosario_desktop_1280_dark.png");

  await page.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/simulacro.html` });
  await waitFor(page, `Boolean(document.querySelector("[data-start-simulacro]"))`);
  await evaluate(page, `document.querySelector("[data-start-simulacro]").click()`);
  await waitFor(page, `document.querySelectorAll("[data-simulacro-question]").length === 10`);
  const simulacro = await evaluate(page, `({ questions: document.querySelectorAll("[data-simulacro-question]").length, confidence: document.querySelectorAll("[data-confidence]").length })`);
  if (simulacro.questions !== 10 || simulacro.confidence !== 0) throw new Error(`Simulacro incompleto: ${JSON.stringify(simulacro)}`);
  await page.send("Emulation.setDeviceMetricsOverride", { width: 375, height: 900, deviceScaleFactor: 1, mobile: true });
  await setTheme(page, "light");
  await capture(page, "simulacro_mobile_375_light.png");
  await setTheme(page, "dark");
  await capture(page, "simulacro_mobile_375_dark.png");
  await page.send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await setTheme(page, "light");
  await capture(page, "simulacro_desktop_1280_light.png");
  await setTheme(page, "dark");
  await capture(page, "simulacro_desktop_1280_dark.png");
  const submitted = await evaluate(page, `(() => { document.querySelectorAll("[data-simulacro-question]").forEach((question) => { question.querySelector("input")?.click(); question.querySelector("[data-answer-button]")?.click(); }); document.querySelector("[data-simulacro-submit]")?.click(); return Boolean(document.querySelector(".simulacro-result")); })()`);
  if (!submitted) throw new Error("El simulacro no mostró resultado.");

  await page.send("Emulation.setDeviceMetricsOverride", { width: 375, height: 900, deviceScaleFactor: 1, mobile: true });
  await page.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/repaso.html` });
  await waitFor(page, `Boolean(document.querySelector("[data-question-id]"))`);
  const review = await evaluate(page, `({ question: Boolean(document.querySelector("[data-question-id]")), confidence: document.querySelectorAll("[data-confidence]").length })`);
  if (!review?.question || review.confidence !== 3) throw new Error(`Repaso incompleto: ${JSON.stringify(review)}`);
  await setTheme(page, "light");
  await capture(page, "repaso_mobile_375_light.png");
  await setTheme(page, "dark");
  await capture(page, "repaso_mobile_375_dark.png");

  await page.send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await setTheme(page, "light");
  await capture(page, "repaso_desktop_1280_light.png");
  await setTheme(page, "dark");
  await capture(page, "repaso_desktop_1280_dark.png");
  await page.send("Page.close");
  page.socket.close();
  console.log("[OK] Continuidad, cola de repaso y capturas UX verificadas.");
} finally {
  chrome.kill("SIGKILL");
  server.close();
  server.closeAllConnections?.();
  await new Promise((resolve) => setTimeout(resolve, 150));
  fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
