# Encargo Antigravity — Contenido del sitio para el examen final

**Repositorio:** `emorito/meto2psico25`, rama `rediseno-2026` (rige `AGENTS.md`). Trabaja con Gemini; las tareas mecánicas van a Ollama.
**Contexto:** el sitio prepara al estudiante para el examen del 10/12. Su formato: Parte I con 20 ítems cerrados y Parte II con un caso integrador de 8 preguntas, 40 puntos, alcance m01 a m10. Tabla por temas: sección 3 del plan del examen, que Codex deja copiada en `data/examen.json`.
**Regla de oro:** el sitio **no conoce el examen**. No se lee la carpeta `Examen final 2026/` salvo el plan, secciones 2, 3 y 6, que dan formato y reglas de calidad. Todo caso o ítem que se redacte aquí debe ser distinto de los del examen.
**Plazo:** S1 y S2, 28/11; S3, 27/11 (antes de que Enrique revise). **PC-E2 (29/11):** Claude revisa.

---

## S1 — Casos integradores de práctica (Gemini)

1. Redactá **4 casos de práctica** en `data/casos/practica.json`, con `tipo: "caso_integrador"`, `origen: "borrador_ia"` y `estado: "revisar"`.
2. Cada caso tiene la misma arquitectura que la Parte II del examen: una viñeta de 380 a 450 palabras con fallas plantadas en los eslabones señalados, 8 preguntas (las mismas de la tabla 5.2 del plan, en su forma genérica), respuesta modelo, variantes aceptables, errores que valen 0 y la rúbrica de 0, 1,25 y 2,5.
3. **Variedad obligatoria** para que practiquen las dos rutas y otros diseños:
   - un experimento con grupo control y asignación aleatoria;
   - un cuasiexperimento con grupos intactos;
   - un estudio cualitativo con entrevistas: las preguntas de variables, muestreo y análisis se adaptan a categorías, suficiencia y codificación;
   - un estudio descriptivo por encuesta con muestreo probabilístico, bien hecho, para que vean un caso donde el margen de error **sí** corresponde.

   Prohibido repetir los dos diseños del examen con el mismo tema: preexperimental antes-después en un colegio, y asociativo de redes sociales y sueño.
4. Esquema:
   ```json
   {
     "id": "caso-p01",
     "tipo": "caso_integrador",
     "titulo": "…",
     "vineta": "…",
     "preguntas": [
       {
         "n": 1,
         "eslabon": "problema",
         "nivel": "Analiza",
         "enunciado": "…",
         "respuesta_modelo": "…",
         "aceptables": ["…"],
         "errores_cero": ["…"],
         "lectura_ref": "…"
       }
     ],
     "fallas_plantadas": [ { "eslabon": "…", "falla": "…", "frase": "…" } ],
     "origen": "borrador_ia",
     "estado": "revisar",
     "nota_revision": ""
   }
   ```

## S2 — Completar el banco donde el examen lo necesita (Gemini, y Ollama para validar)

Ítems aprobados hoy: m09, 16; m10, 24. El simulacro "Formato del final" toma 1 ítem de cada uno por intento. Con tan pocos, los estudiantes los memorizan.

1. Redactá **20 ítems nuevos para m09** y **20 para m10**, a partir de `assets/reading/7. Diez pasos para la construcción de un test.pdf`, `Materiales de Lectura/El plan de análisis de datos en un proyecto de investigación.pdf` y los planes de las clases 11 y 12 (`Plan vigente de clases - Metodología II - 2026.md`).
   - **m09:** cadena objetivo → dato → fuente → técnica → instrumento; técnica frente a instrumento; calidad (validez como argumento, confiabilidad, rigor cualitativo), sin fórmulas; ética (consentimiento, privacidad, custodia, IA y datos sensibles).
   - **m10:** diferencia entre plan, análisis ejecutado y resultado; elección del análisis según objetivo, diseño y nivel de medición; inferencia solo si el diseño y el muestreo lo permiten; ruta cualitativa (unidad de significado, codificación, categorías, memos, casos divergentes); asociación frente a causalidad.
2. Reglas de redacción: las de la sección 6 del plan del examen, más las de la sección 7 del plan maestro del sitio. Reparto de dificultad: 6 de nivel 1, 9 de nivel 2 y 5 de nivel 3 por módulo.
3. Corré `scripts/validate_draft_items.py`. Además, la similitud con el banco existente tiene que ser menor a 0,6.

## S3 — Lista de aprobación rápida para Enrique (Ollama y script)

El cuello de botella es la aprobación docente: hay 96 borradores en `data/borradores/`, más los nuevos de S1 y S2.

1. Generá `docs/APROBACION-RAPIDA.md` con una tabla por módulo, en este orden de prioridad: **m09, m10, m07, m06, m05, m04, m08**, después el resto. Columnas: ID, enunciado, opciones con la correcta marcada, fuente, resultado del validador y una casilla `[ ] aprobar`.
2. Agregá un script `scripts/aplicar_aprobacion.py` que lea las casillas marcadas y pase esos ítems a `estado: "aprobado"`. No cambia nada más.
3. Objetivo: que Enrique apruebe en una sola sesión de 30 a 40 minutos lo necesario para que m09 y m10 lleguen a 30 o más ítems aprobados, más los 4 casos de práctica.

## S4 — Datos faltantes de los módulos (Gemini, sin inventar)

En `data/modulos.json`, completá `preguntas_orientadoras`, `eslabon_cadena` y `autoauditoria` de m09 y m10, solo a partir de `Plan vigente de clases - Metodología II - 2026.md` (secciones "Preparación" y "Resultados" de las clases 11 y 12). Si no hay fuente, se deja vacío y se anota en `ESTADO.md`.

---

## Cierre

`ESTADO.md` se actualiza al terminar cada tarea, con un *commit* por tarea. Nada pasa a `aprobado` sin la marca de Enrique.
