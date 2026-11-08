# Plan maestro — Sitio de estudio de Metodología de la Investigación II

**Sitio:** https://emorito.github.io/meto2psico25/ · **Repositorio:** `emorito/meto2psico25`
**Destinatario:** Antigravity (agentes en paralelo; Ollama para tareas mecánicas, según se indica)
**Dirección y supervisión:** Claude, que revisa en cada punto de control (sección 9)
**Fecha:** 13/10/2026
**Depende de:** `Instrucciones Antigravity - Banco unificado meto2psico25.md`. Ese encargo se termina primero y su esquema de datos se extiende aquí (sección 5), sin rehacerlo.

---

## 0. Reglas de trabajo

1. **Se trabaja en una rama `rediseno-2026`.** Nada entra a `main` sin la aprobación del docente. Si ya hay cambios hechos sobre `main` por el encargo anterior, se conservan y la rama nace desde ahí.
2. **Se previsualiza en local** (`python3 -m http.server 8000` en la raíz) y se prueba a 375 px y a 1280 px de ancho.
3. **Al terminar cada fase se actualiza `ESTADO.md`** en la raíz del repo: qué se hizo, qué falta, qué decisiones quedaron abiertas y cómo se verificó. Ese archivo es el canal de supervisión.
4. **Sin dependencias pesadas.** HTML, CSS y JavaScript con módulos ES, sin paso de compilación, para que el sitio siga funcionando en GitHub Pages. Las fuentes vienen de Google Fonts y los íconos se dibujan como SVG dentro del propio repo. Se elimina Font Awesome.
5. **El contenido de los ítems no se reescribe.** Lo que sea inconsistente se marca con `estado: "revisar"`; no se corrige.
6. **Contenido nuevo** (ítems, casos, ejemplos): lo redacta el modelo de Antigravity (Gemini), siempre a partir de los textos de `Materiales de Lectura/*.md` y del plan vigente. Entra con `origen: "borrador_ia"` y `estado: "revisar"`, y no se publica hasta que el docente lo apruebe.

---

## 1. Propósito

El sitio no reemplaza a Moodle ni a la clase por Zoom. Cumple dos funciones del modelo *B-Learning* del plan vigente:

- **Antes de la clase:** preparar al estudiante para que llegue con los conceptos activados y la lectura hecha (aula invertida).
- **Después de la clase:** consolidar, repasar y llegar al examen final con dominio verificado, no solo con lectura.

El estudiante debería poder responder siempre tres preguntas: **dónde estoy en la ruta del proyecto, qué tengo que repasar hoy y qué tan bien domino cada tema.**

---

## 2. Enfoque pedagógico

El diseño se apoya en estrategias con evidencia sólida en psicología del aprendizaje y en las indicaciones de práctica docente del proyecto (diseño hacia atrás, andamiaje graduado, evaluación formativa continua, atención a la carga cognitiva y a la ansiedad).

| Principio | Cómo se aplica en el sitio |
|---|---|
| **Marco antes que detalle** | Cada módulo abre ubicándose en la cadena de coherencia del proyecto (problema → preguntas → objetivos → hipótesis → variables → diseño → muestra → instrumentos → análisis). La cadena es el organizador visual de todo el sitio. |
| **Diseño hacia atrás** | Cada módulo parte de sus resultados de aprendizaje, copiados textualmente del plan vigente, y cada actividad se vincula con uno de ellos. |
| **Práctica de recuperación** | Recordar y responder en vez de releer. Las tarjetas de conceptos piden intentar la respuesta antes de mostrarla. |
| **Efecto de pre-evaluación** | Tres preguntas diagnósticas sin nota al inicio de cada módulo, para orientar la atención durante la lectura. |
| **Ejemplos resueltos y desvanecimiento** | Primero un caso resuelto y comentado; después un caso a medio resolver; al final un caso a resolver solo. Así se gradúa la autonomía. |
| **Práctica espaciada** | Repaso diario con el sistema de cajas de Leitner: los ítems vuelven a 1, 3, 7, 14 y 30 días según el acierto. |
| **Práctica intercalada** | El repaso y el simulacro mezclan módulos, porque discriminar entre conceptos parecidos (objetivo / actividad, población / muestra, técnica / instrumento) es la dificultad real del curso. |
| **Retroalimentación elaborada e inmediata** | Además de "correcto / incorrecto", el feedback explica por qué y remite a la lectura. Un error genera una segunda oportunidad más adelante en la misma sesión. |
| **Metacognición y calibración** | Antes de ver el resultado, el estudiante indica su seguridad (seguro / dudoso / adiviné). El panel de progreso muestra dónde hay **sobreconfianza** (seguro y equivocado), que es la señal de error conceptual. |
| **Dominio verificado** | Un módulo se da por dominado con al menos 80 % en una verificación de 10 ítems de dificultad mixta, que no repite ítems ya vistos en la práctica de esa sesión. |
| **Transferencia al proyecto** | Cada módulo cierra con una autoauditoría del propio proyecto del estudiante, vinculada a la evidencia Moodle de esa clase. |
| **Carga emocional** | Tono sereno y profesional, error presentado como parte del proceso, sin cronómetros salvo en el simulacro, sin rankings entre estudiantes. |

### Posturas de la cátedra que el contenido debe respetar
- Un objetivo de investigación es un **propósito cognitivo** (describir, explicar, predecir, establecer, determinar, identificar), no una actividad. *Analizar, calcular o recoger* son medios.
- **Delimitar no es simplificar:** un problema bien delimitado conserva su complejidad.
- **Diseño:** las amenazas a la validez (Campbell y Stanley) y los principios de Kish (realismo, control, representatividad) son los ejes para elegir entre diseños experimentales, observacionales o de encuesta.
- Las rutas **cuantitativa y cualitativa** tienen el mismo rango; no se fuerza la lógica cuantitativa sobre proyectos cualitativos.

---

## 3. Arquitectura del sitio

| Página | Archivo | Función |
|---|---|---|
| Inicio | `index.html` | La ruta del proyecto (11 módulos), el próximo paso sugerido y los repasos pendientes de hoy. |
| Módulo | `modulo.html?m=m05` | El ciclo de aprendizaje completo (sección 4). |
| Repaso | `repaso.html` | Sesión diaria de práctica espaciada e intercalada (15 ítems como máximo). |
| Simulacro | `simulacro.html` | Examen de práctica (sección 4.3). |
| Progreso | `progreso.html` | Dominio por módulo y subtema, calibración, ítems difíciles, exportación del comprobante. |
| Glosario | `glosario.html` | Conceptos de todas las tarjetas, con buscador y enlace a su módulo. |
| Guía de estilo | `estilo.html` | Muestra de tokens y componentes. **Se publica en el punto de control 1 y después queda oculta.** |

### Apertura de módulos
Se mantiene la idea original de avance progresivo, ajustada al curso en marcha: **un módulo se abre cuando se domina el anterior o cuando llega la fecha de su clase, lo que ocurra primero.** Así nadie queda bloqueado para preparar la clase de la semana. Las fechas salen de `modulos.json`. El botón "Desbloquear" desaparece.

### Módulos y calendario

| ID | Módulo | Clase | Fecha |
|---|---|---:|---|
| m01 | El proceso de investigación científica | 1–2 | 05/08 |
| m02 | Elección, delimitación y búsqueda | 3 | 19/08 |
| m03 | Literatura, teoría, antecedentes y vacío | 4 | 25/08 |
| m04 | Problema y preguntas de investigación | 5 | 02/09 |
| m05 | Objetivos, hipótesis y coherencia | 6 | 09/09 |
| m06 | Constructos, variables, definiciones y categorías | 7 | 16/09 |
| m07 | Enfoque, alcance y diseño | 8 | 23/09 |
| m08 | Población, muestra, corpus y muestreo | 9 | 30/09 |
| m09 | Técnicas, instrumentos, procedimientos y ética | 11 | 14/10 |
| m10 | Análisis cuantitativo y cualitativo | 12 | 21/10 |
| m11 | Escritura académica, APA, Zotero e IA | 13 | 28/10 |

---

## 4. Experiencias de aprendizaje

### 4.1 El ciclo de un módulo (25 a 40 minutos)

Se presenta como una secuencia de pasos numerados con indicador de avance. El estudiante puede saltar entre pasos, pero se le sugiere el orden.

1. **Ubicación.** La cadena de coherencia con el eslabón del módulo resaltado, los resultados de aprendizaje y dos o tres preguntas orientadoras (las del plan vigente, sección "Lectura y preparación").
2. **Diagnóstico.** Tres ítems de dificultad 1–2, sin nota. Al terminar: "Tené en cuenta esto al leer", con los conceptos de los ítems fallados.
3. **Estudio.** Lectura (PDF o enlace), video y NotebookLM, con tiempo estimado. Se incluye la lista de preguntas orientadoras para responder mientras se lee.
4. **Conceptos clave.** Tarjetas de recuperación: el estudiante ve el término, piensa la respuesta, la revela y se autoevalúa (lo sabía / dudé / no lo sabía). Las que no sabía pasan a la caja 1 del repaso. **Se muestran todas las tarjetas del módulo, no una muestra al azar.**
5. **Práctica guiada.** Un caso resuelto, con el razonamiento comentado paso a paso → un caso con un paso a completar → un caso a resolver solo. Los casos vienen de `Diseno de Investigacion/Clase 8 - Banco de casos - Diseno y amenazas.md` y de los planes de clase; donde falten, se redactan como borrador (regla 0.6).
6. **Práctica adaptativa.** Doce ítems del banco del módulo. Se empieza en dificultad 2; dos aciertos seguidos suben un nivel y un error baja uno. Cada respuesta va con indicación de seguridad y feedback elaborado. Los errores reaparecen al final de la sesión.
7. **Verificación de dominio.** Diez ítems: 3 de dificultad 1, 4 de dificultad 2 y 3 de dificultad 3, sin repetir los de la práctica de esa sesión, con opciones mezcladas. Con 80 % o más, el módulo queda **dominado**. Por debajo, se muestra qué subtemas repasar; se puede reintentar después de una nueva práctica.
8. **Aplicación al proyecto.** Lista de autoauditoría del propio proyecto, por ejemplo en m05: "¿Tu objetivo general expresa un propósito cognitivo y no una actividad?". Se enlaza con la evidencia Moodle de esa clase y se guarda localmente.
9. **Cierre.** El "punto más turbio": una línea sobre qué quedó menos claro. Se guarda en el progreso y se incluye en el comprobante.

### 4.2 Repaso diario (`repaso.html`)
- Hasta 15 ítems tomados de los módulos abiertos, en este orden de prioridad: (1) vencidos según Leitner, (2) respondidos con sobreconfianza, (3) subtemas con menor dominio.
- Siempre intercalados entre módulos; nunca dos seguidos del mismo subtema.
- Cajas de Leitner: 1 → 1 día, 2 → 3, 3 → 7, 4 → 14, 5 → 30. Un acierto sube una caja y un error vuelve a la 1.
- Al terminar: cuántos ítems se repasaron, cuántos subieron de caja y cuándo toca el próximo repaso.

### 4.3 Simulacro (`simulacro.html`)
- **Simulacro final:** 40 ítems de todos los módulos, en proporción a la cantidad de clases de cada uno, con 60 minutos de cronómetro visible que se puede ocultar. El feedback se da todo al final. Sin pistas.
- **Simulacro por bloque:** m01–m04, m05–m08 o m09–m11, con 20 ítems.
- El resultado se desglosa por módulo y por subtema, y cada parte lleva un enlace "repasar esto".
- Aviso visible: *El examen final presencial no permite IA ni materiales; practicá en las mismas condiciones.*

### 4.4 Progreso (`progreso.html`)
- Estado de cada módulo (no iniciado / en curso / dominado), dominio por subtema en barras horizontales, ítems por caja de Leitner.
- **Calibración:** porcentaje de aciertos según el nivel de seguridad declarado, con la lista de ítems en los que hubo sobreconfianza.
- **Comprobante:** página imprimible o PDF con nombre (lo escribe el estudiante), módulos dominados con fecha y puntaje, simulacros realizados y puntos más turbios. Sirve para presentar en Moodle si el docente lo pide.
- Exportar e importar el progreso como archivo `.json`, para cambiar de dispositivo.

### 4.5 Tipos de ítem que el motor debe soportar

| Tipo | Uso | Origen |
|---|---|---|
| `opcion_multiple` | General | Banco unificado |
| `verdadero_falso` | Conceptos y errores frecuentes | Banco unificado |
| `pareo` | Asociar conceptos con ejemplos | GIFT (hoy en `no_soportados.json`) |
| `respuesta_corta` | Términos clave; comparación sin tildes ni mayúsculas, con variantes aceptadas | GIFT (hoy en `no_soportados.json`) |
| `caso` | Viñeta con 1 a 3 preguntas de opción múltiple asociadas | Banco de casos y borradores |
| `clasificar` | Asignar cada enunciado a una categoría (objetivo / actividad, técnica / instrumento, cuali / cuanti) | Borradores |
| `ordenar` | Secuencias (pasos de construcción de un test, cadena de coherencia) | Borradores |

**Siempre:** opciones mezcladas en cada presentación, nunca un `alert()`, retroalimentación dentro de la página, y todo operable con teclado.

---

## 5. Datos

### 5.1 Fuentes
- `data/banco/mNN.json`, `data/banco/flipcards.json` y `data/modulos.json`, generados por el encargo del banco unificado.
- El sitio **solo usa los ítems con `estado: "aprobado"`**. Los que están en `revisar` no se muestran.

### 5.2 Extensiones del esquema (además de la sección 3.1 del encargo anterior)
```json
{
  "tipo": "caso",
  "vineta": "texto del caso…",
  "preguntas": [ { "enunciado": "…", "opciones": ["…"], "correcta": 0, "feedback": {…} } ],
  "resultado_aprendizaje": 2,
  "lectura_ref": "05.0. Constructo, Variables y Definiciones - Kerlinger y Lee (2002) Cap. 3.md",
  "origen": "original | borrador_ia"
}
```
- `pareo`: `pares: [{"a": "…", "b": "…"}]`
- `respuesta_corta`: `aceptadas: ["…", "…"]`
- `clasificar`: `categorias: ["…"]`, `elementos: [{"texto": "…", "categoria": 0}]`
- `ordenar`: `pasos: ["…"]`, en el orden correcto

En `modulos.json` se agregan `fecha_clase`, `preguntas_orientadoras`, `autoauditoria` (lista de preguntas), `evidencia_moodle` (texto) y `eslabon_cadena` (cuál resaltar).

### 5.3 Persistencia (`assets/js/store.js`)
- Todo se guarda en `localStorage` bajo la clave `meto2.v2`, con `try/catch` en cada lectura y escritura. Si el almacenamiento no está disponible, el sitio funciona igual sin guardar.
- Se guarda: estado por módulo, historial de respuestas (id, acierto, seguridad, fecha), cajas de Leitner, autoauditorías, puntos turbios y simulacros.
- **Migración:** si existe la clave antigua `meto2_progress`, se mapea `moduloN` → módulo nuevo según la tabla de asignación del encargo anterior. Se conserva solo el dato `completed`, sin marcar dominio.

---

## 6. Diseño gráfico

### 6.1 Dirección
**Editorial académico:** sobrio, legible y confiable, como una buena revista científica o una editorial universitaria. Nada de efectos para impresionar. El color se usa para dar sentido (estado, acción), no para decorar.

**Se elimina:** el video de cerebro y las partículas del encabezado, los emojis como íconos, la tipografía Montserrat en peso 900, el giro 3D de las tarjetas, las sombras grandes, el lema "con un toque de humor" y los créditos a ChatGPT y MiniMax.
**Se conserva:** el terracota, como acento de identidad usado con moderación.

### 6.2 Tokens (`assets/css/tokens.css`)

```css
:root {
  /* Superficies y texto */
  --paper: #FAF8F5;  --surface: #FFFFFF;  --surface-2: #F3F0EB;
  --ink: #1C1F24;    --ink-2: #4A505A;    --ink-3: #6B7280;
  --line: #E4E0D9;
  /* Marca */
  --primary: #1F3A5F;       /* azul tinta: acciones, enlaces, foco */
  --primary-soft: #E8EEF5;
  --accent: #B4472D;        /* terracota: marca, eslabón activo, detalles */
  --accent-soft: #F6E7E2;
  /* Estados (siempre acompañados de ícono y texto) */
  --ok: #2E6B45;   --ok-soft: #E6F1EA;
  --err: #A1302A;  --err-soft: #F7E5E3;
  --warn: #8A6D1F; --warn-soft: #F6EFD9;
  /* Tipografía */
  --font-serif: "Source Serif 4", Georgia, serif;
  --font-sans: "Inter", system-ui, sans-serif;
  --fs-1: .875rem; --fs-2: 1rem; --fs-3: 1.125rem; --fs-4: 1.25rem;
  --fs-5: 1.563rem; --fs-6: 1.953rem; --fs-7: 2.441rem;
  /* Espaciado (múltiplos de 4 px) */
  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px; --s-5: 24px; --s-6: 32px; --s-7: 48px; --s-8: 64px;
  --radius: 8px; --radius-sm: 4px;
  --shadow: 0 1px 2px rgb(0 0 0 / .06), 0 1px 1px rgb(0 0 0 / .04);
  --measure: 68ch;
  --dur: 160ms;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --paper: #121418; --surface: #1A1D23; --surface-2: #22262E;
    --ink: #E8E6E3; --ink-2: #B4B9C2; --ink-3: #8B919C; --line: #2C313A;
    --primary: #8FB3E0; --primary-soft: #1E2A3A;
    --accent: #E08566; --accent-soft: #3A2520;
    --ok: #74C495; --ok-soft: #1C3226; --err: #F0928A; --err-soft: #3A1F1D;
    --warn: #E3C46E; --warn-soft: #3A3220;
  }
}
:root[data-theme="dark"] { /* mismos valores que el bloque anterior */ }
```
- Los títulos van en `--font-serif` peso 600; la interfaz y el texto corrido, en `--font-sans` 400/500/600. Los números usan cifras tabulares.
- Interlineado: 1,6 en el texto y 1,25 en los títulos. El texto de lectura no supera `--measure`.
- **Contraste AA verificado** en ambos temas, para el texto y para los estados.
- Selector de tema claro / oscuro / automático en la barra superior; la elección se guarda.

### 6.3 Componentes
- **Barra superior:** a la izquierda, "Metodología de la Investigación II" en serif más "Psicología · UNIBE" en texto pequeño. A la derecha: Ruta · Repaso (con contador de pendientes) · Simulacro · Progreso · Glosario. En móvil, un menú desplegable.
- **Cadena de coherencia:** una fila de eslabones conectados por una línea fina. El eslabón activo lleva relleno de acento y los dominados un ícono de verificación. Se usa en el inicio y en el paso 1 de cada módulo. En móvil se desplaza horizontalmente.
- **Tarjeta de módulo:** número grande en serif, título, fecha de clase, chip de estado y barra de dominio de 4 px. Sin ilustraciones. Si está cerrada, se muestra atenuada con el texto "Se abre el 14/10 o al dominar m08".
- **Tarjeta de ítem:** enunciado en `--fs-4`, opciones como filas completas seleccionables (`label` + `input` nativo, con foco visible), los tres botones de seguridad y después el botón "Responder".
- **Panel de retroalimentación:** borde izquierdo de 3 px en `--ok` o `--err` con fondo suave, ícono, título ("Correcto" / "Revisá este punto"), explicación y "Ver en la lectura →".
- **Tarjeta de concepto:** término en serif y el botón "Mostrar respuesta" (que despliega en el lugar, sin girar). Luego, los tres botones de autoevaluación.
- **Indicador de pasos del módulo:** 9 pasos con número y nombre corto; pasos completados con verificación.
- **Íconos:** un sprite SVG propio (`assets/icons.svg`) con trazos de 1,5 px al estilo Lucide: libro, video, chat, verificación, cruz, flecha, candado, reloj, gráfico, búsqueda, imprimir, descargar.

### 6.4 Movimiento y accesibilidad
- Transiciones de `--dur` solo en color, opacidad y alto. Se respeta `prefers-reduced-motion`.
- `<!DOCTYPE html>`, `lang="es"`, jerarquía de títulos correcta, `aria-live="polite"` en la retroalimentación, objetivos táctiles de 44 px o más, navegación completa con teclado.
- El video de YouTube se carga solo al hacer clic (miniatura con botón), para que la página cargue rápido.

### 6.5 Tono de los textos de interfaz
Académico, cercano y breve. En segunda persona y con voseo de forma provisoria, como el feedback actual (decisión abierta 3; si cambia, se reemplaza en todos los textos). Sin emojis. Los mensajes de error orientan ("Revisá la diferencia entre técnica e instrumento"), no juzgan.

---

## 7. Contenido faltante (borradores para revisión)

Cobertura mínima por módulo: **40 ítems aprobados** (12 de dificultad 1, 18 de dificultad 2 y 10 de dificultad 3), **8 o más tarjetas** y **3 casos** (resuelto, a completar y libre).

1. Calcular la brecha con la hoja "Cobertura" del encargo anterior.
2. Prioridad de redacción, según el calendario: **m09 → m10 → m11** (las clases que vienen), después **m02 → m03**, y por último la **ruta cualitativa** de m06, m08 y m10 (categorías, corpus, codificación, rigor).
3. Fuentes por módulo:
   - m09: `Materiales de Lectura` y la lectura "Diez pasos para la construcción de un test" del repo;
   - m10: `https://emorito.github.io/guianalisis/` y los capítulos de análisis en `Diseno de Investigacion/Archivos MD/`;
   - m11: la guía de APA del repo y la guía de IA de `Actividades de clase/`;
   - m02 y m03: `Guía práctica para la revisión de la literatura - versión revisada 2026.md` y `04.0`/`04.1`.
4. **Reglas de redacción de ítems:**
   - un solo concepto por ítem, con el enunciado completo y en forma afirmativa;
   - tres o cuatro opciones homogéneas en largo y forma, sin "todas" ni "ninguna de las anteriores";
   - distractores tomados de errores reales de estudiantes;
   - la correcta en posición variable;
   - nada de absolutos que delaten la respuesta;
   - cada ítem cita su fuente en `lectura_ref` y respeta las posturas de la sección 2.
5. Todo borrador entra con `estado: "revisar"` y se lista en una hoja nueva, "Borradores", de `revision_items.xlsx`.

---

## 8. Fases y paralelización

| Fase | Agentes en paralelo | Entregable | Depende de |
|---|---|---|---|
| **F0** | — | Terminar el encargo del banco unificado (fases A–E) | — |
| **F1. Base visual** | A: `tokens.css`, `base.css`, `components.css`, `icons.svg`, `estilo.html` · B: `store.js` con la migración y pruebas | Guía de estilo navegable | — (corre en paralelo con F0) |
| **F2. Núcleo** | A: Inicio + cadena + tarjetas de módulo · B: `modulo.html` con los pasos 1–9 · C: motor de ítems (`engine.js`: tipos, adaptativo, verificación) | El ciclo de un módulo funcionando con m05 de punta a punta | F0, F1, **punto de control 1** |
| **F3. Repaso y simulacro** | A: Leitner + `repaso.html` · B: `simulacro.html` · C: `progreso.html` + comprobante | Las tres páginas funcionando | F2, **punto de control 2** |
| **F4. Contenido** | Uno por módulo prioritario (sección 7), con Gemini | Borradores en la hoja "Borradores" | F0 (puede empezar junto con F2) |
| **F5. Pulido y publicación** | A: accesibilidad y rendimiento · B: textos de interfaz y glosario · C: README y limpieza de código muerto | PR de `rediseno-2026` a `main` | F3, revisión del docente, **punto de control 3** |

Las tareas mecánicas (convertir formatos, verificar enlaces, contar cobertura, revisar la ortografía de los textos de interfaz) se delegan a Ollama o a scripts.

---

## 9. Puntos de control

Antigravity se detiene en cada uno, actualiza `ESTADO.md` y avisa. Claude revisa y deja sus observaciones en `REVISION.md` en la raíz del repo; Antigravity las aplica antes de seguir.

1. **PC1, después de F1:** `estilo.html` con capturas a 375 px y a 1280 px, en tema claro y oscuro.
2. **PC2, después de F2:** el módulo m05 completo, con capturas de cada paso y el resultado de las pruebas.
3. **PC3, antes de publicar:** resultados de Lighthouse, lista de verificación de la sección 10 y enlace a la PR.

---

## 10. Criterios de aceptación

- [ ] Ninguna página tiene desplazamiento horizontal a 375 px.
- [ ] Lighthouse ≥ 90 en Accesibilidad, Buenas prácticas y SEO; ≥ 85 en Rendimiento en móvil.
- [ ] Cero errores en la consola; no queda ningún `alert()`, `confirm()` ni `onclick` en línea.
- [ ] La posición de la respuesta correcta queda distribuida en forma uniforme en 200 presentaciones simuladas (prueba automática).
- [ ] Solo se muestran ítems con `estado: "aprobado"` (prueba automática).
- [ ] El progreso antiguo se migra sin errores y el sitio funciona con `localStorage` bloqueado.
- [ ] Todo es operable con teclado, el foco se ve siempre y la retroalimentación se anuncia por `aria-live`.
- [ ] Hay pruebas Playwright para el ciclo de m05, un repaso, un simulacro corto y la exportación e importación del progreso.
- [ ] No quedan Font Awesome, el video del encabezado, emojis como íconos ni archivos sin uso (`theme-toggle.*`, `flip-cards.css`, `progreso.json`, `integridad.json`).
- [ ] El README describe la estructura real y cómo actualizar los bancos.

---

## 11. Decisiones abiertas para el docente

1. Umbral de dominio: **80 %** propuesto (el actual es 60 %).
2. Si el comprobante de progreso se pedirá en Moodle o queda como recurso voluntario.
3. Registro de los textos: **voseo** (como el feedback actual: "Revisá…") o tuteo.
4. Los ítems marcados "revisar" quedan fuera del sitio hasta que se aprueben (propuesto).
