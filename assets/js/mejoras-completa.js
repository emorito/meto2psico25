// MEJORAS COMPLETA - Iconos, Texto y Cuestionario Mejorado
(function() {
  console.log('🎯 INICIANDO MEJORAS COMPLETAS...');
  
  // Lista de íconos para cada módulo
  const ICONOS_UNIDADES = {
    'modulo1': '🔍', // Problema de investigación - lupa
    'modulo2': '📚', // Marco teórico - libros
    'modulo3': '🧪', // Metodología - experimentos
    'modulo4': '📊', // Análisis - gráficos
    'modulo5': '✍️', // Redacción - bolígrafo
    'modulo6': '📈'  // Presentación - tendencias
  };
  
  // Aplicar mejoras cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 DOM LISTO - APLICANDO MEJORAS');
    
    // 3. Agregar íconos a títulos de unidades
    agregarIconosUnidades();
    
    // 4. Agregar texto descriptivo
    agregarTextoDescriptivo();
    
    // 5. Mejorar cuestionarios
    mejorarCuestionarios();
    
    console.log('✅ TODAS LAS MEJORAS APLICADAS');
  });
  
  // 3. FUNCIÓN: Agregar íconos a títulos de unidades
  function agregarIconosUnidades() {
    const slug = document.body.dataset.moduleSlug || obtenerSlugActual();
    const icono = ICONOS_UNIDADES[slug];
    
    if (icono) {
      const titulo = document.querySelector('h2, h1');
      if (titulo && !titulo.querySelector('.icono-unidad')) {
        const spanIcono = document.createElement('span');
        spanIcono.className = 'icono-unidad';
        spanIcono.textContent = `${icono} `;
        spanIcono.style.cssText = `
          display: inline-block;
          margin-right: 0.5rem;
          font-size: 1.5rem;
          vertical-align: middle;
        `;
        
        titulo.insertBefore(spanIcono, titulo.firstChild);
        console.log(`✅ ICONO AGREGADO: ${icono} a unidad`);
      }
    }
  }
  
  // 4. FUNCIÓN: Agregar texto descriptivo
  function agregarTextoDescriptivo() {
    const primerTitulo = document.querySelector('h2, h1');
    
    if (primerTitulo && !document.querySelector('.texto-descriptivo-unidades')) {
      const parrafo = document.createElement('p');
      parrafo.className = 'texto-descriptivo-unidades';
      parrafo.innerHTML = `
        <strong>📚 Espacio de preparación para el examen de Metodología de la Investigación</strong><br>
        Estas son las unidades temáticas que dominarás para tu evaluación final.
      `;
      parrafo.style.cssText = `
        background: rgba(227, 83, 54, 0.1);
        border: 2px solid #E35336;
        border-radius: 8px;
        padding: 1rem;
        margin: 1rem 0;
        font-size: 0.95rem;
        line-height: 1.5;
      `;
      
      primerTitulo.parentNode.insertBefore(parrafo, primerTitulo.nextSibling);
      console.log('✅ TEXTO DESCRIPTIVO AGREGADO');
    }
  }
  
  // 5. FUNCIÓN: Mejorar cuestionarios
  function mejorarCuestionarios() {
    // Mejorar espaciado de opciones
    const opciones = document.querySelectorAll('.quiz-options label');
    opciones.forEach((opcion) => {
      opcion.style.cssText += `
        margin-bottom: 0.5rem !important;
        padding: 0.75rem !important;
        display: block !important;
        line-height: 1.4 !important;
        font-size: 0.95rem !important;
      `;
    });
    
    // Mejorar feedback del quiz
    const feedback = document.querySelector('#quiz-feedback, .quiz-feedback');
    if (feedback) {
      feedback.style.cssText += `
        margin: 1rem 0 !important;
        padding: 1rem !important;
        font-weight: 400 !important;
        font-size: 0.9rem !important;
        line-height: 1.5 !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        margin-bottom: 3rem !important;
      `;
    }
    
    // Mejorar botones de acción
    const botones = document.querySelectorAll('.quiz-submit, .quiz-retry, button');
    botones.forEach((boton) => {
      boton.style.cssText += `
        margin: 0.5rem 0.25rem !important;
        padding: 0.6rem 1.2rem !important;
        font-size: 0.9rem !important;
      `;
    });
    
    console.log('✅ CUESTIONARIOS MEJORADOS');
  }
  
  // Función auxiliar para obtener el slug del módulo
  function obtenerSlugActual() {
    const path = window.location.pathname;
    const archivo = path.split('/').pop();
    return archivo.replace('.html', '');
  }
  
  // Función para agregar ícono al encabezado del cuestionario
  function agregarIconoCuestionario() {
    const tituloQuiz = document.querySelector('.quiz-question h4');
    if (tituloQuiz && !tituloQuiz.querySelector('.icono-cuestionario')) {
      const icono = document.createElement('span');
      icono.className = 'icono-cuestionario';
      icono.textContent = '🎯 ';
      icono.style.cssText = `
        display: inline-block;
        margin-right: 0.5rem;
        font-size: 1.2rem;
        vertical-align: middle;
      `;
      
      tituloQuiz.insertBefore(icono, tituloQuiz.firstChild);
    }
  }
  
  // Aplicar también cuando la página esté completamente cargada
  window.addEventListener('load', function() {
    agregarIconoCuestionario();
  });
  
})();
