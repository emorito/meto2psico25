# Guía de despliegue en GitHub Pages

Sigue estos pasos para desplegar el sitio web en GitHub Pages:

1. **Clonar el repositorio o copiar el contenido de `site_web_metodologia`** a un repositorio de GitHub. Asegúrate de que los archivos estén en la raíz del repositorio (por ejemplo, `index.html` y la carpeta `modules/`).
2. **Crear una rama llamada `gh-pages`** o activar GitHub Pages desde la configuración del repositorio, seleccionando la rama principal (`main`) y la carpeta raíz (`/`).
3. **Hacer commit y push** de todos los archivos. GitHub generará automáticamente la URL de GitHub Pages (por ejemplo, `https://usuario.github.io/repositorio/`).
4. **Verificar** que el sitio se cargue correctamente visitando la URL generada. Todos los recursos (PDF, CSS, JS) deben cargarse desde rutas relativas.

Los archivos están diseñados para funcionar sin dependencias externas excepto
Google Fonts para las tipografías. No se requieren frameworks adicionales.