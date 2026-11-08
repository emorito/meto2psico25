# Encargo para Antigravity — contenido en borrador (rama `rediseno-2026`)

**Lee primero `AGENTS.md`.** Este encargo es solo de contenido. No toques código: eso lo hace Codex en paralelo.
Modelo: Gemini para redactar; Ollama para las tareas mecánicas (marcadas con ⚙).

---

## Tarea 1 — Borradores de ítems para m08, m09, m10 y m11

**Meta por módulo:** completar hasta 40 ítems, según la cobertura del plan maestro (12 de dificultad 1, 18 de dificultad 2 y 10 de dificultad 3). Antes de redactar, calculá la brecha con lo que ya hay (⚙).

**Espera antes de empezar m08 y m09:** Claude entrega primero las cápsulas nuevas de esos dos módulos en `data/contenido/m08.json` y `data/contenido/m09.json`. Los ítems se redactan **a partir de esas cápsulas** y de las fuentes, no de los ítems viejos. m10 y m11 se pueden empezar ya.

### Fuentes por módulo, en orden de autoridad

Rutas relativas a la carpeta `Metodología II` de OneDrive.

| Módulo | Canon | Apoyo |
|---|---|---|
| m08 Muestreo | `Diseno de Investigacion/Archivos MD/Statistical Design for Research - Leslie Kish.md`; Kish, *Survey Sampling* y Cochran, *Sampling Techniques* (en `Estadística & Psicometría/Sampling/`) | `Materiales de Lectura/07.0. LIBRO - Métodos de muestreo - Jacinto Rodríguez Osuna.md` |
| m09 Instrumentos | `APA Handbook … Foundations, planning, measures, and psychometrics.md` | `Estadística & Psicometría/Psicometría/` (Muñiz, Meneses, Furr) y `/Reliability/` (Dunn et al. 2013; Sijtsma 2009); `assets/reading/7. Diez pasos para la construcción de un test.pdf`; `ITCGuidelinesforTranslatingandAdaptingTestsSecondEdition.pdf` |
| m10 Análisis | `APA Handbook … Data analysis and research publication.md` | `https://emorito.github.io/guianalisis/` |
| m11 Escritura | APA 7 y JARS (apastyle.apa.org) | `assets/reading/9. Aplicación de Estilo APA en trabajos académicos.pdf` |

### Formato de salida

Un archivo por módulo: `data/borradores/mNN.json`. Es una lista de ítems con el esquema de `data/banco/` (ver la sección 5 del plan maestro):

```json
{
  "id": "m08-b001",
  "tipo": "opcion_multiple",
  "enunciado": "…",
  "opciones": ["…", "…", "…", "…"],
  "correcta": 2,
  "feedback": { "correcto": "…", "incorrecto": "…" },
  "dificultad": 2,
  "subtema": "…",
  "lectura_ref": "archivo y capítulo o sección exacta",
  "origen": "borrador_ia",
  "estado": "revisar",
  "nota_revision": ""
}
```

### Reglas de redacción

Las de la sección 7.4 del plan maestro, más estas:

1. **`lectura_ref` tiene que apuntar a un pasaje real.** Si no encontrás respaldo en las fuentes, no escribas el ítem.
2. **Muestreo:** ningún ítem puede presentar un margen de error para una muestra no probabilística, ni un tamaño de muestra calculado para un estudio cualitativo, ni el número 384 como valor universal. Al menos un tercio de los ítems de m08 tienen que ser de **discriminación**: dado un caso, ¿qué justificación del tamaño corresponde?
3. **Psicometría:** la validez se trata como un argumento sustentado en evidencias sobre la interpretación de las puntuaciones, no como una propiedad del test. Alfa no se presenta como sinónimo de fiabilidad: se mencionan sus supuestos o su alternativa, omega.
4. **Distractores:** tomados de errores reales de estudiantes, por ejemplo "un alfa alto prueba la unidimensionalidad" o "una muestra grande es representativa".
5. Sin "todas las anteriores" ni "ninguna de las anteriores". La posición de la respuesta correcta se reparte en forma pareja (⚙ verificar al final).

### Verificación final (⚙ Ollama o script)

- JSON válido; IDs únicos; `correcta` dentro del rango de opciones.
- Distribución de `correcta` y de `dificultad` por módulo.
- Listado de todos los borradores en la hoja "Borradores" de `Banco de ítems/Banco unificado 2026/revision_items.xlsx`.

## Tarea 2 — ⚙ Convertir Olaz y Medrano a markdown

*Metodología de la investigación para estudiantes de psicología*. Hay que convertirlo y dejarlo en `Diseno de Investigacion/Archivos MD/`. Es el único manual de psicología en español rioplatense del corpus.

## Entrega

- Commit en `rediseno-2026` con `data/borradores/` y `ESTADO.md` actualizado.
- Avisar al docente. Claude revisa una muestra de cada módulo antes de que el docente apruebe.
