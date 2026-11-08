import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 8993;
const CDP_PORT = 9224;
const OUTPUT = path.join(ROOT, "capturas", "v3");
fs.mkdirSync(OUTPUT, { recursive: true });

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};

const server = http.createServer((request, response) => {
  const relative = decodeURIComponent(request.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
  const filePath = path.resolve(ROOT, relative);
  if (!filePath.startsWith(`${ROOT}${path.sep}`) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] ?? "application/octet-stream" });
  fs.createReadStream(filePath).pipe(response);
});

await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "meto2-pc1-"));
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

async function capture({ width, height, theme, name }) {
  const targetResponse = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?${encodeURIComponent(`http://127.0.0.1:${PORT}/estilo.html`)}`, { method: "PUT" });
  const target = await targetResponse.json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map();
  let messageId = 0;
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(message.error); else resolve(message.result);
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
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/estilo.html` });
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 600 });
  await send("Emulation.setEmulatedMedia", { media: "screen", features: [{ name: "prefers-color-scheme", value: theme }] });
  await new Promise((resolve) => setTimeout(resolve, 600));
  const themeResult = await send("Runtime.evaluate", { expression: `document.documentElement.setAttribute('data-theme', '${theme}'); if (document.querySelector('#theme-select')) document.querySelector('#theme-select').value = '${theme}'; document.documentElement.dataset.theme;`, returnByValue: true });
  if (themeResult.exceptionDetails) throw new Error(`No se pudo aplicar tema ${theme}`);
  await new Promise((resolve) => setTimeout(resolve, 500));
  const metrics = await send("Runtime.evaluate", { expression: "({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, theme: document.documentElement.dataset.theme, background: getComputedStyle(document.body).backgroundColor })", returnByValue: true });
  const image = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  const output = path.join(OUTPUT, `${name}.png`);
  fs.writeFileSync(output, Buffer.from(image.data, "base64"));
  await send("Page.close");
  socket.close();
  console.log(`${name}: ${metrics.result.value.width}px viewport, ${metrics.result.value.scrollWidth}px scroll, theme=${metrics.result.value.theme}, bg=${metrics.result.value.background}, ${output}`);
  if (metrics.result.value.scrollWidth > metrics.result.value.width) throw new Error(`${name}: desplazamiento horizontal`);
}

try {
  await waitForCdp();
  for (const theme of ["light", "dark"]) {
    await capture({ width: 375, height: 900, theme, name: `estilo_mobile_375_${theme}` });
    await capture({ width: 1280, height: 900, theme, name: `estilo_desktop_1280_${theme}` });
  }
} finally {
  chrome.kill("SIGKILL");
  server.close();
  await new Promise((resolve) => setTimeout(resolve, 150));
  fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
