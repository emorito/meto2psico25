// ========================================
// TOGGLE DE TEMA CLARO/OSCURO PARA MÓDULOS
// ========================================

function initThemeToggle() {
  // Crear botón de toggle si no existe
  if (document.querySelector('.theme-toggle')) return;

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'theme-toggle';
  toggleBtn.setAttribute('aria-label', 'Cambiar tema');
  toggleBtn.innerHTML = `
    <span class="sun-icon">☀️</span>
    <span class="moon-icon">🌙</span>
  `;
  
  // Insertar después del header
  const header = document.querySelector('header');
  if (header) {
    header.appendChild(toggleBtn);
  } else {
    document.body.insertBefore(toggleBtn, document.body.firstChild);
  }

  // Cargar tema guardado o usar predeterminado
  const savedTheme = localStorage.getItem('module_theme') || 'light';
  setTheme(savedTheme);

  // Event listener para cambio de tema
  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('module_theme', theme);
  }
}

// Llamar al inicializar módulos
if (typeof window !== 'undefined') {
  // Si se ejecuta en contexto del navegador
  document.addEventListener('DOMContentLoaded', initThemeToggle);
}
