# ESTADO — rama `rediseno-2026`

**Abierta:** 08/11/2026 desde `main` (bc1aed6).

**Publicación mixta en `main` (08/11/2026, por decisión docente: «hay que publicarla ya»).** Se fusionó la rama tal como estaba después de PC2: el inicio (`index.html`) y el examen (`examen.html`) siguen siendo los anteriores; cada módulo abre ahora en `modulo.html` (ciclo v3, con las cápsulas nuevas de m08 y m09, el árbol, la calculadora y la galería). `modules/view.html` sigue accesible. «Repaso», «Progreso» y «Glosario» quedan reservados hasta que existan sus páginas. El trabajo continúa en `rediseno-2026` y se vuelve a fusionar por etapas.

## Encargos activos

| Encargo | Responsable | Estado |
|---|---|---|
| `docs/ENCARGO-CODEX.md`: migración de datos, motor v3 (MVP), herramientas de muestreo | Codex | Tareas 1 y 3 completas; Tarea 2 detenida en PC2 |
| `docs/ENCARGO-ANTIGRAVITY.md`: borradores de ítems m08 a m11; convertir Olaz y Medrano | Antigravity | Completo: Tarea 2 salteada; 80 ítems en data/borradores/ (m08–m11) corregidos y validados según R4 (distractores verosímiles, lectura_ref canónica, posiciones intactas) |
| Cápsulas nuevas de m08 y m09, galería de pseudocálculos, auditoría de ítems de m08 | Claude | En curso |

## Decisiones abiertas

1. Fecha del examen final (fija el plazo del *merge*).
2. Las cuatro del plan maestro: umbral del 80 %, comprobante, voseo e ítems en revisar.

## Trabajo continuo — UX y generación controlada de ítems (10/11/2026)

- Se incorporaron el plan de UX/banco y el inventario de materiales en `docs/PLAN-UX-Y-BANCO-AUTOMATICO.md` y `docs/INVENTARIO-MATERIALES-Y-BRECHAS.md`. La prioridad visible para estudiantes queda expresada con verbos cotidianos: **Seguir**, **Repasar**, **Practicar** y **Ver la explicación**.
- La continuidad ahora usa `lastActivity` dentro del almacén único `meto2.v2`. La portada ofrece el módulo y paso donde se dejó; `modulo.html?m=mNN&step=...` restaura explícitamente el paso. No se promete sincronización entre dispositivos ni se agrega login.
- Se agregó `repaso.html` y `assets/js/review-app.js`: la cola muestra errores o respuestas con seguridad insuficiente, registra el resultado y programa intervalos de 1, 3, 7, 14 y 30 días. Solo una respuesta correcta y segura avanza de caja; un error o una respuesta dudosa vuelve a la cola el mismo día. El módulo no considera los borradores de ítems.
- Se agregó `progreso.html` y `assets/js/progress-app.js`: muestra módulos dominados con puntaje/fecha, módulos en curso, siguiente paso, subtemas pendientes y cantidad de repaso. La navegación ya no deja “Progreso” como enlace falso.
- Se agregó `simulacro.html` y `assets/js/simulacro-app.js`: una prueba corta de 10 ítems aprobados, mezclados entre módulos, con feedback inmediato y resultado guardado en `simulacros` sin alterar dominio ni cola de repaso.
- Se agregó `glosario.html` y `assets/js/glossary-app.js`: buscador y filtro por módulo sobre las 115 tarjetas existentes, con explicación desplegable y retorno al paso de conceptos. No incorpora definiciones nuevas.
- Se armonizó la interfaz v3 y la portada heredada al umbral operativo del 80 % y se reemplazaron etiquetas técnicas del ciclo por acciones más directas: “Qué ya sabés”, “Practicá”, “Verificá lo aprendido” y “Aplicalo a tu proyecto”.
- Se quitaron de la experiencia visible las fechas vencidas del parcial y de entregas. Mientras la fecha oficial siga abierta, la portada y el examen indican consultar el cronograma docente en lugar de inventar una fecha; los documentos históricos y `data/examen.json` se conservaron sin reescritura.
- Se agregó `scripts/validate_draft_items.py`, que valida estructura, IDs, metadatos, referencias declaradas y distribución de posiciones correctas sin cambiar estados.
- Se agregaron modelos explícitos para m02 y m03 en `data/item_models/` y se generaron 16 nuevos candidatos en `data/borradores/m02.json` y `data/borradores/m03.json`. Los 96 borradores de m02, m03 y m08–m11 conservan `origen: "borrador_ia"` y `estado: "revisar"`; ninguno se publica ni se incorpora al banco aprobado.
- Las referencias a materiales externos al repositorio se conservan como trazabilidad declarada; no se afirma que esos archivos estén empaquetados en GitHub Pages. Los faltantes de canon y la revisión docente siguen abiertos.
- Verificación ejecutada: `node --test tests/*.mjs` — 22 pruebas pasan; `python3 scripts/verify_exam_readiness.py` pasa; `python3 scripts/validate_draft_items.py` valida 96 borradores; `node --check` pasa para los módulos JS; `git diff --check` limpio. La prueba de navegador de continuidad, repaso y almacenamiento único también pasa sin errores de consola, 404 inesperados ni overflow en móvil. Las capturas de este flujo quedan en `capturas/v3/ux/` para 375/1280 px y claro/oscuro.
- Falta en esta etapa: simulacro independiente, página de progreso, glosario contextual, acciones de tarjetas y corrección de fechas heredadas de la portada. No se declara todavía completa la Etapa 2 ni se aprueba ningún borrador automáticamente.

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
- R4 resuelto por Antigravity (ver registro al final): distractores inverosímiles reemplazados por errores reales de estudiantes y `lectura_ref` saneadas con citas canónicas, conservando enunciados, posiciones correctas y `estado: "revisar"`.
- Verificación: `node --test tests/*.mjs` — 16 pruebas pasan; `scripts/verify_exam_readiness.py`; captura automatizada de 72 combinaciones (m05/m08 × 9 pasos × 375/1280 × claro/oscuro), sin errores de consola ni desplazamiento horizontal; cadena=9, herramientas m08=2 y galería=8.
- Punto de control: **PC2 alcanzado.** Las capturas quedan en `capturas/v3/pc2/`. Falta F3 (repaso, simulacro, progreso y pulido) y la revisión de Claude antes de continuar.

---

## Antigravity — Resolución de Observaciones R4 (08/11/2026)

Se completó la aplicación de la revisión R4 de Claude sobre los 80 ítems en `data/borradores/m08.json` a `m11.json`, sin modificar enunciados ni las posiciones de las respuestas correctas:

1. **Reemplazo de distractores inverosímiles por errores reales de estudiantes:**
   - Se eliminaron todas las opciones absurdas o delatoras («el tiempo en milisegundos», «el software bloquea el cálculo», «100 participantes por reactivo», «número de serie de la placa gráfica», «horas de descanso», «mayores de 65 años», «física cuántica», etc.).
   - Se reemplazaron por concepciones alternativas y errores típicos de estudiantes: «una muestra grande es representativa», «alfa alto prueba unidimensionalidad», «n = 384 vale para cualquier estudio», «la validez es una propiedad del test», «más de 30 casos por grupo alcanza», «test-retest mide validez», «el software no admite decimales», «confundir muestreo por cuotas con estratificado», etc.
   - Las cuatro opciones de cada ítem mantienen longitud homogénea y alta plausibilidad pedagógica.
2. **Saneamiento de `lectura_ref` no circular:**
   - Se removió cualquier cita o mención a archivos internos del sitio (`data/contenido_claude/...`, `cápsula`).
   - Todos los ítems citan ahora directamente las obras del canon metodológico y artículos de referencia:
     - *m08:* Leslie Kish (*Statistical Design for Research*, 1987; *Survey Sampling*, 1965), William G. Cochran (*Sampling Techniques*, 1977), Fernando Rodríguez Osuna (*Métodos de muestreo*, 1991), Jacob Cohen (*Statistical Power Analysis*, 1988), Geoff Cumming & Robert Calin-Jageman (*Introduction to the New Statistics*, 2017), Kirsti Malterud et al. (2016, *Information Power*), *APA Handbook* (Vol. 3).
     - *m09:* AERA/APA/NCME (*Standards for Educational and Psychological Testing*, 2014), José Muñiz (*Introducción a la Psicometría*, 2018), José Muñiz & Eduardo Fonseca-Pedrero (2019, *Diez pasos*), Klaas Sijtsma (2009, *Cronbach's alpha*), Klaas J. Dunn et al. (2014, *From alpha to omega*), William Revelle & Richard E. Zinbarg (2009), Jum C. Nunnally & Ira H. Bernstein (*Teoría psicométrica*, 1994), Fred N. Kerlinger & Howard B. Lee (2002), directrices de la International Test Commission (ITC, 2017) e iniciativa COSMIN.
     - *m10 y m11:* Citas canónicas al *APA Handbook of Research Methods in Psychology* (Vols. 2 y 3), `guianalisis`, normas *APA 7* y estándares *JARS-Quant* / *JARS-Qual*.
3. **Verificación automatizada:**
   - **Integridad JSON y conteo:** 80 ítems totales (m08: 16, m09: 24, m10: 16, m11: 24).
   - **IDs:** Únicos y secuenciales (`m08-b001` a `m08-b016`, `m09-b001` a `m09-b024`, `m10-b001` a `m10-b016`, `m11-b001` a `m11-b024`).
   - **Balance de opciones correctas:** Distribución uniforme exacta en cada archivo:
     - m08: `{0: 4, 1: 4, 2: 4, 3: 4}`
     - m09: `{0: 6, 1: 6, 2: 6, 3: 6}`
     - m10: `{0: 4, 1: 4, 2: 4, 3: 4}`
     - m11: `{0: 6, 1: 6, 2: 6, 3: 6}`
   - **Atributos de control:** 100 % de los ítems con `origen: "borrador_ia"`, `estado: "revisar"`, `nota_revision: ""`.
   - **Tests de regresión:** `node --test tests/*.mjs` (16 tests pasando) y `python3 meto2psico25/scripts/verify_exam_readiness.py` (auditoría de exclusión limpia).

---

## Auditoría funcional de Codex — 08/11/2026

### R5 — Etapa 1 completada por Codex (08/11/2026)

- Se ejecutaron, en orden, los cuatro puntos pedidos por R5: dominio real en el paso 7; almacén único `meto2.v2` para portada, examen y ciclo; mezcla de opciones con prueba automatizada de distribución; y práctica adaptativa con subida/bajada de dificultad, errores reaparecidos al final y declaración obligatoria de seguridad (`seguro`, `dudoso`, `adiviné`).
- El paso 7 calcula el puntaje sobre 10 ítems, aplica el umbral de 80 %, guarda fecha, puntaje, aciertos, estado de dominio y subtemas para repasar en `modules[mNN].domain`.
- La práctica adaptativa trabaja ítem por ítem, registra la seguridad y conserva los borradores fuera de publicación: solo usa ítems con `estado: "aprobado"`.
- Se actualizaron las capturas PC2 de m05 y m08 para los nueve pasos, 375/1280 px y temas claro/oscuro en `capturas/v3/pc2/`.
- Verificación: `node --test tests/*.mjs` — 20 pruebas pasan; `python3 scripts/verify_exam_readiness.py` pasa; `node scripts/test_browser_suite.mjs` pasa sin errores de consola, 404 no esperados ni overflow; `node scripts/capture_pc2.mjs` pasa las 72 combinaciones; prueba interactiva adicional del paso adaptativo pasa seguridad obligatoria, feedback y avance.
- Punto de control: **R5 Etapa 1 alcanzada.** El trabajo se detiene aquí para revisión de Claude y del docente. No se implementa la Etapa 2 (F3: repaso/Leitner, simulacro, progreso y glosario).

### Resultado ejecutivo

La rama funciona parcialmente. El ciclo nuevo de `modulo.html` carga y renderiza m05/m08, pero el MVP todavía no está completo: F3 no existe y varias piezas de F2 están solo dibujadas, sin cerrar el circuito de progreso y dominio. La causa de la sensación de sitio incompleto es la convivencia de dos arquitecturas:

- la portada `index.html` y `examen.html` siguen usando `assets/js/app.js`/`examen.js`, `main.css`, `meto2_progress_2026` y los datos legados `data/mNN.json`;
- `modulo.html` usa `modulo-app.js`, `engine.js`, `store.js`, `meto2.v2` y `data/banco`/`data/contenido`.

### Verificaciones ejecutadas

- `node --test tests/*.mjs`: 16 pruebas pasan.
- `python3 scripts/verify_exam_readiness.py`: auditoría de exclusión limpia.
- `node scripts/test_browser_suite.mjs`: portada y examen legados, diagnóstico y carga de m05 sin errores de consola, 404 ni overflow en 390 px.
- `node scripts/capture_pc2.mjs`: m05 y m08, nueve pasos, 375/1280 px y claro/oscuro; sin errores de consola ni overflow, cadena=9, herramientas m08=2 y galería=8.

### Faltantes bloqueantes antes de declarar el MVP

1. **F3 ausente:** no existen `repaso.html`, `simulacro.html`, `progreso.html` ni `glosario.html`. La barra nueva deja Progreso y Glosario como enlaces reservados a `#`; Repaso apunta a `modulo.html?m=m08` y no a una sesión Leitner.
2. **Dominio no se calcula ni se guarda:** el paso 7 muestra diez preguntas y feedback por ítem, pero no tiene entrega, puntaje, resultado 80 %, subtemas a repasar ni actualización de `modules[mNN].domain/completed/lastScore`. La portada lee otro almacén, por lo que el avance del ciclo nuevo no aparece allí.
3. **Práctica adaptativa incompleta:** `selectAdaptiveItems` prioriza dificultad 2 una sola vez; no implementa subida/bajada por aciertos consecutivos, reaparición de errores ni seguridad declarada.
4. **Conceptos y Leitner incompletos:** las tarjetas se muestran en `<details>`, pero no tienen botones «lo sabía / dudé / no lo sabía» ni envían tarjetas a las cajas de repaso.
5. **Mezcla de opciones no implementada:** `renderQuestion` conserva el orden original de las opciones. La posición correcta del banco aprobado está sesgada y no existe la prueba de uniformidad en 200 presentaciones.
6. **Tipos de ítem pendientes:** el motor solo renderiza opciones de radio; no implementa `pareo`, `respuesta_corta`, `caso`, `clasificar` ni `ordenar` definidos por el plan.
7. **Accesibilidad/pulido pendiente:** persisten `confirm()` en `app.js`, `alert()` en el temporizador de `examen.js` y emojis como íconos en la portada/examen/módulo legado, en contra de los criterios de aceptación.

### Brechas de contenido y datos

- Ítems aprobados actuales: m01 64, m02 35, m03 34, m04 57, m05 102, m06 66, m07 53, m08 40, m09 16, m10 24 y m11 16. La meta de 40 aprobados por módulo todavía no se alcanza en m02, m03 y m09–m11; los 80 borradores recientes permanecen correctamente fuera del sitio hasta aprobación.
- `preguntas_orientadoras`, `eslabon_cadena` y `evidencia_moodle` siguen vacíos en `data/modulos.json` donde no hay fuente; m10/m11 tampoco tienen autoauditoría integrada. Esto deja mensajes genéricos en esos pasos.
- `README.md` describe la arquitectura vieja y no documenta `data/banco`, `data/contenido`, el motor v3 ni cómo actualizar los borradores.
- Siguen presentes archivos legados que el criterio de aceptación marca para retirar o justificar (`data/progreso.json`, `integridad.json`, `modules/view.html`, `assets/js/app.js`, `assets/css/main.css`).

### Orden recomendado de trabajo

1. Unificar la portada y el ciclo en `meto2.v2`; implementar primero la verificación de dominio y la actualización de módulo.
2. Implementar `repaso.html`/Leitner y `simulacro.html`; después `progreso.html` y exportación/importación.
3. Completar tarjetas, seguridad, mezcla de opciones y pruebas de interacción; retirar o aislar la arquitectura legada.
4. Integrar los borradores solo después de la aprobación docente; no cambiar su contenido durante esta auditoría.

### Decisiones abiertas agregadas

- Definir si el umbral operativo del sitio queda en 80 % y cómo se armoniza con el umbral legado de 70 %.
- Definir la fecha y el alcance del examen final para dimensionar el simulacro de 40 ítems.
