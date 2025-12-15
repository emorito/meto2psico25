/**
 * Metodología de la Investigación - Core Logic
 * Handles dynamic content loading, progress tracking, and interactive modules.
 */

const APP = (() => {
  // Configuration
  const CONFIG = {
    modules: [
      { slug: 'modulo1', title: 'El método científico' },
      { slug: 'modulo2', title: 'Teoría y revisión de la literatura' },
      { slug: 'modulo3', title: 'Problema, objetivos e hipótesis' },
      { slug: 'modulo4', title: 'Variables y operacionalización' },
      { slug: 'modulo5', title: 'Diseño de investigación' },
      { slug: 'modulo6', title: 'Población, muestra y muestreo' },
      { slug: 'modulo7', title: 'Desarrollo de instrumentos' },
      { slug: 'modulo8', title: 'Análisis de datos' },
      { slug: 'modulo9', title: 'Informe académico – APA' }
    ],
    paths: {
      data: '../data/',
      root: '../'
    }
  };

  // State Management
  let state = {
    progress: loadProgress()
  };

  // --- Persistence ---
  function loadProgress() {
    const stored = localStorage.getItem('meto2_progress');
    return stored ? JSON.parse(stored) : {};
  }

  function saveProgress() {
    localStorage.setItem('meto2_progress', JSON.stringify(state.progress));
    updateGlobalUI();
  }

  function markModuleComplete(slug, score = 0, bypassed = false) {
    state.progress[slug] = {
      completed: true,
      score: score,
      bypassed: bypassed,
      timestamp: new Date().toISOString()
    };
    saveProgress();
  }

  function isModuleUnlocked(index) {
    if (index === 0) return true; // First always open
    const prevSlug = CONFIG.modules[index - 1].slug;
    return state.progress[prevSlug]?.completed;
  }

  // --- DOM Elements ---
  const UI = {
    progressBar: document.querySelector('.progress-bar'),
    moduleGrid: document.querySelector('.modules-grid'),
    quizContainer: document.getElementById('quiz-dynamic-container'),
    flipContainer: document.getElementById('flips-dynamic-container'),
    videoContainer: document.getElementById('video-dynamic-container'),
    // notebookLink: document.getElementById('notebook-dynamic-link'), // Removed constant ref as we might replace it
    simContainer: document.getElementById('sim-dynamic-container')
  };

  // --- Core Functions ---

  function initIndex() {
    if (!UI.moduleGrid) return;

    UI.moduleGrid.innerHTML = CONFIG.modules.map((mod, index) => {
      const unlocked = isModuleUnlocked(index);
      const isCompleted = state.progress[mod.slug]?.completed;
      const statusClass = unlocked ? '' : 'locked';

      return `
            <div class="module-card ${statusClass}" data-slug="${mod.slug}">
                <div class="module-icon">${getIconForModule(index)}</div>
                <h2>${mod.title}</h2>
                <p>Módulo ${index + 1}</p>
                <div class="card-actions">
                    <button class="start-btn" ${unlocked ? '' : 'disabled'} 
                        onclick="window.location.href='modules/view.html?m=${mod.slug}'">
                        ${isCompleted ? 'Repasar' : 'Comenzar'}
                    </button>
                    ${!unlocked ? `<button class="manual-unlock" onclick="APP.unlockManually(event, ${index})">🔓 Desbloquear</button>` : ''}
                </div>
            </div>`;
    }).join('');

    updateGlobalUI();
  }

  function getIconForModule(index) {
    const icons = ['🔬', '📚', '🔍', '🧩', '🧪', '👥', '🛠️', '📊', '✍️'];
    return icons[index] || '📝';
  }

  function unlockManually(event, index) {
    event.stopPropagation();
    const mod = CONFIG.modules[index];
    if (confirm(`¿Desbloquear manualmente "${mod.title}"?`)) {
      if (index > 0) {
        const prevSlug = CONFIG.modules[index - 1].slug;
        markModuleComplete(prevSlug, 0, true);
        location.reload();
      }
    }
  }

  async function initModuleView() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('m');

    if (!slug) {
      window.location.href = '../index.html';
      return;
    }

    // Set active state
    document.body.setAttribute('data-module', slug);

    // Load Data
    try {
      const response = await fetch(`${CONFIG.paths.data}${slug}.json`);
      if (!response.ok) throw new Error('Data not found');
      const data = await response.json();
      renderModuleContent(data, slug);
    } catch (error) {
      console.warn('Using dummy data or failed to load:', error);
      renderModulePlaceholder(slug);
    }
  }

  // --- Core Functions ---

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // ... (initIndex and initModuleView remain unchanged) ...

  function renderModuleContent(data, slug) {
    // 1. Header
    const titleEl = document.querySelector('#module-title');
    if (titleEl) titleEl.textContent = data.title || 'Módulo ' + slug;

    // 2. Video
    if (data.videoId && UI.videoContainer) {
      UI.videoContainer.innerHTML = `
                <div class="video-wrapper">
                    <iframe src="https://www.youtube.com/embed/${data.videoId}" 
                        frameborder="0" allowfullscreen></iframe>
                </div>`;
    }

    // 3. Notebook & Readings (Kept generic logic)
    const notebookSection = document.querySelector('.notebook-section');
    if (notebookSection) {
      let readingHtml = '';
      const placeholder = document.getElementById('notebook-dynamic-link');
      if (placeholder) placeholder.remove();

      if (data.notebookUrl) {
        readingHtml += `
            <a href="${data.notebookUrl}" target="_blank" class="notebook-link">
                <i class="fa-solid fa-robot"></i> Notebook LM
            </a>`;
      }
      if (data.readingFile) {
        readingHtml += `
            <a href="../${data.readingFile}" target="_blank" class="notebook-link download-btn">
                <i class="fa-solid fa-file-pdf"></i> Descargar Lectura
            </a>`;
      }
      if (data.webReadingUrl) {
        readingHtml += `
            <a href="${data.webReadingUrl}" target="_blank" class="notebook-link">
                <i class="fa-solid fa-globe"></i> Lectura Online
            </a>`;
      }

      if (readingHtml) {
        let container = notebookSection.querySelector('.links-container');
        if (!container) {
          container = document.createElement('div');
          container.className = 'links-container';
          container.style.display = 'flex';
          container.style.gap = '1rem';
          container.style.flexWrap = 'wrap';
          container.style.marginTop = '1rem';
          notebookSection.appendChild(container);
        }
        container.innerHTML = readingHtml;
      }
    }

    // 4. Flip Cards (RANDOM 5)
    if (data.flipCards && UI.flipContainer) {
      // Apply Grid Layout Class to Container
      UI.flipContainer.className = 'flip-grid';

      const randomCards = shuffleArray([...data.flipCards]).slice(0, 6);

      UI.flipContainer.innerHTML = randomCards.map(card => `
                <div class="flip-card" onclick="this.classList.toggle('is-flipped')">
                    <div class="flip-card-inner">
                        <div class="flip-card-front">
                            <i class="fa-solid fa-circle-question" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.8;"></i>
                            <p>${card.front}</p>
                        </div>
                        <div class="flip-card-back">
                            <p>${card.back}</p>
                        </div>
                    </div>
                </div>
            `).join('');
    }

    // 5. Quiz (RANDOM 5)
    if (data.quiz && UI.quizContainer) {
      const randomQuiz = shuffleArray([...data.quiz]).slice(0, 5);
      renderQuiz(randomQuiz, slug);
    }

    // 6. Navigation
    renderNav(slug);
  }

  function renderQuiz(questions, slug) {
    let html = '';
    questions.forEach((q, idx) => {
      html += `
                <div class="quiz-question" data-idx="${idx}">
                    <h4>${idx + 1}. ${q.question}</h4>
                    <div class="quiz-options">
                        ${q.options.map((opt, oIdx) => `
                            <label class="quiz-option" onclick="APP.selectOption(this)">
                                <input type="radio" name="q${idx}" value="${oIdx}">
                                ${opt}
                            </label>
                        `).join('')}
                    </div>
                    <div class="feedback"></div>
                </div>
            `;
    });

    html += `<button class="start-btn" onclick="APP.submitQuiz('${slug}')">Evaluar Respuestas</button>`;
    UI.quizContainer.innerHTML = html;

    // Save correct answers for validation
    UI.quizContainer.dataset.answers = JSON.stringify(questions.map(q => q.correctIndex));
    // Save feedback
    UI.quizContainer.dataset.feedbacks = JSON.stringify(questions.map(q => q.feedback));
  }

  function renderNav(currentSlug) {
    const idx = CONFIG.modules.findIndex(m => m.slug === currentSlug);
    const nextModule = CONFIG.modules[idx + 1];

    const navContainer = document.querySelector('.module-navigation');
    if (!navContainer) return;

    let html = `<a href="../index.html" class="nav-button module-nav-prev">← Inicio</a>`;

    if (nextModule) {
      const isUnlocked = state.progress[currentSlug]?.completed;
      html += `
                <button class="nav-button module-nav-next" 
                    ${isUnlocked ? '' : 'disabled'}
                    onclick="window.location.href='view.html?m=${nextModule.slug}'">
                    ${isUnlocked ? 'Siguiente Módulo →' : 'Completa el Quiz para avanzar'}
                </button>
            `;
    } else {
      html += `<div class="finished-message">¡Has completado todo el curso! 🎓</div>`;
    }
    navContainer.innerHTML = html;
  }

  function renderModulePlaceholder(slug) {
    const titleEl = document.querySelector('#module-title');
    const mod = CONFIG.modules.find(m => m.slug === slug);
    if (titleEl) titleEl.textContent = mod ? mod.title : 'Módulo Desconocido';
    if (UI.flipContainer) UI.flipContainer.innerHTML = '<p class="text-center text-muted">Contenido pendiente de carga...</p>';
  }

  // --- Public Methods (exposed as APP.method) ---

  function selectOption(label) {
    const parent = label.closest('.quiz-options');
    parent.querySelectorAll('.quiz-option').forEach(l => l.classList.remove('selected'));
    label.classList.add('selected');
    label.querySelector('input').checked = true;
  }

  function submitQuiz(slug) {
    const correctAnswers = JSON.parse(UI.quizContainer.dataset.answers);
    const feedbacks = JSON.parse(UI.quizContainer.dataset.feedbacks);
    let score = 0;

    correctAnswers.forEach((ans, idx) => {
      const selected = document.querySelector(`input[name="q${idx}"]:checked`);
      const qDiv = document.querySelector(`.quiz-question[data-idx="${idx}"]`);
      const fbDiv = qDiv.querySelector('.feedback');

      qDiv.classList.remove('correct', 'incorrect');

      if (selected && parseInt(selected.value) === ans) {
        score++;
        qDiv.classList.add('correct');
        fbDiv.innerHTML = `<div class="item-feedback correct">✅ ${feedbacks[idx].correct}</div>`;
      } else {
        qDiv.classList.add('incorrect');
        fbDiv.innerHTML = `<div class="item-feedback incorrect">❌ ${feedbacks[idx].incorrect}</div>`;
      }
    });

    const finalScore = score / correctAnswers.length;

    if (finalScore >= 0.6) {
      markModuleComplete(slug, finalScore);
      alert(`¡Aprobaste con ${(finalScore * 100).toFixed(0)}%!`);
      renderNav(slug);
      window.button_next = document.querySelector('.module-nav-next');
      if (window.button_next) window.button_next.focus();
    } else {
      alert('Intenta de nuevo para avanzar.');
    }
  }

  function updateGlobalUI() {
    const completed = Object.values(state.progress).filter(p => p.completed).length;
    const total = CONFIG.modules.length;
    const pct = (completed / total) * 100;
    if (UI.progressBar) UI.progressBar.style.width = `${pct}%`;
  }

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.modules-grid')) {
      initIndex();
    } else if (document.body.hasAttribute('data-module')) {
      initModuleView();
    }
  });

  return {
    selectOption,
    submitQuiz,
    unlockManually
  };
})();
