# ESTADO — rama `rediseno-2026`

**Abierta:** 08/11/2026 desde `main` (bc1aed6).

**Publicación mixta en `main` (08/11/2026, por decisión docente: «hay que publicarla ya»).** Se fusionó la rama tal como estaba después de PC2: el inicio (`index.html`) y el examen (`examen.html`) siguen siendo los anteriores; cada módulo abre ahora en `modulo.html` (ciclo v3, con las cápsulas nuevas de m08 y m09, el árbol, la calculadora y la galería). `modules/view.html` sigue accesible. «Repaso», «Progreso» y «Glosario» quedan reservados hasta que existan sus páginas. El trabajo continúa en `rediseno-2026` y se vuelve a fusionar por etapas.

## Encargos activos

| Encargo | Responsable | Estado |
|---|---|---|
| `docs/ENCARGO-CODEX.md`: migración de datos, motor v3 (MVP), herramientas de muestreo | Codex | Tareas 1 y 3 completas; Tarea 2 detenida en PC2 |
| `docs/ENCARGO-ANTIGRAVITY.md`: borradores de ítems m08 a m11; convertir Olaz y Medrano | Antigravity | Tarea 2 salteada (no hallado en disco local); borradores completos generados y auditados en data/borradores/ para m08 (16 ítems), m09 (24 ítems), m10 (16 ítems) y m11 (24 ítems) |
| Cápsulas nuevas de m08 y m09, galería de pseudocálculos, auditoría de ítems de m08 | Claude | En curso |

## Decisiones abiertas

1. Fecha del examen final (fija el plazo del *merge*).
2. Las cuatro del plan maestro: umbral del 80 %, comprobante, voseo e ítems en revisar.

## Registro de ejecución de Codex

### Tarea 1 — Migración de datos (08/11/2026)

- Se creó `scripts/migrar_v3.py`, una migración idempotente que conserva `estado`, `nota_revision` y `origen` cuando ya existen en `data/banco/`.
- Se generaron `data/banco/m01.json` a `m11.json`, `data/banco/flipcards.json`, `data/contenido/m01.json` a `m11.json` y se ampliaron los módulos de `data/modulos.json`.
- Resultado: 517 ítems migrados, 115 flipcards y 3 ítems bajo observación propia (`m05-0091`, `m05-0095`, `m05-0106`). La lista negra docente no reapareció.
- Se aplicó R1 de `REVISION.md`: las cápsulas de `data/contenido_claude/m08.json` y `m09.json` tienen precedencia sin ser modificadas; se integraron árbol, calculadora, galería, autoauditorías, la auditoría de 7 ítems de m08 (`estado: "revisar"`) y los dos subtemas nuevos de m09.
- `fecha_clase` se conserva desde el índice existente. `preguntas_orientadoras`, `evidencia_moodle` y `eslabon_cadena` quedan vacíos porque no tienen fuente en los datos actuales; `autoauditoria` ya está integrada para m08 y m09.
- Verificación: conteo 517 → 517, auditoría de exclusión (`scripts/verify_exam_readiness.py`), prueba de conservación de campos editables, segunda ejecución byte a byte idéntica y hashes intactos de `data/contenido_claude/`.
- Falta: cerrar Tarea 3 y luego motor/páginas (Tarea 2), con parada en PC1.

### Tarea 3 — Herramientas de muestreo (08/11/2026)

- Se crearon `assets/js/muestreo/calculos.mjs`, `arbol-muestreo.mjs`, `calculadora-honesta.mjs` e `index.mjs`, además de `tests/muestreo.test.mjs`.
- La calculadora obliga a elegir diseño y propósito antes de mostrar números; bloquea estimación para muestras no probabilísticas, no calcula estudios cualitativos y exige la fuente del tamaño de efecto para potencia.
- El árbol muestra un nodo por vez, permite volver y conserva el camino. Sus hojas y textos, igual que los avisos de la calculadora, se leen desde `data/contenido_claude/m08.json` a través del contenido integrado; no se duplican textos pedagógicos en el código.
- Verificación: `node --test tests/` — 9 pruebas pasan: estimación 385/292/730, potencia 85/64/93 y los tres bloqueos sin número.
- Falta: integrar el helper en el renderer del ciclo de m08 desde los bloques `type: "herramienta"` durante F2.

### Tarea 2 — F1: base visual y persistencia (PC1, 08/11/2026)

- Se agregaron `tokens.css`, `base.css`, `components.css` e `icons.svg` con la dirección editorial, tokens claro/oscuro, foco visible, reducción de movimiento y componentes sin emojis.
- Se creó `estilo.html` como guía navegable y `assets/js/store.js` con la clave `meto2.v2`, migración de `meto2_progress`/`meto2_progress_2026` conservando solo `completed`, y funcionamiento sin `localStorage`.
- Se añadió `assets/js/muestreo/index.mjs` con el punto de montaje de bloques `type: "herramienta"`; el renderer de módulos queda para F2.
- Capturas PC1: `capturas/v3/estilo_mobile_375_light.png`, `estilo_mobile_375_dark.png`, `estilo_desktop_1280_light.png` y `estilo_desktop_1280_dark.png`.
- Verificación: `node --test tests/` — 13 pruebas pasan; `scripts/capture_pc1.mjs` confirma 375 px y 1280 px sin desplazamiento horizontal en ambos temas; JSON/SVG válidos y `git diff --check` limpio.
- Punto de control: **PC1 alcanzado.** Se detiene el trabajo hasta la revisión de Claude. No se implementaron todavía `engine.js`, `index.html` v3 ni el ciclo de `modulo.html`.

---

# ESTADO DEL PROYECTO — METO2PSICO25 (PLAN 2026)

Fecha de corte: 13 de octubre de 2026  
Asignatura: Metodología de la Investigación Científica II — Psicología UNIBE  
Commit base: `bb56446` (encabezado nuevo integrado y verificado)

---

## 1. Ítems eliminados del Banco por decisión docente (Módulo 05: Objetivos)

Revisión contra `Materiales de Lectura/Notas adicionales sobre formulacion de objetivos.pdf` (criterios de cátedra: los 3 planos de verbos, las 2 pruebas de validación, y descarte de objetivos como pasos, actividades o cronogramas):

| ID Ítem | Motivo de eliminación definitiva | Criterio de cátedra vulnerado |
| :--- | :--- | :--- |
| `m05-0113` | Da «Comprobar» como verbo de objetivo explicativo y el feedback indica «DEMOSTRAR». | La nota descarta verbos confirmatorios; en ciencia empírica no se demuestra una hipótesis sino que se contrasta. |
| `m05-0088` | Define el objetivo específico como «pasos concretos». | Confusión de objetivo cognitivo con cronograma/etapas de trabajo (objetivo-paso). |
| `m05-0132` | Define el objetivo específico como «pasos para alcanzar el general». | Ídem: los objetivos específicos son sub-resultados de conocimiento, no tareas metodológicas. |
| `m05-0134` | Enunciado: «Establecer los pasos que se deben seguir…». | Confunde objetivo con plan de acción/procedimiento empírico. |
| `m05-0105` | Afirma que el objetivo general responde a «¿qué se va a hacer y para qué?». | El objetivo rige qué se quiere conocer, no qué se hace; y el «para qué» corresponde a la justificación/impacto. |
| `m05-0087` | Criterio SMART «T»: objetivos definidos en el tiempo «para marcar las distintas etapas». | Convierte el objetivo en cronograma o hito temporal. |
| `m05-0096` | Criterio SMART «M»: el objetivo debe «definir el método o sistema de medición». | Introduce el método (Plano 2) dentro de la formulación del objetivo cognitivo (Plano 1). |
| `m05-0098` | La respuesta era formalmente válida, pero el feedback explicativo afirmaba que «los objetivos son acciones concretas». | Induce al estudiante al error de confundir objetivo de conocimiento con actividad material. |
| `m05-0115` | La respuesta era formalmente válida, pero el feedback explicativo afirmaba que «los objetivos son acciones específicas». | Ídem: confunde el resultado de conocimiento con la acción o tarea de recolección. |

> **Garantía técnica de exclusión:** Estos 9 IDs fueron eliminados de `data/m05.json` y quedaron registrados en la lista negra `EXCLUDED_QUIZ_IDS` dentro de `scripts/build_site_data.py`. Además, la prueba automatizada `scripts/verify_exam_readiness.py` audita que ninguno de estos ítems reaparezca en el repositorio ni en sorteos aleatorios de autoevaluación.

---

## 2. Ítems bajo observación (dudosos para definición futura del docente)

Los siguientes ítems permanecen activos pero aislados para evaluación posterior:

1. **Objetivos metodológicos (`m05-0091`, `m05-0095`, `m05-0106`):**
   - El programa institucional de la materia menciona «general, específicos y metodológicos».
   - La nota de cátedra descarta verbos de artefacto como «construir» o «diseñar» para objetivos cognitivos.
2. **Marco SMART de gestión (`m05-0076`, `m05-0081`, `m05-0100`, `m05-0112`):**
   - Proviene de marcos de metas organizacionales; no contradice de forma directa la nota pero su lenguaje pedagógico pertenece a gestión más que a epistemología científica.
3. **Clasificación de datos (`m05-0089`):**
   - Pide un verbo para «clasificar datos» y da «Identificar» como correcto; los datos son objetos materiales/registros, no fenómenos psicológicos en sí mismos.

---

## 3. Estado de Módulos para el Parcial de Hoy (13/10)

- **Módulos abiertos sin restricción:** `m01` a `m08` (Clases 1 a 9). Cualquier estudiante puede acceder a sus cápsulas, tarjetas 3D, minicasos, simulador y autoevaluación directamente.
- **Módulos con progresión normal:** `m09` a `m11` (Clases 11 a 15, correspondientes a la segunda mitad del semestre).
- **Puerta de entrada de evaluación:** `examen.html` con diagnóstico formativo de 16 preguntas (2 por módulo) y simulacro de 60 minutos (30 preguntas), sin afectar el progreso guardado en `localStorage`.

---

## Antigravity — Avance y Verificación

### Tarea 2 — Búsqueda de Olaz y Medrano en disco local
- Siguiendo la indicación de Claude, se restringió la búsqueda de *Metodología de la investigación para estudiantes de psicología* exclusivamente al almacenamiento local (`~/Library/CloudStorage/OneDrive-Personal` y disco local).
- Tras ejecutar búsquedas recursivas (`find -iname "*olaz*"` e indexación Spotlight), se constató que la obra no se encuentra en las carpetas locales.
- Se revirtió cualquier descarga externa previa (eliminando archivos y symlinks en `Diseno de Investigacion/Archivos MD/`). La Tarea 2 queda **salteada** por ausencia del archivo fuente local y anotada en este registro.
- En `data/borradores/m11.json`, los ítems que apuntaban preliminarmente a dicha obra fueron reorientados a las fuentes del canon disponibles localmente (`assets/reading/9. Aplicación de Estilo APA en trabajos académicos.pdf` y estándares JARS).

### Borradores de ítems para m10 y m11 (Completados)
- **Archivos generados:**
  - `data/borradores/m10.json`: 16 ítems nuevos (`m10-b001` a `m10-b016`), cubriendo la brecha para alcanzar la meta de 40 ítems (24 existentes + 16 nuevos).
  - `data/borradores/m11.json`: 24 ítems nuevos (`m11-b001` a `m11-b024`), cubriendo la brecha para alcanzar la meta de 40 ítems (16 existentes + 24 nuevos).
- **Esquema y metadatos:** Todos con `origen: "borrador_ia"`, `estado: "revisar"`, `nota_revision: ""`, 4 opciones homogéneas sin "todas/ninguna", feedback educativo completo y `lectura_ref` específica (*APA Handbook* Vols. 2 y 3; `guianalisis`; *Normas APA 7 y JARS*).
- **Distribución:**
  - **m10:** Dificultad {1: 5, 2: 7, 3: 4} (alcanza 12 Dif. 1, 18 Dif. 2, 10 Dif. 3). Opciones correctas: {0: 4, 1: 4, 2: 4, 3: 4}. Subtemas: 10 cuantitativo, 6 cualitativo.
  - **m11:** Dificultad {1: 7, 2: 9, 3: 8} (alcanza 12 Dif. 1, 18 Dif. 2, 10 Dif. 3). Opciones correctas: {0: 6, 1: 6, 2: 6, 3: 6}. Subtemas: 6 citación, 6 normas APA 7, 7 escritura académica/JARS, 5 IA responsable.

### Borradores de ítems para m08 y m09 (Completados sobre `contenido_claude/`)
- **Archivos generados:**
  - `data/borradores/m08.json`: 16 ítems nuevos (`m08-b001` a `m08-b016`), redactados a partir de `data/contenido_claude/m08.json`, Kish (*Statistical Design for Research*, *Survey Sampling*) y Cochran (*Sampling Techniques*).
    - **Discriminación metodológica:** 8 de los 16 ítems (50 %, superando el tercio exigido) son casos directos de discriminación basados en la galería de pseudocálculos (los 384 universales, población finita inventada, cuotas vs estratos, efecto de diseño en conglomerados, tamaño de efecto de cajón) y en la tabla de justificación del tamaño por propósito (precisión para estimar, potencia para contrastar, literatura para modelos, acceso/límites para no probabilístico, saturación y potencia informativa de Malterud para cualitativo).
    - **Distribución:** Dificultad {1: 5, 2: 7, 3: 4}. Opciones correctas perfectamente equilibradas: {0: 4, 1: 4, 2: 4, 3: 4}. Subtemas: muestreo (5), muestra (6), población (3), corpus (2).
  - `data/borradores/m09.json`: 24 ítems nuevos (`m09-b001` a `m09-b024`), redactados a partir de `data/contenido_claude/m09.json`, los *Standards* AERA/APA/NCME (2014), Muñiz & Fonseca-Pedrero (Diez pasos), Sijtsma/Dunn (alfa vs omega), directrices de la ITC y directrices COSMIN.
    - **Cobertura temática:**
      - *Alfa vs Omega:* Supuesto de tau-equivalencia de alfa vs congenericidad de omega; por qué alfa alto no prueba unidimensionalidad; omega jerárquico ($\omega_h$) en modelos bifactoriales.
      - *Error Estándar de Medida (EEM):* Concepto en TCT ($Se = s \cdot \sqrt{1 - r_{xx}}$) e intervalos de confianza para puntuaciones individuales ($X \pm z \cdot Se$).
      - *Cinco fuentes de evidencia de validez (Standards 2014):* Contenido (jueces, V de Aiken), procesos de respuesta (protocolos think-aloud), estructura interna (AFC, CFI/RMSEA), relación con otras variables (convergente, discriminante, atenuación en criterio) y consecuencias del uso (validez consecuencial, impacto adverso).
      - *Análisis y construcción de ítems:* Diez pasos de Muñiz, índice de dificultad ($p$), correlación ítem-total corregida (discriminación $\ge 0,30$), mito del $\alpha > 0,95$ por redundancia.
      - *Adaptación ITC e Invarianza:* Traducción inversa (back-translation); sesgo de constructo, método e ítem (DIF); niveles de invarianza en AFC multigrupo (configural, métrica, escalar, estricta) y necesidad de invarianza escalar para comparar medias latentes entre grupos.
      - *Ética y selección:* Criterios COSMIN y riesgo ético/diagnóstico del uso de baremos extranjeros sin tipificación local.
    - **Distribución:** Dificultad {1: 5, 2: 11, 3: 8}. Opciones correctas perfectamente equilibradas: {0: 6, 1: 6, 2: 6, 3: 6}. Subtemas: medición (1), validación (6), instrumentos (7), construcción y adaptación (9), ética (1).
- **Verificación global:**
  - Script de validación automatizada auditó los 4 archivos de borradores (`m08.json`, `m09.json`, `m10.json`, `m11.json`), confirmando 80 ítems totales en borrador, unicidad de IDs, integridad JSON, tipado, ausencia total de fórmulas en muestras no probabilísticas/cualitativas, y balance exacto de dificultades y alternativas de respuesta.

## Registro de ejecución de Codex — F2 / PC2 (08/11/2026)

- Se implementó `modulo.html` con el ciclo de nueve pasos y `engine.js`: filtrado exclusivo de ítems aprobados, práctica adaptativa, verificación 3/4/3 y umbral de dominio del 80 %.
- La cadena visual tiene los nueve eslabones reales: problema → preguntas → objetivos → hipótesis → variables → diseño → muestra → instrumentos → análisis. La barra reserva Progreso y Glosario.
- m08 monta el árbol y la calculadora desde los bloques `type: "herramienta"`, usando los textos de `data/contenido/m08.json`; el paso 5 muestra los 8 pseudocálculos con «Lo que se escribió», «Diagnóstico» y «Corrección». m05 tiene su ciclo completo con casos, cápsula, práctica y cierre.
- Se importaron de forma idempotente los borradores de `data/borradores/m08.json` a `m11.json`: 80 ítems con `estado: "revisar"` y `origen: "borrador_ia"`. `scripts/import_borradores.py` permite reejecutar la importación sin tocar sus textos; el motor no los publica.
- R4 queda abierto para Antigravity: distractores inverosímiles y `lectura_ref` circulares siguen sin corregirse para respetar la propiedad del contenido y la regla de no reescritura. Permanecen fuera del sitio por `estado: "revisar"`.
- Verificación: `node --test tests/*.mjs` — 16 pruebas pasan; `scripts/verify_exam_readiness.py`; captura automatizada de 72 combinaciones (m05/m08 × 9 pasos × 375/1280 × claro/oscuro), sin errores de consola ni desplazamiento horizontal; cadena=9, herramientas m08=2 y galería=8.
- Punto de control: **PC2 alcanzado.** Las capturas quedan en `capturas/v3/pc2/`. Falta F3 (repaso, simulacro, progreso y pulido) y la revisión de Claude antes de continuar.
