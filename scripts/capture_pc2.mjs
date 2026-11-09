import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 8994;
const CDP_PORT = 9226;
const OUTPUT = path.join(ROOT, "capturas", "v3", "pc2");
const MODULES = ["m05", "m08"];
const STEPS = ["ubicacion", "diagnostico", "estudio", "conceptos", "guiada", "adaptativa", "verificacion", "auditoria", "cierre"];
const THEMES = ["light", "dark"];
const VIEWPORTS = [{ name: "mobile_375", width: 375, height: 900 }, { name: "desktop_1280", width: 1280, height: 900 }];
fs.mkdirSync(OUTPUT, { recursive: true });

const server = http.createServer((request, response) => {
  const relative = decodeURIComponent(request.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
  const filePath = path.resolve(ROOT, relative);
  if (!filePath.startsWith(`${ROOT}${path.sep}`) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    response.writeHead(404).end("Not found");
    return;
  }
  const ext = path.extname(filePath);
  const type = { ".html": "text/html", ".css": "text/css", ".js": "application/javascript", ".mjs": "application/javascript", ".json": "application/json", ".svg": "image/svg+xml" }[ext] ?? "application/octet-stream";
  response.writeHead(200, { "Content-Type": type });
  fs.createReadStream(filePath).pipe(response);
});

await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "meto2-pc2-"));
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${profile}`,
  "--no-first-run", "--no-default-browser-check", "--disable-background-networking", "--disable-extensions", "--mute-audio", "about:blank",
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

async function capture(moduleId, step, viewport, theme) {
  const pageUrl = `http://127.0.0.1:${PORT}/modulo.html?m=${moduleId}&step=${step}`;
  const targetResponse = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?${encodeURIComponent(pageUrl)}`, { method: "PUT" });
  const target = await targetResponse.json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map();
  const consoleErrors = [];
  let messageId = 0;
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(message.error); else resolve(message.result);
    } else if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
      consoleErrors.push(message.params.args.map((arg) => arg.value ?? "").join(" "));
    }
  };
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++messageId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Page.navigate", { url: pageUrl });
  await new Promise((resolve) => setTimeout(resolve, 800));
  await send("Emulation.setDeviceMetricsOverride", { width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: false });
  await send("Emulation.setEmulatedMedia", { media: "screen", features: [{ name: "prefers-color-scheme", value: theme }] });
  await send("Runtime.evaluate", { expression: `document.documentElement.setAttribute('data-theme', '${theme}'); document.querySelector('#theme-select').value = '${theme}';` });
  await new Promise((resolve) => setTimeout(resolve, 500));
  const audit = await send("Runtime.evaluate", {
    expression: `({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      stepButtons: document.querySelectorAll('.module-nav button').length,
      activeStep: document.querySelector('.module-step')?.className ?? '',
      title: document.querySelector('h1')?.textContent ?? '',
      chain: document.querySelectorAll('.coherence__item').length,
      tools: document.querySelectorAll('.sampling-tree, .honest-calculator').length,
      gallery: document.querySelectorAll('.gallery-card').length,
      overflow: [...document.querySelectorAll('*')].filter((element) => element.scrollWidth > element.clientWidth + 1).slice(0, 8).map((element) => ({ tag: element.tagName, className: element.className, scrollWidth: element.scrollWidth, clientWidth: element.clientWidth })),
      errors: document.querySelector('#module-status')?.textContent ?? ''
    })`,
    returnByValue: true,
  });
  const metrics = audit.result.value;
  if (metrics.stepButtons !== 9 || !metrics.activeStep.includes("is-active") || metrics.width !== viewport.width || metrics.scrollWidth > metrics.width || consoleErrors.length) {
    throw new Error(`${moduleId}/${step}/${viewport.name}/${theme}: ${JSON.stringify({ metrics, consoleErrors })}`);
  }
  if (step === "ubicacion" && metrics.chain !== 9) throw new Error(`${moduleId}: faltan eslabones de coherencia.`);
  if (moduleId === "m08" && step === "estudio" && metrics.tools !== 2) throw new Error("m08: faltan árbol o calculadora.");
  if (moduleId === "m08" && step === "guiada" && metrics.gallery !== 8) throw new Error("m08: galería incompleta.");
  const image = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  const name = `${moduleId}_${step}_${viewport.name}_${theme}.png`;
  fs.writeFileSync(path.join(OUTPUT, name), Buffer.from(image.data, "base64"));
  await send("Page.close");
  socket.close();
  console.log(`${name}: OK`);
}

try {
  await waitForCdp();
  for (const moduleId of MODULES) {
    for (const step of STEPS) {
      for (const viewport of VIEWPORTS) {
        for (const theme of THEMES) await capture(moduleId, step, viewport, theme);
      }
    }
  }
} finally {
  chrome.kill("SIGKILL");
  server.close();
  server.closeAllConnections?.();
  await new Promise((resolve) => setTimeout(resolve, 150));
  fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
