# Metodología de la Investigación Científica II — Psicología UNIBE (Plan 2026)

Plataforma web educativa interactiva para la asignatura **Metodología de la Investigación Científica II** de la Licenciatura en Psicología en la **Universidad Iberoamericana (UNIBE)**, bajo la cátedra del **Prof. Lic. Ezequiel Morosini**.

---

## Estado operativo de `rediseno-2026`

La experiencia nueva se abre desde `modulo.html` y comparte un único almacén local, `meto2.v2`, entre la portada, los módulos, el repaso, el simulacro y el progreso. No hay login ni sincronización entre dispositivos: el avance queda en el navegador del estudiante.

La ruta visible para estudiantes es:

- `index.html`: inicio y continuidad;
- `modulo.html?m=mNN`: ciclo guiado de nueve pasos;
- `repaso.html`: errores, dudas y tarjetas pendientes;
- `simulacro.html`: prueba corta de 10 ítems sin alterar dominio ni repaso;
- `progreso.html`: módulos dominados, actividad reciente y siguientes acciones;
- `glosario.html`: búsqueda sobre las 115 tarjetas existentes.

La arquitectura heredada (`modules/view.html`, `examen.html` y parte de `assets/js/app.js`) se conserva para no romper enlaces publicados, pero no debe recibir contenido nuevo sin una decisión explícita.

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
   - **115 tarjetas** (10 a 12 por módulo), con explicación, valoración “Lo sabía / Dudé / No lo sabía”, repaso espaciado y búsqueda en el glosario.
4. **Minicasos Aplicados y Simulador de Decisiones**:
   - **33 minicasos reales** (3 por módulo) con acordeones independientes para *Pista Orientadora* y *Dictamen Docente*.
   - **11 laboratorios interactivos de simulación** (3 pasos ramificados por módulo) con retroalimentación inmediata sobre riesgos metodológicos y validez.
5. **Autoevaluación Formativa con Retroalimentación**:
   - Banco v3 de **597 ítems**: 507 aprobados y 90 en revisión. El sitio solo presenta aprobados; los 96 borradores nuevos permanecen fuera de publicación.
   - Modalidades de práctica rápida (5 ítems), intensiva (10 ítems) o banco completo, filtro por nivel de dificultad (*Fácil*, *Intermedio*, *Difícil*) y explicación formativa en el 100% de las preguntas.

---

## 🗂️ Estructura del Repositorio

```text
├── index.html                  # Inicio, continuidad, repaso pendiente y catálogo de 11 módulos
├── modulo.html                 # Ciclo v3 de nueve pasos (?m=m01 .. ?m=m11)
├── repaso.html                 # Cola de errores, dudas y tarjetas
├── simulacro.html              # Prueba corta independiente
├── progreso.html               # Resumen de avance local
├── glosario.html               # Búsqueda de tarjetas
├── modules/
│   └── view.html               # Vista heredada; se conserva por compatibilidad
├── assets/
│   ├── css/
│   │   └── main.css            # Hoja de estilos consolidada (Light/Dark, tipografía fluida clamp(), componentes)
│   ├── js/
│   │   ├── app.js              # Portada heredada conectada al almacén v2
│   │   ├── engine.js            # Motor v3: selección, opciones, feedback y sesiones
│   │   ├── store.js             # meto2.v2, continuidad y repaso espaciado
│   │   ├── modulo-app.js        # Ciclo v3 de módulo
│   │   ├── review-app.js        # Repaso de preguntas y tarjetas
│   │   ├── progress-app.js      # Progreso y siguientes acciones
│   │   ├── simulacro-app.js     # Prueba corta sin contaminar dominio
│   │   └── glossary-app.js      # Glosario de tarjetas
│   ├── images/
│   │   └── hero.png            # Póster de respaldo del encabezado
│   ├── videos/
│   │   └── cerebro_efficient.mp4
│   └── reading/                # 14 lecturas y guías oficiales en PDF
├── data/
│   ├── modulos.json             # Índice maestro de los 11 módulos
│   ├── banco/                   # Ítems v3; solo estado aprobado se publica
│   ├── borradores/              # Candidatos IA siempre en estado revisar
│   ├── item_models/             # Modelos explícitos para generación controlada
│   ├── contenido/               # Cápsulas y minicasos v3
│   └── banco/flipcards.json     # 115 tarjetas
└── scripts/
    ├── generate_item_drafts.py # Generación desde modelos; no sobreescribe sin --replace
    ├── validate_draft_items.py  # Auditoría estructural de borradores
    ├── verify_exam_readiness.py # Exclusiones y reglas de examen
    └── test_ux_flow.mjs         # Continuidad, repaso y capturas
```

---

## 🚀 Ejecución Local

Para visualizar el sitio localmente (necesario para que `fetch()` cargue los archivos JSON):

```bash
python3 -m http.server 8000
```

Luego abre en el navegador: `http://localhost:8000`

Verificación mínima antes de un commit:

```bash
node --test tests/*.mjs
python3 scripts/verify_exam_readiness.py
python3 scripts/validate_draft_items.py
node scripts/test_browser_suite.mjs
node scripts/test_ux_flow.mjs
```

Los ítems de `data/borradores/` requieren revisión docente. El generador no los incorpora al banco publicado, no modifica ítems existentes y no debe usarse para crear protocolos o ítems de tests comerciales.
