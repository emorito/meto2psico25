# Plan — meto2psico25 v3 y psychoResearch

**Fecha:** 08/11/2026 · **Dirección y revisión:** Claude · **Ejecución:** Codex (código), Antigravity + Gemini (contenido masivo), Ollama (tareas mecánicas)
**Hereda de:** `Plan maestro - Sitio de estudio Metodología II.md` (13/10). Sus decisiones de arquitectura, tokens, ciclo de módulo, Leitner y criterios de aceptación **se mantienen**. Este plan agrega contenido, el reparto de trabajo entre agentes y un segundo sitio.

---

## 0. Diagnóstico de partida

| Aspecto | Estado en `main` (bc1aed6) |
|---|---|
| Arquitectura | La vieja: `app.js` monolítico, flip 3D, video de encabezado, Font Awesome. El rediseño del 13/10 no se ejecutó. |
| Banco | 526 ítems; m05 depurado (9 excluidos). m09: 16 ítems; m10: pocos; m11: pocos. |
| m08 Muestreo | 47 ítems conceptuales. Falta el criterio de **cuándo hay fórmula y cuándo no**. No cubre potencia, efecto de diseño aplicado, tasa de respuesta, potencia informativa ni saturación con criterio. Hay ítems ambiguos. |
| m09 Instrumentos | Cápsula de 4 tarjetas; la psicometría es una mención. No aparecen los Standards AERA/APA/NCME, omega ni alfa con supuestos, el error estándar de medida, el análisis de ítems, AFE/AFC, la invarianza, la adaptación (ITC), los baremos ni la selección de instrumentos (COSMIN). |
| Calendario | Última clase el 11/11 o el 18/11; el examen final, después. **El sitio actual tiene que seguir funcionando para el final.** |

## 1. Principio rector del contenido: sin pseudocálculo

Dos reglas que valen para los dos sitios y que todo ítem, caso o calculadora tiene que respetar:

1. **La fórmula depende del diseño muestral, no al revés.** Un margen de error y un nivel de confianza solo existen cuando cada unidad del marco tuvo una probabilidad conocida de ser elegida. En una muestra no probabilística, "n = 384, 95 %, ±5 %" es un número sin referente.
2. **El tamaño se justifica por el propósito.** Estimar un parámetro usa una fórmula de precisión, con corrección por población finita, efecto de diseño y tasa de respuesta. Contrastar una hipótesis usa un análisis de potencia, con un tamaño de efecto tomado de la literatura y no inventado. Un modelo factorial o SEM se justifica con su propia literatura, sabiendo que las reglas de pulgar están cuestionadas. En cualitativo se habla de potencia informativa y saturación, nunca de fórmula. Un estudio no probabilístico se justifica por acceso, potencia y límites de inferencia declarados.

## 1 bis. Canon de autoridad

Todo contenido de los dos sitios se ancla en estas obras. Ante una discrepancia con otra fuente, manda el canon. Si dos obras del canon discrepan entre sí, se muestra la tensión y no se elige una (como ya se hizo con Kish frente a Campbell y Stanley).

| Obra | Gobierna | ¿Disponible? |
|---|---|---|
| McGuigan, *Psicología experimental* | Raíces experimentales, método, control | **No está en las carpetas** |
| Kerlinger y Lee, *Investigación del comportamiento* | Problema, hipótesis, constructos, variables, diseño | Sí, capítulos en markdown |
| Kazdin, *Research Design in Clinical Psychology* | Diseño clínico, caso único, validez | Sí, PDF y markdown |
| *APA Handbook of Research Methods in Psychology* (3 vol.) | Marco general, medición, cualitativo, análisis | Sí, markdown |
| APA, JARS (cuantitativo, cualitativo y mixto) | Qué se reporta y cómo | **No está**; es público en apastyle.apa.org |
| Campbell y Stanley; Shadish, Cook y Campbell | Validez y amenazas, notación | Sí, markdown |
| Nunnally (y Bernstein), *Psychometric Theory* | Teoría de la medición, fiabilidad, construcción de escalas | **No está** |
| Kish, *Statistical Design for Research* y *Survey Sampling* | Criterios de diseño, muestreo, efecto de diseño | Sí |
| Snedecor y Cochran, *Statistical Methods* (1989); Cochran, *Sampling Techniques* | Inferencia, tamaño de muestra | *Sampling Techniques* sí; *Statistical Methods*, **no** |

**Fuentes de apoyo** (no son autoridad, solo desarrollo o actualización): Muñiz, Meneses y Furr (psicometría); Sijtsma, Dunn et al. y Revelle y Zinbarg (alfa frente a omega); las directrices de la ITC; Rodríguez Osuna (muestreo); Marradi (lo social y lo no estándar).

**Carpeta `Taller TFG 2024`** (OneDrive > Documentos), útil sobre todo para psychoResearch: Danziger, *Constructing the Subject* (unidad 1, raíces históricas de la investigación psicológica); Cumming y Calin-Jageman, *Introduction to the New Statistics* (unidad 2, estimación y ciencia abierta); Ruth, Wutich y Bernard, *Handbook of Teaching Qualitative and Mixed Research Methods* (unidades 9 y 10); Ravitch y Riggan, *Reason & Rigor* (marcos conceptuales, unidad 3); Passer, Schweigert y Abbott y McKinney (manuales de apoyo); la estructura del protocolo de TFG y la tabla de trayectoria (rutas por perfil, en particular la del tesista).

**Biblioteca Instrumental:** es material privado y en parte comercial. En los sitios no se publican protocolos ni ítems de tests. Como mucho, se usan los metadatos de las familias marcadas `publicable: true` como ejemplos de fichas técnicas.

## 2. Resultado 1 — meto2psico25 v3

### 2.1 Un sitio completo en la rama, publicado antes del final

Decidido el 08/11: **todo se trabaja en la rama `rediseno-2026`**, que es el plan maestro del 13/10 (F1 a F5) más el contenido de este plan. `main` no se toca hasta que la rama esté completa y la apruebes. Ese día se hace un solo *merge* y el sitio nuevo queda publicado entero antes del examen final. Si la rama no llega a tiempo, `main` sigue sirviendo tal como está.

Para que llegue a tiempo, el alcance mínimo publicable (MVP) es: Inicio, ciclo de módulo (pasos 1 a 9), Repaso, Simulacro y los 11 módulos con su contenido migrado; más la calculadora honesta y el árbol de muestreo en m08. Progreso, glosario y comprobante entran si hay tiempo; si no, quedan para después del final.

### 2.2 Muestreo (m08), reestructurado

1. **Árbol de decisión navegable**, a partir de tres preguntas: ¿hay marco muestral? ¿la selección es aleatoria? ¿qué quiero hacer con los datos? (estimar, contrastar, modelar, comprender). Cada hoja del árbol lleva a su forma legítima de justificar el tamaño.
2. **Calculadora honesta.** Primero pregunta el tipo de muestreo y el propósito; recién después calcula.
   - Si el muestreo es probabilístico y se quiere estimar: precisión, con corrección por población finita, efecto de diseño y ajuste por tasa de respuesta.
   - Si se quiere contrastar: potencia, para correlación, diferencia de medias y proporciones, con el tamaño de efecto y su fuente como campo obligatorio.
   - Si el muestreo es no probabilístico: **no entrega margen de error**. Explica por qué y ofrece el análisis de potencia como alternativa legítima.
   - Si el estudio es cualitativo: no calcula nada. Ofrece una guía de potencia informativa (Malterud et al.) y criterios de saturación.
3. **Galería de pseudocálculos.** Casos realistas, cada uno con su diagnóstico y su corrección: los 384 aplicados a una muestra de conveniencia; la población finita con un N inventado; el "95 % de confianza" en una muestra intencional; la fórmula usada para fijar el número de entrevistas; la muestra grande tomada como si fuera representativa; las cuotas presentadas como estratos.
4. **Ítems.** Los ambiguos se marcan con `estado: "revisar"`, sin corregirlos. Se agregan ítems de discriminación, por ejemplo: "¿Qué justificación corresponde a este caso?".

### 2.3 Instrumentación (m09), expandida

Se organiza con el marco de los **Standards (AERA, APA y NCME, 2014)**: la validez como argumento sustentado en evidencias.

| Bloque | Contenido |
|---|---|
| Cadena | Objetivo → información → fuente → técnica → instrumento. Se conserva. |
| Medir en psicología | Constructo, indicador, nivel de medición y error. Teoría clásica de los tests: X = V + E. |
| Fiabilidad | Test-retest, formas paralelas, consistencia interna. Alfa y sus supuestos (tau-equivalencia) frente a omega. Error estándar de medida e intervalo de la puntuación individual. Fiabilidad interjueces (kappa, CCI). |
| Validez | Cinco fuentes de evidencia: contenido, procesos de respuesta, estructura interna, relación con otras variables y consecuencias. "Un test no es válido; lo son las interpretaciones de sus puntuaciones." |
| Construcción | Los diez pasos (Muñiz y Fonseca-Pedrero), que ya están en el repo, con análisis de ítems (dificultad, discriminación, correlación ítem-total). |
| Estructura interna | AFE frente a AFC, de forma conceptual, sin fórmulas. Qué reportar. |
| Adaptación y uso | Directrices de la ITC; invarianza de medición; baremos locales. Contexto bilingüe castellano-guaraní como caso. |
| Elegir un instrumento | Lista de cotejo inspirada en COSMIN: evidencia en población similar, fiabilidad reportada en la muestra propia, licencia y permisos. |
| Instrumentos cualitativos | Guía de entrevista, guía de observación, pilotaje y reflexividad. |
| Ética | Se conserva y se amplía: consentimiento, custodia, menores, IA. |

**Fuente principal:** *APA Handbook of Research Methods in Psychology*, vol. 1 (Foundations, planning, measures, and psychometrics), ya convertido a markdown en `Diseno de Investigacion/Archivos MD/`. **A complementar** con tu biblioteca de Estadística y Psicometría, si me das acceso (ver decisiones abiertas).

## 3. Resultado 2 — psychoResearch

**Qué es:** un programa abierto de investigación en psicología, sin adscripción institucional, sin fechas de clase y sin evidencias de Moodle. Nace del rediseño (carril B) como **duplicado mejorado**: el mismo motor y el mismo sistema visual, con un currículo propio.

**Tesis curricular:** la psicología como ciencia hunde sus raíces en la psicología experimental y hoy se hace con cuatro tradiciones de igual rango: experimental, instrumental, asociativa/social y cualitativa.

| Unidad | Contenido | Fuentes del corpus |
|---|---|---|
| 1. Raíces | Fechner, Wundt, Ebbinghaus; el laboratorio como origen; inducción, deducción y abducción | Kerlinger cap. 1, Marradi cap. 1 |
| 2. Ciencia abierta y replicación | Crisis de replicación, preregistro, poder estadístico, prácticas cuestionables | APA Handbook vol. 3 |
| 3. Del problema al proyecto | Problema, preguntas, objetivos como propósito cognitivo, hipótesis | Material de cátedra |
| 4. Medición y psicometría | El bloque 2.3, ampliado: TRI introductoria, invarianza, tests adaptativos | APA Handbook vol. 1, biblioteca |
| 5. Diseño experimental y cuasiexperimental | X · O · R, amenazas, validez | Campbell y Stanley, Shadish et al. |
| 6. Diseños de caso único | AB, ABAB, línea base múltiple | Kazdin |
| 7. Investigación asociativa y por encuestas | Correlacional, predictiva, de encuesta | Kish, Ato et al. |
| 8. Muestreo e inferencia | El bloque 2.2, completo | Rodríguez Osuna, Kish |
| 9. Investigación cualitativa | Fenomenología, teoría fundamentada, análisis temático, rigor, reflexividad | APA Handbook vol. 2 |
| 10. Investigación social, comunitaria y mixta | IAP, diseños mixtos, triangulación | Marradi, Brough |
| 11. Análisis | Cuantitativo, cualitativo y asistido por IA, con codificación desde fuera | guianalisis |
| 12. Ética, escritura y comunicación | APA 7, IA responsable, comunicación pública | Material de cátedra |

Diferencias con meto2psico25: la apertura de módulos es libre (sin fechas), hay rutas sugeridas por perfil (estudiante de grado, tesista, clínico que investiga) y el sitio está en **castellano neutro con tuteo** (decidido el 08/11). Cada unidad cierra con su **lista JARS**: qué tiene que quedar reportado en el informe.

## 4. Reparto de trabajo, pensado para ahorrar créditos

| Quién | Qué | Por qué |
|---|---|---|
| **Claude** | Este plan; la arquitectura curricular; las cápsulas de m08 y m09 y la galería de pseudocálculos (contenido donde un error conceptual es caro); las especificaciones; la revisión en los puntos de control | Razonamiento alto y contenido crítico |
| **Codex** | El motor del carril B (`engine.js`, `store.js`, Leitner), la calculadora honesta, el árbol de decisión, las pruebas Playwright | Código: lo hace bien y gasta créditos de ChatGPT, no de Claude |
| **Antigravity + Gemini** | Borradores masivos de ítems y casos a partir de los markdown, siguiendo plantillas; convertir Olaz y Medrano; armar el currículo de psychoResearch con las fuentes | Volumen alto con reglas claras |
| **Ollama** | Contar cobertura, verificar enlaces, ortografía, validar JSON | Tarea mecánica, sin costo |

**Cómo se coordinan:** cada repo lleva un `AGENTS.md` (Codex lo lee automáticamente y Antigravity lo recibe como instrucción), más `ESTADO.md`, donde el agente informa, y `REVISION.md`, donde Claude deja sus observaciones. Los encargos van en archivos `Instrucciones - … .md` en tu carpeta, como hasta ahora.

## 5. Fases

Todo en la rama `rediseno-2026`. Las fases A (contenido) y B (código) corren **en paralelo**.

| Fase | Contenido | Responsable | Punto de control |
|---|---|---|---|
| **A1** | Cápsulas nuevas de m08 y m09, galería de pseudocálculos, auditoría de ítems de m08 (marcar en revisar) | Claude | — |
| **A2** | Ítems nuevos para m08 a m11 (borradores) | Antigravity, con plantilla de Claude | Revisás vos |
| **B1–B4** | Plan maestro F1 a F3 (MVP), calculadora honesta, árbol de muestreo, migración de los datos actuales | Codex | PC1 y PC2 del plan maestro |
| **AB** | Integración del contenido en la rama; pruebas; PC3 | Claude revisa, Codex corrige | **PC-AB:** apruebas → *merge* a `main` |
| **C1** | Repo `psychoResearch` desde la rama B; currículo; `AGENTS.md` | Claude (estructura), Antigravity (contenido) | **PC-C1:** apruebas el currículo |
| **C2** | Contenido de las 12 unidades | Antigravity (borradores), Claude (unidades 4 y 8) | **PC-C2:** revisión docente |

## 6. Decisiones

**Tomadas el 08/11:** todo se trabaja en la rama y se publica completo antes del final · el repo `emorito/psychoResearch` lo crea Enrique · hay acceso a Estadística & Psicometría y a la Biblioteca Instrumental · psychoResearch usa tuteo neutro · el canon de autoridad es el de la sección 1 bis.

**Abiertas:**
1. Conseguir las obras del canon que faltan: McGuigan, Nunnally y Snedecor y Cochran. Los JARS se bajan de APA.
2. La fecha del examen final, que fija el plazo del *merge*.
3. Siguen abiertas las cuatro decisiones del plan maestro: umbral del 80 %, comprobante, voseo e ítems en revisar.
