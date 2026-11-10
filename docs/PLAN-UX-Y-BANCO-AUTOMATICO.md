# Plan de trabajo — experiencia educativa y banco de ítems

**Fecha:** 10/11/2026
**Rama:** `rediseno-2026`
**Propósito:** convertir el sitio en una experiencia de estudio guiada, simple y verificable, sin publicar contenido no aprobado.

## Resultado que debe percibir el estudiante

Al abrir el sitio, la persona tiene que poder responder sin conocer la arquitectura técnica:

1. dónde quedó;
2. qué puede hacer ahora;
3. qué debería repasar;
4. por qué una respuesta fue adecuada o no;
5. cuándo conviene volver a intentarlo.

La navegación visible usará verbos cotidianos: **Seguir**, **Repasar**, **Practicar** y **Ver la explicación**. Términos internos como `dominio`, `Leitner`, `adaptativo` o `item model` no son parte de la interfaz estudiantil.

## Orden de implementación

### A. Base segura de avance

- Persistir `lastActivity` por módulo: módulo, paso, ítem, tipo de actividad y fecha.
- Persistir el estado mínimo de una práctica interrumpida.
- Hacer que la portada ofrezca **Seguir donde quedaste**.
- Mantener `meto2.v2`, sin login y sin prometer sincronización entre dispositivos.

### B. Flujo de estudio

- Portada orientada a tres acciones: **Seguir donde quedé**, **Repasar lo que me salió mal**, **Hacer una prueba corta**.
- Repaso breve con errores, baja seguridad y subtemas pendientes.
- Feedback con explicación, referencia de lectura y nueva oportunidad.
- Tarjetas con tres respuestas de estudio: **lo sabía**, **dudé**, **no lo sabía**.
- Espaciado posterior de los ítems; la respuesta incorrecta no debe desaparecer.

### C. Banco de ítems

- Mantener separados `aprobado` y `revisar`.
- Generar variantes desde modelos de ítem explícitos, no desde una instrucción abierta sin control.
- Cada modelo debe declarar: resultado observable, fuente, operación cognitiva, variables permitidas, distractores esperados y reglas de exclusión.
- Cada instancia debe conservar `origen: "borrador_ia"`, `estado: "revisar"`, `lectura_ref`, `modelo_id` y `generado_en`.
- Validar automáticamente JSON, referencias, duplicados, posición de la respuesta correcta, dificultad declarada y reglas antipseudocálculo.
- La revisión humana decide si un ítem entra al banco publicado. Ningún generador cambia ítems existentes.

### D. Evidencia y revisión

- Pruebas unitarias para el motor y el generador.
- Pruebas de navegador en 375 px y 1280 px, claro y oscuro.
- Capturas antes y después de cada cambio visible.
- Revisión de una muestra por módulo antes de cualquier cambio de `revisar` a `aprobado`.
- `ESTADO.md` actualizado en cada commit funcional.

## Inventario inicial y faltantes

### Disponible localmente

- `Materiales de Lectura/`: lecturas base en Markdown/PDF, incluidas ciencia, problemas, objetivos, constructos, diseño, muestreo y revisión de literatura.
- `Diseno de Investigacion/Archivos MD/`: corpus amplio de metodología, diseños, muestreo, psicometría, análisis y publicación.
- `assets/reading/`: lecturas seleccionadas que ya usa el sitio.
- `Trabajos de proceso/`: entregables del proyecto —problema, marco, diseño, muestra, instrumentos, análisis, ética, gestión y referencias—.
- `Exámenes/`: parciales y finales históricos para auditoría de cobertura, no para copiar preguntas automáticamente.
- `Banco de ítems/Banco unificado 2026/`: banco y hojas de revisión docente.

### Faltantes o pendientes de adquisición/verificación

- McGuigan, *Psicología experimental*.
- Nunnally y Bernstein, *Psychometric Theory*.
- Snedecor y Cochran, *Statistical Methods*.
- JARS oficiales de APA, si se requiere una copia local estable.
- Confirmación docente de las fuentes que todavía solo aparecen como referencia bibliográfica en los borradores.
- Decisión docente sobre los ítems con `estado: "revisar"`; esos ítems no deben publicarse por automatismo.

## Fuentes sobre generación automática de ítems

- Gierl y Lai, modelos de ítem y generación basada en modelos: <https://doi.org/10.1080/15305058.2011.635830>.
- Lai, Gierl y colaboradores, proceso de revisión y evaluación de ítems generados: <https://doi.org/10.1111/emip.12129>.
- Revisión sistemática reciente de generación automática en evaluación educativa: <https://doi.org/10.1080/10494820.2025.2482588>.
- Revisión sobre validez de preguntas generadas por IA: <https://pubmed.ncbi.nlm.nih.gov/42160214/>.

La conclusión operativa es conservadora: la automatización sirve para ampliar borradores y variantes, pero no sustituye la revisión de contenido, lógica, sesgo, dificultad ni evidencia de validez.

## Criterios de detención

Se detiene el trabajo y se informa al docente si aparece cualquiera de estas situaciones:

- una fuente local contradice el plan vigente y no hay autoridad definida;
- un ítem nuevo requiere decidir una postura docente no documentada;
- para mejorar la UX habría que reescribir contenido aprobado;
- una migración puede borrar progreso o mezclar almacenes;
- una propuesta de sincronización requiere recolectar datos personales;
- una mejora visible no pasa las pruebas de regresión.
