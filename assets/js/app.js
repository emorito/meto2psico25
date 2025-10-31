/*
 * fixed_app.js - Versión corregida del script híbrido
 *
 * Esta versión corrige los errores de sintaxis presentes en la
 * implementación híbrida anterior (notablemente en initPDFDownload y
 * trackPDFDownload) que impedían la ejecución del código. Se mantiene
 * toda la funcionalidad original: navegación entre módulos, quizzes de
 * 5 ítems, simulaciones interactivas, bloqueo/desbloqueo automático,
 * guardado de progreso y las mejoras añadidas (barra de progreso,
 * descarga de PDFs, video optimizado y animaciones).  
 */

(() => {
  const MODULES = [
    { slug: 'modulo1', title: 'Problema de investigación' },
    { slug: 'modulo2', title: 'Objetivos de investigación' },
    { slug: 'modulo3', title: 'Hipótesis de investigación' },
    { slug: 'modulo4', title: 'Constructos y variables' },
    { slug: 'modulo5', title: 'Diseño de investigación' },
    { slug: 'modulo6', title: 'Población, muestra y muestreo' }
  ];

  const PROGRESS_TEMPLATE = MODULES.reduce((obj, mod) => {
    obj[mod.slug] = { completed: false, score: null };
    return obj;
  }, {});

  // PDFs para descarga
  const PDF_FILES = {
    'modulo1': 'assets/readings/problemas_hipotesis.pdf',
    'modulo2': 'assets/readings/objetivos.pdf',
    'modulo3': 'assets/readings/hipotesis.pdf',
    'modulo4': 'assets/readings/variables.pdf',
    'modulo5': 'assets/readings/disenos.pdf',
    'modulo6': 'assets/readings/muestreo.pdf'
  };

  function loadProgress() {
    const data = localStorage.getItem('progreso');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        for (const mod of MODULES) {
          if (!parsed[mod.slug]) {
            parsed[mod.slug] = { completed: false, score: null };
          }
        }
        return parsed;
      } catch (err) {
        console.warn('No se pudo parsear el progreso, se restablece.', err);
      }
    }
    saveProgress(PROGRESS_TEMPLATE);
    return { ...PROGRESS_TEMPLATE };
  }

  function saveProgress(prog) {
    localStorage.setItem('progreso', JSON.stringify(prog));
    // Actualizar barra de progreso si existe
    updateProgressBar();
  }

  // ========================================
  // FUNCIONALIDAD ORIGINAL - MANTENER INTACTA
  // ========================================

  function initIndex() {
    const progress = loadProgress();
    const cards = document.querySelectorAll('.module-card');
    cards.forEach(card => {
      const index = parseInt(card.getAttribute('data-index'), 10);
      const slug = card.getAttribute('data-slug');
      const btn = card.querySelector('.start-btn');
      let locked = false;
      if (index > 1) {
        const prevSlug = MODULES[index - 2].slug;
        const prevResult = progress[prevSlug];
        locked = !(prevResult && prevResult.score !== null && prevResult.score >= 0.8);
      }
      if (locked) {
        card.classList.add('locked');
        btn.disabled = true;
      } else {
        btn.disabled = false;
        btn.addEventListener('click', () => {
          window.location.href = `modules/${slug}.html`;
        });
      }
    });

    // Inicializar mejoras adicionales
    initPDFDownload();
    initProgressBar();
    initAnimations();
  }

  function initModule(slug) {
    setupFlipCards();
    setupQuiz(slug);
    setupDecisionSimulation(slug);

    // Inicializar mejoras adicionales
    initProgressBar();
    initAnimations();
  }

  function setupFlipCards() {
    const cards = document.querySelectorAll('.flip-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('is-flipped');
      });
    });
  }

  function setupQuiz(slug) {
    const quizContainer = document.getElementById('quiz-container');
    const submitBtn = document.getElementById('quiz-submit');
    const feedbackEl = document.getElementById('quiz-feedback');
    const dataPath = `../data/items_${slug}.json`;
    fetch(dataPath)
      .then(resp => resp.json())
      .then(data => {
        const items = data.items || [];
        function renderAndBind() {
          const shuffled = items.slice().sort(() => Math.random() - 0.5).slice(0, 5);
          renderQuizQuestions(shuffled, quizContainer);
          enhanceQuizOptionSelection(quizContainer);
          feedbackEl.textContent = '';
          const prevFeedbacks = quizContainer.querySelectorAll('.item-feedback');
          prevFeedbacks.forEach(el => el.remove());
          const prevRetake = document.getElementById('quiz-retake');
          if (prevRetake) prevRetake.remove();
          submitBtn.disabled = false;
          submitBtn.onclick = function() {
            submitBtn.disabled = true;
            const score = evaluateQuiz(shuffled);
            const progress = loadProgress();
            progress[slug] = { completed: true, score: score };
            saveProgress(progress);
            if (score >= 0.8) {
              feedbackEl.textContent = `¡Excelente! Obtuviste ${(score * 100).toFixed(0)}%. Se ha desbloqueado el siguiente módulo.`;
            } else if (score >= 0.6) {
              feedbackEl.textContent = `¡Buen intento! Obtuviste ${(score * 100).toFixed(0)}%. Puedes avanzar, pero te recomendamos repasar el material.`;
            } else {
              feedbackEl.textContent = `Obtuviste ${(score * 100).toFixed(0)}%. Te sugerimos repasar la lectura y las tarjetas antes de continuar.`;
            }
            showItemFeedback(shuffled, quizContainer);
            showRetakeButton();
          };
        }
        function showItemFeedback(items, container) {
          const questionDivs = container.querySelectorAll('.quiz-question');
          items.forEach((item, idx) => {
            const qDiv = questionDivs[idx];
            const selected = document.querySelector(`input[name="q${idx}"]:checked`);
            const isCorrect = selected && parseInt(selected.value, 10) === item.correct_option_index;
            if (item.feedback) {
              const fb = document.createElement('p');
              fb.className = 'item-feedback';
              fb.textContent = isCorrect ? item.feedback.correct : item.feedback.incorrect;
              qDiv.appendChild(fb);
            }
          });
        }
        function showRetakeButton() {
          const btn = document.createElement('button');
          btn.id = 'quiz-retake';
          btn.className = 'quiz-retake';
          btn.textContent = 'Volver a intentar';
          feedbackEl.appendChild(btn);
          btn.addEventListener('click', () => {
            renderAndBind();
          });
        }
        renderAndBind();
      })
      .catch(err => {
        console.error('Error al cargar el banco de ítems:', err);
        quizContainer.innerHTML = '<p>No se pudo cargar el cuestionario.</p>';
        submitBtn.style.display = 'none';
      });
  }

  function renderQuizQuestions(items, container) {
    container.innerHTML = '';
    items.forEach((item, idx) => {
      const qDiv = document.createElement('div');
      qDiv.className = 'quiz-question';
      const h4 = document.createElement('h4');
      h4.textContent = `${idx + 1}. ${item.question_text}`;
      qDiv.appendChild(h4);
      const ul = document.createElement('ul');
      ul.className = 'quiz-options';
      item.options.forEach((opt, optIdx) => {
        const li = document.createElement('li');
        const label = document.createElement('label');
        label.className = 'quiz-option-label';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `q${idx}`;
        radio.value = optIdx;
        const text = document.createElement('span');
        text.className = 'quiz-option-text';
        text.textContent = opt;
        label.appendChild(radio);
        label.appendChild(text);
        li.appendChild(label);
        ul.appendChild(li);
      });
      qDiv.appendChild(ul);
      container.appendChild(qDiv);
    });
  }

  function enhanceQuizOptionSelection(container) {
    const groups = container.querySelectorAll('.quiz-options');
    groups.forEach(group => {
      const labels = Array.from(group.querySelectorAll('.quiz-option-label'));
      labels.forEach(label => {
        const input = label.querySelector('input[type="radio"]');
        if (!input) return;
        if (input.checked) {
          label.classList.add('is-selected');
        }
        input.addEventListener('change', () => {
          labels.forEach(l => l.classList.remove('is-selected'));
          label.classList.add('is-selected');
        });
      });
    });
  }

  function evaluateQuiz(items) {
    let correct = 0;
    items.forEach((item, idx) => {
      const selected = document.querySelector(`input[name="q${idx}"]:checked`);
      if (selected && parseInt(selected.value, 10) === item.correct_option_index) {
        correct++;
      }
    });
    return items.length > 0 ? correct / items.length : 0;
  }

  function setupDecisionSimulation(slug) {
    const container = document.getElementById('decision-container');
    const sim = SIMULATIONS[slug];
    if (!sim) {
      container.innerHTML = '<p>No hay simulación para este módulo.</p>';
      return;
    }
    let currentStep = sim.start;
    function renderStep(stepId) {
      const step = sim.steps[stepId];
      container.innerHTML = '';
      const div = document.createElement('div');
      div.className = 'decision-step';
      const p = document.createElement('p');
      p.textContent = step.question;
      div.appendChild(p);
      const ul = document.createElement('ul');
      ul.className = 'decision-options';
      step.options.forEach(opt => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.textContent = opt.text;
        btn.className = 'start-btn';
        btn.addEventListener('click', () => {
          if (opt.next in sim.steps) {
            renderStep(opt.next);
          } else {
            container.innerHTML = `<p>${sim.results[opt.next]}</p>`;
          }
        });
        li.appendChild(btn);
        ul.appendChild(li);
      });
      div.appendChild(ul);
      container.appendChild(div);
    }
    renderStep(currentStep);
  }

  const SIMULATIONS = {
    modulo1: {
      start: 's1',
      steps: {
        s1: {
          question: '¿Qué conviene hacer primero al definir un problema?',
          options: [
            { text: 'Leer bibliografía y delimitar variables', next: 's2' },
            { text: 'Escribir cualquier cosa y ver qué sale', next: 'fail1' }
          ]
        },
        s2: {
          question: 'Has delimitado el problema, ¿qué sigue?',
          options: [
            { text: 'Plantear hipótesis', next: 'success' },
            { text: 'Ignorar y saltar al diseño', next: 'fail2' }
          ]
        }
      },
      results: {
        success: '¡Buen trabajo! Definir el problema y luego plantear hipótesis te ayudará a orientar el estudio.',
        fail1: 'Ups… improvisar puede ser divertido, pero no es ciencia. 🤓',
        fail2: 'Sin una hipótesis, tu diseño navegará sin brújula. ¡Vuelve y piensa en tus hipótesis!'
      }
    },
    modulo2: {
      start: 's1',
      steps: {
        s1: {
          question: '¿Cuántos objetivos generales debe tener una investigación?',
          options: [
            { text: 'Uno', next: 's2' },
            { text: 'Tres', next: 'fail1' }
          ]
        },
        s2: {
          question: 'Los objetivos específicos deben…',
          options: [
            { text: 'Ser claros y factibles', next: 'success' },
            { text: 'Ser vagos y ambiguos', next: 'fail2' }
          ]
        }
      },
      results: {
        success: '¡Objetivos en marcha! Bien planteados, guiarán tu camino.',
        fail1: 'Demasiados generales confunden más que ayudan. Mejor formula uno solo.',
        fail2: 'Si son vagos, nadie sabrá qué medir. ¡Replantea tus objetivos!'
      }
    },
    modulo3: {
      start: 's1',
      steps: {
        s1: {
          question: 'Una buena hipótesis debe…',
          options: [
            { text: 'Ser falsable y relacionar variables', next: 's2' },
            { text: 'Ser una opinión disfrazada', next: 'fail1' }
          ]
        },
        s2: {
          question: '¿Qué tipo de hipótesis elegirías en un experimento clásico?',
          options: [
            { text: 'Direccional', next: 'success' },
            { text: 'Sin relación entre variables', next: 'fail2' }
          ]
        }
      },
      results: {
        success: '¡Perfecto! Una hipótesis direccional te permite predecir un sentido claro.',
        fail1: 'Una opinión no es hipótesis. ¡Necesitas variables medibles!',
        fail2: 'Si no planteas relación, ¡no hay nada que comprobar!'
      }
    },
    modulo4: {
      start: 's1',
      steps: {
        s1: {
          question: '¿Qué es un constructo?',
          options: [
            { text: 'Una idea teórica que se mide a través de variables', next: 's2' },
            { text: 'Un dispositivo de laboratorio que se compra en la ferretería', next: 'fail1' }
          ]
        },
        s2: {
          question: 'La variable dependiente es…',
          options: [
            { text: 'El efecto o respuesta medida', next: 'success' },
            { text: 'La causa que manipulamos', next: 'fail2' }
          ]
        }
      },
      results: {
        success: '¡Excelente! Ya distingues constructos y variables.',
        fail1: 'Eso sería un tornillo, no un constructo. 🙈',
        fail2: 'Esa es la independiente. La dependiente es la respuesta que observas.'
      }
    },
    modulo5: {
      start: 's1',
      steps: {
        s1: {
          question: 'Si manipulas una variable y controlas las demás, ¿qué diseño usas?',
          options: [
            { text: 'Experimental', next: 's2' },
            { text: 'Descriptivo', next: 'fail1' }
          ]
        },
        s2: {
          question: 'Si no puedes asignar al azar, tu diseño es…',
          options: [
            { text: 'Cuasiexperimental', next: 'success' },
            { text: 'Correlacional', next: 'fail2' }
          ]
        }
      },
      results: {
        success: '¡Muy bien! Identificas cuándo usar diseños experimentales y cuasiexperimentales.',
        fail1: 'Un diseño descriptivo no manipula variables. ¡Sigue repasando!',
        fail2: 'El correlacional no manipula variables, solo mide asociaciones.'
      }
    },
    modulo6: {
      start: 's1',
      steps: {
        s1: {
          question: 'Para generalizar resultados se recomienda…',
          options: [
            { text: 'Muestreo probabilístico', next: 's2' },
            { text: 'Elegir a los amigos que pasen por allí', next: 'fail1' }
          ]
        },
        s2: {
          question: 'El tamaño muestral depende de…',
          options: [
            { text: 'Precisión deseada y variabilidad', next: 'success' },
            { text: 'La cantidad de café que tengas', next: 'fail2' }
          ]
        }
      },
      results: {
        success: '¡Acierto! Un buen muestreo es la base de inferencias fiables.',
        fail1: 'Eso se llama muestreo por “colegas”, no es recomendable.',
        fail2: 'Por más café que bebas, el tamaño de la muestra no cambiará. ☕'
      }
    }
  };

  // ========================================
  // MEJORAS NUEVAS - AÑADIR SIN ROMPER
  // ========================================

  function initProgressBar() {
    // Solo crear barra de progreso si no existe
    if (document.querySelector('.progress-container')) return;

    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    progressContainer.innerHTML = `
        <div class="progress-bar"></div>
        <div class="progress-text">0/6 módulos (0%)</div>
    `;
    document.body.appendChild(progressContainer);

    setTimeout(() => {
      progressContainer.classList.add('visible');
    }, 500);

    updateProgressBar();
  }

  function updateProgressBar() {
    const progress = loadProgress();
    const completed = Object.values(progress).filter(m => m.completed).length;
    const total = Object.keys(progress).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');
    if (progressBar && progressText) {
      progressBar.style.width = `${percentage}%`;
      progressText.textContent = `${completed}/${total} módulos (${percentage}%)`;
    }
  }

  function initPDFDownload() {
    // Solo crear botón si no existe
    if (document.querySelector('.pdf-download')) return;

    const downloadContainer = document.createElement('div');
    downloadContainer.className = 'pdf-download';
    // Crear el botón toggle y el menú de descargas correctamente
    downloadContainer.innerHTML = `
      <button id="pdfToggle" class="pdf-toggle">
        📚 <span class="btn-text">Descargas</span>
      </button>
      <div class="pdf-download-menu" id="pdfMenu">
        ${Object.entries(PDF_FILES)
          .map(([module, file]) => `
            <a href="${file}" download class="pdf-menu-item" data-module="${module}">
              📄 ${getModuleName(module)}
            </a>
          `)
          .join('')}
      </div>
    `;
    document.body.appendChild(downloadContainer);

    const toggleBtn = document.getElementById('pdfToggle');
    const menu = document.getElementById('pdfMenu');
    toggleBtn.addEventListener('click', () => {
      menu.classList.toggle('visible');
    });
    document.addEventListener('click', (e) => {
      if (!downloadContainer.contains(e.target)) {
        menu.classList.remove('visible');
      }
    });
    downloadContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('pdf-menu-item')) {
        const module = e.target.getAttribute('data-module');
        trackPDFDownload(module);
      }
    });
  }

  function getModuleName(module) {
    const moduleNames = {
      modulo1: 'Problema de investigación',
      modulo2: 'Objetivos de investigación',
      modulo3: 'Hipótesis de investigación',
      modulo4: 'Constructos y variables',
      modulo5: 'Diseño de investigación',
      modulo6: 'Población, muestra y muestreo'
    };
    return moduleNames[module] || module;
  }

  function trackPDFDownload(module) {
    // Utilizar template literal para registrar correctamente el módulo
    console.log(`📥 PDF descargado: ${module}`);
    const downloads = JSON.parse(localStorage.getItem('pdf_downloads') || '{}');
    downloads[module] = new Date().toISOString();
    localStorage.setItem('pdf_downloads', JSON.stringify(downloads));
  }

  function initAnimations() {
    // Solo en desktop para mejor rendimiento
    if (window.innerWidth <= 768) return;
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
      document.querySelectorAll('.module-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        observer.observe(card);
      });
    }
  }

  // ========================================
  // INICIALIZACIÓN
  // ========================================
  document.addEventListener('DOMContentLoaded', () => {
    const slug = document.body.getAttribute('data-module-slug');
    if (slug) {
      initModule(slug);
    } else {
      initIndex();
    }
  });
})();
