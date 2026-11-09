# AGENTS.md — meto2psico25

Instrucciones para cualquier agente que trabaje en este repo (Codex, Antigravity, Gemini u Ollama).
Dirección y revisión: Claude. Decisión final: el docente (Enrique Morosini).

## Documentos que mandan, en este orden

1. `docs/plan-v3-y-psychoresearch.md`: plan vigente (08/11/2026). Canon de autoridad, principio antipseudocálculo, fases.
2. `docs/plan-maestro-2026-10-13.md`: arquitectura, tokens, ciclo de módulo, esquema de datos, criterios de aceptación.
3. Tu encargo específico: `docs/ENCARGO-CODEX.md` o `docs/ENCARGO-ANTIGRAVITY.md`.
4. `REVISION.md`, si existe: observaciones de Claude que se aplican antes de seguir.

Si dos documentos se contradicen, manda el de número más bajo. Si la duda persiste, la anotás en `ESTADO.md` como decisión abierta y no la resolvés por tu cuenta.

## Reglas fijas

- **Rama:** se trabaja en `rediseno-2026`. Nunca en `main`, nunca `push --force`, nunca *merge* sin la aprobación del docente.
- **Sin compilación:** HTML, CSS y JavaScript con módulos ES. Tiene que funcionar en GitHub Pages tal como está. Sin frameworks ni CDN de componentes. Google Fonts está permitido.
- **El contenido no se reescribe.** Lo que esté mal o parezca inconsistente se marca con `estado: "revisar"` y se anota el motivo en `nota_revision`. No se corrige.
- **Contenido nuevo** (ítems, casos, ejemplos): entra con `origen: "borrador_ia"` y `estado: "revisar"`. El sitio solo muestra ítems con `estado: "aprobado"`.
- **Muestreo:** nunca se presenta un margen de error ni un nivel de confianza para una muestra no probabilística. Nunca se calcula un "tamaño de muestra" para un estudio cualitativo. Ver la sección 1 del plan vigente.
- **Biblioteca Instrumental:** no se publican protocolos ni ítems de tests comerciales.
- **Registro:** voseo en meto2psico25 (por ahora; decisión abierta 3 del plan maestro). Sin emojis en la interfaz.
- **Al cerrar cada tarea:** actualizar `ESTADO.md` con qué se hizo, cómo se verificó, qué falta y qué decisiones quedaron abiertas. Hacer un *commit* por tarea, con un mensaje descriptivo.

## Verificación mínima antes de cada commit

```bash
python3 -m http.server 8000          # previsualizar
node --test tests/*.mjs              # pruebas unitarias del motor
python3 scripts/verify_exam_readiness.py
```

Probar a 375 px y a 1280 px, en tema claro y oscuro.
