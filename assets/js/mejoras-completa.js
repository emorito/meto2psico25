// MEJORAS COMPLETA - SIN CONFLICTOS CON FLIP-CARDS
(function() {
  console.log('🎯 INICIANDO MEJORAS COMPLETAS SIN CONFLICTOS...');
  
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
    console.log('📋 DOM LISTO - APLICANDO MEJORAS SIN CONFLICTOS');
    
    // 1. Agregar íconos a títulos de unidades (solo en módulos específicos)
    agregarIconosUnidades();
    
    // 2. Agregar texto descriptivo SOLO en portada principal (verificar si estamos en home)
    agregarTextoDescriptivoSoloPortada();
    
    // ❌ ELIMINADA LA FUNCIÓN PROBLEMÁTICA: corregirFlipCards()
    // Las flip-cards ya funcionan correctamente con app.js
    
    // 3. Mejorar contraste en modo claro (sin tocar flip-cards)
    mejorarContrasteModoClaro();
    
    // 4. Mejorar cuestionarios
    mejorarCuestionarios();
    
    console.log('✅ TODAS LAS MEJORAS APLICADAS SIN CONFLICTOS');
  });
  
  // 1. FUNCIÓN: Agregar íconos a títulos de unidades (solo módulos específicos)
  function agregarIconosUnidades() {
    const slug = document.body.dataset.moduleSlug || obtenerSlugActual();
    console.log(`🎯 Slug detectado: ${slug}`);
    
    // Solo aplicar en módulos específicos
    if (ICONOS_UNIDADES[slug]) {
      const headers = document.querySelectorAll('h2');
      
      headers.forEach(header => {
        const texto = header.textContent.toLowerCase();
        let icono = null;
        
        // Asignar íconos según el contenido del header
        if (texto.includes('problema')) {
          icono = ICONOS_UNIDADES.modulo1; // 🔍
        } else if (texto.includes('marco') || texto.includes('teóric')) {
          icono = ICONOS_UNIDADES.modulo2; // 📚
        } else if (texto.includes('metodolog') || texto.includes('método')) {
          icono = ICONOS_UNIDADES.modulo3; // 🧪
        } else if (texto.includes('análisis') || texto.includes('datos')) {
          icono = ICONOS_UNIDADES.modulo4; // 📊
        } else if (texto.includes('redacción') || texto.includes('escritur')) {
          icono = ICONOS_UNIDADES.modulo5; // ✍️
        } else if (texto.includes('presentación') || texto.includes('resultados')) {
          icono = ICONOS_UNIDADES.modulo6; // 📈
        }
        
        if (icono && !header.querySelector('.icono-unidad')) {
          const spanIcono = document.createElement('span');
          spanIcono.className = 'icono-unidad';
          spanIcono.textContent = icono;
          spanIcono.style.cssText = `
            font-size: 1.2em;
            margin-right: 8px;
            display: inline-block;
          `;
          header.insertBefore(spanIcono, header.firstChild);
          console.log(`✅ Ícono ${icono} agregado a: ${texto}`);
        }
      });
    }
  }
  
  // 2. FUNCIÓN: Agregar texto descriptivo SOLO en portada principal
  function agregarTextoDescriptivoSoloPortada() {
    // Verificar si estamos en la página principal (portada)
    const esPortada = esPaginaPrincipal();
    
    if (esPortada) {
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
          text-align: center;
          font-size: 1.1em;
          line-height: 1.4;
          box-shadow: 0 2px 8px rgba(227, 83, 54, 0.1);
        `;
        
        primerTitulo.insertAdjacentElement('afterend', parrafo);
        console.log('✅ Texto descriptivo agregado SOLO en portada');
      }
    } else {
      console.log('🚫 No estamos en portada - omitiendo texto descriptivo');
    }
  }
  
  // 3. FUNCIÓN: Mejorar contraste en modo claro (SIN TOCAR FLIP-CARDS)
  function mejorarContrasteModoClaro() {
    const style = document.createElement('style');
    style.id = 'contraste-mejorado';
    style.textContent = `
      /* === MEJORAS DE CONTRASTE EN MODO CLARO === */
      
      /* Botón NOTEBOOK LM: mejor contraste en modo claro */
      .tema-claro .notebook {
        background: #f8f9fa !important;
        border: 2px solid #dee2e6 !important;
        color: #2c3e50 !important;
      }
      
      /* Asegurar que todos los botones tengan buen contraste */
      .tema-claro button:not(.nav-button):not(.demo-button) {
        background: #E35336 !important;
        color: white !important;
        border: none !important;
      }
      
      .tema-claro button:not(.nav-button):not(.demo-button):hover {
        background: #C44529 !important;
      }
      
      /* Solo mejorar contraste general, NO FLIP-CARDS (ya funcionan bien) */
    `;
    
    document.head.appendChild(style);
    console.log('✅ Estilos de contraste mejorado agregados (sin flip-cards)');
  }
  
  // 4. FUNCIÓN: Mejorar cuestionarios (espaciado y posición)
  function mejorarCuestionarios() {
    const style = document.createElement('style');
    style.id = 'cuestionarios-mejorados';
    style.textContent = `
      /* === MEJORAS EN CUESTIONARIOS === */
      
      /* Reducir espaciado entre opciones */
      .quiz-options li {
        margin-bottom: 0.6rem !important;
      }
      
      .quiz-options li:last-child {
        margin-bottom: 0 !important;
      }
      
      /* Botones del cuestionario */
      .quiz-submit-btn {
        margin-top: 1.5rem !important;
        display: block !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }
      
      /* Feedback del quiz: evitar superposición */
      .quiz-feedback {
        margin-bottom: 1.5rem !important;
        clear: both !important;
      }
      
      /* Respuestas de quiz en modo claro */
      .tema-claro .quiz-options label {
        color: #2c3e50 !important;
        background: #ffffff !important;
        border: 1px solid #dee2e6 !important;
      }
      
      .tema-claro .quiz-options label:hover {
        background: #f8f9fa !important;
        border-color: #E35336 !important;
      }
      
      .tema-claro .quiz-question h4,
      .tema-claro .decision-step p {
        color: #2c3e50 !important;
      }
    `;
    
    document.head.appendChild(style);
    console.log('✅ Estilos de cuestionarios mejorados');
  }
  
  // FUNCIÓN AUXILIAR: Detectar si estamos en la página principal
  function esPaginaPrincipal() {
    // Detectar por título o URL o presencia de elementos específicos de portada
    const titulo = document.title.toLowerCase();
    const url = window.location.pathname.toLowerCase();
    const h1 = document.querySelector('h1');
    
    // Criterios para identificar portada:
    // 1. Título contiene "metodología" y "investigación"
    // 2. URL es index o home
    // 3. H1 contiene texto específico de inicio
    
    const esPorTitulo = titulo.includes('metodología') && titulo.includes('investigación');
    const esPorUrl = url.includes('index') || url === '/' || url.endsWith('.html') && !url.includes('modulo');
    const esPorH1 = h1 && (h1.textContent.includes('Metodología') || h1.textContent.includes('Investigación'));
    
    const esPortada = esPorTitulo || esPorUrl || esPorH1;
    
    console.log(`🏠 Detección de portada - Título: ${esPorTitulo}, URL: ${esPorUrl}, H1: ${esPorH1}, Resultado: ${esPortada}`);
    return esPortada;
  }
  
  // FUNCIÓN AUXILIAR: Obtener slug del módulo actual
  function obtenerSlugActual() {
    const path = window.location.pathname;
    const match = path.match(/modulo(\d+)/);
    return match ? `modulo${match[1]}` : 'desconocido';
  }
  
})();
