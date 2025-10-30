/*
* JAVASCRIPT COMPLETO OPTIMIZADO
* Incluye: Barra progreso, descarga PDFs, controles video, animaciones
* Compatible con el app.js existente
*/
(function() {
'use strict';
// ========================================
// VARIABLES GLOBALES
// ========================================
const PROGRESS_UPDATE_INTERVAL = 30000; // 30 segundos
const PDF_FILES = {
'modulo1': 'assets/readings/problemas_hipotesis.pdf',
'modulo2': 'assets/readings/objetivos.pdf', 
'modulo3': 'assets/readings/hipotesis.pdf',
'modulo4': 'assets/readings/variables.pdf',
'modulo5': 'assets/readings/disenos.pdf',
'modulo6': 'assets/readings/muestreo.pdf'
};
// ========================================
// BARRA DE PROGRESO
// ========================================
function initProgressBar() {
// Crear contenedor de la barra
const progressContainer = document.createElement('div');
progressContainer.className = 'progress-container';
progressContainer.innerHTML = `
<div class="progress-bar"></div>
<div class="progress-text">0% completado</div>
`;
document.body.appendChild(progressContainer);
// Mostrar después de un breve delay
setTimeout(() => {
progressContainer.classList.add('visible');
}, 500);
// Actualizar progreso inicial
updateProgressBar();
// Auto-actualizar cada 30 segundos
setInterval(updateProgressBar, PROGRESS_UPDATE_INTERVAL);
}
function updateProgressBar() {
const progress = loadProgress();
const completed = Object.values(progress).filter(m => m.completed).length;
const total = Object.keys(progress).length;
const percentage = Math.round((completed / total) * 100);
const progressBar = document.querySelector('.progress-bar');
const progressText = document.querySelector('.progress-text');
if (progressBar && progressText) {
progressBar.style.width = `${percentage}%`;
progressText.textContent = `${completed}/${total} módulos (${percentage}%)`;
}
}
// ========================================
// DESCARGA DE PDFs
// ========================================
function initPDFDownload() {
// Crear botón de descarga
const downloadContainer = document.createElement('div');
downloadContainer.className = 'pdf-download';
downloadContainer.innerHTML = `
<button class="pdf-download-btn" id="pdfToggle" aria-label="Descargar PDFs">
📚 <span class="btn-text">Descargas</span>
</button>
<div class="pdf-download-menu" id="pdfMenu">
${Object.entries(PDF_FILES).map(([module, file]) => 
`<a href="${file}" download class="pdf-menu-item" data-module="${module}">
📄 ${getModuleName(module)}
</a>`
).join('')}
</div>
`;
document.body.appendChild(downloadContainer);
// Event listeners
const toggleBtn = document.getElementById('pdfToggle');
const menu = document.getElementById('pdfMenu');
toggleBtn.addEventListener('click', () => {
menu.classList.toggle('visible');
});
// Cerrar menú al hacer click fuera
document.addEventListener('click', (e) => {
if (!downloadContainer.contains(e.target)) {
menu.classList.remove('visible');
}
});
// Tracking de descargas
downloadContainer.addEventListener('click', (e) => {
if (e.target.classList.contains('pdf-menu-item')) {
const module = e.target.getAttribute('data-module');
trackPDFDownload(module);
}
});
}
function getModuleName(module) {
const moduleNames = {
'modulo1': 'Problema de investigación',
'modulo2': 'Objetivos de investigación', 
'modulo3': 'Hipótesis de investigación',
'modulo4': 'Constructos y variables',
'modulo5': 'Diseño de investigación',
'modulo6': 'Población, muestra y muestreo'
};
return moduleNames[module] || module;
}
function trackPDFDownload(module) {
// Analytics simple - puedes integrar con Google Analytics
console.log(`📥 PDF descargado: ${module}`);
// Actualizar progreso local si es necesario
const downloads = JSON.parse(localStorage.getItem('pdf_downloads') || '{}');
downloads[module] = new Date().toISOString();
localStorage.setItem('pdf_downloads', JSON.stringify(downloads));
}
// ========================================
// CONTROLES DE VIDEO
// ========================================
function initVideoControls() {
const video = document.querySelector('.hero-video');
if (!video) return;
// Optimización de carga
video.addEventListener('loadeddata', () => {
console.log('✅ Video cargado exitosamente');
});
video.addEventListener('error', (e) => {
console.warn('⚠️ Error en video, usando fallback');
// Aquí podrías mostrar una imagen estática como fallback
});
// Auto-pause en conexiones lentas
const connection = navigator.connection;
if (connection && connection.effectiveType && 
(connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
video.pause();
console.log('📱 Video pausado en conexión lenta');
}
// Optimización de rendimiento
if ('IntersectionObserver' in window) {
const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
if (video.paused) video.play();
} else {
if (!video.paused) video.pause();
}
});
}, { threshold: 0.1 });
observer.observe(video);
}
}
// ========================================
// ANIMACIONES SUTILES
// ========================================
function initAnimations() {
// Observador de intersección para animaciones al hacer scroll
if ('IntersectionObserver' in window) {
const observerOptions = {
threshold: 0.1,
rootMargin: '0px 0px -50px 0px'
};
const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
observer.unobserve(entry.target);
}
});
}, observerOptions);
// Observar módulos
document.querySelectorAll('.module-card').forEach(card => {
card.style.opacity = '0';
card.style.transform = 'translateY(20px)';
observer.observe(card);
});
// Observar sección intro
const introSection = document.querySelector('.intro-section');
if (introSection) {
introSection.style.opacity = '0';
introSection.style.transform = 'translateY(20px)';
observer.observe(introSection);
}
}
// Animación de partículas sutiles
createSubtleParticles();
}
function createSubtleParticles() {
const particleContainer = document.querySelector('.floating-particles');
if (!particleContainer) return;
// Solo en desktop para mejor rendimiento
if (window.innerWidth > 768) {
const particleCount = 8;
for (let i = 0; i < particleCount; i++) {
const particle = document.createElement('div');
particle.className = 'floating-particle';
particle.style.cssText = `
position: absolute;
width: 2px;
height: 2px;
background: rgba(227, 83, 54, 0.3);
border-radius: 50%;
left: ${Math.random() * 100}%;
top: ${Math.random() * 100}%;
animation: float ${5 + Math.random() * 5}s infinite ease-in-out;
animation-delay: ${Math.random() * 3}s;
pointer-events: none;
`;
particleContainer.appendChild(particle);
}
}
}
// ========================================
// MEJORAS DE ACCESIBILIDAD
// ========================================
function initAccessibility() {
// Skip link para navegación por teclado
const skipLink = document.createElement('a');
skipLink.href = '#main-content';
skipLink.textContent = 'Saltar al contenido principal';
skipLink.className = 'skip-link';
skipLink.style.cssText = `
position: absolute;
top: -40px;
left: 6px;
background: var(--color-primary);
color: white;
padding: 8px;
text-decoration: none;
z-index: 1001;
border-radius: 4px;
transition: top 0.3s;
`;
skipLink.addEventListener('focus', () => {
skipLink.style.top = '6px';
});
skipLink.addEventListener('blur', () => {
skipLink.style.top = '-40px';
});
document.body.insertBefore(skipLink, document.body.firstChild);
// Añadir ID al contenido principal
const mainContent = document.querySelector('main') || document.querySelector('.modules-grid');
if (mainContent && !mainContent.id) {
mainContent.id = 'main-content';
}
// Atributos ARIA para botón de PDFs
const pdfToggle = document.getElementById('pdfToggle');
if (pdfToggle) {
pdfToggle.setAttribute('aria-expanded', 'false');
pdfToggle.setAttribute('aria-haspopup', 'true');
pdfToggle.addEventListener('click', () => {
const isExpanded = pdfToggle.getAttribute('aria-expanded') === 'true';
pdfToggle.setAttribute('aria-expanded', !isExpanded);
});
}
// Announce progress updates para lectores de pantalla
const progressAnnouncer = document.createElement('div');
progressAnnouncer.setAttribute('aria-live', 'polite');
progressAnnouncer.setAttribute('aria-atomic', 'true');
progressAnnouncer.className = 'sr-only';
progressAnnouncer.style.cssText = `
position: absolute;
left: -10000px;
width: 1px;
height: 1px;
overflow: hidden;
`;
document.body.appendChild(progressAnnouncer);
// Función para anunciar cambios de progreso
window.announceProgress = function(message) {
progressAnnouncer.textContent = message;
};
}
// ========================================
// OPTIMIZACIONES DE RENDIMIENTO
// ========================================
function initPerformanceOptimizations() {
// Lazy loading de imágenes
if ('IntersectionObserver' in window) {
const imageObserver = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
const img = entry.target;
if (img.dataset.src) {
img.src = img.dataset.src;
img.removeAttribute('data-src');
imageObserver.unobserve(img);
}
}
});
});
document.querySelectorAll('img[data-src]').forEach(img => {
imageObserver.observe(img);
});
}
// Preload de recursos críticos
const preloadLinks = [
{ href: 'assets/img/cerebro_efficient.mp4', as: 'video', type: 'video/mp4' }
];
preloadLinks.forEach(link => {
const preloadLink = document.createElement('link');
preloadLink.rel = 'preload';
preloadLink.href = link.href;
preloadLink.as = link.as;
if (link.type) preloadLink.type = link.type;
document.head.appendChild(preloadLink);
});
// Detectar conexión lenta y optimizar
if (navigator.connection) {
const connection = navigator.connection;
if (connection.effectiveType && 
(connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
// Desactivar animaciones no esenciales en conexión lenta
document.documentElement.style.setProperty('--transition-smooth', 'all 0.1s ease');
// Reducir número de partículas
const particles = document.querySelectorAll('.floating-particle');
particles.forEach((particle, index) => {
if (index > 3) particle.style.display = 'none';
});
}
}
}
// ========================================
// INICIALIZACIÓN
// ========================================
function init() {
// Verificar que estamos en la página principal
if (!document.body.getAttribute('data-module-slug')) {
initProgressBar();
initPDFDownload();
initAnimations();
initAccessibility();
initPerformanceOptimizations();
}
// Siempre inicializar controles de video
initVideoControls();
console.log('🚀 Sistema completo inicializado con todas las mejoras');
}
// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', init);
} else {
init();
}
// Funciones globales necesarias para compatibilidad
window.loadProgress = window.loadProgress || function() {
const data = localStorage.getItem('progreso');
if (data) {
try {
return JSON.parse(data);
} catch (err) {
console.warn('No se pudo parsear el progreso');
}
}
return {};
};
window.saveProgress = window.saveProgress || function(prog) {
localStorage.setItem('progreso', JSON.stringify(prog));
// Anunciar cambio de progreso para accesibilidad
const completed = Object.values(prog).filter(m => m.completed).length;
const total = Object.keys(prog).length;
if (window.announceProgress) {
window.announceProgress(`Progreso actualizado: ${completed} de ${total} módulos completados`);
}
};
})();
