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
