# Metodología de la Investigación Científica II — Psicología UNIBE (Plan 2026)

Plataforma web educativa interactiva para la asignatura **Metodología de la Investigación Científica II** de la Licenciatura en Psicología en la **Universidad Iberoamericana (UNIBE)**, bajo la cátedra del **Prof. Lic. Ezequiel Morosini**.

---

## 🧭 Arquitectura Pedagógica (Plan 2026 · 11 Módulos)

El curso acompaña al estudiante desde la concepción de la idea de investigación hasta la redacción del informe final con normas APA (7.ª ed.) y uso ético de Inteligencia Artificial (**Protocolo VERA**), organizado en **4 etapas** y **11 módulos (`m01` a `m11`)**:

| Etapa | ID | Módulo | Clases Plan 2026 |
| :--- | :--- | :--- | :--- |
| **Etapa 1 · Fundamentos y Literatura** | `m01` | El proceso de investigación científica | Clase 1 |
| **Etapa 1 · Fundamentos y Literatura** | `m02` | Elección del tema, delimitación y búsqueda de información | Clases 2 y 3 |
| **Etapa 1 · Fundamentos y Literatura** | `m03` | Revisión de la literatura, teoría, antecedentes y vacío | Clase 4 |
| **Etapa 2 · Planteamiento y Variables** | `m04` | Planteamiento del problema y preguntas de investigación | Clase 5 |
| **Etapa 2 · Planteamiento y Variables** | `m05` | Objetivos, hipótesis y matriz de coherencia | Clases 6 y 7 |
| **Etapa 2 · Planteamiento y Variables** | `m06` | Constructos, variables, definiciones, operacionalización y categorización | Clase 8 (Parte 1) |
| **Etapa 3 · Estrategia Empírica** | `m07` | Enfoque, alcance y diseño de investigación | Clase 8 (Parte 2) |
| **Etapa 3 · Estrategia Empírica** | `m08` | Población, muestra, corpus y muestreo | Clase 10 |
| **Etapa 3 · Estrategia Empírica** | `m09` | Técnicas, instrumentos, procedimientos y ética | Clase 11 |
| **Etapa 4 · Análisis y Escritura** | `m10` | Análisis de datos cuantitativos y cualitativos | Clase 12 |
| **Etapa 4 · Análisis y Escritura** | `m11` | Escritura académica, normas APA, Zotero y uso responsable de IA | Transversal / Clases 13–15 |

---

## ✨ Componentes Interactivos por Módulo

Cada uno de los 11 módulos integra 5 experiencias de aprendizaje activo:

1. **Multimedia, Guías y Bibliografía Oficial**:
   - Selector de clases en video (incluyendo soporte multi-video en `m05` y Guía Interactiva de Laboratorio Documental en `m02`).
   - Descarga directa de lecturas y guías en PDF (`assets/reading/`) y enlaces a cuadernos interactivos en **NotebookLM**.
2. **Cápsula Metodológica Clave**:
   - Síntesis estructurada con tablas comparativas, reglas de oro y listas de verificación para el trabajo práctico.
3. **Tarjetas de Estudio 3D (Flip-Cards)**:
   - **115 tarjetas interactivas** (10 a 12 por módulo) con giro 3D por clic o teclado (`Enter` / `Espacio`), mezclado aleatorio y seguimiento de dominio.
4. **Minicasos Aplicados y Simulador de Decisiones**:
   - **33 minicasos reales** (3 por módulo) con acordeones independientes para *Pista Orientadora* y *Dictamen Docente*.
   - **11 laboratorios interactivos de simulación** (3 pasos ramificados por módulo) con retroalimentación inmediata sobre riesgos metodológicos y validez.
5. **Autoevaluación Formativa con Retroalimentación**:
   - Banco depurado de **526 ítems** con barajado simultáneo de preguntas y opciones de respuesta.
   - Modalidades de práctica rápida (5 ítems), intensiva (10 ítems) o banco completo, filtro por nivel de dificultad (*Fácil*, *Intermedio*, *Difícil*) y explicación formativa en el 100% de las preguntas.

---

## 🗂️ Estructura del Repositorio

```text
├── index.html                  # Portada con video hero, panel de progreso, filtros por etapa y catálogo de 11 módulos
├── modules/
│   └── view.html               # Vista dinámica de estudio por módulo (?id=m01 .. ?id=m11)
├── assets/
│   ├── css/
│   │   └── main.css            # Hoja de estilos consolidada (Light/Dark, tipografía fluida clamp(), componentes)
│   ├── js/
│   │   └── app.js              # Motor de estado, catálogo, cápsulas, flip-cards, simulador y autoevaluación
│   ├── images/
│   │   └── hero.png            # Póster de respaldo del encabezado
│   ├── videos/
│   │   └── cerebro_efficient.mp4
│   └── reading/                # 14 lecturas y guías oficiales en PDF
├── data/
│   ├── modulos.json            # Índice maestro de los 11 módulos del Plan 2026
│   └── m01.json .. m11.json    # Datos completos de cada módulo (recursos, cápsula, flipCards, miniCases, simulation, quiz)
└── scripts/
    └── build_site_data.py      # Script reproducible de construcción y validación de datos JSON
```

---

## 🚀 Ejecución Local

Para visualizar el sitio localmente (necesario para que `fetch()` cargue los archivos JSON):

```bash
python3 -m http.server 8000
```

Luego abre en el navegador: `http://localhost:8000`
