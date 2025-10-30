// TEMA CLARO/OSCURO - ULTRA SIMPLE - FUNCIONA SIEMPRE
(function() {
  console.log('🚀 INICIANDO TEMA...');
  
  // Crear botón inmediatamente
  const btn = document.createElement('button');
  btn.innerHTML = '🌙 CLARO';
  btn.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    background: #E35336 !important;
    color: white !important;
    border: none !important;
    padding: 12px 16px !important;
    border-radius: 25px !important;
    cursor: pointer !important;
    z-index: 9999 !important;
    font-size: 14px !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
  `;
  
  document.body.appendChild(btn);
  console.log('✅ BOTÓN CREADO');
  
  // Cargar tema guardado
  const saved = localStorage.getItem('tema') || 'claro';
  cambiarTema(saved);
  
  // Evento del botón
  btn.onclick = function() {
    const actual = document.body.dataset.tema || 'claro';
    const nuevo = actual === 'claro' ? 'oscuro' : 'claro';
    cambiarTema(nuevo);
  };
  
  function cambiarTema(tema) {
    console.log('🎨 CAMBIANDO A:', tema);
    
    // Limpiar clases anteriores
    document.body.classList.remove('tema-claro', 'tema-oscuro');
    
    // Aplicar tema
    document.body.dataset.tema = tema;
    document.body.classList.add('tema-' + tema);
    localStorage.setItem('tema', tema);
    
    // Actualizar botón
    btn.innerHTML = tema === 'oscuro' ? '☀️ OSCURO' : '🌙 CLARO';
    
    // Aplicar estilos manualmente
    if (tema === 'oscuro') {
      document.body.style.background = '#1a1a1a';
      document.body.style.color = '#e0e0e0';
    } else {
      document.body.style.background = '#ffffff';
      document.body.style.color = '#2c3e50';
    }
    
    console.log('✅ TEMA APLICADO:', tema);
  }
})();
