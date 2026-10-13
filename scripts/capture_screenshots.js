const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8976;
const ROOT_DIR = path.resolve(__dirname, '..');
const CAPTURAS_DIR = path.join(ROOT_DIR, 'capturas', 'encabezado');

if (!fs.existsSync(CAPTURAS_DIR)) {
  fs.mkdirSync(CAPTURAS_DIR, { recursive: true });
}

// 1. Servidor estático básico
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') safePath = '/index.html';
  const filePath = path.join(ROOT_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found: ' + urlPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

async function main() {
  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
  console.log(`[OK] Servidor local corriendo en http://127.0.0.1:${PORT}`);

  // 2. Iniciar Chrome Headless con puerto CDP
  const CDP_PORT = 9225;
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-extensions',
    '--mute-audio',
    'about:blank'
  ]);

  // Esperar a que el puerto de depuración esté listo
  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      const data = await res.json();
      wsUrl = data.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch (e) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  if (!wsUrl) {
    throw new Error('No se pudo conectar al puerto de depuración de Chrome.');
  }
  console.log('[OK] Conectado a Chrome DevTools Protocol:', wsUrl);

  // Crear una nueva pestaña para el sitio
  const targetRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?http://127.0.0.1:${PORT}/index.html`, {
    method: 'PUT'
  });
  const targetData = await targetRes.json();
  const pageWsUrl = targetData.webSocketDebuggerUrl;

  const ws = new WebSocket(pageWsUrl);
  let id = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      const cb = callbacks.get(msg.id);
      callbacks.delete(msg.id);
      if (msg.error) cb.reject(new Error(msg.error.message));
      else cb.resolve(msg.result);
    }
  };

  await new Promise((resolve) => ws.onopen = resolve);

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const reqId = id++;
      callbacks.set(reqId, { resolve, reject });
      ws.send(JSON.stringify({ id: reqId, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  const failedRequests = [];
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Network.responseReceived') {
      const status = msg.params.response.status;
      if (status >= 400) {
        failedRequests.push({ url: msg.params.response.url, status });
      }
    }
  });

  // Generar estados de progreso
  function buildProgress(dominatedCount) {
    const modules = {};
    for (let i = 1; i <= 11; i++) {
      const mid = 'm' + String(i).padStart(2, '0');
      const isDone = i <= dominatedCount;
      modules[mid] = {
        completed: isDone,
        bestScore: isDone ? 100 : null,
        attempts: isDone ? 1 : 0,
        unlockedManually: i <= dominatedCount + 1,
        flippedCards: [],
        outcomesChecked: [],
        simCompleted: isDone
      };
    }
    return {
      freeReviewMode: false,
      modules: modules
    };
  }

  const scenarios = [
    { name: '1280px-claro-vacio', width: 1280, height: 900, theme: 'light', done: 0, mobile: false },
    { name: '1280px-oscuro-vacio', width: 1280, height: 900, theme: 'dark', done: 0, mobile: false },
    { name: '1280px-claro-7modulos', width: 1280, height: 900, theme: 'light', done: 7, mobile: false },
    { name: '1280px-oscuro-7modulos', width: 1280, height: 900, theme: 'dark', done: 7, mobile: false },
    { name: '390px-claro-vacio', width: 390, height: 1100, theme: 'light', done: 0, mobile: true },
    { name: '390px-oscuro-vacio', width: 390, height: 1100, theme: 'dark', done: 0, mobile: true },
    { name: '390px-claro-7modulos', width: 390, height: 1100, theme: 'light', done: 7, mobile: true },
    { name: '390px-oscuro-7modulos', width: 390, height: 1100, theme: 'dark', done: 7, mobile: true }
  ];

  console.log(`\nGenerando las 8 capturas requeridas en ${CAPTURAS_DIR}...`);

  for (const sc of scenarios) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: sc.width,
      height: sc.height,
      deviceScaleFactor: 2,
      mobile: sc.mobile
    });

    const STORAGE_KEY = 'meto2_progress_2026';
    const THEME_KEY = 'meto2_theme';
    const progressObj = buildProgress(sc.done);
    const setupScript = `
      localStorage.setItem('${THEME_KEY}', '${sc.theme}');
      localStorage.setItem('${STORAGE_KEY}', '${JSON.stringify(progressObj)}');
      document.documentElement.setAttribute('data-theme', '${sc.theme}');
    `;
    await send('Runtime.evaluate', { expression: setupScript });
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/index.html` });

    // Esperar a que la página recargue completamente y renderice los módulos
    await new Promise((r) => setTimeout(r, 1200));

    // Verificar si hay desplazamiento horizontal a 390px
    const overflowEval = await send('Runtime.evaluate', {
      expression: `({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      })`,
      returnByValue: true
    });
    const overflow = overflowEval.result.value;
    if (sc.width === 390) {
      if (overflow.hasHorizontalOverflow) {
        console.warn(`[ALERTA] Desplazamiento horizontal detectado en ${sc.name}: scrollWidth=${overflow.scrollWidth}, clientWidth=${overflow.clientWidth}`);
      } else {
        console.log(`[VERIFICADO] 390px sin desborde horizontal (${sc.name}): scrollWidth=${overflow.scrollWidth}, clientWidth=${overflow.clientWidth}`);
      }
    }

    // Capturar pantalla del encabezado
    // Obtener las dimensiones del elemento .hero
    const clipEval = await send('Runtime.evaluate', {
      expression: `(() => {
        const hero = document.querySelector('.hero');
        if (!hero) return null;
        const rect = hero.getBoundingClientRect();
        return {
          x: 0,
          y: 0,
          width: Math.ceil(rect.width),
          height: Math.ceil(rect.height + 60) // Incluye la barra superior
        };
      })()`,
      returnByValue: true
    });
    const clip = clipEval.result.value;

    const screenshotResult = await send('Page.captureScreenshot', {
      format: 'png',
      clip: clip ? {
        x: clip.x,
        y: clip.y,
        width: clip.width,
        height: Math.min(clip.height, sc.height),
        scale: 1
      } : undefined
    });

    const outPath = path.join(CAPTURAS_DIR, `${sc.name}.png`);
    fs.writeFileSync(outPath, Buffer.from(screenshotResult.data, 'base64'));
    console.log(`[CAPTURADA] ${sc.name}.png (${fs.statSync(outPath).size} bytes)`);
  }

  // Cerrar procesos
  ws.close();
  chromeProcess.kill();
  server.close();
  console.log('\n[FINALIZADO] Todas las capturas generadas con éxito.');
}

main().catch((err) => {
  console.error('[ERROR]', err);
  process.exit(1);
});
