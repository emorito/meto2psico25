# ESTADO DE CONTENIDO — Preparación del sitio para el examen final (`rediseno-2026`)

**Encargo:** `docs/ENCARGO-ANTIGRAVITY-sitio-examen-final.md`  
**Fecha:** 25/11/2026  
**Responsable:** Antigravity (Gemini + scripts de validación en Python)

---

## 1. S1 — Casos integradores de práctica (`data/casos/practica.json`) — COMPLETADO

Se redactaron los **4 casos integradores de práctica** en `data/casos/practica.json` con `tipo: "caso_integrador"`, `origen: "borrador_ia"` y `estado: "revisar"`.

| ID | Diseño y enfoque | Tema (contexto paraguayo) | Palabras viñeta | Preguntas | Particularidades metodológicas |
|---|---|---|---:|---:|---|
| `caso-p01` | Experimental con preprueba-posprueba, grupo control en lista de espera y asignación aleatoria (`R O1 X O2 / R O3 — O4`) | Taller breve de regulación emocional y ansiedad ante evaluaciones orales en ingresantes de Medicina (Asunción) | 421 | 8 | Distingue asignación aleatoria a condiciones (validez interna) de muestreo por conveniencia por afiche (pseudocálculo de 95 % y ±5 %); instrumento ad hoc improvisado. |
| `caso-p02` | Cuasiexperimental con grupos intactos no equivalentes pre-post (`O1 X O2 / --- / O3 — O4`) | Pausas activas laborales y fatiga mental en operadores telefónicos de dos turnos (San Lorenzo) | 428 | 8 | Amenaza de selección diferencial e historia local entre turno mañana y turno tarde; vulneración ética grave (coacción, nombre y cédula entregados a RR. HH.). |
| `caso-p03` | Cualitativo fenomenológico con entrevistas semiestructuradas | Vivencias de sobrecarga y estrategias cotidianas de cuidado en familiares cuidadores de adultos mayores con demencia (Luque) | 388 | 8 | Adapta preguntas a supuesto orientador, categorías/subcategorías iniciales y emergentes, muestreo intencional por criterios (pseudocálculo de fórmula en 14 entrevistas), prohibición de subir audios sensibles a IA pública y ruta de codificación/categorización cualitativa. |
| `caso-p04` | Descriptivo-correlacional transversal por encuesta con **muestreo probabilístico estratificado** bien hecho | Prevalencia de desgaste profesional y apoyo organizacional percibido en enfermeros de hospitales públicos (Asunción) | 415 | 8 | Marco muestral completo ($N = 2.400$), sorteo aleatorio estratificado ($n = 400$): caso ejemplar donde el margen de error ($\pm 4,5\,\%$ al $95\,\%$) **sí** corresponde; falla plantada en instrumento ad hoc sin consentimiento y conclusión causal a partir de correlación. |

---

## 2. S2 — Nuevos ítems para `m09` y `m10` (`data/borradores/m09.json`, `data/borradores/m10.json`) — COMPLETADO

Se agregaron **20 ítems nuevos a `data/borradores/m09.json`** (`m09-b025` a `m09-b044`, pasando de 24 a **44 borradores**) y **20 ítems nuevos a `data/borradores/m10.json`** (`m10-b017` a `m10-b036`, pasando de 16 a **36 borradores**), sin borrar ni modificar los borradores previos.

- **Fuentes utilizadas:** `assets/reading/7. Diez pasos para la construcción de un test.pdf` (Muñiz y Fonseca-Pedrero, 2019), `Materiales de Lectura/El plan de análisis de datos en un proyecto de investigación.pdf` y las Clases 11 y 12 de `Plan vigente de clases - Metodología II - 2026.md`.
- **Cobertura conceptual:**
  - **m09:** cadena objetivo → dato → fuente → técnica → instrumento (`m09-b025`, `m09-b031`); técnica frente a instrumento (`m09-b026`, `m09-b032`); calidad de la medición, diez pasos de construcción, validez como argumento sobre las inferencias, pilotaje cualitativo/cuantitativo, edición, formatos y dimensionalidad sin fórmulas (`m09-b027` a `m09-b029`, `m09-b033` a `m09-b037`, `m09-b040` a `m09-b044`); ética, consentimiento, anonimización con tabla separada, custodia y uso ético de IA sin cargar datos sensibles (`m09-b030`, `m09-b038`, `m09-b039`).
  - **m10:** diferencia entre plan en tiempo futuro, análisis ejecutado y resultado sin datos inventados (`m10-b017`, `m10-b023`); preparación de la matriz, recodificación de ítems inversos y pérdida de potencia al categorizar puntajes continuos (`m10-b018`, `m10-b019`, `m10-b024`); elección de descriptivos y pruebas según objetivo, diseño, nivel de medición y evaluación convergente de normalidad (`m10-b020`, `m10-b022`, `m10-b025` a `m10-b028`, `m10-b031`, `m10-b034`, `m10-b035`); alcance inferencial condicionado al muestreo probabilístico (`m10-b033`); asociación frente a causalidad (`m10-b032`); ruta cualitativa —unidad de significado, codificación, categorías, memos, casos divergentes— y articulación mixta (`m10-b021`, `m10-b029`, `m10-b030`, `m10-b036`).
- **Reparto de dificultad (exacto en ambos lotes de 20):** 6 de nivel 1, 9 de nivel 2 y 5 de nivel 3.
- **Balance de la opción correcta (exacto en ambos lotes de 20):** `{0: 5, 1: 5, 2: 5, 3: 5}`.
- **Homogeneidad de opciones (regla 6.1):** todas las opciones de los 40 ítems nuevos miden entre el 75 % y el 125 % del promedio de caracteres de su ítem; la opción correcta es la más larga en 0/20 ítems nuevos de `m09` y en 1/20 ítems nuevos de `m10`.
- **Similitud (`difflib.SequenceMatcher`):** todos los enunciados nuevos tienen similitud `< 0,60` contra la totalidad de `data/banco/*.json` y `data/borradores/*.json`.
- **Validador oficial (`python3 scripts/validate_draft_items.py`):** `[OK] 136 borradores estructuralmente válidos en 6 módulos` (`m02`: 8, `m03`: 8, `m08`: 16, `m09`: 44, `m10`: 36, `m11`: 24), todos con `origen: "borrador_ia"` y `estado: "revisar"`.

---

## 3. S4 — Datos faltantes de `m09` y `m10` en `data/modulos.json` — COMPLETADO

Se completaron en `data/modulos.json`, exclusivamente a partir de las secciones "Preparación" y "Resultados" (incluyendo rutas cuantitativa y cualitativa) de las Clases 11 y 12 de `Plan vigente de clases - Metodología II - 2026.md`:

- **`m09` (Clase 11):**
  - `eslabon_cadena`: `"instrumentos"`.
  - `preguntas_orientadoras`: 3 preguntas derivadas directamente de "Preparación" y "Resultados" de la Clase 11.
  - `autoauditoria`: se conservaron las 8 preguntas existentes y se integró el criterio de rigor cualitativo, riesgo y eliminación de registros de los resultados de la Clase 11.
- **`m10` (Clase 12):**
  - `eslabon_cadena`: `"analisis"`.
  - `preguntas_orientadoras`: 3 preguntas derivadas de "Preparación" y "Resultados comunes" de la Clase 12.
  - `autoauditoria`: 7 preguntas de verificación derivadas de "Resultados comunes", "Ruta cuantitativa" y "Ruta cualitativa" de la Clase 12.

---

## 4. S3 — Lista de aprobación rápida y script (`docs/APROBACION-RAPIDA.md`, `scripts/aplicar_aprobacion.py`) — COMPLETADO

1. **`docs/APROBACION-RAPIDA.md`:**
   - Incluye la tabla de resumen de cobertura, la tabla de los **4 casos integradores de práctica** (`caso-p01` a `caso-p04`) y una tabla por módulo en el orden de prioridad exacto solicitado: **m09, m10, m07, m06, m05, m04, m08**, seguidos por **m01, m02, m03, m11** (146 ítems en revisión + 4 casos = 150 elementos listos para decisión docente).
   - Columnas: `ID`, `Enunciado`, `Opciones (con la correcta marcada)`, `Fuente`, `Resultado del validador` (con dificultad, similitud máxima frente al banco aprobado y chequeo de longitud) y casilla `[ ] aprobar`.
2. **`scripts/aplicar_aprobacion.py`:**
   - Lee `docs/APROBACION-RAPIDA.md`, detecta únicamente las filas marcadas con `[x] aprobar` (o `[X] aprobar`) y cambia `estado` a `"aprobado"` en `data/borradores/mNN.json`, `data/banco/mNN.json` y `data/casos/practica.json`.
   - No modifica ningún otro campo ni aprueba elementos sin marca explícita. Soporta `--dry-run`.

---

## 5. Estado final

Todo el contenido nuevo permanece con `origen: "borrador_ia"` y `estado: "revisar"`. No se tocaron archivos de código del sitio ni se realizaron commits.

PC-E2 (contenido) listo para revisión de Claude
