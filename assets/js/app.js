/*
 * app.js
 *
 * Este archivo implementa la lógica de interactividad y progresión para el
 * sitio web de metodología de la investigación. Se encarga de gestionar el
 * progreso del usuario, bloquear y desbloquear módulos según el resultado
 * de los cuestionarios, cargar los bancos de ítems y renderizar los
 * cuestionarios, las actividades de tipo flip‑card y las simulaciones de
 * decisiones. El progreso se guarda en el localStorage del navegador.
 */

(() => {
  // Configuración de los módulos en orden.  No se realiza fetch para
  // simplificar el código; los nombres deben coincidir con los slugs y
  // archivos existentes.
  const MODULES = [
    { slug: 'modulo1', title: 'Problema de investigación' },
    { slug: 'modulo2', title: 'Objetivos de investigación' },
    { slug: 'modulo3', title: 'Hipótesis de investigación' },
    { slug: 'modulo4', title: 'Constructos y variables' },
    { slug: 'modulo5', title: 'Diseño de investigación' },
    { slug: 'modulo6', title: 'Población, muestra y muestreo' }
  ];

  // Plantilla de progreso inicial. Cada módulo comienza sin completar.
  const PROGRESS_TEMPLATE = MODULES.reduce((obj, mod) => {
    obj[mod.slug] = { completed: false, score: null };
    return obj;
  }, {});

  /**
   * Devuelve el objeto de progreso almacenado en localStorage o la plantilla
   * inicial si aún no existe. Esta función siempre devuelve un objeto
   * completamente inicializado.
   */
  function loadProgress() {
    const data = localStorage.getItem('progreso');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        // Asegurar que todas las claves existen
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
    // Si no existe o falló el parseo, se devuelve la plantilla y se guarda
    saveProgress(PROGRESS_TEMPLATE);
    return { ...PROGRESS_TEMPLATE };
  }

  /**
   * Guarda el objeto de progreso en localStorage.
   */
  function saveProgress(prog) {
    localStorage.setItem('progreso', JSON.stringify(prog));
  }

  /**
   * Inicializa la página de inicio: muestra los módulos y bloquea los que
   * corresponda en función del progreso.
   */
  function initIndex() {
    const progress = loadProgress();
    const cards = document.querySelectorAll('.module-card');
    cards.forEach(card => {
      const index = parseInt(card.getAttribute('data-index'), 10);
      const slug = card.getAttribute('data-slug');
      const btn = card.querySelector('.start-btn');
      // Por defecto el primer módulo está disponible
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
          // Navegar al módulo
          window.location.href = `modules/${slug}.html`;
        });
      }
    });
  }

  /**
   * Inicializa una página de módulo. Configura las flip‑cards, el
   * cuestionario y la simulación de decisiones.
   * @param {string} slug Slug del módulo, por ejemplo "modulo1".
   */
  function initModule(slug) {
    setupFlipCards();
    setupQuiz(slug);
    setupDecisionSimulation(slug);
  }

  /**
   * Añade el comportamiento de giro a todas las tarjetas de la página.
   */
  function setupFlipCards() {
    const cards = document.querySelectorAll('.flip-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('is-flipped');
      });
    });
  }

  /**
   * Carga el banco de ítems y construye el cuestionario. El usuario
   * responde y se calcula la puntuación. Los resultados se almacenan en
   * el progreso, desbloqueando el siguiente módulo si corresponde.
   * @param {string} slug Slug del módulo actual.
   */
  function setupQuiz(slug) {
    const quizContainer = document.getElementById('quiz-container');
    const submitBtn = document.getElementById('quiz-submit');
    const feedbackEl = document.getElementById('quiz-feedback');
    // Ruta relativa al archivo de datos (módulos están en subcarpeta modules/)
    const dataPath = `../data/items_${slug}.json`;
    fetch(dataPath)
      .then(resp => resp.json())
      .then(data => {
        const items = data.items || [];
        // Mezclar aleatoriamente y tomar 7 preguntas (o todas si hay menos)
        const shuffled = items.sort(() => Math.random() - 0.5).slice(0, 7);
        renderQuizQuestions(shuffled, quizContainer);
        submitBtn.addEventListener('click', () => {
          const score = evaluateQuiz(shuffled);
          const progress = loadProgress();
          // Guardar la puntuación
          progress[slug] = { completed: true, score: score };
          saveProgress(progress);
          // Mostrar mensaje
          if (score >= 0.8) {
            feedbackEl.textContent = `¡Excelente! Obtuviste ${(score * 100).toFixed(0)}%. Se ha desbloqueado el siguiente módulo.`;
          } else if (score >= 0.6) {
            feedbackEl.textContent = `¡Buen intento! Obtuviste ${(score * 100).toFixed(0)}%. Puedes avanzar, pero te recomendamos repasar el material.`;
          } else {
            feedbackEl.textContent = `Obtuviste ${(score * 100).toFixed(0)}%. Te sugerimos repasar la lectura y las tarjetas antes de continuar.`;
          }
        }, { once: true });
      })
      .catch(err => {
        console.error('Error al cargar el banco de ítems:', err);
        quizContainer.innerHTML = '<p>No se pudo cargar el cuestionario.</p>';
        submitBtn.style.display = 'none';
      });
  }

  /**
   * Renderiza las preguntas del cuestionario en el contenedor.
   * @param {Array} items Lista de preguntas.
   * @param {HTMLElement} container Contenedor donde se insertan las preguntas.
   */
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
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `q${idx}`;
        radio.value = optIdx;
        label.appendChild(radio);
        label.appendChild(document.createTextNode(opt));
        li.appendChild(label);
        ul.appendChild(li);
      });
      qDiv.appendChild(ul);
      container.appendChild(qDiv);
    });
  }

  /**
   * Evalúa las respuestas del usuario y devuelve el puntaje en la escala 0‑1.
   * @param {Array} items Lista de preguntas con índices de opción correcta.
   */
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

  /**
   * Configura la simulación de decisiones para un módulo. Cada módulo tiene un
   * pequeño árbol de decisiones codificado en el objeto `SIMULATIONS`. El
   * usuario avanza a través de las preguntas y recibe un mensaje final.
   * @param {string} slug Slug del módulo.
   */
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
            // Final result
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

  // Definición de simulaciones por módulo. Cada simulación incluye un
  // identificador de paso inicial, un objeto `steps` con preguntas y
  // opciones que apuntan a más pasos o a resultados, y un objeto
  // `results` con mensajes de salida. Esto permite crear rutas tipo
  // "elige tu propio camino".
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

  // Poner en marcha el script cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', () => {
    const slug = document.body.getAttribute('data-module-slug');
    if (slug) {
      initModule(slug);
    } else {
      initIndex();
    }
  });
})();