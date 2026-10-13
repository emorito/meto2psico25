/**
 * PREPARACIÓN PARA EL EXAMEN PARCIAL — METODOLOGÍA II (UNIBE 2026)
 * Lógica interactiva para examen.html:
 * - Mapa de contenidos Moodle a módulos m01–m08
 * - Diagnóstico rápido de 16 ítems (2 por módulo, opciones y preguntas barajadas, semáforo)
 * - Simulacro de 60 minutos (30 ítems proporcionales, cronómetro ocultable, corrección desglosada)
 * - Cero mutaciones al progreso regular guardado en localStorage.
 */

(function () {
  'use strict';

  const EXAM_MODULE_IDS = ['m01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08'];

  const MODULE_METADATA = {
    m01: { number: 1, title: 'El proceso de investigación científica', clases: 'Clases 1–2', contenido: 'Proceso de investigación' },
    m02: { number: 2, title: 'Selección y delimitación del tema', clases: 'Clase 3', contenido: 'Selección y delimitación del tema' },
    m03: { number: 3, title: 'Revisión de literatura', clases: 'Clase 4', contenido: 'Revisión de literatura' },
    m04: { number: 4, title: 'Problema y preguntas de investigación', clases: 'Clase 5', contenido: 'Problema y preguntas' },
    m05: { number: 5, title: 'Objetivos e hipótesis de investigación', clases: 'Clase 6', contenido: 'Objetivos e hipótesis o supuestos' },
    m06: { number: 6, title: 'Variables y operacionalización', clases: 'Clase 7', contenido: 'Variables o categorías' },
    m07: { number: 7, title: 'Enfoque, alcance y diseño', clases: 'Clase 8', contenido: 'Enfoque, alcance y diseño' },
    m08: { number: 8, title: 'Población y técnicas de muestreo', clases: 'Clase 9', contenido: 'Población, muestra o corpus' }
  };

  /* ========================================================================
     1. UTILIDADES
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

  function shuffle(arr) {
    const copy = Array.isArray(arr) ? arr.slice() : [];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function prepareItem(rawItem, modId) {
    const origOptions = Array.isArray(rawItem.options) ? rawItem.options : [];
    const origCorrect = (rawItem.correctIndex !== undefined) ? rawItem.correctIndex : (rawItem.correcta || 0);
    const correctText = origOptions[origCorrect] || '';

    const indexed = origOptions.map(function (opt, idx) {
      return { text: opt, isCorrect: idx === origCorrect };
    });

    const shuffled = shuffle(indexed);
    const newCorrectIndex = shuffled.findIndex(function (o) { return o.isCorrect; });

    return {
      id: rawItem.id,
      moduleId: modId,
      question: rawItem.question || rawItem.enunciado || '',
      options: shuffled.map(function (o) { return o.text; }),
      correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
      originalCorrectText: correctText,
      dificultad: rawItem.dificultad || 2,
      dificultad_label: rawItem.dificultad_label || 'Intermedio',
      subtema: rawItem.subtema || '',
      subtema_label: rawItem.subtema_label || '',
      feedback: rawItem.feedback || {
        correcta: '¡Correcto! Respuesta verificada con la cátedra.',
        incorrecta: 'Respuesta incorrecta. La opción adecuada es: ' + correctText
      }
    };
  }

  /* ========================================================================
     2. CARGA Y CACHÉ DE MÓDULOS DEL PARCIAL (M01 A M08)
     ======================================================================== */
  let modulesDataCache = null;

  async function loadExamModules() {
    if (modulesDataCache) return modulesDataCache;
    try {
      const promises = EXAM_MODULE_IDS.map(function (id) {
        return fetch('data/' + id + '.json').then(function (r) {
          if (!r.ok) throw new Error('Error al cargar ' + id);
          return r.json();
        });
      });
      const dataArr = await Promise.all(promises);
      modulesDataCache = {};
      EXAM_MODULE_IDS.forEach(function (id, idx) {
        modulesDataCache[id] = dataArr[idx];
      });
      return modulesDataCache;
    } catch (err) {
      console.error('Error cargando módulos del examen:', err);
      return null;
    }
  }

  /* ========================================================================
     3. DIAGNÓSTICO RÁPIDO (16 ÍTEMS: 2 POR MÓDULO)
     ======================================================================== */
  let currentDiagnosticItems = [];
  let diagnosticSubmitted = false;

  function renderDiagnosticQuiz(modulesMap) {
    const container = document.getElementById('diag-items-list');
    const resultsContainer = document.getElementById('diag-results-container');
    const submitBtn = document.getElementById('diag-submit-btn');
    const counterBadge = document.getElementById('diag-progress-badge');

    if (!container) return;
    if (resultsContainer) resultsContainer.hidden = true;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Evaluar diagnóstico rápido';
    }

    // Seleccionar 2 ítems por módulo
    const sampledItems = [];
    EXAM_MODULE_IDS.forEach(function (modId) {
      const mod = modulesMap[modId];
      if (!mod || !Array.isArray(mod.quiz)) return;
      const shuffledQuiz = shuffle(mod.quiz);
      const chosen = shuffledQuiz.slice(0, 2);
      chosen.forEach(function (raw) {
        sampledItems.push(prepareItem(raw, modId));
      });
    });

    currentDiagnosticItems = shuffle(sampledItems);
    diagnosticSubmitted = false;

    if (counterBadge) counterBadge.textContent = '0 de ' + currentDiagnosticItems.length + ' respondidas';

    container.innerHTML = currentDiagnosticItems.map(function (item, idx) {
      const qNum = idx + 1;
      const modMeta = MODULE_METADATA[item.moduleId] || {};
      const modBadge = 'M' + String(modMeta.number).padStart(2, '0') + ' · ' + (modMeta.title || '');
      const difBadge = item.dificultad_label || 'Intermedio';

      return (
        '<article class="exam-question-item" id="diag-item-' + idx + '">' +
          '<div class="exam-question-header">' +
            '<span class="exam-q-num">Pregunta ' + qNum + ' de ' + currentDiagnosticItems.length + '</span>' +
            '<span class="exam-q-meta">' +
              '<span>' + escapeHtml(modBadge) + '</span>' +
              '<span>·</span>' +
              '<span>' + escapeHtml(difBadge) + '</span>' +
            '</span>' +
          '</div>' +
          '<div class="exam-q-text">' + formatInlineMarkdown(item.question) + '</div>' +
          '<ul class="exam-options-list">' +
            item.options.map(function (optText, optIdx) {
              const optId = 'diag-q' + idx + '-opt' + optIdx;
              return (
                '<li>' +
                  '<label class="exam-option-label" for="' + optId + '" id="diag-label-' + idx + '-' + optIdx + '">' +
                    '<input type="radio" name="diag_q_' + idx + '" id="' + optId + '" value="' + optIdx + '">' +
                    '<span>' + formatInlineMarkdown(optText) + '</span>' +
                  '</label>' +
                '</li>'
              );
            }).join('') +
          '</ul>' +
          '<div class="exam-feedback-box" id="diag-feedback-' + idx + '" hidden></div>' +
        '</article>'
      );
    }).join('');

    // Listener para actualizar contador de respuestas
    container.querySelectorAll('input[type="radio"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        if (diagnosticSubmitted) return;
        const answered = container.querySelectorAll('input[type="radio"]:checked').length;
        if (counterBadge) {
          counterBadge.textContent = answered + ' de ' + currentDiagnosticItems.length + ' respondidas';
        }
      });
    });
  }

  function evaluateDiagnostic() {
    if (diagnosticSubmitted) return;
    const container = document.getElementById('diag-items-list');
    const resultsContainer = document.getElementById('diag-results-container');
    const submitBtn = document.getElementById('diag-submit-btn');

    const total = currentDiagnosticItems.length;
    let totalCorrect = 0;
    const perModStats = {};

    EXAM_MODULE_IDS.forEach(function (id) {
      perModStats[id] = { total: 0, correct: 0 };
    });

    currentDiagnosticItems.forEach(function (item, idx) {
      perModStats[item.moduleId].total++;
      const checked = container.querySelector('input[name="diag_q_' + idx + '"]:checked');
      const chosenIdx = checked ? parseInt(checked.value, 10) : null;
      const isCorrect = (chosenIdx !== null && chosenIdx === item.correctIndex);

      if (isCorrect) {
        totalCorrect++;
        perModStats[item.moduleId].correct++;
      }

      // Deshabilitar radios
      container.querySelectorAll('input[name="diag_q_' + idx + '"]').forEach(function (r) {
        r.disabled = true;
      });

      // Estilizar opciones
      item.options.forEach(function (optText, optIdx) {
        const label = document.getElementById('diag-label-' + idx + '-' + optIdx);
        if (!label) return;
        if (optIdx === item.correctIndex) {
          label.classList.add('is-correct-choice');
        } else if (chosenIdx === optIdx && !isCorrect) {
          label.classList.add('is-incorrect-choice');
        }
      });

      // Mostrar feedback oficial de cátedra
      const feedbackEl = document.getElementById('diag-feedback-' + idx);
      if (feedbackEl) {
        feedbackEl.hidden = false;
        const fbText = isCorrect
          ? (item.feedback.correcta || item.feedback.correct || '¡Respuesta correcta!')
          : (item.feedback.incorrecta || item.feedback.incorrect || ('Respuesta incorrecta. La opción adecuada es: ' + item.originalCorrectText));
        feedbackEl.className = 'exam-feedback-box ' + (isCorrect ? 'correct' : 'incorrect');
        feedbackEl.innerHTML =
          '<strong>' + (isCorrect ? '✓ Correcto' : '✗ Revisión') + ':</strong> ' +
          formatInlineMarkdown(fbText);
      }
    });

    diagnosticSubmitted = true;
    if (submitBtn) {
      submitBtn.textContent = 'Diagnóstico completado';
      submitBtn.disabled = true;
    }

    // Renderizar tarjeta de Semáforo
    if (resultsContainer) {
      resultsContainer.hidden = false;
      const pct = Math.round((totalCorrect / total) * 100);

      const hasRed = Object.keys(perModStats).some(function (k) { return perModStats[k].correct === 0; });

      resultsContainer.innerHTML =
        '<div class="traffic-summary-card">' +
          '<div class="traffic-alert-banner">' +
            '<span>⚠️</span>' +
            '<span><b>Resultado global: ' + totalCorrect + ' de ' + total + ' aciertos (' + pct + '%).</b> Repasá primero lo que quedó en rojo.</span>' +
          '</div>' +
          '<div class="traffic-grid">' +
            EXAM_MODULE_IDS.map(function (modId) {
              const stat = perModStats[modId];
              const meta = MODULE_METADATA[modId];
              let statusClass = 'status-green';
              let badgeText = '🟢 Dominado';
              if (stat.correct === 0) {
                statusClass = 'status-red';
                badgeText = '🔴 Prioridad';
              } else if (stat.correct === 1) {
                statusClass = 'status-yellow';
                badgeText = '🟡 Repaso';
              }

              return (
                '<div class="traffic-mod-cell ' + statusClass + '">' +
                  '<div class="traffic-cell-header">' +
                    '<span class="traffic-cell-title">M' + String(meta.number).padStart(2, '0') + ' · ' + escapeHtml(meta.title) + '</span>' +
                    '<span class="traffic-cell-badge">' + badgeText + '</span>' +
                  '</div>' +
                  '<div class="traffic-cell-score">' + stat.correct + ' de ' + stat.total + ' aciertos</div>' +
                  '<div class="traffic-cell-links">' +
                    '<a href="modules/view.html?id=' + modId + '#sec-capsula" target="_blank" class="traffic-cell-link">📖 Cápsula →</a>' +
                    '<a href="modules/view.html?id=' + modId + '#sec-flipcards" target="_blank" class="traffic-cell-link">🃏 Tarjetas →</a>' +
                  '</div>' +
                '</div>'
              );
            }).join('') +
          '</div>' +
          '<div style="margin-top:20px; display:flex; gap:12px; flex-wrap:wrap;">' +
            '<button type="button" id="diag-retry-btn" class="btn-exam-outline">' +
              '🔄 Generar otro diagnóstico (16 ítems nuevos)' +
            '</button>' +
            '<a href="#sec-mapa" class="btn-exam-outline">' +
              '🗺️ Ver mapa completo de contenidos' +
            '</a>' +
          '</div>' +
        '</div>';

      const retryBtn = document.getElementById('diag-retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', function () {
          renderDiagnosticQuiz(modulesDataCache);
          document.getElementById('sec-diagnostico').scrollIntoView({ behavior: 'smooth' });
        });
      }

      resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /* ========================================================================
     4. SIMULACRO CRONOMETRADO DE 60 MINUTOS (30 ÍTEMS)
     ======================================================================== */
  let currentMockItems = [];
  let mockTimerInterval = null;
  let mockRemainingSeconds = 3600; // 60 minutos
  let mockTimerHidden = false;
  let mockSubmitted = false;

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  }

  function startMockExam(modulesMap) {
    const container = document.getElementById('mock-items-list');
    const startCard = document.getElementById('mock-start-card');
    const activeWrap = document.getElementById('mock-active-wrap');
    const resultsContainer = document.getElementById('mock-results-container');
    const timerDisplay = document.getElementById('mock-timer-display');
    const submitBtn = document.getElementById('mock-submit-btn');

    if (!container || !activeWrap) return;

    if (startCard) startCard.hidden = true;
    if (resultsContainer) resultsContainer.hidden = true;
    activeWrap.hidden = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Entregar y calificar simulacro';
    }

    // Muestra proporcional de 30 ítems:
    // m01..m06: 4 ítems c/u = 24 ítems
    // m07..m08: 3 ítems c/u = 6 ítems
    // Total = 30 ítems
    const sampled = [];
    EXAM_MODULE_IDS.forEach(function (modId, idx) {
      const mod = modulesMap[modId];
      if (!mod || !Array.isArray(mod.quiz)) return;
      const count = (idx < 6) ? 4 : 3;
      const shuffled = shuffle(mod.quiz);
      shuffled.slice(0, count).forEach(function (raw) {
        sampled.push(prepareItem(raw, modId));
      });
    });

    currentMockItems = shuffle(sampled);
    mockSubmitted = false;
    mockRemainingSeconds = 3600;

    container.innerHTML = currentMockItems.map(function (item, idx) {
      const qNum = idx + 1;
      const modMeta = MODULE_METADATA[item.moduleId] || {};
      const modBadge = 'M' + String(modMeta.number).padStart(2, '0') + ' · ' + (modMeta.title || '');

      return (
        '<article class="exam-question-item" id="mock-item-' + idx + '">' +
          '<div class="exam-question-header">' +
            '<span class="exam-q-num">Pregunta ' + qNum + ' de ' + currentMockItems.length + '</span>' +
            '<span class="exam-q-meta">' + escapeHtml(modBadge) + '</span>' +
          '</div>' +
          '<div class="exam-q-text">' + formatInlineMarkdown(item.question) + '</div>' +
          '<ul class="exam-options-list">' +
            item.options.map(function (optText, optIdx) {
              const optId = 'mock-q' + idx + '-opt' + optIdx;
              return (
                '<li>' +
                  '<label class="exam-option-label" for="' + optId + '" id="mock-label-' + idx + '-' + optIdx + '">' +
                    '<input type="radio" name="mock_q_' + idx + '" id="' + optId + '" value="' + optIdx + '">' +
                    '<span>' + formatInlineMarkdown(optText) + '</span>' +
                  '</label>' +
                '</li>'
              );
            }).join('') +
          '</ul>' +
          '<div class="exam-feedback-box" id="mock-feedback-' + idx + '" hidden></div>' +
        '</article>'
      );
    }).join('');

    // Iniciar cronómetro regresivo
    clearInterval(mockTimerInterval);
    function updateTimerUi() {
      if (!timerDisplay) return;
      if (mockTimerHidden) {
        timerDisplay.textContent = '⏱️ Cronómetro en curso (oculto)';
      } else {
        timerDisplay.textContent = '⏱️ Tiempo restante: ' + formatTime(mockRemainingSeconds);
      }
      if (mockRemainingSeconds <= 300) {
        timerDisplay.classList.add('is-warning');
      } else {
        timerDisplay.classList.remove('is-warning');
      }
    }

    updateTimerUi();
    mockTimerInterval = setInterval(function () {
      if (mockRemainingSeconds > 0) {
        mockRemainingSeconds--;
        updateTimerUi();
      } else {
        clearInterval(mockTimerInterval);
        alert('⏰ El tiempo límite de 60 minutos ha finalizado. El simulacro se entregará automáticamente.');
        evaluateMockExam();
      }
    }, 1000);
  }

  function evaluateMockExam() {
    if (mockSubmitted) return;
    clearInterval(mockTimerInterval);

    const container = document.getElementById('mock-items-list');
    const resultsContainer = document.getElementById('mock-results-container');
    const submitBtn = document.getElementById('mock-submit-btn');

    const total = currentMockItems.length;
    let totalCorrect = 0;
    const perModStats = {};

    EXAM_MODULE_IDS.forEach(function (id) {
      perModStats[id] = { total: 0, correct: 0 };
    });

    currentMockItems.forEach(function (item, idx) {
      perModStats[item.moduleId].total++;
      const checked = container.querySelector('input[name="mock_q_' + idx + '"]:checked');
      const chosenIdx = checked ? parseInt(checked.value, 10) : null;
      const isCorrect = (chosenIdx !== null && chosenIdx === item.correctIndex);

      if (isCorrect) {
        totalCorrect++;
        perModStats[item.moduleId].correct++;
      }

      // Deshabilitar radios
      container.querySelectorAll('input[name="mock_q_' + idx + '"]').forEach(function (r) {
        r.disabled = true;
      });

      // Estilizar opciones
      item.options.forEach(function (optText, optIdx) {
        const label = document.getElementById('mock-label-' + idx + '-' + optIdx);
        if (!label) return;
        if (optIdx === item.correctIndex) {
          label.classList.add('is-correct-choice');
        } else if (chosenIdx === optIdx && !isCorrect) {
          label.classList.add('is-incorrect-choice');
        }
      });

      // Mostrar feedback
      const feedbackEl = document.getElementById('mock-feedback-' + idx);
      if (feedbackEl) {
        feedbackEl.hidden = false;
        const fbText = isCorrect
          ? (item.feedback.correcta || item.feedback.correct || '¡Respuesta correcta!')
          : (item.feedback.incorrecta || item.feedback.incorrect || ('Respuesta incorrecta. La opción adecuada es: ' + item.originalCorrectText));
        feedbackEl.className = 'exam-feedback-box ' + (isCorrect ? 'correct' : 'incorrect');
        feedbackEl.innerHTML =
          '<strong>' + (isCorrect ? '✓ Correcto' : '✗ Revisión') + ':</strong> ' +
          formatInlineMarkdown(fbText);
      }
    });

    mockSubmitted = true;
    if (submitBtn) {
      submitBtn.textContent = 'Simulacro entregado y calificado';
      submitBtn.disabled = true;
    }

    const elapsedSeconds = 3600 - mockRemainingSeconds;
    const elapsedMins = Math.floor(elapsedSeconds / 60);
    const elapsedSecs = elapsedSeconds % 60;
    const timeFormatted = elapsedMins + ' min ' + elapsedSecs + ' seg';
    const pct = Math.round((totalCorrect / total) * 100);

    if (resultsContainer) {
      resultsContainer.hidden = false;
      resultsContainer.innerHTML =
        '<div class="traffic-summary-card">' +
          '<h3 class="exam-serif-title" style="font-size:1.4rem; margin-bottom:8px;">📊 Calificación del Simulacro de 60 Minutos</h3>' +
          '<p style="color:var(--exam-ink-2); margin-bottom:16px;">' +
            'Obtuviste <b>' + totalCorrect + ' de ' + total + ' aciertos (' + pct + '%)</b> en un tiempo de <b>' + timeFormatted + '</b>.' +
          '</p>' +
          '<h4 style="font-size:0.95rem; margin-bottom:12px;">Desglose de aciertos por módulo evaluado:</h4>' +
          '<div class="traffic-grid">' +
            EXAM_MODULE_IDS.map(function (modId) {
              const stat = perModStats[modId];
              const meta = MODULE_METADATA[modId];
              const modPct = Math.round((stat.correct / stat.total) * 100);
              let statusClass = 'status-green';
              if (modPct < 50) statusClass = 'status-red';
              else if (modPct < 75) statusClass = 'status-yellow';

              return (
                '<div class="traffic-mod-cell ' + statusClass + '">' +
                  '<div class="traffic-cell-header">' +
                    '<span class="traffic-cell-title">M' + String(meta.number).padStart(2, '0') + ' · ' + escapeHtml(meta.title) + '</span>' +
                  '</div>' +
                  '<div class="traffic-cell-score">' + stat.correct + ' de ' + stat.total + ' aciertos (' + modPct + '%)</div>' +
                  '<div class="traffic-cell-links">' +
                    '<a href="modules/view.html?id=' + modId + '#sec-capsula" target="_blank" class="traffic-cell-link">Repasar cápsula →</a>' +
                  '</div>' +
                '</div>'
              );
            }).join('') +
          '</div>' +
          '<div style="margin-top:20px; display:flex; gap:12px; flex-wrap:wrap;">' +
            '<button type="button" id="mock-retry-btn" class="btn-exam-outline">' +
              '🔄 Iniciar nuevo simulacro (30 preguntas diferentes)' +
            '</button>' +
            '<a href="#sec-recordatorios" class="btn-exam-outline">' +
              '💡 Ver recordatorios clave del docente' +
            '</a>' +
          '</div>' +
        '</div>';

      const retryBtn = document.getElementById('mock-retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', function () {
          startMockExam(modulesDataCache);
          document.getElementById('sec-simulacro').scrollIntoView({ behavior: 'smooth' });
        });
      }

      resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /* ========================================================================
     5. INICIALIZACIÓN DE LA PÁGINA EXAMEN
     ======================================================================== */
  async function initExamPage() {
    const modulesMap = await loadExamModules();
    if (!modulesMap) {
      console.error('No se pudieron inicializar los módulos de examen.');
      return;
    }

    // 1. Diagnóstico Rápido
    renderDiagnosticQuiz(modulesMap);

    const diagSubmitBtn = document.getElementById('diag-submit-btn');
    if (diagSubmitBtn) {
      diagSubmitBtn.addEventListener('click', evaluateDiagnostic);
    }

    const diagShuffleBtn = document.getElementById('diag-shuffle-btn');
    if (diagShuffleBtn) {
      diagShuffleBtn.addEventListener('click', function () {
        renderDiagnosticQuiz(modulesMap);
      });
    }

    // 2. Simulacro de 60 minutos
    const mockStartBtn = document.getElementById('mock-start-btn');
    if (mockStartBtn) {
      mockStartBtn.addEventListener('click', function () {
        startMockExam(modulesMap);
      });
    }

    const mockSubmitBtn = document.getElementById('mock-submit-btn');
    if (mockSubmitBtn) {
      mockSubmitBtn.addEventListener('click', evaluateMockExam);
    }

    const mockToggleTimerBtn = document.getElementById('mock-toggle-timer-btn');
    if (mockToggleTimerBtn) {
      mockToggleTimerBtn.addEventListener('click', function () {
        mockTimerHidden = !mockTimerHidden;
        mockToggleTimerBtn.textContent = mockTimerHidden ? '👁️ Mostrar cronómetro' : '👁️ Ocultar cronómetro';
        const timerDisplay = document.getElementById('mock-timer-display');
        if (timerDisplay) {
          if (mockTimerHidden) {
            timerDisplay.textContent = '⏱️ Cronómetro en curso (oculto)';
          } else {
            timerDisplay.textContent = '⏱️ Tiempo restante: ' + formatTime(mockRemainingSeconds);
          }
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initExamPage();
  });
})();
