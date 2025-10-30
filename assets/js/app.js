/*
 * modified_app.js
 *
 * Esta versión de la lógica de interacción incluye mejoras solicitadas
 * por el Prof. Morosini para la experiencia de formación en
 * Metodología de la Investigación. Se adapta el cuestionario para
 * seleccionar únicamente 5 ítems en cada intento, muestra la
 * retroalimentación específica de cada pregunta al finalizar y
 * ofrece un botón para volver a intentar el cuestionario, mezclando
 * aleatoriamente las preguntas disponibles. Además, mantiene el
 * comportamiento original de bloqueo/desbloqueo de módulos basado en
 * la puntuación del usuario.
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
  }

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
  }

  function initModule(slug) {
    setupFlipCards();
    setupQuiz(slug);
    setupDecisionSimulation(slug);
  }

  function setupFlipCards() {
    const cards = document.querySelectorAll('.flip-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('is-flipped');
      });
    });
  }

  /**
   * Configura el cuestionario para un módulo. Selecciona 5 preguntas al azar,
   * renderiza las opciones, calcula el puntaje, muestra retroalimentación
   * por ítem y ofrece la posibilidad de reintentar el cuestionario con
   * nuevas preguntas mezcladas.
   * @param {string} slug Slug del módulo actual.
   */
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
          // Barajar y tomar 5 preguntas
          const shuffled = items.slice().sort(() => Math.random() - 0.5).slice(0, 5);
          renderQuizQuestions(shuffled, quizContainer);
          feedbackEl.textContent = '';
          // Quitar retroalimentaciones previas
          const prevFeedbacks = quizContainer.querySelectorAll('.item-feedback');
          prevFeedbacks.forEach(el => el.remove());
          // Eliminar botón de reintento si existe
          const prevRetake = document.getElementById('quiz-retake');
          if (prevRetake) prevRetake.remove();
          submitBtn.disabled = false;
          submitBtn.onclick = function() {
            // Prevenir múltiples envíos hasta reintento
            submitBtn.disabled = true;
            const score = evaluateQuiz(shuffled);
            const progress = loadProgress();
            progress[slug] = { completed: true, score: score };
            saveProgress(progress);
            // Mostrar mensaje de desempeño general
            if (score >= 0.8) {
              feedbackEl.textContent = `¡Excelente! Obtuviste ${(score * 100).toFixed(0)}%. Se ha desbloqueado el siguiente módulo.`;
            } else if (score >= 0.6) {
              feedbackEl.textContent = `¡Buen intento! Obtuviste ${(score * 100).toFixed(0)}%. Puedes avanzar, pero te recomendamos repasar el material.`;
            } else {
              feedbackEl.textContent = `Obtuviste ${(score * 100).toFixed(0)}%. Te sugerimos repasar la lectura y las tarjetas antes de continuar.`;
            }
            // Mostrar retroalimentación individual
            showItemFeedback(shuffled, quizContainer);
            // Agregar botón de reintento
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

  document.addEventListener('DOMContentLoaded', () => {
    const slug = document.body.getAttribute('data-module-slug');
    if (slug) {
      initModule(slug);
    } else {
      initIndex();
    }
  });
})();
