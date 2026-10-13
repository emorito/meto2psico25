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
