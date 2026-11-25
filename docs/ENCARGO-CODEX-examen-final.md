# Encargo Codex — Preparación del sitio para el examen final y validador de ítems

**Repositorio:** `emorito/meto2psico25`, rama `rediseno-2026` (ver `AGENTS.md`).
**Manda, para el examen:** `Metodología II/Examen final 2026/00 - Plan y tabla de especificaciones - Examen final 2026.md`. De ese documento solo se usan las secciones 2, 3 y 6. **Ningún ítem, caso ni clave del examen entra al repositorio.**
**Plazo:** tareas X1 y X2, 25/11; X3 a X5, 28/11. **PC-E2 (29/11):** Claude revisa y Enrique aprueba el *merge* antes de la clase de revisión del 01/12.

---

## X1 — Validador de ítems del examen (fuera del repo)

Escribí `Metodología II/Examen final 2026/herramientas/validar_examen.py`: Python 3, sin dependencias externas.

- **Entrada:** `items/parte1_candidatos.json` (esquema de la sección 7 del plan) y, opcionalmente, `armado/forma_A.json` y `armado/forma_B.json`.
- **Comprobaciones:**
  1. Esquema: campos obligatorios, `correcta` dentro del rango, 4 opciones en OM y `["Verdadero","Falso"]` en V/F.
  2. Cobertura: exactamente 3 candidatos por cada celda de I-01 a I-20, y que formato, tema y nivel coincidan con la tabla (codificala en el script como constante).
  3. Extensión: cada opción entre el 75 % y el 125 % del promedio de su ítem; cuántas veces la correcta es la más larga.
  4. Expresiones prohibidas: "todas las anteriores", "ninguna de las anteriores", "a y b", y además "siempre", "nunca" y "únicamente" (estas tres como advertencia, no como error).
  5. Distribución de la correcta. En los candidatos: ninguna letra por encima del 35 %. En una forma armada: cada letra 3 o 4 veces en las 14 OM, sin más de 2 seguidas iguales y con 3 V y 3 F.
  6. Similitud (difflib, umbral 0,6) del enunciado contra `meto2psico25/data/banco/*.json`, `data/borradores/*.json` y el texto de los exámenes anteriores, si se pasa `--previos <carpeta de .txt>`.
  7. Que la `fuente` exista como archivo.
- **Salida:** `items/informe_validacion.md`, con una tabla por ítem y un resumen. El código de salida es distinto de 0 si hay errores.
- **Armado** (opción `--armar`): con la elección del docente (`armado/eleccion.json`, que tiene un ID por celda), generá `forma_A.json` y `forma_B.json`. Barajá el orden de los ítems y el de las opciones con semilla fija, y repetí hasta cumplir la regla 5 en las dos formas. Las semillas quedan registradas.
- **Pruebas:** `herramientas/test_validar_examen.py`, con casos mínimos que fallen y que pasen.

## X2 — Corregir lo que el sitio dice del examen

`data/examen.json`, `examen.html` y `assets/js/examen.js` describen hoy un examen en Moodle de 60 minutos con los 11 módulos. Se reemplaza por:

- **Fecha:** 10/12/2026 · **Formato:** presencial, en papel, sin IA ni materiales; 2 h como máximo; pensado para 35–40 min.
- **Estructura:** Parte I con 20 ítems cerrados (opción múltiple y verdadero/falso), 20 puntos; Parte II con un caso integrador de 8 preguntas breves, 20 puntos. Total: 40.
- **Qué entra:** módulos m01 a m10 (clases 1 a 12). m11 (clase 13) queda como material de consulta y no se evalúa.
- **Peso por módulo**, que es el que se muestra al estudiante: el total por tema de la sección 3 del plan, agrupado por módulo:

| Módulo | Peso |
|---|---|
| m01 | 2 |
| m02 | 1 |
| m03 | 2 |
| m04 | 4,5 |
| m05 | 8 |
| m06 | 5,5 |
| m07 | 5,5 |
| m08 | 4,5 |
| m09 | 3,5 |
| m10 | 3,5 |

- Quitá `texto_moodle`: ya no corresponde.

## X3 — Simulacro "Formato del final"

En `simulacro.html`, agregá un modo nuevo, sin tocar los existentes, con dos partes:

1. **Parte I:** 20 ítems aprobados del banco (`estado: "aprobado"`), repartidos por módulo según los pesos de la Parte I:

| Módulo | Ítems |
|---|---|
| m01 | 2 |
| m02 | 1 |
| m03 | 2 |
| m04 | 2 |
| m05 | 3 |
| m06 | 3 |
| m07 | 3 |
| m08 | 2 |
| m09 | 1 |
| m10 | 1 |

   Proporción aproximada de 14 OM y 6 V/F; si un módulo no alcanza, se completa con el más cercano y se avisa. **Las opciones se mezclan en cada presentación**: es la brecha 5 de `ESTADO.md` y vale para todo el sitio, no solo para este modo. Feedback al final.
2. **Parte II:** un caso de práctica de `data/casos/practica.json` (lo produce Antigravity con un esquema nuevo, `tipo: "caso_integrador"`):
   - viñeta y 8 preguntas, con un `textarea` por pregunta;
   - al terminar se muestra, por pregunta, la respuesta modelo y la rúbrica de 0, 1,25 y 2,5;
   - el estudiante **se autocalifica** y el sitio suma.

   Solo se muestran casos con `estado: "aprobado"`.
3. Cronómetro visible y ocultable, sugerido de 40 minutos. Al final: puntaje sobre 40, desglose por tema y enlace "repasar esto" al módulo. Se guarda en `simulacros` dentro de `meto2.v2`.

## X4 — Pendientes de calidad que afectan al estudiante esta semana

De las brechas de `ESTADO.md`, solo estas:

- la mezcla de opciones en todo el sitio (ver X3), con la prueba de uniformidad en 200 presentaciones;
- quitar `alert()` y `confirm()` de `examen.js` y `app.js`;
- que `repaso.html` y `simulacro.html` no muestren nunca ítems en `revisar`, con su prueba.

El resto de las brechas queda para después del examen.

## X5 — Verificación

`node --test tests/*.mjs`, `python3 scripts/verify_exam_readiness.py` (actualizalo al formato nuevo) y las pruebas Playwright del modo "Formato del final" a 375 px y a 1280 px. Después se actualiza `ESTADO.md` y se hace un *commit* por tarea. **No hagas *merge* a `main`.**
