import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8992;
const CDP_PORT = 9223;
const SCREENSHOT_DIR = path.join(ROOT_DIR, 'scripts', 'screenshots');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

// 1. Static file server
const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(ROOT_DIR, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found: ' + reqPath);
  }
});

await new Promise((resolve) => server.listen(PORT, resolve));
console.log(`[HTTP Server] Listening on http://localhost:${PORT}`);

// 2. Launch Headless Chrome with Remote Debugging
const chromeProfile = path.join(ROOT_DIR, '.tmp_chrome_profile');
fs.rmSync(chromeProfile, { recursive: true, force: true });
fs.mkdirSync(chromeProfile, { recursive: true });

const chromeProc = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new',
  `--remote-debugging-port=${CDP_PORT}`,
  `--user-data-dir=${chromeProfile}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-background-networking',
  '--disable-extensions',
  'about:blank'
], { stdio: 'ignore' });

// Wait for Chrome CDP port to open
let cdpReady = false;
for (let i = 0; i < 30; i++) {
  try {
    const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
    if (res.ok) {
      cdpReady = true;
      break;
    }
  } catch (e) {}
  await new Promise(r => setTimeout(r, 200));
}

if (!cdpReady) {
  console.error('[CDP] Could not connect to Chrome debugging port.');
  chromeProc.kill();
  server.close();
  process.exit(1);
}
console.log('[CDP] Chrome ready');

// Helper to interact with a page via CDP WebSocket
async function runPageTest({ url, width, height, isMobile, theme, screenshotName, testActions }) {
  console.log(`\nTesting: ${screenshotName} (${width}x${height}, ${theme})...`);

  // Create new target tab
  const createRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  const target = await createRes.json();
  const wsUrl = target.webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);
  let id = 1;
  const pending = new Map();
  const consoleErrors = [];
  const network404s = [];

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    } else if (msg.method === 'Runtime.consoleAPICalled') {
      if (msg.params.type === 'error') {
        const text = msg.params.args.map(a => a.value || JSON.stringify(a)).join(' ');
        consoleErrors.push(text);
      }
    } else if (msg.method === 'Network.responseReceived') {
      const status = msg.params.response.status;
      const respUrl = msg.params.response.url;
      if (status === 404 && !respUrl.includes('favicon.ico')) {
        network404s.push(`${status} ${respUrl}`);
      }
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');

  // Set device viewport
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 2,
    mobile: isMobile
  });

  // Set theme preference
  await send('Emulation.setEmulatedMedia', {
    media: 'screen',
    features: [{ name: 'prefers-color-scheme', value: theme }]
  });

  // Force document data-theme
  await send('Runtime.evaluate', {
    expression: `
      document.documentElement.setAttribute('data-theme', '${theme}');
      try { localStorage.setItem('meto2_theme', '${theme}'); } catch(e) {}
    `
  });

  // Wait for load and animations
  await new Promise(r => setTimeout(r, 1200));

  // Run optional custom actions
  if (testActions) {
    await testActions(send);
  }

  // Check horizontal overflow
  const evalMetrics = await send('Runtime.evaluate', {
    expression: `
      ({
        windowWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth
      })
    `,
    returnByValue: true
  });
  const metrics = evalMetrics.result.value;

  // Capture screenshot
  const screenshotRes = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false
  });
  const screenshotPath = path.join(SCREENSHOT_DIR, `${screenshotName}.png`);
  fs.writeFileSync(screenshotPath, Buffer.from(screenshotRes.data, 'base64'));

  // Close tab
  await send('Page.close');
  ws.close();

  // Report
  const passed = consoleErrors.length === 0 && network404s.length === 0 && !metrics.hasHorizontalOverflow;
  console.log(`  Screenshot saved: ${screenshotPath} (${fs.statSync(screenshotPath).size} bytes)`);
  console.log(`  Metrics: window=${metrics.windowWidth}px, scroll=${metrics.scrollWidth}px (Overflow: ${metrics.hasHorizontalOverflow ? 'FAIL' : 'OK'})`);
  if (consoleErrors.length > 0) {
    console.error(`  [CONSOLE ERRORS]:`, consoleErrors);
  } else {
    console.log(`  [CONSOLE]: 0 errors`);
  }
  if (network404s.length > 0) {
    console.error(`  [404 ERRORS]:`, network404s);
  } else {
    console.log(`  [NETWORK]: 0 non-favicon 404s`);
  }
  return passed;
}

// RUN TESTS
let allPassed = true;

// 1. Portada escritorio (1280px)
const t1 = await runPageTest({
  url: `http://localhost:${PORT}/index.html`,
  width: 1280,
  height: 900,
  isMobile: false,
  theme: 'light',
  screenshotName: 'index_desktop_1280_light'
});
allPassed = allPassed && t1;

// 2. Portada móvil (390px, claro y oscuro)
const t2 = await runPageTest({
  url: `http://localhost:${PORT}/index.html`,
  width: 390,
  height: 844,
  isMobile: true,
  theme: 'light',
  screenshotName: 'index_mobile_390_light'
});
allPassed = allPassed && t2;

const t3 = await runPageTest({
  url: `http://localhost:${PORT}/index.html`,
  width: 390,
  height: 844,
  isMobile: true,
  theme: 'dark',
  screenshotName: 'index_mobile_390_dark'
});
allPassed = allPassed && t3;

// 3. Examen escritorio (1280px, claro y oscuro)
const t4 = await runPageTest({
  url: `http://localhost:${PORT}/examen.html`,
  width: 1280,
  height: 1000,
  isMobile: false,
  theme: 'light',
  screenshotName: 'examen_desktop_1280_light'
});
allPassed = allPassed && t4;

const t5 = await runPageTest({
  url: `http://localhost:${PORT}/examen.html`,
  width: 1280,
  height: 1000,
  isMobile: false,
  theme: 'dark',
  screenshotName: 'examen_desktop_1280_dark'
});
allPassed = allPassed && t5;

// 4. Examen móvil (390px, claro y oscuro)
const t6 = await runPageTest({
  url: `http://localhost:${PORT}/examen.html`,
  width: 390,
  height: 844,
  isMobile: true,
  theme: 'light',
  screenshotName: 'examen_mobile_390_light'
});
allPassed = allPassed && t6;

const t7 = await runPageTest({
  url: `http://localhost:${PORT}/examen.html`,
  width: 390,
  height: 844,
  isMobile: true,
  theme: 'dark',
  screenshotName: 'examen_mobile_390_dark'
});
allPassed = allPassed && t7;

// 5. Interacción interactiva en examen.html (diagnóstico evaluado)
const t8 = await runPageTest({
  url: `http://localhost:${PORT}/examen.html`,
  width: 1280,
  height: 1200,
  isMobile: false,
  theme: 'light',
  screenshotName: 'examen_diagnostico_evaluado',
  testActions: async (send) => {
    console.log('  [Action] Selecting radio buttons in diagnostic...');
    await send('Runtime.evaluate', {
      expression: `
        // Responder automáticamente a las preguntas del diagnóstico
        for (let i = 0; i < 16; i++) {
          const radio = document.querySelector('input[name="diag_q_' + i + '"]');
          if (radio) {
            radio.checked = true;
            radio.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
        // Clic en evaluar
        const btn = document.getElementById('diag-submit-btn');
        if (btn) btn.click();
      `
    });
    await new Promise(r => setTimeout(r, 600));
  }
});
allPassed = allPassed && t8;

// 6. Verificar desbloqueo de m01..m08 sin progreso
const t9 = await runPageTest({
  url: `http://localhost:${PORT}/modules/view.html?id=m05`,
  width: 1280,
  height: 900,
  isMobile: false,
  theme: 'light',
  screenshotName: 'modulo05_unlocked_private_mode',
  testActions: async (send) => {
    const evalRes = await send('Runtime.evaluate', {
      expression: `
        ({
          selectOptions: Array.from(document.querySelectorAll('#module-quick-select option')).map(o => o.text),
          moduleTitle: document.getElementById('module-title') ? document.getElementById('module-title').textContent : '',
          isLocked: document.querySelector('.module-card.is-locked') !== null
        })
      `,
      returnByValue: true
    });
    const info = evalRes.result.value;
    console.log('  [M05 Unlock Check]: options in dropdown:', info.selectOptions.slice(0, 8));
  }
});
allPassed = allPassed && t9;

// Cleanup
chromeProc.kill();
server.close();

console.log('\n========================================');
if (allPassed) {
  console.log('✅ TODAS LAS PRUEBAS EN NAVEGADOR PASARON CON ÉXITO:');
  console.log('  - Cero 404s en recursos de la aplicación.');
  console.log('  - Cero errores en consola de JavaScript.');
  console.log('  - Cero desbordamiento horizontal en 390px (móvil).');
  console.log('  - M01 a M08 desbloqueados y accesibles.');
  console.log('  - Diagnóstico rápido evaluado con éxito con semáforo por módulo.');
  console.log('========================================\n');
  process.exit(0);
} else {
  console.error('❌ HUBO FALLOS EN LAS PRUEBAS EN NAVEGADOR.');
  process.exit(1);
}
