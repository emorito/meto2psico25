# Centro de Aprendizaje en Metodología de la Investigación

Este repositorio contiene el código y los recursos para un sitio web educativo
de seis unidades sobre metodología de la investigación, diseñado para ser
desplegado en GitHub Pages. La estructura de carpetas es la siguiente:

```
site_web_metodologia/
├── index.html                 # Página principal con tarjetas de los módulos
├── modules/                   # Carpeta con las páginas de cada módulo
│   ├── modulo1.html
│   ├── modulo2.html
│   ├── modulo3.html
│   ├── modulo4.html
│   ├── modulo5.html
│   └── modulo6.html
├── assets/
│   ├── css/
│   │   └── style.css          # Hojas de estilo globales
│   ├── js/
│   │   └── app.js             # Lógica de interactividad y progreso
│   └── readings/
│       ├── problemas_hipotesis.pdf
│       ├── hipotesis.pdf
│       ├── objetivos.pdf
│       ├── variables.pdf
│       ├── disenos.pdf
│       └── muestreo.pdf
├── data/
│   ├── items_modulo1.json     # Bancos de ítems por módulo
│   ├── items_modulo2.json
│   ├── items_modulo3.json
│   ├── items_modulo4.json
│   ├── items_modulo5.json
│   ├── items_modulo6.json
│   └── progreso.json          # Estructura para almacenar el avance del usuario
├── integridad.json            # Manifiesto de integridad con hashes SHA‑256
└── deploy_guide.md            # Guía para desplegar en GitHub Pages
```

Para editar el contenido de los módulos, modifica los archivos HTML bajo
`modules/` y los bancos de ítems bajo `data/`. Para cambiar los estilos o
la lógica de interactividad, edita `assets/css/style.css` y `assets/js/app.js`.
