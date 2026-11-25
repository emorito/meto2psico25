import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 8994;
const CDP_PORT = 9225;
const fixture = path.join(ROOT, "tests/fixtures/caso_practica.json");
const screenshotDir = path.join(ROOT, "capturas/v3/examen-final");
fs.mkdirSync(screenshotDir, { recursive: true });
const mime = { ".html": "text/html", ".css": "text/css", ".js": "application/javascript", ".json": "application/json", ".svg": "image/svg+xml" };

const server = http.createServer((request, response) => {
  const requestPath = decodeURIComponent(request.url.split("?")[0]);
  const filePath = requestPath === "/data/casos/practica.json" ? fixture : path.join(ROOT, requestPath === "/" ? "simulacro.html" : requestPath);
  if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, { "Content-Type": mime[path.extname(filePath)] ?? "application/octet-stream" });
  fs.createReadStream(filePath).pipe(response);
});
await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));

const profile = path.join(ROOT, ".tmp_exam_final_profile");
fs.rmSync(profile, { recursive: true, force: true });
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${profile}`,
  "--no-first-run", "--no-default-browser-check", "--disable-background-networking", "--disable-extensions", "about:blank",
], { stdio: "ignore" });

async function waitForCdp() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error("Chrome no abrió el puerto de depuración.");
}

async function testViewport(width, height) {
  const created = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?${encodeURIComponent(`http://127.0.0.1:${PORT}/simulacro.html`)}`, { method: "PUT" });
  const target = await created.json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map();
  const errors = [];
  let id = 0;
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const handler = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) handler.reject(new Error(JSON.stringify(message.error)));
      else handler.resolve(message.result);
    } else if (message.method === "Runtime.exceptionThrown") {
      errors.push(message.params.exceptionDetails.text);
    } else if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
      errors.push(message.params.args.map((arg) => arg.value ?? arg.description).join(" "));
    }
  };
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      id += 1;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width <= 480 });
  await new Promise((resolve) => setTimeout(resolve, 1200));
  const result = await send("Runtime.evaluate", {
    expression: `(async () => {
      const wait = (test) => new Promise((resolve, reject) => {
        const started = Date.now();
        const timer = setInterval(() => {
          if (test()) { clearInterval(timer); resolve(); }
          else if (Date.now() - started > 5000) { clearInterval(timer); reject(new Error('timeout')); }
        }, 50);
      });
      await wait(() => document.querySelector('[data-start-final]'));
      const start = document.querySelector('[data-start-final]');
      if (start.disabled) throw new Error('El modo final quedó deshabilitado con el fixture aprobado');
      start.click();
      await wait(() => document.querySelectorAll('[data-final-question]').length === 20);
      const optionCounts = [...document.querySelectorAll('[data-final-question]')].map((card) => card.querySelectorAll('input[type=radio]').length);
      document.querySelectorAll('[data-final-question]').forEach((card) => card.querySelector('input[type=radio]').click());
      document.querySelector('[data-submit-part-one]').click();
      await wait(() => document.querySelectorAll('[data-case-answer]').length === 8);
      return {
        questions: optionCounts.length,
        om: optionCounts.filter((count) => count === 4).length,
        vf: optionCounts.filter((count) => count === 2).length,
        caseAnswers: document.querySelectorAll('[data-case-answer]').length,
        overflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  const metrics = result.result.value;
  if (metrics.questions !== 20 || metrics.om !== 14 || metrics.vf !== 6 || metrics.caseAnswers !== 8 || metrics.overflow || errors.length) {
    throw new Error(`${width}px: ${JSON.stringify({ metrics, errors })}`);
  }
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  fs.writeFileSync(path.join(screenshotDir, `formato_final_${width}.png`), Buffer.from(shot.data, "base64"));
  await send("Page.close");
  socket.close();
  console.log(`[OK] ${width}px: 20 ítems (14 OM/6 V/F), 8 respuestas de caso, sin overflow ni errores.`);
}

try {
  await waitForCdp();
  await testViewport(375, 844);
  await testViewport(1280, 900);
} finally {
  chrome.kill();
  await Promise.race([
    new Promise((resolve) => chrome.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);
  await new Promise((resolve) => server.close(resolve));
  try {
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  } catch (error) {
    console.warn(`[WARN] No se pudo retirar el perfil temporal de Chrome: ${error.code ?? error.message}`);
  }
}
