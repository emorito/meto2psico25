/**
 * METODOLOGÍA DE LA INVESTIGACIÓN II — PSICOLOGÍA UNIBE (PLAN 2026)
 * Motor interactivo principal (Catálogo de 11 módulos, Progreso, Multimedia,
 * Cápsulas Metodológicas, Flip-Cards 3D, Minicasos, Simulador y Autoevaluación)
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'meto2_progress_2026';
  const THEME_KEY = 'meto2_theme';
  const TOTAL_MODULES = 11;
  const TOTAL_FLIPCARDS_COURSE = 115;
  const PASS_THRESHOLD = 70;

  const STAGE_MAP = {
    m01: { stage: 1, name: 'Etapa 1 · Fundamentos y Literatura' },
    m02: { stage: 1, name: 'Etapa 1 · Fundamentos y Literatura' },
    m03: { stage: 1, name: 'Etapa 1 · Fundamentos y Literatura' },
    m04: { stage: 2, name: 'Etapa 2 · Planteamiento y Variables' },
    m05: { stage: 2, name: 'Etapa 2 · Planteamiento y Variables' },
    m06: { stage: 2, name: 'Etapa 2 · Planteamiento y Variables' },
    m07: { stage: 3, name: 'Etapa 3 · Estrategia Empírica' },
    m08: { stage: 3, name: 'Etapa 3 · Estrategia Empírica' },
    m09: { stage: 3, name: 'Etapa 3 · Estrategia Empírica' },
    m10: { stage: 4, name: 'Etapa 4 · Análisis y Escritura' },
    m11: { stage: 4, name: 'Etapa 4 · Análisis y Escritura' }
  };

  /* ========================================================================
     1. UTILIDADES DE FORMATO Y SEGURIDAD HTML
     ======================================================================== */
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatInlineMarkdown(str) {
    const safe = escapeHtml(str);
    return safe
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>');
  }

  function shuffleArray(arr) {
    const copy = Array.isArray(arr) ? arr.slice() : [];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function normalizeModuleId(rawId) {
    if (!rawId) return 'm01';
    const clean = String(rawId).trim().toLowerCase();
    if (/^m\d{2}$/.test(clean)) return clean;
    const match = clean.match(/(\d+)/);
    if (match) {
      const num = Math.max(1, Math.min(TOTAL_MODULES, parseInt(match[1], 10)));
      return 'm' + String(num).padStart(2, '0');
    }
    return 'm01';
  }

  /* ========================================================================
     2. GESTIÓN DE TEMA CLARO / OSCURO
     ======================================================================== */
  function getActiveTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  function applyTheme(theme) {
    const valid = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', valid);
    try {
      localStorage.setItem(THEME_KEY, valid);
    } catch (e) {}

    const iconEl = document.getElementById('theme-toggle-icon');
    const textEl = document.getElementById('theme-toggle-text');
    if (iconEl) iconEl.textContent = valid === 'dark' ? '☀️' : '🌙';
    if (textEl) textEl.textContent = valid === 'dark' ? 'Modo claro' : 'Modo oscuro';
  }

  function initTopbarScrollBehavior() {
    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
    const topbarEl = document.querySelector('.site-topbar');
    if (!topbarEl) return;
    window.addEventListener('scroll', function () {
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      if (currentScrollY > 75 && currentScrollY > lastScrollY) {
        topbarEl.classList.add('is-scrolled-down');
      } else {
        topbarEl.classList.remove('is-scrolled-down');
      }
      lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
    }, { passive: true });
  }

  function initThemeToggle() {
    applyTheme(getActiveTheme());
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        const next = getActiveTheme() === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    }
    initTopbarScrollBehavior();
  }

  /* ========================================================================
     3. GESTIÓN DE PROGRESO EN LOCALSTORAGE
     ======================================================================== */
  function createDefaultProgress() {
    const modules = {};
    for (let i = 1; i <= TOTAL_MODULES; i++) {
      const id = 'm' + String(i).padStart(2, '0');
      modules[id] = {
        completed: false,
        bestScore: null,
        attempts: 0,
        unlockedManually: i === 1,
        flippedCards: [],
        outcomesChecked: [],
        simCompleted: false
      };
    }
    return {
      freeReviewMode: false,
      modules: modules
    };
  }

  function loadProgress() {
    const base = createDefaultProgress();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return base;
      const parsed = JSON.parse(raw);
      if (typeof parsed.freeReviewMode === 'boolean') {
        base.freeReviewMode = parsed.freeReviewMode;
      }
      if (parsed.modules && typeof parsed.modules === 'object') {
        Object.keys(base.modules).forEach(function (id) {
          if (parsed.modules[id]) {
            base.modules[id] = Object.assign({}, base.modules[id], parsed.modules[id]);
            if (!Array.isArray(base.modules[id].flippedCards)) base.modules[id].flippedCards = [];
            if (!Array.isArray(base.modules[id].outcomesChecked)) base.modules[id].outcomesChecked = [];
          }
        });
      }
    } catch (e) {}
    return base;
  }

  function saveProgress(progress) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {}
  }

  function isModuleUnlocked(modId, progress) {
    const num = parseInt(modId.slice(1), 10);
    // Tarea A2: m01 a m08 (clases 1 a 9 que entran en el parcial) quedan SIEMPRE abiertos
    if (num >= 1 && num <= 8) return true;
    if (progress.freeReviewMode) return true;
    const modState = progress.modules[modId];
    if (modState && modState.unlockedManually) return true;
    if (modState && modState.completed) return true;

    if (num > 1) {
      const prevId = 'm' + String(num - 1).padStart(2, '0');
      const prevState = progress.modules[prevId];
      if (prevState && prevState.completed) return true;
    }
    return false;
  }

  function computeCourseStats(progress) {
    let completedCount = 0;
    let scoreSum = 0;
    let scoredModules = 0;
    let flippedTotal = 0;
    let simTotal = 0;

    Object.keys(progress.modules).forEach(function (id) {
      const m = progress.modules[id];
      if (m.completed) completedCount++;
      if (typeof m.bestScore === 'number') {
        scoreSum += m.bestScore;
        scoredModules++;
      }
      if (Array.isArray(m.flippedCards)) {
        flippedTotal += m.flippedCards.length;
      }
      if (m.simCompleted) simTotal++;
    });

    return {
      completedCount: completedCount,
      completedPct: Math.round((completedCount / TOTAL_MODULES) * 100),
      avgScore: scoredModules > 0 ? Math.round(scoreSum / scoredModules) : null,
      flippedTotal: Math.min(TOTAL_FLIPCARDS_COURSE, flippedTotal),
      simTotal: simTotal
    };
  }

  /* ========================================================================
     4. PÁGINA DE INICIO (INDEX.HTML)
     ======================================================================== */
  async function initHomePage() {
    let modulosList = [];
    try {
      const res = await fetch('data/modulos.json');
      const data = await res.json();
      modulosList = Array.isArray(data) ? data : (data.modulos || []);
    } catch (err) {
      const grid = document.getElementById('modules-grid');
      if (grid) {
        grid.innerHTML = '<div class="dashboard-panel"><p>Error al cargar data/modulos.json. Verifica que el servidor local esté activo.</p></div>';
      }
      return;
    }

    let activeStage = 'all';
    let searchQuery = '';

    function renderHeroRouteAndWeek(list, progress, stats) {
      if (!Array.isArray(list) || list.length === 0) return;

      // 1. Encontrar el módulo para "Continuar con el módulo N"
      // Regla: el primer módulo abierto y no dominado; si todos están dominados, el último.
      let currentMod = null;
      for (let i = 0; i < list.length; i++) {
        const m = list[i];
        const mState = progress.modules[m.id] || {};
        if (!mState.completed) {
          currentMod = m;
          break;
        }
      }
      if (!currentMod) {
        currentMod = list[list.length - 1];
      }

      // Evento de evaluación institucional
      const EXAMEN_EVENT = {
        tipo: 'examen',
        nombre: 'Examen parcial',
        fecha: '2026-10-13',
        modulos: ['m01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08'],
        duracion_min: 60
      };

      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const todayStr = y + '-' + m + '-' + d;

      const examDate = new Date(EXAMEN_EVENT.fecha + 'T00:00:00');
      const nowDateOnly = new Date(todayStr + 'T00:00:00');
      const diffDays = Math.round((examDate.getTime() - nowDateOnly.getTime()) / (1000 * 60 * 60 * 24));
      const examActive = diffDays >= 0 && diffDays <= 7;

      const continueBtn = document.getElementById('hero-continue-btn');
      const continueNum = document.getElementById('hero-continue-num');
      const continueTitle = document.getElementById('hero-continue-title');
      if (continueBtn) {
        if (examActive) {
          continueBtn.href = 'examen.html';
          continueBtn.innerHTML =
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>' +
            '<span>Preparación para el parcial<small>Diagnóstico rápido (16 ítems) y simulacro de 60 min</small></span>';
        } else if (currentMod) {
          continueBtn.href = 'modules/view.html?id=' + encodeURIComponent(currentMod.id);
          if (continueNum) continueNum.textContent = String(currentMod.number || 1);
          if (continueTitle) continueTitle.textContent = currentMod.title || '';
        }
      }

      // 2. Repaso de hoy · N ítems (oculto si no existe repaso espaciado)
      const reviewBtn = document.getElementById('hero-review-btn');
      const reviewCountEl = document.getElementById('hero-review-count');
      const dueCount = (progress.spacedReview && progress.spacedReview.dueCount) || 0;
      if (reviewBtn) {
        if (dueCount > 0) {
          reviewBtn.style.display = 'inline-flex';
          if (reviewCountEl) reviewCountEl.textContent = dueCount + ' ítems';
        } else {
          reviewBtn.style.display = 'none';
        }
      }

      // 3. "Esta semana": evaluación de examen o próxima clase según fecha actual
      let nextClassMod = null;
      for (let i = 0; i < list.length; i++) {
        const mod = list[i];
        if (mod.fecha_clase && mod.fecha_clase >= todayStr) {
          nextClassMod = mod;
          break;
        }
      }

      const weekWhen = document.getElementById('hero-week-when');
      const weekList = document.getElementById('hero-week-list');

      if (weekWhen && weekList) {
        if (examActive) {
          const diasTexto = diffDays === 0 ? 'hoy, 13/10' : (diffDays === 1 ? 'mañana' : ('en ' + diffDays + ' días'));
          weekWhen.innerHTML = 'Examen parcial · <span>' + diasTexto + '</span>';
          weekList.innerHTML =
            '<li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/></svg><span><b>Qué entra:</b> clases 1 a 9 (módulos 1 al 8).</span></li>' +
            '<li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></svg><span><b>Formato:</b> 60 minutos, un único intento, sin IA.</span></li>' +
            '<li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg><span><b>Preparación:</b> <a href="examen.html" style="color:var(--accent);font-weight:600;text-decoration:underline;">diagnóstico y simulacro en examen.html →</a></span></li>';
        } else if (nextClassMod) {
          const claseNum = nextClassMod.clase_numero || nextClassMod.clase_2026 || '';
          const fechaTxt = nextClassMod.fecha_clase_texto || nextClassMod.fecha_display || '';
          weekWhen.innerHTML = 'Clase ' + escapeHtml(String(claseNum)) + ' · <span>' + escapeHtml(fechaTxt) + '</span>';

          const sem = nextClassMod.semana_tarea || {};
          const antesTxt = sem.antes || ('lectura de preparación del módulo ' + (nextClassMod.number || '') + '.');
          const despuesTxt = sem.despues || ('verificación de dominio del módulo ' + (nextClassMod.number || '') + '.');
          const entregaTxt = sem.entrega_moodle || 'evidencia en Moodle según cronograma.';

          weekList.innerHTML =
            '<li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/></svg><span><b>Antes:</b> ' + escapeHtml(antesTxt) + '</span></li>' +
            '<li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><span><b>Después:</b> ' + escapeHtml(despuesTxt) + '</span></li>' +
            '<li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg><span><b>Entrega en Moodle:</b> ' + escapeHtml(entregaTxt) + '</span></li>';
        } else {
          weekWhen.innerHTML = 'Cierre de semestre · <span>Examen Final</span>';
          weekList.innerHTML =
            '<li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/></svg><span><b>Antes:</b> repaso integral de los 11 módulos del proyecto.</span></li>' +
            '<li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><span><b>Después:</b> defensa y presentación del borrador fundamentado.</span></li>' +
            '<li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg><span><b>Entrega en Moodle:</b> portafolio final integrado según calendario institucional.</span></li>';
        }
      }

      // 4. "La ruta del proyecto"
      const routeSummary = document.getElementById('route-progress-summary');
      if (routeSummary) {
        routeSummary.textContent = stats.completedCount + ' de ' + list.length + ' módulos dominados';
      }

      const routeTitleEl = document.querySelector('.route-head h2');
      if (routeTitleEl) {
        routeTitleEl.innerHTML = 'La ruta del proyecto' + (examActive ? ' <span class="exam-pill" title="Módulos evaluados en el parcial">Entra en el parcial (1 a 8)</span>' : '');
      }

      let maxCompletedIdx = -1;
      for (let i = 0; i < list.length; i++) {
        const mState = progress.modules[list[i].id] || {};
        if (mState.completed) {
          maxCompletedIdx = i;
        }
      }

      let doneH = 0;
      let doneV = 0;
      if (maxCompletedIdx >= 0) {
        if (maxCompletedIdx === list.length - 1) {
          doneH = 91;
          doneV = 100;
        } else {
          doneH = Math.round((maxCompletedIdx / (list.length - 1)) * 91 * 10) / 10;
          doneV = Math.round(((maxCompletedIdx + 1) / list.length) * 100);
        }
      }

      const stepsOl = document.getElementById('project-route-steps');
      if (stepsOl) {
        stepsOl.style.setProperty('--done', doneH + '%');
        stepsOl.style.setProperty('--done-v', doneV + '%');

        const STAGE_GROUPS = [
          { id: 'stage-col-1', name: 'Fundamentos y literatura', mods: ['m01', 'm02', 'm03'] },
          { id: 'stage-col-2', name: 'Planteamiento y variables', mods: ['m04', 'm05', 'm06'] },
          { id: 'stage-col-3', name: 'Estrategia empírica', mods: ['m07', 'm08', 'm09'] },
          { id: 'stage-col-4', name: 'Análisis y escritura', mods: ['m10', 'm11'] }
        ];

        STAGE_GROUPS.forEach(function (sg) {
          const colEl = document.getElementById(sg.id);
          if (!colEl) return;
          const allDone = sg.mods.every(function (mid) {
            return progress.modules[mid] && progress.modules[mid].completed;
          });
          const isCurrentStage = currentMod && sg.mods.indexOf(currentMod.id) !== -1;
          colEl.className = 'stage' + (allDone ? ' is-done' : (isCurrentStage ? ' is-current' : ''));
        });

        const nextClassModId = nextClassMod ? nextClassMod.id : null;

        let stepsHtml = '';
        list.forEach(function (modItem, idx) {
          if (modItem.id === 'm01') stepsHtml += '<li class="stage-inline" aria-hidden="true">Fundamentos y literatura</li>';
          else if (modItem.id === 'm04') stepsHtml += '<li class="stage-inline" aria-hidden="true">Planteamiento y variables</li>';
          else if (modItem.id === 'm07') stepsHtml += '<li class="stage-inline" aria-hidden="true">Estrategia empírica</li>';
          else if (modItem.id === 'm10') stepsHtml += '<li class="stage-inline" aria-hidden="true">Análisis y escritura</li>';

          const mState = progress.modules[modItem.id] || {};
          const isDone = Boolean(mState.completed);
          const isCurrent = !isDone && currentMod && currentMod.id === modItem.id;
          const isNext = !isDone && !isCurrent && nextClassModId && nextClassModId === modItem.id;

          let stepClass = 'step';
          let statusText = 'Por venir';
          if (isDone) {
            stepClass += ' is-done';
            statusText = 'Dominado';
          } else if (isCurrent) {
            stepClass += ' is-current';
            statusText = 'En curso';
          } else if (isNext) {
            stepClass += ' is-next';
            statusText = 'Próxima clase';
          }

          let dateLabel = modItem.fecha_display || '';
          if (isCurrent) {
            dateLabel = 'En curso';
          } else if (isNext) {
            dateLabel = 'Clase ' + (modItem.fecha_display || '');
          }

          const ariaCurrentAttr = isCurrent ? ' aria-current="step"' : '';
          const modNumber = modItem.number || (idx + 1);
          if (examActive && modNumber <= 8) {
            stepClass += ' in-exam';
          }
          const shortTitle = modItem.short_title || modItem.title;

          stepsHtml +=
            '<li class="' + stepClass + '">' +
              '<a href="modules/view.html?id=' + encodeURIComponent(modItem.id) + '"' + ariaCurrentAttr + '>' +
                '<span class="dot" aria-label="Módulo ' + modNumber + ': ' + statusText + '">' + modNumber + '</span>' +
                '<span class="meta">' +
                  '<span class="label">' + escapeHtml(shortTitle) + '</span>' +
                  '<span class="date">' + escapeHtml(dateLabel) + '</span>' +
                '</span>' +
              '</a>' +
            '</li>';
        });

        stepsOl.innerHTML = stepsHtml;

        const legendEl = document.querySelector('.hero .legend');
        if (legendEl) {
          const existingExamLegend = legendEl.querySelector('.l-exam-item');
          if (examActive && !existingExamLegend) {
            const examSpan = document.createElement('span');
            examSpan.className = 'l-exam-item';
            examSpan.innerHTML = '<i class="l-exam"></i>Entra en el parcial (1 al 8)';
            legendEl.appendChild(examSpan);
          } else if (!examActive && existingExamLegend) {
            existingExamLegend.remove();
          }
        }
      }
    }

    function renderDashboardAndCatalog() {
      const progress = loadProgress();
      const stats = computeCourseStats(progress);
      renderHeroRouteAndWeek(modulosList, progress, stats);

      const elCompleted = document.getElementById('stat-completed');
      const elCompletedPct = document.getElementById('stat-completed-pct');
      const elAvg = document.getElementById('stat-avg-score');
      const elFlip = document.getElementById('stat-flipcards');
      const elSim = document.getElementById('stat-simulations');
      const elFill = document.getElementById('global-progress-fill');
      const elBar = document.getElementById('global-progress-bar');

      if (elCompleted) elCompleted.textContent = stats.completedCount + ' / ' + TOTAL_MODULES;
      if (elCompletedPct) elCompletedPct.textContent = stats.completedPct + '% del recorrido completado';
      if (elAvg) elAvg.textContent = stats.avgScore !== null ? stats.avgScore + '%' : '—';
      if (elFlip) elFlip.textContent = stats.flippedTotal + ' / ' + TOTAL_FLIPCARDS_COURSE;
      if (elSim) elSim.textContent = stats.simTotal + ' / ' + TOTAL_MODULES;
      if (elFill) elFill.style.width = stats.completedPct + '%';
      if (elBar) elBar.setAttribute('aria-valuenow', String(stats.completedPct));

      const topToggle = document.getElementById('free-review-toggle');
      const topIcon = document.getElementById('free-review-icon');
      const topLabel = document.getElementById('free-review-label');
      const dashBtn = document.getElementById('unlock-all-btn');

      if (topToggle) {
        topToggle.setAttribute('aria-pressed', String(progress.freeReviewMode));
        topToggle.classList.toggle('is-active', progress.freeReviewMode);
      }
      if (topIcon) topIcon.textContent = progress.freeReviewMode ? '🔓' : '🔒';
      if (topLabel) topLabel.textContent = progress.freeReviewMode ? 'Repaso Libre Activo' : 'Modo Secuencial';
      if (dashBtn) {
        dashBtn.textContent = progress.freeReviewMode ? '🔒 Volver a Modo Secuencial' : '🔓 Activar Repaso Libre';
      }

      const q = searchQuery.trim().toLowerCase();
      const filtered = modulosList.filter(function (m) {
        const stInfo = STAGE_MAP[m.id] || { stage: 1, name: 'Etapa 1' };
        const stageNum = m.etapa_num || m.stageNumber || stInfo.stage;
        if (activeStage !== 'all' && String(stageNum) !== String(activeStage)) {
          return false;
        }
        if (!q) return true;
        const haystack = [
          m.id,
          m.title,
          m.nombre,
          m.proposito,
          m.clase_2026,
          m.titulo_clase_plan_2026,
          m.etapa,
          stInfo.name,
          (m.subtemas_labels || []).join(' '),
          (m.resultados || []).join(' ')
        ].join(' ').toLowerCase();
        return haystack.indexOf(q) !== -1;
      });

      const countLabel = document.getElementById('catalog-count-label');
      if (countLabel) {
        countLabel.textContent = 'Mostrando ' + filtered.length + ' de ' + modulosList.length + ' módulos';
      }

      const grid = document.getElementById('modules-grid');
      if (!grid) return;

      if (filtered.length === 0) {
        grid.innerHTML =
          '<div class="dashboard-panel" style="grid-column: 1 / -1; text-align: center;">' +
          '<h3>No se encontraron módulos para tu búsqueda</h3>' +
          '<p class="stat-meta" style="margin-top:0.4rem;">Prueba con otro término (ej. hipótesis, diseño, muestreo, APA, Zotero) o selecciona "Todos los módulos".</p>' +
          '</div>';
        return;
      }

      grid.innerHTML = filtered.map(function (m) {
        const modState = progress.modules[m.id] || {};
        const unlocked = isModuleUnlocked(m.id, progress);
        const stInfo = STAGE_MAP[m.id] || { stage: 1, name: 'Etapa 1' };
        const stageNum = m.etapa_num || m.stageNumber || stInfo.stage;
        const stageLabel = m.etapa || m.stageName || stInfo.name;
        const modNum = m.number || m.orden || parseInt(m.id.slice(1), 10);
        const classLabel = m.clase_2026 ? ('Clases ' + m.clase_2026 + ' · Plan 2026') : ('Módulo ' + modNum);
        const iconPrefix = m.icon ? (m.icon + ' ') : '';
        const titleText = iconPrefix + 'Módulo ' + modNum + ': ' + (m.title || m.nombre);
        const descText = m.proposito || m.description || '';

        let statusBadgeHtml = '';
        if (modState.completed) {
          const scoreTxt = typeof modState.bestScore === 'number' ? ' · ' + modState.bestScore + '%' : '';
          statusBadgeHtml = '<span class="status-badge completed">✅ Completado' + scoreTxt + '</span>';
        } else if (unlocked) {
          if (modState.unlockedManually && m.id !== 'm01' && !progress.freeReviewMode) {
            statusBadgeHtml = '<span class="status-badge unlocked">🔓 Desbloqueado</span>';
          } else {
            statusBadgeHtml = '<span class="status-badge in-progress">📘 Disponible</span>';
          }
        } else {
          statusBadgeHtml = '<span class="status-badge locked">🔒 Bloqueado</span>';
        }

        const counts = m.counts || {};
        const videoPill = (counts.videos || 0) > 0
          ? '🎬 ' + counts.videos + (counts.videos > 1 ? ' videos' : ' video')
          : '🧭 Guía interactiva';
        const pdfPill = '📄 ' + (counts.readings || 1) + ' PDF';
        const cardsPill = '🃏 ' + (counts.flipCards || 10) + ' tarjetas';
        const quizPill = '✅ ' + (counts.quiz || counts.quizItems || 16) + ' ítems';

        let actionHtml = '';
        if (unlocked) {
          actionHtml =
            '<a href="modules/view.html?id=' + encodeURIComponent(m.id) + '" class="btn btn-primary">' +
            (modState.completed ? 'Repasar módulo →' : 'Estudiar módulo →') +
            '</a>';
        } else {
          actionHtml =
            '<div class="module-card-actions">' +
            '<button type="button" class="btn btn-outline js-unlock-single" data-mod-id="' + escapeHtml(m.id) + '" title="Desbloquear este módulo manualmente para estudiarlo hoy">' +
            '🔓 Desbloquear' +
            '</button>' +
            '</div>';
        }

        return (
          '<article class="module-card ' + (unlocked ? '' : 'is-locked') + '" data-stage="' + stageNum + '">' +
            '<div>' +
              '<div class="module-card-header">' +
                '<span class="module-stage-pill">' + escapeHtml(stageLabel) + '</span>' +
                '<span class="module-class-badge">' + escapeHtml(classLabel) + '</span>' +
              '</div>' +
              '<h3 class="module-card-title">' + escapeHtml(titleText) + '</h3>' +
              '<p class="module-card-desc">' + formatInlineMarkdown(descText) + '</p>' +
              '<div class="module-resource-pills">' +
                '<span class="resource-mini-pill">' + escapeHtml(videoPill) + '</span>' +
                '<span class="resource-mini-pill">' + escapeHtml(pdfPill) + '</span>' +
                '<span class="resource-mini-pill">' + escapeHtml(cardsPill) + '</span>' +
                '<span class="resource-mini-pill">' + escapeHtml(quizPill) + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="module-card-footer">' +
              statusBadgeHtml +
              actionHtml +
            '</div>' +
          '</article>'
        );
      }).join('');

      grid.querySelectorAll('.js-unlock-single').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const targetId = btn.getAttribute('data-mod-id');
          const curr = loadProgress();
          if (curr.modules[targetId]) {
            curr.modules[targetId].unlockedManually = true;
            saveProgress(curr);
            renderDashboardAndCatalog();
          }
        });
      });
    }

    const stageTabs = document.getElementById('stage-tabs');
    if (stageTabs) {
      stageTabs.querySelectorAll('.stage-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
          stageTabs.querySelectorAll('.stage-tab').forEach(function (t) {
            t.classList.remove('is-active');
            t.setAttribute('aria-selected', 'false');
          });
          tab.classList.add('is-active');
          tab.setAttribute('aria-selected', 'true');
          activeStage = tab.getAttribute('data-stage') || 'all';
          renderDashboardAndCatalog();
        });
      });
    }

    const searchInput = document.getElementById('module-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        searchQuery = searchInput.value || '';
        renderDashboardAndCatalog();
      });
    }

    const toggleFiltersBtn = document.getElementById('toggle-filters-btn');
    const catalogControls = document.querySelector('.catalog-controls');
    if (toggleFiltersBtn && catalogControls) {
      toggleFiltersBtn.addEventListener('click', function () {
        const expanded = catalogControls.classList.toggle('is-filters-expanded');
        toggleFiltersBtn.setAttribute('aria-expanded', String(expanded));
        toggleFiltersBtn.textContent = expanded ? '▲ Ocultar filtros por etapa' : '🔍 Filtrar temas por etapa (11) ▾';
      });
    }

    function toggleFreeReview() {
      const curr = loadProgress();
      curr.freeReviewMode = !curr.freeReviewMode;
      saveProgress(curr);
      renderDashboardAndCatalog();
    }

    const topFreeBtn = document.getElementById('free-review-toggle');
    const dashFreeBtn = document.getElementById('unlock-all-btn');
    if (topFreeBtn) topFreeBtn.addEventListener('click', toggleFreeReview);
    if (dashFreeBtn) dashFreeBtn.addEventListener('click', toggleFreeReview);

    const resetBtn = document.getElementById('reset-progress-btn');
    if (resetBtn) {
      let confirmingReset = false;
      let resetTimer = null;
      resetBtn.addEventListener('click', function () {
        if (!confirmingReset) {
          confirmingReset = true;
          resetBtn.textContent = '⚠️ ¿Confirmar reinicio total? Hacé clic de nuevo';
          resetBtn.classList.add('btn-outline');
          resetTimer = setTimeout(function () {
            confirmingReset = false;
            resetBtn.textContent = '↺ Reiniciar progreso';
            resetBtn.classList.remove('btn-outline');
          }, 4000);
        } else {
          clearTimeout(resetTimer);
          confirmingReset = false;
          const fresh = createDefaultProgress();
          saveProgress(fresh);
          resetBtn.textContent = '✅ Progreso reiniciado';
          setTimeout(function () {
            resetBtn.textContent = '↺ Reiniciar progreso';
            resetBtn.classList.remove('btn-outline');
          }, 1800);
          renderDashboardAndCatalog();
        }
      });
    }

    renderDashboardAndCatalog();
  }

  /* ========================================================================
     5. VISTA DE MÓDULO (MODULES/VIEW.HTML)
     ======================================================================== */
  async function initModulePage() {
    const params = new URLSearchParams(window.location.search);
    const moduleId = normalizeModuleId(params.get('id'));

    let modulosCatalog = [];
    let moduleData = null;

    try {
      const [catRes, modRes] = await Promise.all([
        fetch('../data/modulos.json'),
        fetch('../data/' + moduleId + '.json')
      ]);
      const catJson = await catRes.json();
      modulosCatalog = Array.isArray(catJson) ? catJson : (catJson.modulos || []);
      moduleData = await modRes.json();
    } catch (err) {
      const titleEl = document.getElementById('module-title');
      if (titleEl) titleEl.textContent = 'No se pudo cargar el módulo ' + moduleId;
      return;
    }

    const progress = loadProgress();
    if (!progress.modules[moduleId]) {
      progress.modules[moduleId] = {
        completed: false,
        bestScore: null,
        attempts: 0,
        unlockedManually: true,
        flippedCards: [],
        outcomesChecked: [],
        simCompleted: false
      };
      saveProgress(progress);
    }

    const modNum = moduleData.number || moduleData.orden || parseInt(moduleId.slice(1), 10);
    document.title = 'Módulo ' + modNum + ': ' + (moduleData.title || moduleData.nombre) + ' | Metodología II — UNIBE';

    function updateTopbarAndHeroStatus() {
      const curr = loadProgress();
      const stats = computeCourseStats(curr);
      const mState = curr.modules[moduleId] || {};

      const progTxt = document.getElementById('topbar-progress-text');
      const progFill = document.getElementById('topbar-progress-fill');
      if (progTxt) progTxt.textContent = stats.completedCount + '/' + TOTAL_MODULES + ' aprobados';
      if (progFill) progFill.style.width = stats.completedPct + '%';

      const selectEl = document.getElementById('module-quick-select');
      if (selectEl) {
        selectEl.innerHTML = modulosCatalog.map(function (item) {
          const st = curr.modules[item.id] || {};
          const unlocked = isModuleUnlocked(item.id, curr);
          const prefix = st.completed ? '✅ ' : (unlocked ? '📘 ' : '🔒 ');
          const selected = item.id === moduleId ? ' selected' : '';
          const n = item.number || item.orden || parseInt(item.id.slice(1), 10);
          return '<option value="' + escapeHtml(item.id) + '"' + selected + '>' +
            escapeHtml(prefix + 'M' + n + ' · ' + (item.title || item.nombre)) +
            '</option>';
        }).join('');

        const selectMobileEl = document.getElementById('module-quick-select-mobile');
        if (selectMobileEl) {
          selectMobileEl.innerHTML = selectEl.innerHTML;
        }
      }

      const mobileProgTxt = document.getElementById('mobile-progress-text');
      if (mobileProgTxt) {
        mobileProgTxt.textContent = stats.completedCount + '/' + TOTAL_MODULES + ' aprobados';
      }

      const statusBadge = document.getElementById('module-status-badge');
      if (statusBadge) {
        if (mState.completed) {
          statusBadge.className = 'status-badge completed';
          statusBadge.textContent = '✅ Módulo aprobado' + (typeof mState.bestScore === 'number' ? ' (' + mState.bestScore + '%)' : '');
        } else {
          statusBadge.className = 'status-badge in-progress';
          statusBadge.textContent = '📘 En estudio';
        }
      }
    }

    const selectEl = document.getElementById('module-quick-select');
    if (selectEl) {
      selectEl.addEventListener('change', function () {
        const target = selectEl.value;
        if (target && target !== moduleId) {
          window.location.href = 'view.html?id=' + encodeURIComponent(target);
        }
      });
    }

    const selectMobileEl = document.getElementById('module-quick-select-mobile');
    if (selectMobileEl) {
      selectMobileEl.addEventListener('change', function () {
        const target = selectMobileEl.value;
        if (target && target !== moduleId) {
          window.location.href = 'view.html?id=' + encodeURIComponent(target);
        }
      });
    }

    // Poblar Cabecera del Módulo
    const stInfo = STAGE_MAP[moduleId] || { stage: 1, name: 'Etapa 1' };
    const stageBadge = document.getElementById('module-stage-badge');
    const classBadge = document.getElementById('module-class-badge');
    const titleEl = document.getElementById('module-title');
    const purposeEl = document.getElementById('module-purpose');

    if (stageBadge) stageBadge.textContent = moduleData.etapa || moduleData.stageName || stInfo.name;
    if (classBadge) {
      classBadge.textContent = moduleData.titulo_clase_plan_2026 ||
        (moduleData.clase_2026 ? ('Clases ' + moduleData.clase_2026 + ' · Plan 2026') : ('Módulo ' + modNum));
    }
    if (titleEl) {
      const iconPrefix = moduleData.icon ? (moduleData.icon + ' ') : '';
      titleEl.textContent = iconPrefix + 'Módulo ' + modNum + ': ' + (moduleData.title || moduleData.nombre);
    }
    if (purposeEl) purposeEl.innerHTML = formatInlineMarkdown(moduleData.proposito || moduleData.description || '');

    updateTopbarAndHeroStatus();

    // Poblar Resultados de Aprendizaje Esperados (Interactivos)
    const outcomes = moduleData.resultados || moduleData.resultados_aprendizaje || [];
    const outcomesListEl = document.getElementById('outcomes-list');
    const outcomesCounterEl = document.getElementById('outcomes-counter');

    function renderOutcomes() {
      const curr = loadProgress();
      const checkedArr = curr.modules[moduleId].outcomesChecked || [];
      if (outcomesCounterEl) {
        outcomesCounterEl.textContent = checkedArr.length + ' de ' + outcomes.length + ' logrados';
      }
      if (!outcomesListEl) return;
      outcomesListEl.innerHTML = outcomes.map(function (txt, idx) {
        const isChecked = checkedArr.indexOf(idx) !== -1;
        return (
          '<li class="outcome-item">' +
            '<label>' +
              '<input type="checkbox" data-outcome-idx="' + idx + '"' + (isChecked ? ' checked' : '') + '>' +
              '<span>' + formatInlineMarkdown(txt) + '</span>' +
            '</label>' +
          '</li>'
        );
      }).join('');

      outcomesListEl.querySelectorAll('input[type="checkbox"]').forEach(function (chk) {
        chk.addEventListener('change', function () {
          const idx = parseInt(chk.getAttribute('data-outcome-idx'), 10);
          const p = loadProgress();
          const list = p.modules[moduleId].outcomesChecked || [];
          const pos = list.indexOf(idx);
          if (chk.checked && pos === -1) list.push(idx);
          if (!chk.checked && pos !== -1) list.splice(pos, 1);
          p.modules[moduleId].outcomesChecked = list;
          saveProgress(p);
          if (outcomesCounterEl) {
            outcomesCounterEl.textContent = list.length + ' de ' + outcomes.length + ' logrados';
          }
        });
      });
    }
    renderOutcomes();

    // ----------------------------------------------------------------------
    // SECCIÓN 1: MULTIMEDIA, VIDEOS Y LECTURAS
    // ----------------------------------------------------------------------
    const resources = moduleData.resources || {};
    const videos = Array.isArray(resources.videos) ? resources.videos : [];
    const readings = Array.isArray(resources.readings) ? resources.readings : [];
    const notebooks = Array.isArray(resources.notebooks) ? resources.notebooks : [];

    const videoTabsEl = document.getElementById('video-tabs');
    const mediaStageEl = document.getElementById('media-stage');

    function renderVideoAtIndex(idx) {
      const v = videos[idx];
      if (!v || !mediaStageEl) return;
      const embedUrl = v.embedUrl || (v.videoId ? ('https://www.youtube.com/embed/' + v.videoId) : v.url);
      mediaStageEl.innerHTML =
        '<div class="video-aspect-box">' +
          '<iframe src="' + escapeHtml(embedUrl) + '" ' +
            'title="' + escapeHtml(v.title || 'Video de la clase') + '" ' +
            'loading="lazy" ' +
            'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
            'allowfullscreen>' +
          '</iframe>' +
        '</div>';
    }

    if (videos.length > 0) {
      if (videos.length > 1 && videoTabsEl) {
        videoTabsEl.hidden = false;
        videoTabsEl.innerHTML = videos.map(function (v, i) {
          return (
            '<button type="button" class="video-tab-btn ' + (i === 0 ? 'is-active' : '') + '" data-video-idx="' + i + '">' +
              '🎬 ' + escapeHtml(v.title || ('Parte ' + (i + 1))) +
            '</button>'
          );
        }).join('');

        videoTabsEl.querySelectorAll('.video-tab-btn').forEach(function (btn) {
          btn.addEventListener('click', function () {
            videoTabsEl.querySelectorAll('.video-tab-btn').forEach(function (b) {
              b.classList.remove('is-active');
            });
            btn.classList.add('is-active');
            renderVideoAtIndex(parseInt(btn.getAttribute('data-video-idx'), 10));
          });
        });
      }
      renderVideoAtIndex(0);
    } else if (mediaStageEl) {
      const sg = moduleData.studyGuide || {};
      const steps = Array.isArray(sg.steps) ? sg.steps : [
        {
          title: 'Delimitación temática (5 criterios)',
          detail: 'Acota tu idea inicial especificando **fenómeno psicológico**, **población/contexto**, **recorte temporal**, **nivel de análisis** y **viabilidad empírica**.'
        },
        {
          title: 'Ecuaciones con Operadores Booleanos',
          detail: 'Combina descriptores con **AND** (intersección), **OR** (sinónimos), **NOT** (exclusión), comillas (`"burnout académico"`) y truncamiento (`psicol*`).'
        },
        {
          title: 'Tamizaje en 4 Filtros Sucesivos',
          detail: '1° Título y año → 2° Resumen (objetivo, muestra, instrumentos) → 3° Método y resultados → 4° Lectura crítica e integración en matriz.'
        },
        {
          title: 'Protocolo VERA para uso ético de IA',
          detail: '**V**erificar que cada DOI exista, **E**valuar pertinencia real, **R**eescribir con voz propia y transparentar el **A**poyo tecnológico sin delegar la autoría.'
        }
      ];
      mediaStageEl.innerHTML =
        '<div class="study-guide-interactive">' +
          '<span class="module-stage-pill">🧭 Ruta Guiada de Laboratorio Documental</span>' +
          '<h3 style="margin-top:0.55rem;">' + escapeHtml(sg.title || 'Estrategia de Delimitación y Búsqueda Científica en Bases de Datos') + '</h3>' +
          '<p class="stat-meta">' + escapeHtml(sg.intro || 'Este módulo es de taller práctico: sigue estos 4 pasos operativos mientras trabajas con las dos guías en PDF adjuntas a la derecha.') + '</p>' +
          '<div class="study-steps-list">' +
            steps.map(function (st, i) {
              return (
                '<div class="study-step-item">' +
                  '<span class="study-step-num">' + (i + 1) + '</span>' +
                  '<div>' +
                    '<h4>' + escapeHtml(st.title) + '</h4>' +
                    '<p class="stat-meta" style="margin-top:0.2rem;">' + formatInlineMarkdown(st.detail) + '</p>' +
                  '</div>' +
                '</div>'
              );
            }).join('') +
          '</div>' +
        '</div>';
    }

    // Poblar Lecturas PDF
    const readingsListEl = document.getElementById('readings-list');
    if (readingsListEl) {
      readingsListEl.innerHTML = readings.map(function (r) {
        const href = r.url.startsWith('http') ? r.url : ('../' + r.url.replace(/^\.\.\//, ''));
        return (
          '<li>' +
            '<a href="' + escapeHtml(href) + '" target="_blank" rel="noopener noreferrer" class="resource-item-link">' +
              '<span>📖 ' + escapeHtml(r.title) + '</span>' +
              '<span class="resource-tag">' + escapeHtml((r.type || 'PDF').toUpperCase()) + '</span>' +
            '</a>' +
          '</li>'
        );
      }).join('');
    }

    // Poblar Cuadernos NotebookLM
    const notebooksListEl = document.getElementById('notebooks-list');
    if (notebooksListEl) {
      if (notebooks.length > 0) {
        notebooksListEl.innerHTML = notebooks.map(function (nb) {
          return (
            '<li>' +
              '<a href="' + escapeHtml(nb.url) + '" target="_blank" rel="noopener noreferrer" class="resource-item-link">' +
                '<span>🧠 ' + escapeHtml(nb.title || 'Cuaderno Interactivo NotebookLM') + '</span>' +
                '<span class="resource-tag">Abrir IA</span>' +
              '</a>' +
            '</li>'
          );
        }).join('');
      } else {
        notebooksListEl.innerHTML =
          '<li class="stat-meta">Utiliza las guías descargables en PDF junto con tu matriz de antecedentes y el gestor Zotero para realizar la práctica de este módulo.</li>';
      }
    }

    // ----------------------------------------------------------------------
    // SECCIÓN 2: CÁPSULA METODOLÓGICA CLAVE (SOPORTE DE BLOQUES RICOS)
    // ----------------------------------------------------------------------
    const capsulaEl = document.getElementById('capsula-container');
    const kt = moduleData.keyTakeaways || moduleData.capsula || {};
    if (capsulaEl) {
      let blocksHtml = '';
      if (Array.isArray(kt.blocks)) {
        blocksHtml = kt.blocks.map(function (blk) {
          if (blk.type === 'table' && Array.isArray(blk.headers) && Array.isArray(blk.rows)) {
            return (
              '<div style="margin-top:1.25rem;">' +
                (blk.title ? '<h4 style="margin-bottom:0.55rem;">📊 ' + escapeHtml(blk.title) + '</h4>' : '') +
                '<div class="capsula-table-wrap">' +
                  '<table class="capsula-table">' +
                    '<thead><tr>' +
                      blk.headers.map(function (h) { return '<th>' + escapeHtml(h) + '</th>'; }).join('') +
                    '</tr></thead>' +
                    '<tbody>' +
                      blk.rows.map(function (row) {
                        return '<tr>' + row.map(function (cell) {
                          return '<td>' + formatInlineMarkdown(cell) + '</td>';
                        }).join('') + '</tr>';
                      }).join('') +
                    '</tbody>' +
                  '</table>' +
                '</div>' +
              '</div>'
            );
          }

          if (blk.type === 'cards' && Array.isArray(blk.items)) {
            return (
              '<div style="margin-top:1.25rem;">' +
                (blk.title ? '<h4 style="margin-bottom:0.65rem;">🧭 ' + escapeHtml(blk.title) + '</h4>' : '') +
                '<div class="capsula-cards-grid">' +
                  blk.items.map(function (item) {
                    return (
                      '<div class="capsula-card-item">' +
                        (item.badge ? '<span class="module-stage-pill" style="display:inline-block; margin-bottom:0.4rem;">' + escapeHtml(item.badge) + '</span>' : '') +
                        '<h4>' + escapeHtml(item.title) + '</h4>' +
                        '<p style="margin-top:0.35rem;">' + formatInlineMarkdown(item.text || item.body || '') + '</p>' +
                      '</div>'
                    );
                  }).join('') +
                '</div>' +
              '</div>'
            );
          }

          if (blk.type === 'checklist' && Array.isArray(blk.items)) {
            return (
              '<div class="capsula-card-item" style="margin-top:1.15rem;">' +
                '<h4>✅ ' + escapeHtml(blk.title || 'Lista de verificación') + '</h4>' +
                '<ul style="padding-left:1.2rem; margin-top:0.5rem; display:grid; gap:0.35rem;">' +
                  blk.items.map(function (it) { return '<li>' + formatInlineMarkdown(it) + '</li>'; }).join('') +
                '</ul>' +
              '</div>'
            );
          }

          if (blk.type === 'highlight') {
            return (
              '<div class="capsula-highlight">' +
                '<strong>💡 ' + escapeHtml(blk.title || 'Regla de Oro Metodológica') + ':</strong> ' +
                formatInlineMarkdown(blk.text || '') +
              '</div>'
            );
          }
          return '';
        }).join('');
      }

      capsulaEl.innerHTML =
        '<div class="capsula-wrapper">' +
          '<h3>' + escapeHtml(kt.title || ('Síntesis Metodológica · ' + (moduleData.title || moduleData.nombre))) + '</h3>' +
          (kt.subtitle ? '<p class="capsula-summary" style="margin-top:0.35rem;">' + formatInlineMarkdown(kt.subtitle) + '</p>' : '') +
          blocksHtml +
        '</div>';
    }

    // ----------------------------------------------------------------------
    // SECCIÓN 3: TARJETAS DE ESTUDIO 3D (FLIP-CARDS)
    // ----------------------------------------------------------------------
    const rawFlipCards = Array.isArray(moduleData.flipCards) ? moduleData.flipCards.slice() : [];
    let currentFlipCards = rawFlipCards.map(function (c, index) {
      return Object.assign({}, c, { _origIdx: index });
    });

    const flipContainer = document.getElementById('flip-cards-container');
    const flipBadge = document.getElementById('flipcards-progress-badge');

    function updateFlipProgressBadge() {
      const p = loadProgress();
      const seen = (p.modules[moduleId] && p.modules[moduleId].flippedCards) || [];
      if (flipBadge) {
        flipBadge.textContent = seen.length + ' / ' + rawFlipCards.length + ' tarjetas exploradas';
        flipBadge.className = seen.length >= rawFlipCards.length ? 'status-badge completed' : 'status-badge in-progress';
      }
    }

    function renderFlipCards() {
      if (!flipContainer) return;
      flipContainer.innerHTML = currentFlipCards.map(function (card, displayIdx) {
        const frontText = card.front || card.question || '';
        const backText = card.back || card.answer || '';
        const tagText = card.tag || card.category || card.subtema || ('Concepto #' + (card._origIdx + 1));
        const hintFrontText = ('ontouchstart' in window || navigator.maxTouchPoints > 0)
          ? 'Tocá para girar'
          : 'Hacé clic o presioná Enter para girar';
        const hintBackText = ('ontouchstart' in window || navigator.maxTouchPoints > 0)
          ? 'Tocá para volver'
          : 'Clic para volver al frente';

        return (
          '<div class="flip-card" tabindex="0" role="button" aria-pressed="false" data-orig-idx="' + card._origIdx + '" aria-label="Tarjeta ' + (displayIdx + 1) + ': ' + escapeHtml(frontText) + '">' +
            '<div class="flip-card-inner">' +
              '<div class="flip-card-face flip-card-front">' +
                '<div class="flip-card-top">' +
                  '<span>' + escapeHtml(tagText) + '</span>' +
                  '<span>#' + (card._origIdx + 1) + '</span>' +
                '</div>' +
                '<div class="flip-card-question">' + formatInlineMarkdown(frontText) + '</div>' +
                '<div class="flip-card-hint">' +
                  '<span>' + hintFrontText + '</span>' +
                  '<span>🔄</span>' +
                '</div>' +
              '</div>' +
              '<div class="flip-card-face flip-card-back">' +
                '<div class="flip-card-top">' +
                  '<span>Respuesta Metodológica</span>' +
                  '<span>✓</span>' +
                '</div>' +
                '<div class="flip-card-answer">' + formatInlineMarkdown(backText) + '</div>' +
                '<div class="flip-card-hint">' +
                  '<span>' + hintBackText + '</span>' +
                  '<span>↩</span>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>'
        );
      }).join('');

      flipContainer.querySelectorAll('.flip-card').forEach(function (cardEl) {
        function toggleCard() {
          const isFlipped = cardEl.classList.toggle('is-flipped');
          cardEl.setAttribute('aria-pressed', String(isFlipped));
          const origIdx = parseInt(cardEl.getAttribute('data-orig-idx'), 10);
          const p = loadProgress();
          const arr = p.modules[moduleId].flippedCards || [];
          if (arr.indexOf(origIdx) === -1) {
            arr.push(origIdx);
            p.modules[moduleId].flippedCards = arr;
            saveProgress(p);
            updateFlipProgressBadge();
          }
        }

        cardEl.addEventListener('click', toggleCard);
        cardEl.addEventListener('keydown', function (ev) {
          if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            toggleCard();
          }
        });
      });

      updateFlipProgressBadge();
    }

    renderFlipCards();

    const flipAllBtn = document.getElementById('flip-all-btn');
    const shuffleCardsBtn = document.getElementById('shuffle-cards-btn');
    const resetCardsBtn = document.getElementById('reset-cards-btn');

    if (flipAllBtn && flipContainer) {
      flipAllBtn.addEventListener('click', function () {
        const cards = flipContainer.querySelectorAll('.flip-card');
        const allFlipped = Array.from(cards).every(function (c) { return c.classList.contains('is-flipped'); });
        const p = loadProgress();
        const arr = p.modules[moduleId].flippedCards || [];
        cards.forEach(function (c) {
          c.classList.toggle('is-flipped', !allFlipped);
          c.setAttribute('aria-pressed', String(!allFlipped));
          const origIdx = parseInt(c.getAttribute('data-orig-idx'), 10);
          if (!allFlipped && arr.indexOf(origIdx) === -1) arr.push(origIdx);
        });
        p.modules[moduleId].flippedCards = arr;
        saveProgress(p);
        updateFlipProgressBadge();
      });
    }

    if (shuffleCardsBtn) {
      shuffleCardsBtn.addEventListener('click', function () {
        currentFlipCards = shuffleArray(currentFlipCards);
        renderFlipCards();
      });
    }

    if (resetCardsBtn && flipContainer) {
      resetCardsBtn.addEventListener('click', function () {
        flipContainer.querySelectorAll('.flip-card').forEach(function (c) {
          c.classList.remove('is-flipped');
          c.setAttribute('aria-pressed', 'false');
        });
      });
    }

    // ----------------------------------------------------------------------
    // SECCIÓN 4A: MINICASOS PRÁCTICOS APLICADOS
    // ----------------------------------------------------------------------
    const minicasesContainer = document.getElementById('minicases-container');
    const miniCases = Array.isArray(moduleData.miniCases) ? moduleData.miniCases : [];
    if (minicasesContainer) {
      minicasesContainer.innerHTML = miniCases.map(function (mc, idx) {
        const hintsList = Array.isArray(mc.hints)
          ? mc.hints
          : (mc.hint ? [mc.hint] : []);
        const hintsHtml = hintsList.length > 0
          ? '<details class="case-details">' +
              '<summary>💡 Ver pista orientadora</summary>' +
              '<div class="case-details-body">' +
                '<ul style="padding-left:1.1rem; display:grid; gap:0.35rem;">' +
                  hintsList.map(function (h) { return '<li>' + formatInlineMarkdown(h) + '</li>'; }).join('') +
                '</ul>' +
              '</div>' +
            '</details>'
          : '';

        return (
          '<article class="minicase-card">' +
            '<span class="minicase-badge">' + escapeHtml(mc.context || mc.keyConcept || ('Minicaso Aplicado #' + (idx + 1))) + '</span>' +
            '<h3>' + escapeHtml(mc.title) + '</h3>' +
            '<div class="minicase-scenario">' + formatInlineMarkdown(mc.scenario) + '</div>' +
            '<p class="minicase-question">❓ ' + formatInlineMarkdown(mc.question) + '</p>' +
            hintsHtml +
            '<details class="case-details">' +
              '<summary>🎓 Ver dictamen y análisis docente</summary>' +
              '<div class="case-details-body">' + formatInlineMarkdown(mc.analysis || mc.resolution) + '</div>' +
            '</details>' +
          '</article>'
        );
      }).join('');
    }

    // ----------------------------------------------------------------------
    // SECCIÓN 4B: SIMULACIÓN INTERACTIVA DE DECISIONES (3 PASOS)
    // ----------------------------------------------------------------------
    const simContainer = document.getElementById('simulation-container');
    const simData = moduleData.simulation;
    if (simContainer && simData && Array.isArray(simData.steps) && simData.steps.length > 0) {
      let currentStepIdx = 0;

      function renderSimulation() {
        const p = loadProgress();
        const isSimDone = p.modules[moduleId].simCompleted;
        const step = simData.steps[currentStepIdx];

        const dotsHtml = simData.steps.map(function (_, i) {
          let cls = 'sim-step-dot';
          if (i < currentStepIdx || isSimDone) cls += ' is-done';
          else if (i === currentStepIdx) cls += ' is-current';
          return '<span class="' + cls + '" title="Paso ' + (i + 1) + '">' + (i + 1) + '</span>';
        }).join('');

        simContainer.innerHTML =
          '<div class="simulation-box">' +
            '<div class="simulation-header">' +
              '<div>' +
                '<span class="section-eyebrow">🔬 Simulador de Decisiones Metodológicas</span>' +
                '<h3>' + escapeHtml(simData.title) + '</h3>' +
              '</div>' +
              '<div class="topbar-controls">' +
                (isSimDone ? '<span class="status-badge completed">🏅 Simulación superada</span>' : '') +
                '<div class="sim-step-dots" aria-label="Pasos de la simulación">' + dotsHtml + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="sim-context-banner">' +
              '<strong>Contexto del proyecto:</strong> ' + formatInlineMarkdown(simData.context) +
            '</div>' +
            '<div class="sim-step-body">' +
              '<p class="sim-prompt">' + escapeHtml(step.title || ('Paso ' + (currentStepIdx + 1))) + ': ' + formatInlineMarkdown(step.prompt) + '</p>' +
              '<div class="sim-options-list" id="sim-options-list">' +
                step.options.map(function (opt, oIdx) {
                  return (
                    '<button type="button" class="sim-option-btn" data-opt-idx="' + oIdx + '">' +
                      '<span class="study-step-num" style="background:var(--bg-surface-alt); color:var(--text-main); border:1px solid var(--border-strong);">' +
                        String.fromCharCode(65 + oIdx) +
                      '</span>' +
                      '<span>' + formatInlineMarkdown(opt.text) + '</span>' +
                    '</button>'
                  );
                }).join('') +
              '</div>' +
              '<div id="sim-feedback-slot"></div>' +
            '</div>' +
          '</div>';

        const optButtons = simContainer.querySelectorAll('.sim-option-btn');
        const feedbackSlot = document.getElementById('sim-feedback-slot');

        optButtons.forEach(function (btn) {
          btn.addEventListener('click', function () {
            const idx = parseInt(btn.getAttribute('data-opt-idx'), 10);
            const chosen = step.options[idx];
            if (!chosen) return;

            optButtons.forEach(function (b) {
              b.classList.remove('is-correct', 'is-wrong');
            });

            if (chosen.isOptimal) {
              btn.classList.add('is-correct');
              const isLast = currentStepIdx >= simData.steps.length - 1;
              if (isLast) {
                const prog = loadProgress();
                prog.modules[moduleId].simCompleted = true;
                saveProgress(prog);
              }
              if (feedbackSlot) {
                feedbackSlot.innerHTML =
                  '<div class="sim-feedback-panel correct">' +
                    '<p><strong>✅ Decisión Metodológica Óptima:</strong> ' + formatInlineMarkdown(chosen.feedback) + '</p>' +
                    '<div style="margin-top:0.85rem; display:flex; gap:0.65rem; flex-wrap:wrap;">' +
                      (!isLast
                        ? '<button type="button" id="sim-next-step-btn" class="btn btn-primary">Avanzar al Paso ' + (currentStepIdx + 2) + ' →</button>'
                        : '<span class="status-badge completed">🎉 ¡Has completado los 3 pasos del laboratorio con rigor metodológico!</span>' +
                          '<button type="button" id="sim-restart-btn" class="btn btn-outline">↺ Reiniciar laboratorio</button>') +
                    '</div>' +
                  '</div>';

                const nextBtn = document.getElementById('sim-next-step-btn');
                if (nextBtn) {
                  nextBtn.addEventListener('click', function () {
                    currentStepIdx++;
                    renderSimulation();
                  });
                }
                const restartBtn = document.getElementById('sim-restart-btn');
                if (restartBtn) {
                  restartBtn.addEventListener('click', function () {
                    currentStepIdx = 0;
                    renderSimulation();
                  });
                }
              }
            } else {
              btn.classList.add('is-wrong');
              if (feedbackSlot) {
                feedbackSlot.innerHTML =
                  '<div class="sim-feedback-panel incorrect">' +
                    '<p><strong>⚠️ Riesgo Metodológico Detectado:</strong> ' + formatInlineMarkdown(chosen.feedback) + '</p>' +
                    '<p class="stat-meta" style="margin-top:0.45rem;">Analiza el motivo del sesgo y selecciona otra alternativa para continuar.</p>' +
                  '</div>';
              }
            }
          });
        });
      }

      renderSimulation();
    }

    // ----------------------------------------------------------------------
    // SECCIÓN 5: AUTOEVALUACIÓN FORMATIVA CON BARAJADO DE ÍTEMS Y OPCIONES
    // ----------------------------------------------------------------------
    const allQuizItems = Array.isArray(moduleData.quiz) ? moduleData.quiz : [];
    let quizCountMode = '5';
    let quizDiffFilter = 'all';
    let activeQuizSample = [];

    const quizContainerEl = document.getElementById('quiz-questions-container');
    const quizCounterEl = document.getElementById('quiz-answered-counter');
    const quizBannerEl = document.getElementById('quiz-result-banner');
    const quizFormEl = document.getElementById('quiz-form');

    function buildQuizSample() {
      let pool = allQuizItems.filter(function (item) {
        if (quizDiffFilter === 'all') return true;
        return String(item.dificultad || 2) === String(quizDiffFilter);
      });

      if (pool.length === 0) {
        pool = allQuizItems.slice();
      }

      const shuffledItems = shuffleArray(pool);
      const count = quizCountMode === 'all'
        ? shuffledItems.length
        : Math.min(parseInt(quizCountMode, 10) || 5, shuffledItems.length);

      activeQuizSample = shuffledItems.slice(0, count).map(function (item) {
        const rawOpts = item.options || item.opciones || [];
        const origCorrect = typeof item.correctIndex === 'number' ? item.correctIndex : item.respuesta_correcta;
        const indexedOpts = rawOpts.map(function (text, idx) {
          return { text: text, isCorrect: idx === origCorrect };
        });
        const shuffledOpts = shuffleArray(indexedOpts);
        const newCorrectIdx = shuffledOpts.findIndex(function (o) { return o.isCorrect; });

        return {
          id: item.id,
          question: item.question || item.enunciado,
          subtema: item.subtema_label || item.subtema || 'Metodología',
          dificultad: item.dificultad || 2,
          options: shuffledOpts.map(function (o) { return o.text; }),
          correctIndex: newCorrectIdx >= 0 ? newCorrectIdx : 0,
          feedback: item.feedback || {}
        };
      });
    }

    function updateAnsweredCounter() {
      if (!quizContainerEl || !quizCounterEl) return;
      const checked = quizContainerEl.querySelectorAll('input[type="radio"]:checked').length;
      quizCounterEl.textContent = checked + ' de ' + activeQuizSample.length + ' preguntas respondidas';
    }

    function renderQuiz() {
      buildQuizSample();
      if (quizBannerEl) {
        quizBannerEl.className = 'quiz-result-banner';
        quizBannerEl.innerHTML = '';
      }
      if (!quizContainerEl) return;

      const diffLabels = { 1: 'Nivel Fácil', 2: 'Nivel Intermedio', 3: 'Nivel Difícil' };

      quizContainerEl.innerHTML = activeQuizSample.map(function (q, qIdx) {
        const diffNum = q.dificultad || 2;
        const diffTxt = diffLabels[diffNum] || 'Intermedio';

        return (
          '<article class="quiz-question-card" data-q-idx="' + qIdx + '">' +
            '<div class="quiz-q-header">' +
              '<span class="quiz-q-number">Pregunta ' + (qIdx + 1) + ' de ' + activeQuizSample.length + '</span>' +
              '<div class="quiz-q-badges">' +
                '<span class="resource-mini-pill">' + escapeHtml(q.subtema) + '</span>' +
                '<span class="difficulty-badge difficulty-' + diffNum + '">' + escapeHtml(diffTxt) + '</span>' +
              '</div>' +
            '</div>' +
            '<p class="quiz-q-text">' + formatInlineMarkdown(q.question) + '</p>' +
            '<div class="quiz-options-group" role="radiogroup" aria-label="Pregunta ' + (qIdx + 1) + '">' +
              q.options.map(function (optText, oIdx) {
                const inputId = 'q-' + qIdx + '-opt-' + oIdx;
                return (
                  '<label class="quiz-option-label" for="' + inputId + '" data-opt-idx="' + oIdx + '">' +
                    '<input type="radio" id="' + inputId + '" name="quiz-q-' + qIdx + '" value="' + oIdx + '">' +
                    '<span><strong>' + String.fromCharCode(65 + oIdx) + ')</strong> ' + formatInlineMarkdown(optText) + '</span>' +
                  '</label>'
                );
              }).join('') +
            '</div>' +
            '<div class="item-feedback" id="feedback-q-' + qIdx + '" aria-live="polite"></div>' +
          '</article>'
        );
      }).join('');

      quizContainerEl.querySelectorAll('input[type="radio"]').forEach(function (radio) {
        radio.addEventListener('change', function () {
          const card = radio.closest('.quiz-question-card');
          if (card) {
            card.querySelectorAll('.quiz-option-label').forEach(function (lbl) {
              lbl.classList.remove('is-selected');
            });
            const parentLbl = radio.closest('.quiz-option-label');
            if (parentLbl) parentLbl.classList.add('is-selected');
          }
          updateAnsweredCounter();
        });
      });

      updateAnsweredCounter();
    }

    const quizControlsBar = document.getElementById('quiz-controls-bar');
    if (quizControlsBar) {
      quizControlsBar.querySelectorAll('[data-quiz-count]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          quizControlsBar.querySelectorAll('[data-quiz-count]').forEach(function (b) {
            b.classList.remove('is-active');
          });
          btn.classList.add('is-active');
          quizCountMode = btn.getAttribute('data-quiz-count') || '5';
          renderQuiz();
        });
      });

      quizControlsBar.querySelectorAll('[data-quiz-diff]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          quizControlsBar.querySelectorAll('[data-quiz-diff]').forEach(function (b) {
            b.classList.remove('is-active');
          });
          btn.classList.add('is-active');
          quizDiffFilter = btn.getAttribute('data-quiz-diff') || 'all';
          renderQuiz();
        });
      });
    }

    const newQuizBtn = document.getElementById('new-quiz-btn');
    if (newQuizBtn) {
      newQuizBtn.addEventListener('click', function () {
        renderQuiz();
      });
    }

    if (quizFormEl) {
      quizFormEl.addEventListener('submit', function (ev) {
        ev.preventDefault();
        if (activeQuizSample.length === 0) return;

        let correctCount = 0;

        activeQuizSample.forEach(function (q, qIdx) {
          const card = quizContainerEl.querySelector('.quiz-question-card[data-q-idx="' + qIdx + '"]');
          const selectedRadio = card ? card.querySelector('input[type="radio"]:checked') : null;
          const selectedIdx = selectedRadio ? parseInt(selectedRadio.value, 10) : -1;
          const isRight = selectedIdx === q.correctIndex;

          if (isRight) correctCount++;

          if (card) {
            card.classList.remove('is-answered-correct', 'is-answered-wrong');
            card.classList.add(isRight ? 'is-answered-correct' : 'is-answered-wrong');

            card.querySelectorAll('.quiz-option-label').forEach(function (lbl) {
              const oIdx = parseInt(lbl.getAttribute('data-opt-idx'), 10);
              lbl.classList.remove('is-correct-choice', 'is-wrong-choice');
              if (oIdx === q.correctIndex) {
                lbl.classList.add('is-correct-choice');
              } else if (oIdx === selectedIdx && !isRight) {
                lbl.classList.add('is-wrong-choice');
              }
            });
          }

          const fbEl = document.getElementById('feedback-q-' + qIdx);
          if (fbEl) {
            const rightExplain = q.feedback.correcta || q.feedback.correct || 'Respuesta metodológicamente fundamentada.';
            const wrongExplain = q.feedback.incorrecta || q.feedback.incorrect || 'Revisá la distinción conceptual de este subtema.';
            const correctOptionLetter = String.fromCharCode(65 + q.correctIndex);
            const correctOptionText = q.options[q.correctIndex] || '';

            if (isRight) {
              fbEl.className = 'item-feedback is-visible correct';
              fbEl.innerHTML = '<strong>✅ ¡Correcto!</strong> ' + formatInlineMarkdown(rightExplain);
            } else {
              const prefix = selectedIdx === -1 ? '⚠️ <strong>Pregunta sin responder.</strong> ' : '❌ <strong>Respuesta incorrecta.</strong> ';
              fbEl.className = 'item-feedback is-visible incorrect';
              fbEl.innerHTML =
                prefix + formatInlineMarkdown(wrongExplain) +
                '<div style="margin-top:0.45rem;"><strong>Opción correcta (' + correctOptionLetter + '):</strong> ' +
                formatInlineMarkdown(correctOptionText) + '</div>';
            }
          }
        });

        const scorePct = Math.round((correctCount / activeQuizSample.length) * 100);
        const passed = scorePct >= PASS_THRESHOLD;

        const prog = loadProgress();
        const modState = prog.modules[moduleId];
        modState.attempts = (modState.attempts || 0) + 1;
        if (typeof modState.bestScore !== 'number' || scorePct > modState.bestScore) {
          modState.bestScore = scorePct;
        }
        if (passed) {
          modState.completed = true;
        }
        saveProgress(prog);
        updateTopbarAndHeroStatus();
        updateBottomNavigation();

        if (quizBannerEl) {
          const num = parseInt(moduleId.slice(1), 10);
          const nextId = num < TOTAL_MODULES ? 'm' + String(num + 1).padStart(2, '0') : null;

          quizBannerEl.className = 'quiz-result-banner is-visible ' + (passed ? 'passed' : 'failed');
          quizBannerEl.innerHTML =
            '<h3>' +
              (passed
                ? '🎉 ¡Felicitaciones! Obtuviste ' + scorePct + '% (' + correctCount + ' de ' + activeQuizSample.length + ' aciertos)'
                : '📚 Obtuviste ' + scorePct + '% (' + correctCount + ' de ' + activeQuizSample.length + ' aciertos)') +
            '</h3>' +
            '<p style="margin-top:0.4rem;">' +
              (passed
                ? 'Has superado el umbral del 70%. Este módulo ha quedado registrado como aprobado y el siguiente módulo se encuentra desbloqueado.'
                : 'Se requiere al menos 70% para aprobar el módulo. Revisá la retroalimentación formativa detallada en cada ítem arriba y volvé a intentarlo.') +
            '</p>' +
            '<div style="margin-top:1rem; display:flex; gap:0.75rem; flex-wrap:wrap;">' +
              '<button type="button" id="banner-retry-btn" class="btn btn-outline">🔀 Intentar con nuevas preguntas</button>' +
              (passed && nextId
                ? '<a href="view.html?id=' + nextId + '" class="btn btn-primary">Avanzar al Módulo ' + (num + 1) + ' →</a>'
                : '') +
            '</div>';

          const retryBtn = document.getElementById('banner-retry-btn');
          if (retryBtn) {
            retryBtn.addEventListener('click', function () {
              renderQuiz();
              document.getElementById('sec-quiz').scrollIntoView({ behavior: 'smooth' });
            });
          }
          quizBannerEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }

    renderQuiz();

    // ----------------------------------------------------------------------
    // NAVEGACIÓN INFERIOR ENTRE MÓDULOS
    // ----------------------------------------------------------------------
    const prevBtn = document.getElementById('prev-module-btn');
    const nextBtn = document.getElementById('next-module-btn');
    const unlockNextBtn = document.getElementById('unlock-next-btn');

    function updateBottomNavigation() {
      const curr = loadProgress();
      const num = parseInt(moduleId.slice(1), 10);
      const prevId = num > 1 ? 'm' + String(num - 1).padStart(2, '0') : null;
      const nextId = num < TOTAL_MODULES ? 'm' + String(num + 1).padStart(2, '0') : null;

      if (prevBtn) {
        if (prevId) {
          prevBtn.href = 'view.html?id=' + prevId;
          prevBtn.textContent = '← Módulo ' + (num - 1);
        } else {
          prevBtn.href = '../index.html';
          prevBtn.textContent = '← Volver al Catálogo';
        }
      }

      if (nextBtn) {
        if (nextId) {
          const nextUnlocked = isModuleUnlocked(nextId, curr);
          nextBtn.href = 'view.html?id=' + nextId;
          nextBtn.textContent = (nextUnlocked ? 'Siguiente: Módulo ' + (num + 1) + ' →' : '🔒 Módulo ' + (num + 1) + ' (aprueba o desbloquea)');
          nextBtn.classList.toggle('is-disabled', !nextUnlocked);
          if (unlockNextBtn) {
            unlockNextBtn.hidden = nextUnlocked;
          }
        } else {
          nextBtn.href = '../index.html';
          nextBtn.textContent = '🎓 Finalizar y volver al Catálogo';
          nextBtn.classList.remove('is-disabled');
          if (unlockNextBtn) unlockNextBtn.hidden = true;
        }
      }
    }

    if (unlockNextBtn) {
      unlockNextBtn.addEventListener('click', function () {
        const num = parseInt(moduleId.slice(1), 10);
        if (num < TOTAL_MODULES) {
          const nextId = 'm' + String(num + 1).padStart(2, '0');
          const curr = loadProgress();
          if (curr.modules[nextId]) {
            curr.modules[nextId].unlockedManually = true;
            saveProgress(curr);
            updateTopbarAndHeroStatus();
            updateBottomNavigation();
            window.location.href = 'view.html?id=' + nextId;
          }
        }
    // Navegación por pasos en móvil (evita desplazamiento de 18 pantallas)
    const SECTION_IDS = ['sec-estudio', 'sec-capsula', 'sec-flipcards', 'sec-practica', 'sec-quiz'];
    let currentStepIdx = 0;

    function applyMobileStep(stepIdx) {
      if (window.innerWidth > 768) {
        document.body.classList.remove('mobile-step-active');
        SECTION_IDS.forEach(function (id) {
          const s = document.getElementById(id);
          if (s) s.classList.remove('is-active-step');
        });
        return;
      }

      document.body.classList.add('mobile-step-active');
      currentStepIdx = Math.max(0, Math.min(SECTION_IDS.length - 1, stepIdx));

      SECTION_IDS.forEach(function (id, idx) {
        const s = document.getElementById(id);
        if (s) {
          s.classList.toggle('is-active-step', idx === currentStepIdx);
        }
        const navLink = document.querySelector('.section-nav-link[href="#' + id + '"]');
        if (navLink) {
          navLink.classList.toggle('is-active', idx === currentStepIdx);
        }
      });

      // Crear o actualizar paginador al pie de cada sección en móvil
      SECTION_IDS.forEach(function (id, idx) {
        const s = document.getElementById(id);
        if (!s) return;
        let pager = s.querySelector('.mobile-section-pager');
        if (!pager) {
          pager = document.createElement('div');
          pager.className = 'mobile-section-pager';
          s.appendChild(pager);
        }
        const isFirst = idx === 0;
        const isLast = idx === SECTION_IDS.length - 1;

        pager.innerHTML =
          '<button type="button" class="btn btn-outline js-step-prev"' + (isFirst ? ' disabled style="opacity:0.4;pointer-events:none;"' : '') + '>← Anterior</button>' +
          '<span class="mobile-step-indicator">Paso ' + (idx + 1) + ' de ' + SECTION_IDS.length + '</span>' +
          (isLast
            ? '<button type="button" class="btn btn-primary js-step-finish">Revisar resultados ↓</button>'
            : '<button type="button" class="btn btn-primary js-step-next">Siguiente paso →</button>');

        const prevBtn = pager.querySelector('.js-step-prev');
        if (prevBtn && !isFirst) {
          prevBtn.onclick = function () {
            applyMobileStep(idx - 1);
            const targetEl = document.getElementById(SECTION_IDS[idx - 1]);
            if (targetEl) window.scrollTo({ top: targetEl.offsetTop - 60, behavior: 'smooth' });
          };
        }
        const nextBtn = pager.querySelector('.js-step-next');
        if (nextBtn && !isLast) {
          nextBtn.onclick = function () {
            applyMobileStep(idx + 1);
            const targetEl = document.getElementById(SECTION_IDS[idx + 1]);
            if (targetEl) window.scrollTo({ top: targetEl.offsetTop - 60, behavior: 'smooth' });
          };
        }
        const finishBtn = pager.querySelector('.js-step-finish');
        if (finishBtn) {
          finishBtn.onclick = function () {
            const bottomNav = document.querySelector('.module-navigation');
            if (bottomNav) window.scrollTo({ top: bottomNav.offsetTop - 60, behavior: 'smooth' });
          };
        }
      });
    }

    document.querySelectorAll('.section-nav-link').forEach(function (link) {
      link.addEventListener('click', function (ev) {
        if (window.innerWidth <= 768) {
          ev.preventDefault();
          const targetId = (link.getAttribute('href') || '').replace('#', '');
          const targetIdx = SECTION_IDS.indexOf(targetId);
          if (targetIdx !== -1) {
            applyMobileStep(targetIdx);
            const targetEl = document.getElementById(targetId);
            if (targetEl) window.scrollTo({ top: targetEl.offsetTop - 60, behavior: 'smooth' });
          }
        }
      });
    });

    window.addEventListener('resize', function () {
      applyMobileStep(currentStepIdx);
    });
    applyMobileStep(0);

    updateBottomNavigation();
  }

  /* ========================================================================
     6. INICIALIZACIÓN GLOBAL
     ======================================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    initThemeToggle();
    const pageType = document.body.getAttribute('data-page');
    if (pageType === 'home') {
      initHomePage();
    } else if (pageType === 'module') {
      initModulePage();
    }
  });
})();
