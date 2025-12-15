# Centro de Aprendizaje en Metodología de la Investigación

Este repositorio contiene el código y los recursos para un sitio web educativo sobre metodología de la investigación, estructurado en nueve módulos y diseñado para ser desplegado en GitHub Pages.

La estructura actual de carpetas es la siguiente:

```
site_web_metodologia/
├── index.html                 # Página principal con tarjetas de navegación de los módulos
├── modules/                   # Carpeta para la visualización de módulos
│   └── view.html              # Plantilla genérica para visualizar el contenido dinámico de los módulos
├── assets/
│   ├── css/
│   │   ├── main.css           # Estilos principales del sitio
│   │   ├── flip-cards.css     # Estilos específicos para tarjetas giratorias
│   │   └── theme-toggle.css   # Estilos para el cambio de tema (claro/oscuro)
│   ├── js/
│   │   ├── app.js             # Lógica principal de interactividad y carga de datos
│   │   └── theme-toggle.js    # Lógica para el cambio de tema
│   ├── img/                   # Imágenes y recursos gráficos
│   └── reading/               # Archivos PDF y lecturas complementarias
├── data/
│   ├── modulo[1-9].json       # Archivos JSON con el contenido de cada una de las 9 unidades
│   ├── items_modulo[1-6].json # Bancos de ítems para evaluación (disponibles para módulos 1-6)
│   └── progreso.json          # Estructura inicial para el seguimiento del avance del usuario
├── integridad.json            # Manifiesto de integridad con hashes SHA‑256
└── deploy_guide.md            # Guía para desplegar en GitHub Pages
```

Para editar el contenido de los módulos, modifica los archivos JSON correspondientes en la carpeta `data/`.
Para ajustar los estilos, revisa los archivos en `assets/css/`, principalmente `main.css`.
La lógica de la aplicación se encuentra en `assets/js/app.js`.
