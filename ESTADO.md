# ESTADO — rama `rediseno-2026`

**Abierta:** 08/11/2026 desde `main` (bc1aed6). `main` sigue publicada sin cambios hasta la aprobación del docente.

## Encargos activos

| Encargo | Responsable | Estado |
|---|---|---|
| `docs/ENCARGO-CODEX.md`: migración de datos, motor v3 (MVP), herramientas de muestreo | Codex | Tarea 1 completa; Tarea 3 en preparación |
| `docs/ENCARGO-ANTIGRAVITY.md`: borradores de ítems m08 a m11; convertir Olaz y Medrano | Antigravity | m10 y m11 pueden empezar; m08 y m09 esperan las cápsulas de Claude |
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

### Tarea 2 — Conversión de Olaz y Medrano a Markdown
- **Archivo origen:** *Cuadernos de Metodología para Estudiantes de Psicología: Manual de entrenamiento y práctica* (Fabián O. Olaz & Leonardo A. Medrano, 2014, Editorial Brujas / RDU UNC handle `11086/561651`).
- **Destino generado:** `Diseno de Investigacion/Archivos MD/Metodología de la investigación para estudiantes de psicología (Fabián Olaz y Leonardo Medrano).md` (y enlace simbólico `Metodología de la investigación para estudiantes de psicología.md`).
- **Verificación:** 146 páginas convertidas mediante `pdf_converter.py`, 233.587 caracteres, 2.955 líneas de markdown estructurado con índice, capítulos (epistemología, búsqueda bibliográfica, lectura crítica de papers, citas y referencias APA, textos expositivos/proyectos y presentación de trabajos) y tablas preservadas.

