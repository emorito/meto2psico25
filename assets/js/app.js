/*
* app.js - VERSIÓN HÍBRIDA CORREGIDA
* 
* PRESERVA la funcionalidad original completa:
* - Sistema de navegación entre módulos
* - Quizzes con 5 preguntas aleatorias
* - Simulaciones interactivas
* - Bloqueo/desbloqueo automático
* - Guardado de progreso
* 
* AÑADE mejoras nuevas:
* - Barra de progreso
* - Descarga de PDFs
* - Video optimizado
* - Accesibilidad
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
