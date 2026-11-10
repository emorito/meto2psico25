# Inventario de materiales y brechas

**Corte:** 10/11/2026 · **Rama:** `rediseno-2026`

## Cobertura actual del banco

| Módulo | Total en banco | Aprobados | En revisión | Faltan para 40 aprobados |
|---|---:|---:|---:|---:|
| m01 | 64 | 64 | 0 | 0 |
| m02 | 35 | 35 | 0 | 5 |
| m03 | 34 | 34 | 0 | 6 |
| m04 | 57 | 57 | 0 | 0 |
| m05 | 105 | 102 | 3 | 0 |
| m06 | 66 | 66 | 0 | 0 |
| m07 | 53 | 53 | 0 | 0 |
| m08 | 63 | 40 | 23 | 0 |
| m09 | 40 | 16 | 24 | 24 |
| m10 | 40 | 24 | 16 | 16 |
| m11 | 40 | 16 | 24 | 24 |

Los 80 borradores de m08–m11 están correctamente fuera de publicación. No se convierten en aprobados por alcanzar una cantidad objetivo.

**Advertencia de trazabilidad:** la auditoría cruzada detectó referencias circulares en parte de la copia ya importada a `data/banco/` de m08–m09 (`data/contenido_claude/...`). Antes de aprobar esos ítems hay que comparar cada `lectura_ref` con el borrador original y una fuente canónica. No se corrigen automáticamente ni se reescriben los enunciados.

## Borradores existentes

- `data/borradores/m08.json`: 16 ítems, todos `revisar`.
- `data/borradores/m09.json`: 24 ítems, todos `revisar`.
- `data/borradores/m10.json`: 16 ítems, todos `revisar`.
- `data/borradores/m11.json`: 24 ítems, todos `revisar`.

Todos declaran `origen: "borrador_ia"`. Deben pasar revisión docente antes de incorporarse a una experiencia de evaluación o cambiar de estado.

## Material local útil para el sitio

### Fuentes de contenido

- `Materiales de Lectura/`: 9 lecturas base y material complementario en Markdown/PDF/DOCX.
- `Diseno de Investigacion/Archivos MD/`: 20+ textos metodológicos y de psicología de la investigación.
- `Diseno de Investigacion/Libros & Articulos/`: libros y artículos de apoyo en PDF.
- `assets/reading/`: 9 lecturas seleccionadas ya referenciadas por el sitio.

### Evidencias y actividades

- `Trabajos de proceso/`: entregables 1–12 del anteproyecto.
- `Exámenes/`: parciales y finales históricos para revisar cobertura y formatos.
- `Actividades de clase/`: guías sobre objetivos, literatura e IA responsable.
- `Planes y programas/`: programa, planificación vigente y documentos históricos separados.
- `Banco de ítems/Banco unificado 2026/`: banco, revisión y hoja de seguimiento.

## Brechas de materiales

### Fuentes del canon aún no localizadas

- McGuigan, *Psicología experimental*.
- Nunnally y Bernstein, *Psychometric Theory*.
- Snedecor y Cochran, *Statistical Methods*.
- Copia local estable de JARS oficiales de APA.

### Brechas pedagógicas del sitio

- **Implementado:** cola visible de **Repasar lo que me salió mal**, continuidad de la portada y restauración de la actividad interrumpida.
- **Implementado:** simulacro corto independiente de la arquitectura heredada de `examen.html`, página de progreso con acciones concretas y glosario contextual sobre las tarjetas existentes.
- Las tarjetas conceptuales ahora registran `lo sabía / dudé / no lo sabía` en `meto2.v2`; las dos últimas vuelven a la cola de repaso. Falta una vista más rica del historial de cajas, no el registro básico.
- Falta una autoauditoría específica para m10 y m11, y faltan preguntas orientadoras/eslabones/evidencias donde el plan no aporta una fuente validada.
- Falta decidir si se necesita exportación/importación del avance entre dispositivos; no se debe implementar sincronización ni cuentas sin decisión docente y política de privacidad.

### Brechas técnicas

- La arquitectura nueva y la heredada todavía conviven.
- `localStorage` permite continuidad en el mismo dispositivo, pero no sincronización entre dispositivos.
- No se deben añadir cuentas ni recolección de datos sin decisión docente y política de privacidad.
- Los tipos de ítem no implementados solo deben agregarse si hay datos y una evidencia clara de que aportan al aprendizaje.
