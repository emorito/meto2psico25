# REVISIÓN — observaciones de Claude

Se aplican antes de seguir. Cada entrada se marca como resuelta en `ESTADO.md` cuando se aplica.

## R1 (08/11) — Contenido de Claude para m08 y m09

Están en `data/contenido_claude/m08.json` y `data/contenido_claude/m09.json`.

1. **Precedencia:** si existe `data/contenido_claude/mNN.json`, su `capsula` reemplaza a la migrada. `scripts/migrar_v3.py` nunca escribe en `data/contenido_claude/`.
2. **Bloques nuevos de cápsula:** además de `table`, `cards`, `checklist` y `highlight`, hay que renderizar `{"type": "herramienta", "id": …}`, que monta el árbol (`arbol-muestreo`) o la calculadora (`calculadora-honesta`) de la Tarea 3. En el texto se usa markdown en línea (`**negrita**`, `*cursiva*`).
3. **Textos del árbol y de la calculadora:** salen de `arbol` y `calculadora` en `m08.json`, por identificador (las hojas son `EST`, `POT`, `MOD`, `NP` y `Q`). No se escriben textos propios en el código.
4. **Galería de pseudocálculos** (`galeria_pseudocalculos`): se muestra en el paso 5 de m08 como tarjetas con tres partes plegables: «Lo que se escribió», «Diagnóstico» y «Corrección». Desde el bloqueo de la calculadora para muestras no probabilísticas se enlaza a esta galería.
5. **Autoauditoría:** `autoauditoria` de m08 y m09 alimenta el paso 8 de esos módulos.
6. **Auditoría de ítems de m08:** aplicar `auditoria_items_existentes` al banco migrado (`estado: "revisar"` y `nota_revision`). No modificar el texto de esos ítems.
7. **m09 tiene dos subtemas nuevos** (`subtemas_nuevos`). Agregarlos a `modulos.json` sin quitar los existentes.

## R2 (08/11) — Coordinación de git

Claude también hace push a `rediseno-2026`. Antes de cada push: `git pull --rebase origin rediseno-2026`. Si aparece un conflicto en `ESTADO.md`, se conservan las dos versiones.

## R3 (08/11) — PC1 aprobado, con observaciones

La base visual cumple la dirección editorial, los dos temas y los 375 px. **Se sigue con F2.** Al hacerlo:

1. **Cadena de coherencia completa.** La guía muestra 3 eslabones agrupados. La cadena real tiene 9: problema → preguntas → objetivos → hipótesis → variables → diseño → muestra → instrumentos → análisis (plan maestro, sección 2). En móvil se desplaza en horizontal, según el plan maestro 6.3; si se mantiene la versión vertical, alinear la línea con el centro de los círculos (hoy queda corrida).
2. **Navegación:** Progreso y Glosario quedan fuera del MVP, pero se reserva su lugar en la barra para no rediseñarla después.
3. **`node --test tests/`** falla en Node 22 (toma `tests` como módulo). Usar `node --test tests/*.mjs` en `AGENTS.md` y en la documentación.
4. **Integración de borradores:** importar `data/borradores/m08–m11.json` al banco con `estado: "revisar"` y `origen: "borrador_ia"`, sin tocar su texto. No se muestran hasta que el docente los apruebe.
5. **Prioridad F2:** el ciclo completo de m08 (con árbol, calculadora y galería) y de m05, antes que el resto de los módulos. Detenerse en PC2.

## R4 (08/11) — Revisión de borradores de Antigravity (muestra: los 40 de m08 y m09)

**Contenido:** correcto en lo sustantivo. No encontré errores conceptuales; los cálculos (300/0,60 = 500; EEM = 5 → [60,2; 79,8]) están bien. Se respetan el principio antipseudocálculo y la noción de validez como argumento.

**Dos problemas que hay que corregir antes de que el docente los apruebe:**
1. **Distractores inverosímiles.** Muchos son absurdos y delatan la respuesta («el tiempo en milisegundos», «el software bloquea el cálculo», «100 participantes por reactivo», «personas mayores de 65 años»). Reemplazarlos por **errores reales de estudiantes**, que son los que el ítem tiene que discriminar: «una muestra grande es representativa», «alfa alto prueba unidimensionalidad», «n = 384 vale para cualquier estudio», «la validez es una propiedad del test», «más de 30 casos por grupo alcanza», «test-retest mide validez». Opciones parejas en largo y verosimilitud.
2. **`lectura_ref` circular.** Varios ítems citan la cápsula (`data/contenido_claude/…`) como fuente. La cápsula es material del sitio, no la fuente: citar la obra del canon (capítulo o sección) o, como apoyo, el artículo correspondiente.

Ítems a reescribir completos: ninguno. Solo distractores y referencias, en m08, m09, m10 y m11.
