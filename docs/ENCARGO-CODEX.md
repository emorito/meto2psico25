# Encargo para Codex — motor del sitio v3 (rama `rediseno-2026`)

**Lee primero `AGENTS.md`.** Este encargo cubre el código. El contenido pedagógico lo producen Claude y Antigravity y llega a `data/` en paralelo; vos construís el sitio que lo consume.

**Plazo:** antes del examen final (fecha a confirmar; ver `ESTADO.md`). Por eso se trabaja por **alcance mínimo publicable**: primero lo marcado como MVP; lo demás, solo si el MVP está terminado y probado.

---

## Tarea 1 — Migración de datos (MVP, primero)

Hoy los datos están en `data/m01.json` … `data/m11.json`, con el esquema viejo: `capsula`, `flipCards`, `miniCases`, `simulation`, `quiz` y `resources`. El plan maestro (sección 5) define el esquema nuevo.

1. Escribir `scripts/migrar_v3.py`, que lea los `mNN.json` actuales y genere:
   - `data/banco/mNN.json` con los ítems en el esquema nuevo (`id`, `tipo`, `enunciado`, `opciones`, `correcta`, `feedback`, `dificultad`, `subtema`, `lectura_ref`, `estado`, `origen`, `nota_revision`);
   - `data/banco/flipcards.json`;
   - `data/contenido/mNN.json` con `capsula`, `casos` (de `miniCases` y `simulation`) y recursos;
   - `data/modulos.json` ampliado con los campos de la sección 5.2 del plan maestro (`fecha_clase`, `preguntas_orientadoras`, `autoauditoria`, `evidencia_moodle`, `eslabon_cadena`). Si un campo no tiene fuente, se deja vacío y se anota en `ESTADO.md`; no se inventa.
2. **Estado inicial de los ítems:** `aprobado` para los ítems existentes, que ya pasaron depuración, **salvo** los IDs listados en la sección 2 del `ESTADO.md` actual, que entran como `revisar`. La lista negra `EXCLUDED_QUIZ_IDS` de `scripts/build_site_data.py` sigue excluida.
3. El script es idempotente y **nunca pisa** `estado`, `nota_revision` ni `origen` si ya existen en `data/banco/` (porque Claude y el docente los editan a mano).
4. Prueba: el conteo de ítems por módulo después de migrar coincide con el anterior, menos los excluidos.

## Tarea 2 — Fases F1 a F3 del plan maestro

Seguir el plan maestro, secciones 3, 4, 6 y 8, con este recorte:

| Pieza | Alcance |
|---|---|
| `tokens.css`, `base.css`, `components.css`, `icons.svg` | MVP |
| `store.js` con migración de `meto2_progress` y funcionamiento sin `localStorage` | MVP |
| `engine.js`: tipos `opcion_multiple`, `verdadero_falso`, `caso`; adaptativo; verificación de dominio | MVP |
| `engine.js`: `pareo`, `respuesta_corta`, `clasificar`, `ordenar` | MVP si los datos los traen; si no, después |
| `index.html` (ruta y cadena), `modulo.html` (pasos 1 a 9) | MVP |
| `repaso.html` (Leitner), `simulacro.html` | MVP |
| `examen.html` actual | **Se conserva funcionando** hasta que `simulacro.html` lo reemplace; después se redirige |
| `progreso.html`, comprobante, `glosario.html` | Después del MVP |

La estructura de los pasos de un módulo se toma de los datos: si un módulo no tiene casos, el paso 5 se omite con un aviso; no se rompe.

## Tarea 3 — Herramientas de muestreo para m08 (MVP)

Dos componentes en `assets/js/muestreo/`. Se insertan en el paso 3 (Estudio) de m08 mediante un bloque de cápsula `{"type": "herramienta", "id": "arbol-muestreo"}` o `{"type": "herramienta", "id": "calculadora-honesta"}`.

### 3.1 Árbol de decisión (`arbol-muestreo`)

Preguntas en secuencia, con un solo nodo visible por vez, botón "Volver" y el camino recorrido visible arriba:

1. ¿El estudio es cualitativo (busca comprender significados, procesos o experiencias)? → **Sí:** hoja Q.
2. ¿Existe un marco muestral, es decir, un listado de la población accesible? → **No:** hoja NP.
3. ¿La selección desde ese marco es aleatoria, de modo que cada unidad tiene una probabilidad conocida y mayor que cero? → **No:** hoja NP.
4. ¿Qué querés hacer con los datos? → **Estimar** un valor de la población (proporción, media): hoja EST. **Contrastar** una hipótesis (relación, diferencia): hoja POT. **Ajustar un modelo** factorial o de ecuaciones estructurales: hoja MOD.

Hojas (los textos definitivos los entrega Claude en `data/contenido/m08.json`; vos dejás contenedores con estos identificadores):
- **EST:** fórmula de precisión → abre la calculadora en el modo estimación.
- **POT:** análisis de potencia → abre la calculadora en el modo potencia.
- **MOD:** sin fórmula única; remite a la literatura del modelo. No calcula.
- **NP:** no corresponde margen de error. Se ofrece potencia para el contraste planificado y la declaración de límites de inferencia.
- **Q:** potencia informativa y saturación. No calcula.

### 3.2 Calculadora honesta (`calculadora-honesta`)

**Primero el diseño, después el número.** La pantalla inicial pregunta el tipo de muestreo (probabilístico / no probabilístico / cualitativo) y el propósito. Los campos numéricos aparecen recién después.

**Modo estimación** (solo con muestreo probabilístico):
- Proporción: `n0 = z² · p(1−p) / e²`. Media: `n0 = z² · σ² / e²`.
- Corrección por población finita, opcional, solo si se ingresa N: `n1 = n0 / (1 + (n0 − 1)/N)`.
- Efecto de diseño, opcional, valor por defecto 1: `n2 = n1 · deff`.
- Tasa de respuesta esperada, obligatoria, entre 0 y 1: `n3 = n2 / r`.
- Mostrar **todos los pasos** con su valor y redondear hacia arriba en cada paso que produce un número de personas.
- Si p = 0,5 y no hay fuente, mostrar la advertencia: "p = 0,5 es el supuesto más conservador; si tenés una estimación previa, usala".

**Modo potencia** (para cualquier diseño cuantitativo; el único modo disponible con muestreo no probabilístico):
- Correlación: `n = ((z₁₋α/₂ + z₁₋β) / C)² + 3`, con `C = ½ · ln((1+r)/(1−r))`.
- Dos medias independientes (d de Cohen): por grupo, `n = 2(z₁₋α/₂ + z₁₋β)² / d² + z₁₋α/₂² / 4`.
- Dos proporciones independientes: por grupo, `n = (z₁₋α/₂·√(2p̄q̄) + z₁₋β·√(p₁q₁ + p₂q₂))² / (p₁ − p₂)²`.
- El campo **"fuente del tamaño de efecto"** es obligatorio. Sin él, no se calcula y se muestra: "El tamaño de efecto tiene que venir de la literatura o de un estudio piloto, no de una convención".
- Ajuste por tasa de respuesta, igual que en estimación.
- Nota fija: "Cálculo aproximado (normal). Para diseños más complejos usá G*Power".

**Con muestreo no probabilístico:** el modo estimación aparece **deshabilitado** y explica por qué ("Sin probabilidades de selección conocidas, el margen de error no tiene referente") con un enlace a la galería de pseudocálculos.

**Con estudio cualitativo:** no hay campos numéricos. Se muestra la guía de potencia informativa (texto que entrega Claude).

`z` se calcula con una función de cuantil normal propia (aproximación de Acklam o equivalente), sin librerías externas.

### 3.3 Pruebas obligatorias (`tests/muestreo.test.mjs`, con `node --test`)

| Caso | Esperado |
|---|---|
| Proporción, p = 0,5, e = 0,05, confianza 95 %, sin N, deff 1, r 1 | 385 |
| Ídem, con N = 1200 | 292 |
| Ídem, con N = 1200, deff 1,5, r 0,6 | 730 |
| Correlación r = 0,30, α = 0,05 bilateral, potencia 0,80 | 85 |
| d = 0,5, α = 0,05, potencia 0,80 | 64 por grupo |
| p₁ = 0,30, p₂ = 0,50, α = 0,05, potencia 0,80 | 93 por grupo |
| Muestreo no probabilístico | el modo estimación no devuelve número |
| Cualitativo | no devuelve número |
| Potencia sin fuente del tamaño de efecto | no devuelve número |

## Tarea 4 — Criterios de aceptación

Los de la sección 10 del plan maestro, más las pruebas 3.3. Pruebas Playwright para el ciclo de m05 y m08 (este último incluye el árbol y la calculadora).

## Entrega

- Un commit por tarea en `rediseno-2026`; `ESTADO.md` actualizado.
- Se para en **PC1** (después de F1) y en **PC2** (con m05 y m08 completos), con capturas en `capturas/v3/`, y avisa al docente. Claude revisa y deja `REVISION.md`.
