#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de datos unificados para el Centro de Entrenamiento en Metodología de la Investigación
Psicología UNIBE — Plan 2026 (11 módulos: m01 a m11).

Lee los insumos oficiales de la cátedra (modulos.json, banco/m01..m11.json, banco/flipcards.json)
y genera en data/:
  - data/modulos.json (índice maestro enriquecido para la portada y navegación)
  - data/m01.json .. data/m11.json (datos completos de cada módulo sin latencia)
"""

import json
import os
import re
from pathlib import Path

REPO_ROOT = Path("/Users/emorosini/.gemini/antigravity/brain/7c9eda09-2fe2-4ce1-9725-575282bec5be/scratch/meto2psico25")
DATA_OUT = REPO_ROOT / "data"
BANCO_ROOT = Path("/Users/emorosini/Library/CloudStorage/OneDrive-Personal/Documentos/Docencia 2026/Clases UNIBE/Metodología II/Banco de ítems/Banco unificado 2026")

ETAPAS = {
    "m01": (1, "Etapa 1 · Fundamentos y Búsqueda", "🔬"),
    "m02": (1, "Etapa 1 · Fundamentos y Búsqueda", "🧭"),
    "m03": (1, "Etapa 1 · Fundamentos y Búsqueda", "📚"),
    "m04": (2, "Etapa 2 · El Problema de Investigación", "❓"),
    "m05": (2, "Etapa 2 · El Problema de Investigación", "🎯"),
    "m06": (2, "Etapa 2 · El Problema de Investigación", "🧩"),
    "m07": (3, "Etapa 3 · Diseño y Muestreo", "📐"),
    "m08": (3, "Etapa 3 · Diseño y Muestreo", "👥"),
    "m09": (4, "Etapa 4 · Recolección, Análisis e Informe", "🛠️"),
    "m10": (4, "Etapa 4 · Recolección, Análisis e Informe", "📊"),
    "m11": (4, "Etapa 4 · Recolección, Análisis e Informe", "✍️"),
}

SUBTEMA_LABELS = {
    "ciencia": "Ciencia y conocimiento",
    "metodo_cientifico": "Método científico",
    "enfoque_cientifico": "Enfoque científico",
    "eleccion_tema": "Elección del tema",
    "delimitacion": "Delimitación",
    "busqueda": "Búsqueda académica",
    "ia_responsable": "IA responsable",
    "revision_literatura": "Revisión de literatura",
    "teoria": "Teoría y marcos",
    "antecedentes": "Antecedentes",
    "vacio": "Vacío de conocimiento",
    "problema": "Planteamiento del problema",
    "preguntas": "Preguntas de investigación",
    "justificacion": "Justificación y viabilidad",
    "objetivos": "Objetivos de investigación",
    "hipotesis": "Hipótesis y supuestos",
    "coherencia": "Matriz de coherencia",
    "constructos": "Constructos",
    "variables": "Variables",
    "definiciones": "Definiciones C. y O.",
    "categorias": "Categorías cualitativas",
    "enfoque": "Enfoque metodológico",
    "alcance": "Alcance del estudio",
    "diseno": "Diseño y validez",
    "poblacion": "Población y universo",
    "muestra": "Muestra",
    "muestreo": "Tipos de muestreo",
    "corpus": "Corpus y unidades",
    "tecnicas": "Técnicas de recolección",
    "instrumentos": "Instrumentos",
    "calidad_medicion": "Validez y confiabilidad",
    "etica": "Ética e integridad",
    "analisis_cuantitativo": "Análisis cuantitativo",
    "analisis_cualitativo": "Análisis cualitativo",
    "escritura": "Escritura académica",
    "apa": "Normas APA 7",
    "citacion": "Citación y Zotero",
}

RESOURCES_BY_MODULE = {
    "m01": {
        "videos": [
            {
                "videoId": "l9fdq7LPccE",
                "title": "El método científico y el enfoque de la ciencia",
                "badge": "Clases 1–2 · Fundamentos"
            }
        ],
        "readings": [
            {
                "title": "Cap. 1: La ciencia y el enfoque científico (Kerlinger y Lee)",
                "url": "assets/reading/1. Ciencia y el enfoque científico - Kerlinger y Lee.pdf",
                "type": "pdf",
                "description": "Lectura base sobre los métodos del conocimiento, visión estática y dinámica de la ciencia y objetivos de la investigación científica."
            }
        ],
        "notebooks": [
            {
                "title": "Cuaderno IA · El método científico",
                "url": "https://notebooklm.google.com/notebook/12f614b2-45f2-464b-9db1-92822bf468fb"
            }
        ]
    },
    "m02": {
        "videos": [],
        "studyGuide": {
            "title": "Guía Interactiva de Taller · Clase 3: Del interés amplio a la búsqueda verificable",
            "summary": "En esta sesión trabajamos el paso del campo general al tema delimitado (fenómeno + población + contexto + tiempo) y ejecutamos una estrategia de búsqueda trazable con operadores booleanos y uso ético de IA (Protocolo VERA).",
            "steps": [
                "Evaluar el tema candidato con factores subjetivos (interés, capacidad, tiempo) y objetivos (relevancia, viabilidad, acceso a fuentes).",
                "Transformar el campo general en un tema acotado indicando qué fenómeno, en quiénes y en qué contexto se estudiará.",
                "Diseñar una ecuación booleana por capas usando OR para sinónimos y AND para intersectar conceptos en SciELO, Redalyc, PubMed o PsycINFO.",
                "Aplicar el Protocolo VERA ante cualquier sugerencia de IA: Ver fuente original, Examinar correspondencia, Revisar alcance y Anotar uso."
            ]
        },
        "readings": [
            {
                "title": "Guía práctica para la revisión de la literatura, búsqueda e IA (2026)",
                "url": "assets/reading/2b. Guía práctica para la revisión de la literatura 2026.pdf",
                "type": "pdf",
                "description": "Guía de cátedra UNIBE 2026: del tema a la pregunta buscable, ecuaciones booleanas, selección de bases y protocolo VERA de IA responsable."
            },
            {
                "title": "Cap. 1: La ciencia y el enfoque científico (Kerlinger y Lee)",
                "url": "assets/reading/1. Ciencia y el enfoque científico - Kerlinger y Lee.pdf",
                "type": "pdf",
                "description": "Marco epistemológico de referencia para distinguir temas científicos verificables de opiniones o debates especulativos."
            }
        ],
        "notebooks": [
            {
                "title": "Cuaderno IA · Búsqueda y Literatura",
                "url": "https://notebooklm.google.com/notebook/b63860c5-713f-46dc-8f1c-1f958c345763"
            }
        ]
    },
    "m03": {
        "videos": [
            {
                "videoId": "EJ8aQ9q97vE",
                "title": "Teoría y revisión de la literatura en investigación",
                "badge": "Clase 4 · Literatura y Teoría"
            }
        ],
        "readings": [
            {
                "title": "El papel de la teoría en la investigación social (Marradi, Archenti y Piovani)",
                "url": "assets/reading/2. El papel de la Teoría en la Investigación.pdf",
                "type": "pdf",
                "description": "Lectura obligatoria sobre la relación entre teoría, observación, conceptualización y construcción del objeto de estudio."
            },
            {
                "title": "Guía práctica para la revisión de la literatura (Versión revisada 2026)",
                "url": "assets/reading/2b. Guía práctica para la revisión de la literatura 2026.pdf",
                "type": "pdf",
                "description": "Distinción operativa entre revisión, antecedentes, estado del arte, marco conceptual y marco teórico, más plantillas de matriz."
            }
        ],
        "notebooks": [
            {
                "title": "Cuaderno IA · Teoría y revisión de la literatura",
                "url": "https://notebooklm.google.com/notebook/b63860c5-713f-46dc-8f1c-1f958c345763"
            }
        ]
    },
    "m04": {
        "videos": [
            {
                "videoId": "ou1cjiMA14g",
                "title": "¿Y cuál es tu problema de investigación?",
                "badge": "Clase 5 · Planteamiento del Problema"
            }
        ],
        "readings": [
            {
                "title": "Cap. 2: Problemas e Hipótesis (Kerlinger y Lee)",
                "url": "assets/reading/3a. Problemas e Hipótesis - Kerlinger y Lee Cap. 2.pdf",
                "type": "pdf",
                "description": "Criterios clásicos de Kerlinger y Lee para formular problemas y preguntas de investigación científicamente resolubles."
            },
            {
                "title": "Deficiencias frecuentes en los problemas de investigación",
                "url": "assets/reading/3c. Deficiencias en los problemas de investigacion.pdf",
                "type": "pdf",
                "description": "Síntesis diagnóstica para detectar vaguedad, juicios de valor, falsas preguntas y trampas prácticas en el planteamiento."
            },
            {
                "title": "Compendio: Problemas, hipótesis y variables",
                "url": "assets/reading/3. Problemas, hipotesis y variables.pdf",
                "type": "pdf",
                "description": "Material ampliado de referencia sobre la articulación del núcleo del proyecto."
            }
        ],
        "notebooks": [
            {
                "title": "Cuaderno IA · Problemas de investigación",
                "url": "https://notebooklm.google.com/notebook/a15563d7-fbc9-40d1-bfa9-aca8ecafa6ab"
            }
        ]
    },
    "m05": {
        "videos": [
            {
                "videoId": "W7j0rWTA17g",
                "title": "Objetivos de investigación: ¿Qué quieres lograr?",
                "badge": "Video 1 · Objetivos"
            },
            {
                "videoId": "5LycvPV-zt4",
                "title": "Hipótesis: Adivina… ¡pero con ciencia!",
                "badge": "Video 2 · Hipótesis"
            }
        ],
        "readings": [
            {
                "title": "Los objetivos de investigación (Material de lectura)",
                "url": "assets/reading/3b. Los objetivos de investigación.pdf",
                "type": "pdf",
                "description": "Texto de referencia sobre formulación de objetivos generales y específicos (leer junto con la Cápsula Docente sobre los 3 planos)."
            },
            {
                "title": "Cap. 2: Problemas e Hipótesis (Kerlinger y Lee)",
                "url": "assets/reading/3a. Problemas e Hipótesis - Kerlinger y Lee Cap. 2.pdf",
                "type": "pdf",
                "description": "Fundamentación sobre la naturaleza, función y criterios de contrastabilidad de las hipótesis científicas."
            },
            {
                "title": "Compendio: Problemas, hipótesis y variables",
                "url": "assets/reading/3. Problemas, hipotesis y variables.pdf",
                "type": "pdf",
                "description": "Dossier complementario para profundizar en tipos de hipótesis y coherencia interna."
            }
        ],
        "notebooks": [
            {
                "title": "Cuaderno IA · Objetivos de investigación",
                "url": "https://notebooklm.google.com/notebook/259d72c6-772e-4431-9ccb-7b5d6a567933"
            },
            {
                "title": "Cuaderno IA · Hipótesis de investigación",
                "url": "https://notebooklm.google.com/notebook/4b3ec791-6766-470e-a521-e7084165687c"
            }
        ]
    },
    "m06": {
        "videos": [
            {
                "videoId": "tCGTLLMx3Pw",
                "title": "Constructos, variables y definiciones operacionales",
                "badge": "Clase 7 · Operacionalización"
            }
        ],
        "readings": [
            {
                "title": "Cap. 3: Constructos, variables y definiciones (Kerlinger y Lee)",
                "url": "assets/reading/4. Constructo, Variables y Definiciones - Kerlinger y Lee Cap. 3.pdf",
                "type": "pdf",
                "description": "Distinción rigurosa entre conceptos, constructos, definiciones constitutivas y definiciones operacionales (de medida y experimentales)."
            }
        ],
        "notebooks": [
            {
                "title": "Cuaderno IA · Constructos y variables",
                "url": "https://notebooklm.google.com/notebook/378f0c07-8737-46f3-9475-6972d78fadb8"
            }
        ]
    },
    "m07": {
        "videos": [
            {
                "videoId": "6n_R9khWQOA",
                "title": "Diseño de investigación: propósito, control y validez",
                "badge": "Clase 8 · Diseño"
            }
        ],
        "readings": [
            {
                "title": "Cap. 18: Diseño de investigación: propósito y principio (Kerlinger y Lee)",
                "url": "assets/reading/5. Diseño de Investigación - Propósito y Principio - Kerlinger cap 18.pdf",
                "type": "pdf",
                "description": "Cómo el diseño responde preguntas e implementa el principio MAXMINCON (maximizar varianza sistemática, controlar extraña y minimizar error)."
            }
        ],
        "notebooks": [
            {
                "title": "Cuaderno IA · Diseños de investigación",
                "url": "https://notebooklm.google.com/notebook/1f31401f-24a5-46cf-a2de-04fedb61becf"
            }
        ]
    },
    "m08": {
        "videos": [
            {
                "videoId": "nqxiDZG6gLo",
                "title": "Población, muestra y procedimientos de muestreo",
                "badge": "Clase 9 · Muestreo"
            }
        ],
        "readings": [
            {
                "title": "Fundamentos y Metodología del Muestreo",
                "url": "assets/reading/6. Fundamentos y Metodología del Muestreo.pdf",
                "type": "pdf",
                "description": "Conceptos de universo, población, marco muestral, error muestral y familias de muestreo probabilístico y no probabilístico."
            }
        ],
        "notebooks": [
            {
                "title": "Cuaderno IA · Población y muestra",
                "url": "https://notebooklm.google.com/notebook/f411e077-7c81-4ed6-bcc0-a47c672b4ce0"
            }
        ]
    },
    "m09": {
        "videos": [
            {
                "videoId": "r1jWY-XG4_I",
                "title": "Técnicas, desarrollo de instrumentos y calidad de medición",
                "badge": "Clase 11 · Instrumentos y Ética"
            }
        ],
        "readings": [
            {
                "title": "Diez pasos para la construcción de un test (Muñiz y Fonseca-Pedrero)",
                "url": "assets/reading/7. Diez pasos para la construcción de un test.pdf",
                "type": "pdf",
                "description": "Guía paso a paso para delimitar el marco general, definir la variable, redactar ítems, validar contenido y realizar el estudio piloto."
            }
        ],
        "notebooks": [
            {
                "title": "Cuaderno IA · Desarrollo de instrumentos",
                "url": "https://notebooklm.google.com/notebook/b1f3de4f-282f-4ad9-bf64-71b70ef49488"
            }
        ]
    },
    "m10": {
        "videos": [
            {
                "videoId": "IDrnQgYgRqA",
                "title": "Plan de análisis de datos cuantitativo y cualitativo",
                "badge": "Clase 12 · Análisis de Datos"
            }
        ],
        "readings": [
            {
                "title": "Guía Interactiva de Análisis de Datos (Recurso Web Oficial)",
                "url": "https://emorito.github.io/guianalisis/",
                "type": "web",
                "description": "Plataforma interactiva de la cátedra para seleccionar procedimientos descriptivos, inferenciales y cualitativos según objetivos y nivel de medición."
            }
        ],
        "notebooks": [
            {
                "title": "Cuaderno IA · Análisis de datos",
                "url": "https://notebooklm.google.com/notebook/e9d0f775-f431-47f9-8c39-70f1742b9f48"
            }
        ]
    },
    "m11": {
        "videos": [
            {
                "videoId": "nNMM6g2KtZw",
                "title": "Informe académico, citación y Estilo APA 7",
                "badge": "Clase 13 · Escritura y APA"
            }
        ],
        "readings": [
            {
                "title": "Aplicación del Estilo APA en trabajos académicos",
                "url": "assets/reading/9. Aplicación de Estilo APA en trabajos académicos.pdf",
                "type": "pdf",
                "description": "Manual práctico sobre citas en el texto (narrativas y parentéticas), paráfrasis, lista de referencias y formato general APA."
            },
            {
                "title": "Guía práctica de revisión, redacción académica y uso ético de IA (2026)",
                "url": "assets/reading/2b. Guía práctica para la revisión de la literatura 2026.pdf",
                "type": "pdf",
                "description": "Incluye arquitectura de párrafos de síntesis, auditoría de coherencia global y plantilla de declaración de uso de IA."
            }
        ],
        "notebooks": [
            {
                "title": "Cuaderno IA · Informe académico y Estilo APA",
                "url": "https://notebooklm.google.com/notebook/a175e386-f6e7-4f21-befd-56d63cd78964"
            }
        ]
    }
}

EXTRA_FLIPCARDS = {
    "m02": [
        {
            "front": "¿Qué diferencia hay entre campo, tema y problema?",
            "back": "El campo es el área amplia (ej. Psicología Educativa); el tema recorta un fenómeno de interés; el problema formula una incógnita empírica precisa y respaldada por literatura.",
            "tag": "Delimitación"
        },
        {
            "front": "Factores subjetivos en la elección del tema",
            "back": "Condiciones vinculadas a la persona que investiga: interés genuino, formación previa, dominio de lectura técnica y disponibilidad real de tiempo.",
            "tag": "Elección"
        },
        {
            "front": "Factores objetivos en la elección del tema",
            "back": "Condiciones externas verificables: existencia de fuentes académicas, acceso factible a la población o corpus, viabilidad ética/material y relevancia disciplinar.",
            "tag": "Elección"
        },
        {
            "front": "Los 4 ejes de la delimitación",
            "back": "1) Fenómeno o constructos centrales; 2) Población o unidades de análisis; 3) Espacio o contexto institucional/geográfico; 4) Periodo temporal.",
            "tag": "Delimitación"
        },
        {
            "front": "Operador booleano OR",
            "back": "Conecta sinónimos, variantes o traducciones de un mismo concepto y AMPLÍA los resultados (ej. \"redes sociales\" OR \"social media\").",
            "tag": "Búsqueda"
        },
        {
            "front": "Operador booleano AND",
            "back": "Intersecta conceptos distintos que deben aparecer simultáneamente y RESTRINGE los resultados para ganar precisión (ej. ansiedad AND universitarios).",
            "tag": "Búsqueda"
        },
        {
            "front": "Operador booleano NOT y comillas (\" \")",
            "back": "Las comillas exigen la frase exacta; NOT excluye términos ruidosos (debe usarse con cautela para no borrar estudios relevantes).",
            "tag": "Búsqueda"
        },
        {
            "front": "Búsqueda por capas",
            "back": "Estrategia que inicia con los 2 conceptos nucleares, identifica el vocabulario del campo y luego añade población, contexto y filtros de año para no obtener falsos ceros.",
            "tag": "Búsqueda"
        },
        {
            "front": "Protocolo VERA para uso de IA",
            "back": "V: Ver la fuente original; E: Examinar correspondencia en texto/tablas; R: Revisar alcance sin exagerar causalidad; A: Anotar el uso en la declaración.",
            "tag": "IA responsable"
        },
        {
            "front": "¿Por qué no pedir a un chatbot \"dame 10 referencias\"?",
            "back": "Los modelos de lenguaje generan texto por probabilidad y pueden \"alucinar\" títulos, autores o DOIs inexistentes. Las fuentes se buscan en bases académicas reales.",
            "tag": "IA responsable"
        },
        {
            "front": "Declaración mínima de uso de IA (Plan 2026)",
            "back": "Debe transparentar: 1) herramienta utilizada, 2) propósito específico, 3) sección afectada, 4) modo de verificación y 5) decisión final del estudiante.",
            "tag": "IA responsable"
        }
    ],
    "m04": [
        {
            "front": "Los 3 criterios de Kerlinger para un buen problema",
            "back": "1) Expresar una relación entre dos o más variables (o caracterizar un fenómeno); 2) Formularse claramente y sin ambigüedad como pregunta; 3) Permitir prueba empírica.",
            "tag": "Problema"
        },
        {
            "front": "Secuencia argumentativa del planteamiento",
            "back": "Contexto del fenómeno → Evidencia previa (antecedentes) → Vacío o límite identificado → Relevancia del estudio → Delimitación y pregunta central.",
            "tag": "Planteamiento"
        },
        {
            "front": "Situación problemática vs. problema de investigación",
            "back": "La situación problemática es una dificultad práctica observable (ej. deserción en 1.er año); el problema de investigación es la incógnita cognitiva sobre qué factores la explican o caracterizan.",
            "tag": "Problema"
        },
        {
            "front": "¿Por qué las preguntas de \"Sí / No\" son deficientes?",
            "back": "Porque cierran la indagación de forma dicotómica y no especifican qué dimensión, magnitud, patrón o dirección de la relación se busca establecer.",
            "tag": "Preguntas"
        },
        {
            "front": "¿Por qué un dilema moral o de valor no es un problema científico?",
            "back": "Preguntas con \"¿debería...?\" o \"¿es correcto...?\" expresan juicios normativos no contrastables empíricamente mediante observación o medición.",
            "tag": "Problema"
        },
        {
            "front": "Relación entre pregunta central y preguntas específicas",
            "back": "Las preguntas específicas desglosan las dimensiones o subproblemas necesarios para responder íntegramente la pregunta central sin exceder su alcance.",
            "tag": "Preguntas"
        },
        {
            "front": "Justificación teórica, práctica y metodológica",
            "back": "Expone el \"para qué\" del estudio: qué aporta a la comprensión conceptual (teórica), a qué problema real informa (práctica) o qué instrumento/abordaje adapta (metodológica).",
            "tag": "Justificación"
        },
        {
            "front": "Viabilidad o factibilidad del problema",
            "back": "Condición realista de poder responder la pregunta con el tiempo del semestre, acceso efectivo a los participantes, recursos técnicos y resguardo ético.",
            "tag": "Justificación"
        }
    ],
    "m05": [
        {
            "front": "Los 3 planos que suelen confundirse al redactar objetivos",
            "back": "Plano 1: Propósito cognitivo (conocimiento a producir: identificar, describir, determinar, establecer). Plano 2: Operación metodológica (analizar, medir, aplicar). Plano 3: Finalidad práctica (mejorar, prevenir).",
            "tag": "Objetivos"
        },
        {
            "front": "Prueba 1: Resultado enunciable",
            "back": "Si al pasar el objetivo a pasado en las conclusiones queda un informe de tareas (\"Se analizó la relación\") en vez de un hallazgo (\"Se determinó una relación r = .42\"), no es un buen objetivo.",
            "tag": "Objetivos"
        },
        {
            "front": "Prueba 2: Prueba del complemento",
            "back": "El verbo del objetivo debe regir un objeto de conocimiento (la prevalencia, el grado de asociación, las diferencias) y no un objeto material del trabajo (los datos, las encuestas).",
            "tag": "Objetivos"
        },
        {
            "front": "Derivabilidad horizontal vs. cronograma de pasos",
            "back": "Los objetivos específicos descomponen el conocimiento buscado (son conjuntamente suficientes e individualmente necesarios); NO son una lista cronológica de tareas metodológicas.",
            "tag": "Coherencia"
        }
    ]
}

CAPSULAS = {
    "m01": {
        "title": "Cápsula Metodológica · Ciencia, Sentido Común y Proceso No Lineal",
        "subtitle": "Kerlinger y Lee (Cap. 1) + Clases 1 y 2 del Plan 2026",
        "blocks": [
            {
                "type": "table",
                "title": "5 diferencias clave entre Ciencia y Sentido Común (Kerlinger y Lee)",
                "headers": ["Dimensión", "Sentido Común", "Enfoque Científico"],
                "rows": [
                    ["Uso de esquemas conceptuales", "Usa teorías implícitas, vagas o pintorescas sin cuestionarlas.", "Construye estructuras teóricas explícitas y evalúa su consistencia interna."],
                    ["Prueba de teorías e hipótesis", "Selecciona evidencia que confirma sus creencias (sesgo de confirmación).", "Somete sus hipótesis a pruebas sistemáticas y empíricas con riesgo de refutación."],
                    ["Noción de control", "Rara vez controla explicaciones alternativas o variables extrañas.", "Descarta sistemáticamente variables extrañas que podrían explicar el fenómeno."],
                    ["Búsqueda de relaciones", "Se impresiona por coincidencias fortuitas o casos aislados.", "Persigue relaciones sistemáticas, conscientes y controladas entre fenómenos."],
                    ["Tipo de explicaciones", "Acepta explicaciones metafísicas o no verificables.", "Exige explicaciones observables, públicas y empíricamente contrastables."]
                ]
            },
            {
                "type": "cards",
                "title": "Los 4 métodos del conocimiento (Charles S. Peirce)",
                "items": [
                    {"badge": "1. Tenacidad", "title": "Aferrarse a lo que siempre se creyó", "text": "Se sostiene una creencia por hábito o repetición frecuente, cerrándose a nueva evidencia."},
                    {"badge": "2. Autoridad", "title": "Aceptar por el prestigio de la fuente", "text": "Útil en la vida práctica, pero falible si la autoridad sustituye la verificación empírica."},
                    {"badge": "3. A priori (Intuición)", "title": "\"Es evidente para la razón\"", "text": "Proposiciones que parecen razonables por sí mismas, pero dos personas pueden intuir opuestos."},
                    {"badge": "4. Ciencia", "title": "Autocorrección y control público", "text": "Sus controles son independientes de nuestras creencias personales: la evidencia empírica manda."}
                ]
            },
            {
                "type": "highlight",
                "title": "Regla de oro del Plan 2026: El mapa del proyecto no es una escalera rígida",
                "text": "Avanzar en la revisión de la literatura o diseñar el instrumento suele obligar a ajustar la delimitación del tema, afinar la pregunta o precisar los objetivos. Volver atrás para ganar coherencia no es un error: es el funcionamiento normal de la investigación científica."
            }
        ]
    },
    "m02": {
        "title": "Cápsula Metodológica · Delimitación, Ecuaciones Booleanas y Protocolo VERA",
        "subtitle": "Clase 3 · Elección del tema, búsqueda verificable e IA sin delegación intelectual",
        "blocks": [
            {
                "type": "table",
                "title": "Del campo general al tema delimitado y viable",
                "headers": ["Nivel", "Ejemplo en Psicología", "Diagnóstico metodológico"],
                "rows": [
                    ["Campo amplio", "Salud mental y tecnología", "Demasiado vasto: no define fenómeno, población ni contexto."],
                    ["Tema general", "Redes sociales y ansiedad", "Identifica variables, pero sigue siendo inabarcable para un proyecto."],
                    ["Tema delimitado", "Uso problemático de redes sociales y sintomatología ansiosa en estudiantes universitarios de Asunción (2026)", "Especifica fenómeno (uso problemático, no solo horas), desenlace, población, lugar y tiempo."]
                ]
            },
            {
                "type": "cards",
                "title": "Arquitectura de una ecuación booleana por capas",
                "items": [
                    {"badge": "OR · Amplía", "title": "Agrupa sinónimos dentro de paréntesis", "text": "(\"uso problemático de redes\" OR \"adicción a redes sociales\" OR \"problematic social media use\")"},
                    {"badge": "AND · Intersecta", "title": "Une los conceptos obligatorios", "text": "AND (ansiedad OR \"síntomas ansiosos\" OR anxiety) AND (\"estudiantes universitarios\" OR undergraduates)"},
                    {"badge": "Factores de selección", "title": "Subjetivos vs. Objetivos", "text": "Subjetivos: interés, preparación y tiempo del investigador. Objetivos: acceso a muestras/fuentes, viabilidad y utilidad científica."}
                ]
            },
            {
                "type": "table",
                "title": "Protocolo VERA para auditar cualquier salida de Inteligencia Artificial",
                "headers": ["Paso", "Acción obligatoria del estudiante", "Riesgo que previene"],
                "rows": [
                    ["V · Ver fuente", "Abrir el PDF o artículo original en la base de datos; jamás citar desde el chat.", "Referencias inventadas (alucinaciones de DOI, autor o año)."],
                    ["E · Examinar correspondencia", "Localizar página, tabla o párrafo exacto que respalda la afirmación.", "Atribuir a un autor algo que el artículo no dice o que solo menciona en su introducción."],
                    ["R · Revisar alcance", "Comprobar si la IA convirtió una correlación transversal en una afirmación causal.", "Sobreinterpretación y promesas metodológicas falsas."],
                    ["A · Anotar uso", "Registrar herramienta, fecha, propósito, sección, verificación y decisión propia.", "Falta de transparencia académica o delegación intelectual."]
                ]
            }
        ]
    },
    "m03": {
        "title": "Cápsula Metodológica · Proceso vs. Productos de la Literatura y Vacío",
        "subtitle": "Clase 4 · Revisión, antecedentes, estado del arte, marco conceptual y marco teórico",
        "blocks": [
            {
                "type": "table",
                "title": "Distinción funcional entre el proceso y sus productos (Guía 2026)",
                "headers": ["Elemento", "Qué es", "Pregunta que responde", "Heurística rápida"],
                "rows": [
                    ["Revisión de la literatura", "El PROCESO de buscar, seleccionar, evaluar, fichar y sintetizar fuentes.", "¿Cómo construí una visión fundamentada y trazable?", "Informa bases, descriptores, fechas y criterios de inclusión."],
                    ["Antecedentes", "Estudios empíricos previos relevantes para el problema.", "¿Qué investigaciones concretas se hicieron, cómo y qué hallaron?", "Sintetiza objetivo, método, muestra, hallazgo y límite de estudios previos."],
                    ["Estado del arte", "Balance crítico e integrado del conocimiento actual sobre el tema.", "¿Qué converge, qué se discute y qué vacío queda abierto?", "Agrupa por ejes temáticos (no \"lista de compras\") y deriva el vacío."],
                    ["Marco conceptual", "Definiciones rigurosas de los conceptos centrales del estudio.", "¿Qué significa exactamente X en este proyecto?", "Responde «X se entiende como...» y prepara la operacionalización."],
                    ["Marco teórico", "Conjunto articulado de proposiciones que explica por qué ocurre el fenómeno.", "¿Por qué X se relaciona con Y y qué mecanismo lo explica?", "Responde «X ocurre porque...» (ej. Teoría de la Comparación Social)."]
                ]
            },
            {
                "type": "cards",
                "title": "Cómo redactar un vacío sin exagerar («No existe nada»)",
                "items": [
                    {"badge": "Vacío contextual", "title": "Población o entorno poco explorado", "text": "La relación se estudió en otros países, pero hay escasa evidencia situada en universitarios paraguayos."},
                    {"badge": "Vacío metodológico", "title": "Limitación de los diseños previos", "text": "Predominan estudios que miden solo horas de pantalla sin distinguir uso problemático ni controlar sueño."},
                    {"badge": "Plantilla de síntesis", "title": "De la matriz al párrafo", "text": "«La literatura revisada coincide en ___; sin embargo, predominan ___ y permanece poco estudiado ___ en ___. Por ello, resulta pertinente ___.»"}
                ]
            }
        ]
    },
    "m04": {
        "title": "Cápsula Metodológica · Del Vacío al Problema y las Preguntas",
        "subtitle": "Clase 5 · Estructura argumentativa del planteamiento y clínica de preguntas",
        "blocks": [
            {
                "type": "cards",
                "title": "La cadena argumentativa del planteamiento en 5 movimientos",
                "items": [
                    {"badge": "1. Contexto", "title": "Situar el fenómeno", "text": "Presenta el escenario institucional, social o clínico donde se manifiesta la situación de interés."},
                    {"badge": "2. Evidencia", "title": "Qué sabemos con respaldo", "text": "Integra hallazgos y datos verificados (evitando opiniones sueltas o afirmaciones sin cita)."},
                    {"badge": "3. Vacío / Tensión", "title": "Qué no sabemos todavía", "text": "Señala la brecha empírica, contextual o metodológica que justifica indagar."},
                    {"badge": "4. Relevancia y Delimitación", "title": "Por qué importa y dónde se acota", "text": "Explica qué aportará el estudio y delimita fenómeno, unidades, lugar y periodo."},
                    {"badge": "5. Pregunta de investigación", "title": "Cierre interrogativo preciso", "text": "Formula la incógnita central y las preguntas específicas en total sintonía con el vacío."}
                ]
            },
            {
                "type": "table",
                "title": "Clínica de errores frecuentes en preguntas de investigación",
                "headers": ["Pregunta deficiente", "Error metodológico", "Reformulación rigurosa"],
                "rows": [
                    ["¿Influye el estrés laboral en la salud mental?", "Pregunta cerrada (Sí/No), vaga y sin población ni contexto.", "¿Qué relación existe entre el estrés laboral percibido y el agotamiento emocional en enfermeros de hospitales públicos de Central en 2026?"],
                    ["¿Cómo ayudar a los adolescentes a usar menos el celular?", "Problema práctico de intervención, no pregunta de conocimiento.", "¿Qué prácticas de desconexión digital emplean los adolescentes escolarizados de Asunción y con qué factores familiares las asocian?"],
                    ["¿Deberían prohibirse las redes sociales en menores de 14 años?", "Juicio de valor / normativo no resoluble empíricamente.", "¿Cómo varía el nivel de bienestar subjetivo según la edad de inicio y el patrón de uso de redes sociales en escolares de 12 a 15 años?"]
                ]
            }
        ]
    },
    "m05": {
        "title": "Cápsula Metodológica · Los 3 Planos de Verbos, las 2 Pruebas e Hipótesis",
        "subtitle": "Clase 6 · Guía de Formulación de Objetivos de la Cátedra UNIBE 2026",
        "blocks": [
            {
                "type": "table",
                "title": "Los 3 planos que se confunden en los manuales (¡Un objetivo vive SOLO en el Plano 1!)",
                "headers": ["Plano", "Qué enuncia", "Verbos típicos", "¿Es objetivo de investigación?"],
                "rows": [
                    ["1. Propósito cognitivo", "El conocimiento nuevo que el estudio va a producir", "identificar, describir, estimar, determinar, establecer, comparar, explicar", "✅ SÍ: Es un objetivo de investigación."],
                    ["2. Operación o procedimiento", "El medio metodológico para producir el conocimiento", "analizar, calcular, medir, aplicar, recoger, revisar, tabular, procesar", "❌ NO: Es una actividad del método o cronograma."],
                    ["3. Finalidad práctica", "El «para qué» externo o beneficio esperado", "mejorar, reducir, prevenir, concienciar, contribuir, fortalecer, sensibilizar", "❌ NO: Pertenece a la justificación."]
                ]
            },
            {
                "type": "cards",
                "title": "Las 2 pruebas infalibles y la regla de coherencia",
                "items": [
                    {"badge": "Prueba 1 · Resultado enunciable", "title": "Pásalo a pasado en las Conclusiones", "text": "«Analizar la relación entre X e Y» → «Se analizó la relación» (no informa qué se halló: FALLA). «Determinar el grado y dirección de la relación» → «Se determinó una relación positiva moderada r = .42» (informa un hallazgo: PASA)."},
                    {"badge": "Prueba 2 · Del complemento", "title": "¿Rige conocimiento o material de trabajo?", "text": "«Analizar los datos / Aplicar la encuesta» rige objetos materiales (FALLA). «Estimar la prevalencia / Establecer las diferencias» rige objetos de conocimiento (PASA)."},
                    {"badge": "Jerarquía y Derivabilidad", "title": "No son pasos cronológicos", "text": "Los específicos descomponen el conocimiento del general (conjuntamente suficientes e individualmente necesarios). Ningún específico puede superar el nivel epistémico del general."},
                    {"badge": "¿Cuándo va hipótesis?", "title": "Según alcance y pregunta", "text": "Estudios correlacionales, comparativos y explicativos suelen contrastar hipótesis (Hi / H0). Estudios exploratorios, descriptivos o cualitativos trabajan con preguntas orientadoras o supuestos."}
                ]
            }
        ]
    },
    "m06": {
        "title": "Cápsula Metodológica · De los Constructos a los Indicadores y Categorías",
        "subtitle": "Clase 7 · Ruta cuantitativa de operacionalización y ruta cualitativa de categorización",
        "blocks": [
            {
                "type": "table",
                "title": "Cadena de descenso de abstracción (Kerlinger y Lee, Cap. 3)",
                "headers": ["Concepto / Pieza", "Definición precisa", "Ejemplo en Psicología (Agotamiento laboral / Burnout)"],
                "rows": [
                    ["Constructo", "Concepto teórico adoptado deliberadamente y con respaldo científico para explicar un fenómeno no observable directamente.", "Síndrome de Burnout (Maslach y Jackson)."],
                    ["Definición conceptual (constitutiva)", "Define el constructo precisa y coherentemente usando otros conceptos de la teoría elegida (no de diccionario general).", "Respuesta prolongada a estresores interpersonales crónicos en el trabajo, integrada por agotamiento emocional, despersonalización y baja realización personal."],
                    ["Dimensiones", "Facetas o componentes teóricos en que se desglosa un constructo multidimensional.", "1) Agotamiento emocional; 2) Despersonalización / cinismo; 3) Eficacia profesional."],
                    ["Indicadores", "Manifestaciones empíricas concretas y observables de cada dimensión.", "Frecuencia autoinformada de sentirse emocionalmente exhausto al final de la jornada laboral."],
                    ["Definición operacional", "Especifica qué actividades u operaciones (de medida o experimentales) se realizarán para medir o manipular la variable.", "Puntaje obtenido en los ítems 1, 2, 3, 6, 8, 13, 14, 16 y 20 del inventario MBI-HSS en escala de 0 (nunca) a 6 (todos los días)."]
                ]
            },
            {
                "type": "cards",
                "title": "Dos rutas legítimas: no forzar moldes cuantitativos en estudios cualitativos",
                "items": [
                    {"badge": "Ruta Cuantitativa", "title": "Matriz de Operacionalización", "text": "Constructo → Definición conceptual → Definición operacional → Dimensiones → Indicadores → Nivel de medición (nominal, ordinal, intervalo, razón)."},
                    {"badge": "Ruta Cualitativa", "title": "Matriz de Categorización", "text": "Conceptos sensibilizadores → Categorías iniciales (apriorísticas) → Subcategorías → Preguntas guía, manteniendo apertura a categorías emergentes del campo."}
                ]
            }
        ]
    },
    "m07": {
        "title": "Cápsula Metodológica · Criterios de Kish, Notación X/O/R y Amenazas a la Validez",
        "subtitle": "Clase 8 · Enfoque, alcance y arquitectura del diseño de investigación",
        "blocks": [
            {
                "type": "cards",
                "title": "La tríada de Leslie Kish y la notación de Campbell y Stanley",
                "items": [
                    {"badge": "Realismo", "title": "Contexto natural", "text": "Grado en que las variables y conductas se observan en su entorno habitual sin artificialidad (máximo en observación naturalista)."},
                    {"badge": "Control (Validez Interna)", "title": "Aislar explicaciones rivales", "text": "Capacidad de atribuir el cambio en la VD exclusivamente a la VI mediante manipulación (X), grupo control y aleatorización (R)."},
                    {"badge": "Representación (Validez Externa)", "title": "Generalizar a la población", "text": "Capacidad de extender los hallazgos a una población definida, maximizada por las encuestas con muestreo probabilístico."},
                    {"badge": "Notación X · O · R", "title": "Dibujar antes de etiquetar", "text": "X = tratamiento/intervención; O = observación o medición; R = asignación aleatoria; línea punteada (---) = grupos intactos no equivalentes."}
                ]
            },
            {
                "type": "table",
                "title": "Diagnóstico rápido de diseños y amenazas frecuentes en Psicología",
                "headers": ["Dibujo del diseño", "Nombre real", "Amenaza principal suelta", "Qué objetivo puede sostener"],
                "rows": [
                    ["X   O", "Preexperimental de un solo grupo solo postest", "Control nulo: no se sabe cómo estaban antes ni qué habría pasado sin X.", "Ningún objetivo causal; requiere agregar pretest y grupo de comparación."],
                    ["O1   X   O2", "Preexperimental pretest-postest de un solo grupo", "Historia, maduración, prueba previa y regresión a la media (si se eligieron casos extremos).", "Describir el cambio observado en los participantes (sin atribuir causalidad exclusiva a X)."],
                    ["O1  X  O2  /  ---  /  O1     O2", "Cuasiexperimental con grupo de comparación no equivalente", "Selección (ej. voluntarios vs. no voluntarios) e interacción selección-maduración.", "Comparar el cambio entre grupos declarando las limitaciones de no aleatorizar (o sortear cupos si hay sobredemanda)."],
                    ["R  O1  X  O2  /  R  O1     O2", "Experimental verdadero con grupo control pretest-postest", "Alta validez interna; cuidar mortalidad diferencial y validez ecológica.", "Determinar el efecto causal de la intervención X sobre la variable dependiente."],
                    ["O  (un solo momento, sin X)", "No experimental transversal (descriptivo, correlacional o comparativo)", "Ausencia de manipulación y de precedencia temporal (terceras variables).", "Describir niveles, determinar grado/dirección de relación o establecer diferencias entre grupos."]
                ]
            }
        ]
    },
    "m08": {
        "title": "Cápsula Metodológica · Universo, Población, Muestra, Corpus y Muestreo",
        "subtitle": "Clase 9 · De quién o de qué se obtendrá evidencia y con qué alcance",
        "blocks": [
            {
                "type": "table",
                "title": "Precisión terminológica indispensable",
                "headers": ["Concepto", "Qué designa", "Ejemplo aplicado"],
                "rows": [
                    ["Población", "Conjunto total de casos que cumplen criterios de inclusión, espacio y tiempo sobre el cual se desea concluir.", "Todos los estudiantes matriculados en Psicología en universidades de Asunción en 2026."],
                    ["Marco muestral", "Listado o registro efectivo desde el cual se seleccionan las unidades.", "Nómina oficial de matriculados activos proporcionada por secretaría académica."],
                    ["Muestra / Corpus", "Subconjunto de casos (o conjunto de documentos/textos en estudios documentales/cualitativos) efectivamente incluido.", "240 estudiantes seleccionados para responder la batería (o 18 entrevistas en profundidad)."],
                    ["Unidad de análisis vs. observación", "Sobre quién se concluye vs. quién provee el dato.", "Si se estudia clima familiar (unidad: la familia) encuestando a la madre (unidad de observación: la madre)."]
                ]
            },
            {
                "type": "cards",
                "title": "Familias de muestreo y principio clave sobre el tamaño muestral",
                "items": [
                    {"badge": "Probabilísticos", "title": "Azar conocido (Simple, Sistemático, Estratificado, Conglomerados)", "text": "Todos los elementos del marco tienen probabilidad conocida (>0) de ser elegidos. Permiten estimar el error muestral y generalizar estadísticamente."},
                    {"badge": "No probabilísticos cuantitativos", "title": "Conveniencia o Cuotas", "text": "Útiles cuando no hay marco muestral o el acceso es restringido; obligan a moderar las conclusiones y declarar el sesgo de selección."},
                    {"badge": "Intencional / Cualitativo", "title": "Casos ricos en información y saturación", "text": "No busca representatividad estadística sino profundidad, máxima variación o casos típicos hasta alcanzar suficiencia/saturación teórica."},
                    {"badge": "¡Atención!", "title": "Tamaño grande ≠ Ausencia de sesgo", "text": "Aumentar el tamaño de una muestra autoseleccionada o por conveniencia reduce la variabilidad aleatoria, pero NO corrige el sesgo de selección."}
                ]
            }
        ]
    },
    "m09": {
        "title": "Cápsula Metodológica · Cadena Objetivo–Instrumento, Calidad y Ética",
        "subtitle": "Clase 11 · Fuente, técnica, instrumento, psicometría básica y resguardo ético",
        "blocks": [
            {
                "type": "table",
                "title": "Diferenciar Fuente, Técnica e Instrumento (¡No son sinónimos!)",
                "headers": ["Componente", "Pregunta", "Ejemplos en Psicología"],
                "rows": [
                    ["Fuente de información", "¿Quién o qué entrega el dato?", "Participantes (estudiantes, pacientes, docentes), registros clínicos, expedientes, observación en aula."],
                    ["Técnica de recolección", "¿Mediante qué procedimiento general se obtiene?", "Encuesta, entrevista semiestructurada, grupo focal, observación sistemática, evaluación psicométrica."],
                    ["Instrumento", "¿Con qué herramienta material o soporte se registra?", "Cuestionario sociodemográfico, Escala DASS-21, guía de pautas de entrevista, lista de cotejo o matriz de registro."]
                ]
            },
            {
                "type": "cards",
                "title": "Calidad de la evidencia y Líneas Rojas Éticas",
                "items": [
                    {"badge": "Confiabilidad (Fiabilidad)", "title": "Consistencia y precisión de la medida", "text": "Grado en que el instrumento produce puntuaciones consistentes y libres de error aleatorio (ej. consistencia interna Alfa de Cronbach / Omega de McDonald, estabilidad test-retest)."},
                    {"badge": "Validez", "title": "¿Mide realmente el constructo que dice medir?", "text": "Evidencias de validez de contenido (juicio de expertos), de estructura interna (análisis factorial) y de relación con otras variables."},
                    {"badge": "Rigor cualitativo", "title": "Credibilidad, auditabilidad y reflexividad", "text": "Triangulación de fuentes o investigadores, devolución a participantes, descripción densa y trazabilidad del proceso analítico."},
                    {"badge": "Ética y Privacidad en IA", "title": "Consentimiento, custodia y prohibición en IA pública", "text": "Consentimiento informado libre y revocable, anonimización mediante códigos, plan de custodia y PROHIBICIÓN absoluta de subir entrevistas o datos sensibles a plataformas públicas de IA."}
                ]
            }
        ]
    },
    "m10": {
        "title": "Cápsula Metodológica · Plan de Análisis Cuantitativo, Cualitativo y Mixto",
        "subtitle": "Clase 12 · Cómo transformar los datos recolectados en respuestas a los objetivos",
        "blocks": [
            {
                "type": "table",
                "title": "Selección de procedimientos según el objetivo y el nivel de medición",
                "headers": ["Propósito del objetivo", "Nivel de medición / Dato", "Procedimiento analítico coherente"],
                "rows": [
                    ["Describir o estimar frecuencias/niveles", "Nominal / Ordinal / Escala", "Frecuencias absolutas y relativas (%), mediana/RIC o media y desviación estándar según distribución."],
                    ["Determinar grado y dirección de relación", "Dos variables continuas o ordinales", "Coeficiente r de Pearson (paramétrico) o rho de Spearman (no paramétrico / ordinal)."],
                    ["Establecer diferencias entre 2 grupos", "VI dicotómica + VD continua/ordinal", "Prueba t de Student (independiente o pareada) o U de Mann-Whitney / Wilcoxon + tamaño del efecto."],
                    ["Comprender significados o experiencias", "Corpus textual (entrevistas, grupos focales)", "Transcripción y anonimización → codificación abierta/axial → familias de categorías y temas → selección de citas y casos divergentes."]
                ]
            },
            {
                "type": "cards",
                "title": "4 distinciones para la Clase 12 (Plan 2026)",
                "items": [
                    {"badge": "1. Preparación", "title": "Antes de analizar", "text": "Limpieza de base, detección de valores perdidos, recodificación de ítems inversos y prueba de supuestos (o transcripción y anonimización en cualitativa)."},
                    {"badge": "2. Análisis", "title": "El procedimiento aplicado", "text": "Cálculo estadístico o proceso sistemático de codificación y comparación constante."},
                    {"badge": "3. Resultado", "title": "Lo que muestran los datos", "text": "El hallazgo empírico organizado en tablas, gráficos o matrices categoriales (en el anteproyecto se planifica SIN inventar datos ficticios)."},
                    {"badge": "4. Interpretación", "title": "Diálogo con la teoría", "text": "Explicar qué significa el resultado a la luz del marco teórico, los antecedentes y las limitaciones del diseño."}
                ]
            }
        ]
    },
    "m11": {
        "title": "Cápsula Metodológica · Escritura Académica, APA 7, Zotero e IA Transparente",
        "subtitle": "Clase 13 · Integración del borrador, atribución rigurosa y auditoría global",
        "blocks": [
            {
                "type": "table",
                "title": "Cita textual, Paráfrasis, Síntesis y Copia (Integridad Académica)",
                "headers": ["Modalidad", "Cómo se construye", "¿Lleva cita APA en el texto?", "Cuándo usarla"],
                "rows": [
                    ["Cita directa (textual)", "Reproduce literalmente las palabras del autor entre comillas (<40 palabras) o en bloque sangrado (≥40 palabras).", "Sí: Autor, año y número de página (p. X) o párrafo.", "Solo cuando la formulación exacta de una definición o norma es indispensable."],
                    ["Paráfrasis genuina", "Explica la idea de un autor con estructura sintáctica y palabras propias tras comprender el texto.", "Sí: Autor y año obligatorios.", "Es la forma preferida en Psicología para mantener fluidez argumentativa."],
                    ["Síntesis comparada", "Integra en un mismo párrafo lo que convergen o discrepan dos o más fuentes sobre un eje temático.", "Sí: Cita múltiple ordenada o integrada en el discurso.", "Ideal para redactar antecedentes, estado del arte y justificación."],
                    ["Falsa paráfrasis / Copia", "Cambiar solo dos o tres palabras por sinónimos (\"patchwriting\") o pegar texto de IA sin atribución.", "Constituye plagio o falta a la integridad académica.", "Nunca: debe reemplazarse por paráfrasis real o síntesis propia."]
                ]
            },
            {
                "type": "cards",
                "title": "3 controles finales antes de entregar el borrador",
                "items": [
                    {"badge": "Correspondencia 1 a 1", "title": "Citas en texto ↔ Lista de referencias", "text": "Todo autor citado en el cuerpo debe figurar en las Referencias finales con metadatos completos, y ninguna referencia debe quedar \"huérfana\" sin citar."},
                    {"badge": "Zotero con curaduría humana", "title": "El gestor ayuda, pero tú verificas", "text": "Zotero captura metadatos automáticamente, pero a menudo importa títulos en mayúsculas, autores mal partidos o sin DOI. Revisa cada ficha antes de exportar."},
                    {"badge": "Auditoría de Coherencia", "title": "El hilo conductor completo", "text": "Verifica que los mismos constructos atraviesen título, pregunta, objetivo general, variables/categorías, diseño, instrumento y plan de análisis."}
                ]
            }
        ]
    }
}

MINICASES = {
    "m01": [
        {
            "id": "m01_c1",
            "title": "Caso 1 · «En mi consultorio siempre funciona así»",
            "context": "Psicología Clínica · Asunción",
            "scenario": "Durante el primer taller de Metodología II, un estudiante propone investigar por qué la grafología permite detectar la honestidad laboral. Argumenta: «En la consultora donde trabajo lo usamos hace diez años y mi jefa, que tiene 25 años de experiencia, asegura que nunca falla. Además, es lógico que quien escribe inclinado hacia la derecha sea más extrovertido».",
            "question": "Según la clasificación de Peirce y Kerlinger sobre los métodos del conocimiento, ¿en qué métodos se está apoyando el estudiante y qué exigiría el enfoque científico para abordar su afirmación?",
            "hints": [
                "Observa los tres argumentos que usa: «lo usamos hace diez años», «mi jefa con 25 años de experiencia lo asegura» y «es lógico que sea así».",
                "Recuerda cómo distingue Kerlinger entre tenacidad, autoridad, método a priori y método científico."
            ],
            "analysis": "El estudiante combina tres métodos precientíficos: **tenacidad** («lo usamos hace diez años»), **autoridad** («mi jefa experta asegura que no falla») y el **método a priori o intuición** («es lógico que escribir inclinado indique extroversión»). Para pasar al **enfoque científico**, debería transformar esa creencia en una pregunta contrastable empíricamente, medir los rasgos de escritura y la honestidad/extroversión con instrumentos independientes y validados, controlar el sesgo de confirmación (evaluación a ciegas) y aceptar de antemano que los datos podrían refutar la creencia de la consultora.",
            "keyConcept": "Métodos del conocimiento y control sistemático de sesgos"
        },
        {
            "id": "m01_c2",
            "title": "Caso 2 · El pánico a «retroceder» en el proyecto",
            "context": "Psicología Educativa · Modalidad B-Learning",
            "scenario": "Valeria eligió en la semana 2 estudiar «motivación académica en universitarios». Al leer tres artículos en la semana 4, descubre que la literatura distingue entre motivación intrínseca, extrínseca y amotivación, y que su pregunta original era demasiado ambigua. Preocupada, piensa: «Si cambio mi pregunta ahora, significa que hice todo mal porque el método científico es una secuencia lineal estricta».",
            "question": "¿Es correcto el temor de Valeria? ¿Cómo se explica lo que le ocurre desde el mapa real del proceso de investigación?",
            "hints": [
                "Piensa en el propósito de la Clase 2 del Plan 2026: las relaciones no lineales entre las etapas.",
                "¿La revisión de la literatura ocurre una sola vez y se cierra, o dialoga con el problema?"
            ],
            "analysis": "El temor de Valeria parte de un **mito frecuente**: creer que el método científico es una escalera rígida donde nunca se revisa un escalón anterior. En la práctica real de la investigación (Clase 2), el proceso es **iterativo y espiralado**: leer literatura permite descubrir distinciones conceptuales (como las dimensiones de la motivación en la Teoría de la Autodeterminación) que obligan a **revisar y precisar la delimitación y la pregunta**. Ajustar el problema a la luz de la teoría no es fracasar: es exactamente cómo se construye coherencia interna.",
            "keyConcept": "Carácter iterativo y autocorrectivo del proceso de investigación"
        },
        {
            "id": "m01_c3",
            "title": "Caso 3 · Confundir levantar datos con diseñar un proyecto",
            "context": "Psicología Social · Proyecto de cátedra",
            "scenario": "Un grupo de estudiantes quiere salir mañana mismo a aplicar 100 encuestas sobre estrés en el transporte público porque «sin datos reales e inventados o recolectados ya no hay proyecto de investigación». Aún no han revisado qué teorías explican el estrés ambiental ni qué pregunta exacta buscan responder.",
            "question": "¿Por qué salir a encuestar sin problema ni marco conceptual vulnera la lógica del proyecto de investigación en nuestra asignatura?",
            "hints": [
                "Revisa el rol de la teoría y del diseño en la producción de evidencia pertinente.",
                "En Metodología II el producto integrador es un anteproyecto fundamentado y coherente."
            ],
            "analysis": "Salir a recoger datos a ciegas invierte la lógica científica: sin saber **qué se pregunta** ni **cómo se define el constructo**, cualquier cuestionario improvisado medirá impresiones de sentido común con alto riesgo de invalidez. Además, en nuestra cátedra el producto integrador es un **borrador de proyecto fundamentado y coherente** (no se exigen levantamientos precipitados ni jamás datos ficticios). Primero se construye la arquitectura lógica (literatura → problema → objetivos → variables → diseño → plan de muestreo, instrumentos y análisis).",
            "keyConcept": "Primacía del diseño lógico y teórico sobre la recolección empírica"
        }
    ],
    "m02": [
        {
            "id": "m02_c1",
            "title": "Caso 1 · El tema oceánico vs. el tema sin acceso",
            "context": "Clínica y Forense · Selección del tema",
            "scenario": "Dos estudiantes presentan sus propuestas en la Clase 3:\n• **Propuesta A (Marcos):** «La depresión en América Latina».\n• **Propuesta B (Lucía):** «Perfil neuropsicológico de pacientes con un trastorno genético ultrarraro internados en clínicas psiquiátricas de máxima seguridad en Asunción» (Lucía no trabaja en el sistema penitenciario ni tiene contacto institucional ni acceso a esos expedientes).",
            "question": "Evalúa ambas propuestas cruzando los factores subjetivos y objetivos de selección y los cuatro ejes de delimitación.",
            "hints": [
                "¿Qué le falta recortar a la Propuesta A?",
                "¿Qué factor objetivo crítico incumple la Propuesta B para un trabajo semestral de grado?"
            ],
            "analysis": "• **Propuesta A (Marcos):** Falla por **falta de delimitación**. «La depresión en América Latina» es un campo temático gigantesco, no un tema delimitado. Debe acotar qué aspecto o relación de la depresión, en qué población específica (ej. adultos mayores en centros comunitarios), en qué ciudad/institución y en qué periodo.\n• **Propuesta B (Lucía):** Aunque parece muy específica, falla en los **factores objetivos de viabilidad y acceso**: no cuenta con autorización institucional, acceso real a la muestra ni tiempo suficiente en un semestre para superar las barreras éticas y legales de una población privada de libertad con baja prevalencia.",
            "keyConcept": "Equilibrio entre delimitación específica y factibilidad empírica"
        },
        {
            "id": "m02_c2",
            "title": "Caso 2 · «Profe, busqué en SciELO y dio 0 resultados»",
            "context": "Psicología Organizacional · Estrategia de búsqueda",
            "scenario": "Matías quiere investigar el agotamiento laboral en cajeros de supermercados de San Lorenzo. Abre SciELO, escribe en la caja de búsqueda: `agotamiento laboral en cajeros de supermercados de San Lorenzo Paraguay en el año 2025` y obtiene **0 resultados**. Concluye en su ficha: «No existe ninguna investigación en el mundo sobre mi tema».",
            "question": "¿Por qué la búsqueda de Matías dio cero resultados y cómo debería rediseñarla mediante una ecuación booleana por capas?",
            "hints": [
                "Escribir una oración larga completa en el buscador exige que aparezcan todas esas palabras exactas.",
                "¿Qué pasa si buscas primero los conceptos centrales con sinónimos en español e inglés?"
            ],
            "analysis": "Matías cometió el error de introducir una **frase hiperrestrictiva en lenguaje natural** incluyendo ciudad y año desde el primer intento. La ausencia de resultados no refleja un vacío científico mundial, sino un **error de estrategia de búsqueda**.\n\n**Corrección por capas:**\n1. **Capa 1 (Conceptos + sinónimos con OR y AND):** `(\"agotamiento laboral\" OR burnout OR \"desgaste profesional\") AND (\"sector comercio\" OR supermercados OR cajeros OR \"atención al cliente\")`.\n2. **Capa 2 (Idioma internacional):** `(\"burnout\" OR \"emotional exhaustion\") AND (\"retail workers\" OR \"cashiers\" OR \"customer service\")`.\n3. **Capa 3 (Contexto regional):** explorar en SciELO, Redalyc y repositorios locales de Paraguay/Cono Sur estudios sobre trabajadores de comercio o atención al público.",
            "keyConcept": "Búsqueda booleana por capas vs. frases literales hiperrestrictivas"
        },
        {
            "id": "m02_c3",
            "title": "Caso 3 · Las cinco referencias «perfectas» del chatbot",
            "context": "Integridad Académica · Protocolo VERA de IA",
            "scenario": "Para ahorrar tiempo en la tarea de la Clase 3, Sofía le pide a un chatbot: «Escribe el planteamiento de mi tema con 5 citas en APA 7 de artículos paraguayos de 2024». El chatbot le devuelve un texto impecable con citas como *González y Benítez (2024), Revista Paraguaya de Psicología Aplicada, DOI: 10.1016/j.rppa.2024.03.012*. Sofía lo pega directamente en su entrega.",
            "question": "¿Qué líneas rojas del protocolo de IA responsable vulneró Sofía y cómo debió usar el Protocolo VERA?",
            "hints": [
                "¿De dónde saca un modelo de lenguaje los DOIs y títulos cuando se le pide generar bibliografía?",
                "Revisa las 4 letras del protocolo VERA."
            ],
            "analysis": "Sofía incurrió en dos faltas graves: **delegar la redacción** y **citar fuentes alucinadas sin verificarlas**. Los modelos generativos predicen secuencias plausibles de palabras y suelen inventar títulos, revistas y DOIs inexistentes.\n\nCon el **Protocolo VERA**:\n• **IA permitida:** pedir al asistente sinónimos y descriptores en inglés/español para armar su propia ecuación booleana.\n• **V (Ver fuente):** buscar los artículos reales en SciELO, Google Académico o PubMed y abrir el PDF.\n• **E (Examinar):** comprobar en qué página están los datos.\n• **R (Revisar alcance)** y **A (Anotar):** redactar con voz propia y declarar el uso de la herramienta.",
            "keyConcept": "Verificación de fuentes reales y prohibición de referencias generadas por IA"
        }
    ],
    "m03": [
        {
            "id": "m03_c1",
            "title": "Caso 1 · El síndrome de la «lista de compras» en los antecedentes",
            "context": "Psicología Educativa · Redacción del Estado del Arte",
            "scenario": "En su borrador de la Clase 4, Rodrigo escribe cuatro párrafos seguidos con este formato:\n«En 2020, Pérez estudió la procrastinación en Lima con 120 alumnos y halló que el 40 % procrastina. En 2021, Gómez estudió la procrastinación en Bogotá con 200 alumnos y halló relación con la ansiedad. En 2022, Silva estudió la procrastinación en Chile con 80 alumnos...».",
            "question": "¿Por qué este modo de redactar no constituye un verdadero estado del arte y cómo debe reorganizarse a partir de la matriz de literatura?",
            "hints": [
                "¿Qué pasa cuando cada párrafo resume un artículo aislado sin ponerlos a dialogar?",
                "Recuerda las cuatro operaciones de síntesis: convergencia, contraste, explicación y vacío."
            ],
            "analysis": "Rodrigo cayó en la **«lista de compras»** (yuxtaposición cronológica de fichas aisladas). Un estado del arte no se organiza como «un autor por párrafo», sino **por ejes temáticos e ideas** que integran varias fuentes.\n\n**Cómo mejorarlo leyendo la matriz por columnas:**\n1. **Convergencia:** «Diversos estudios en universitarios latinoamericanos coinciden en que la procrastinación académica se asocia positivamente con el malestar ansioso (Gómez, 2021; Silva, 2022)...».\n2. **Contraste y método:** «No obstante, las estimaciones de prevalencia varían según se evalúe postergación general o evitación por miedo al fracaso...».\n3. **Vacío derivado:** «Pese a esta convergencia regional, la evidencia en universidades paraguayas bajo modalidad semipresencial sigue siendo escasa».",
            "keyConcept": "Síntesis integradora por ejes vs. resumen secuencial de autores"
        },
        {
            "id": "m03_c2",
            "title": "Caso 2 · ¿Definir o explicar? Marco conceptual vs. Marco teórico",
            "context": "Psicología Social · Construcción de marcos",
            "scenario": "Camila investiga la relación entre exposición a redes sociales e insatisfacción corporal en adolescentes. En la sección que titula «Marco Teórico», incluye únicamente definiciones del diccionario de la RAE para las palabras «red», «adolescente» e «imagen», sin mencionar ningún modelo psicológico que explique por qué ver fotos idealizadas afectaría la autovaloración corporal.",
            "question": "Explica los dos errores que comete Camila al construir sus marcos de referencia.",
            "hints": [
                "Primero: ¿una definición del diccionario general sirve como definición conceptual científica?",
                "Segundo: aplica la heurística «X es...» (conceptual) frente a «X ocurre porque...» (teórico)."
            ],
            "analysis": "Camila comete dos errores:\n1. **En lo conceptual:** usa definiciones de diccionario general en lugar de **definiciones conceptuales académicas** provenientes de la literatura psicológica especializada (que delimiten qué se entiende por *insatisfacción corporal* y qué la distingue de otros constructos).\n2. **En lo teórico:** confunde definir palabras con **explicar el fenómeno**. Un **marco teórico** requiere adoptar una teoría articulada —por ejemplo, la *Teoría de la Comparación Social* de Festinger o el *Modelo Tripartito de Influencia*— que proponga el **mecanismo explicativo** («la exposición a imágenes idealizadas incrementa la insatisfacción corporal *porque* activa comparaciones ascendentes e internalización del ideal estético»).",
            "keyConcept": "Heurística: definir conceptos (Marco Conceptual) vs. explicar mecanismos (Marco Teórico)"
        },
        {
            "id": "m03_c3",
            "title": "Caso 3 · Formular el vacío sin exagerar la evidencia",
            "context": "Psicología de la Salud · Justificación del vacío",
            "scenario": "Tras revisar cinco artículos en español sobre adherencia al tratamiento en pacientes hipertensos, un estudiante escribe en su proyecto: «Como ha quedado demostrado, no existe absolutamente ningún estudio previo sobre adherencia terapéutica en pacientes crónicos, por lo que esta investigación será la primera en abordar el tema».",
            "question": "¿Por qué esta afirmación debilita la credibilidad del proyecto ante un tribunal y cómo debería redactarse un vacío proporcional a la evidencia?",
            "hints": [
                "Afirmar que «no existe nada» suele revelar una búsqueda insuficiente, no un tema virgen.",
                "Piensa en los tipos de vacío: contextual, metodológico, conceptual o poblacional."
            ],
            "analysis": "Afirmar que «no existe ningún estudio» sobre un tema clásico como la adherencia terapéutica es una **exageración insostenible** que demuestra desconocimiento de la literatura internacional. Un vacío riguroso es **proporcional al alcance de la búsqueda realizada** y especifica qué aspecto concreto falta.\n\n**Ejemplo de formulación rigurosa:** «Aunque la literatura internacional documenta ampliamente el rol del apoyo familiar en la adherencia al tratamiento antihipertensivo, en las bases consultadas se identificó escasa evidencia empírica situada en usuarios de Unidades de Salud de la Familia (USF) del Departamento Central que considere simultáneamente las barreras percibidas de acceso y las creencias sobre la medicación».",
            "keyConcept": "Proporcionalidad y especificidad en la formulación del vacío"
        }
    ],
    "m04": [
        {
            "id": "m04_c1",
            "title": "Caso 1 · El salto mortal de la opinión al problema",
            "context": "Psicología Educacional · Planteamiento del problema",
            "scenario": "Un borrador de planteamiento comienza y termina así:\n«Hoy en día todos sabemos que los jóvenes ya no leen ni se concentran por culpa de los videos cortos de internet, lo cual está destruyendo la educación paraguaya. Por eso, nuestra pregunta es: ¿Por qué los videos cortos destruyen la atención de los jóvenes?».",
            "question": "Identifica al menos tres deficiencias metodológicas en este planteamiento y propón cómo reestructurarlo con la secuencia de la Clase 5.",
            "hints": [
                "¿Se apoya en evidencia verificada o en generalizaciones de sentido común («todos sabemos», «destruyendo»)?",
                "Observa que la pregunta da por supuesto un efecto causal catastrófico antes de investigar."
            ],
            "analysis": "El texto presenta tres fallas críticas:\n1. **Opinión sin respaldo:** sustituye antecedentes científicos por prejuicios de sentido común («todos sabemos») y lenguaje valorativo («destruyendo»).\n2. **Petición de principio (sesgo confirmatorio):** la pregunta «¿Por qué X destruye Y?» da por probado un daño causal que aún no se midió.\n3. **Falta de delimitación:** no especifica qué proceso atencional (ej. atención sostenida), en qué población ni en qué contexto.\n\n**Reconstrucción (Contexto → Evidencia → Vacío → Delimitación → Pregunta):** contextualizar el auge del consumo de videos breves en adolescentes, citar estudios previos sobre hábitos digitales y funciones ejecutivas, señalar la falta de datos locales con medidas estandarizadas de atención y preguntar: *«¿Qué relación existe entre la frecuencia de uso de plataformas de videos breves y el desempeño en atención sostenida en estudiantes de educación media de un colegio de Asunción durante 2026?»*.",
            "keyConcept": "Secuencia Contexto → Evidencia → Vacío → Relevancia → Delimitación"
        },
        {
            "id": "m04_c2",
            "title": "Caso 2 · Problema práctico de intervención vs. problema de investigación",
            "context": "Psicología Comunitaria · Diferenciación conceptual",
            "scenario": "Un equipo preocupado por el acoso escolar en una escuela de Luque formula como pregunta central de su investigación: «¿Cómo podemos implementar una campaña de charlas y afiches para erradicar el bullying en el tercer ciclo de la Escuela X?».",
            "question": "¿Por qué esta pregunta formula un problema práctico de gestión/intervención y no un problema de investigación científica? ¿Cómo transformarla sin perder el interés en ese contexto?",
            "hints": [
                "Un proyecto de intervención busca cambiar la realidad mediante acciones; un proyecto de investigación busca producir conocimiento que hoy no tenemos.",
                "¿Qué necesitamos saber sobre el acoso escolar en esa escuela o sobre un programa preventivo?"
            ],
            "analysis": "La pregunta «¿Cómo implementar una campaña para erradicar...?» plantea un **problema práctico o de acción profesional**, cuya respuesta es un plan de actividades y no un hallazgo empírico. Para convertirlo en un **problema de investigación**, debemos preguntarnos qué desconocemos:\n\n• **Opción descriptiva/correlacional:** *«¿Cuáles son las modalidades más frecuentes de acoso escolar y su relación con el clima de aula percibido en estudiantes del tercer ciclo de la Escuela X de Luque en 2026?»*.\n• **Opción evaluativa/explicativa:** *«¿Qué efecto tiene un programa psicoeducativo de convivencia escolar sobre las actitudes hacia el acoso escolar en estudiantes del tercer ciclo de la Escuela X?»*.",
            "keyConcept": "Problema cognitivo (qué conocer) vs. problema práctico (qué hacer)"
        },
        {
            "id": "m04_c3",
            "title": "Caso 3 · Preguntas específicas que desbordan la pregunta central",
            "context": "Psicología Clínica · Coherencia entre preguntas",
            "scenario": "Una estudiante formula:\n• **Pregunta central:** «¿Cuál es el nivel de ansiedad ante los exámenes en estudiantes del primer curso de Psicología de la UNIBE en 2026?»\n• **Pregunta específica 1:** «¿Cuáles son las causas inconscientes infantiles que originan la ansiedad ante los exámenes?»\n• **Pregunta específica 2:** «¿Qué eficacia tiene la terapia cognitivo-conductual para curar la ansiedad en estos estudiantes?».",
            "question": "Audita la coherencia entre la pregunta central y las preguntas específicas. ¿Qué problema estructural observas?",
            "hints": [
                "¿Cuál es el alcance de la pregunta central («Cuál es el nivel...»)?",
                "¿Pueden las preguntas específicas exigir estudios causales profundos o ensayos clínicos que no están en la pregunta central?"
            ],
            "analysis": "Existe una **ruptura grave de coherencia y jerarquía**. La pregunta central es de alcance **descriptivo** (estimar y caracterizar el nivel de ansiedad ante exámenes en una población acotada). Sin embargo, la específica 1 exige un estudio etiológico retrospectivo sobre causas infantiles y la específica 2 exige un diseño experimental de eficacia terapéutica.\n\n**Corrección:** las preguntas específicas deben desglosar la pregunta central en sus dimensiones y subgrupos observables, por ejemplo:\n1. *¿Cómo se manifiestan las dimensiones cognitiva, fisiológica y motora de la ansiedad ante exámenes en los estudiantes de primer curso?*\n2. *¿Qué variaciones presenta el nivel de ansiedad ante exámenes según el turno de cursado y la condición laboral de los estudiantes?*",
            "keyConcept": "Correspondencia de alcance entre pregunta general y preguntas específicas"
        }
    ],
    "m05": [
        {
            "id": "m05_c1",
            "title": "Caso 1 · Desconexión digital y teletrabajo (Asunción · Alcance Exploratorio)",
            "context": "Psicología Organizacional · Asunción (Caso oficial de cátedra)",
            "scenario": "El trabajo remoto se extendió en empresas de servicios de Asunción sin pautas claras de desconexión. No existe un inventario local de qué hacen efectivamente los trabajadores para delimitar su jornada.\n\n**Pregunta:** ¿Qué prácticas de desconexión digital emplean los trabajadores en modalidad remota de empresas de servicios de Asunción?\n\n**Borrador del estudiante:**\n• *Propuesta A:* «Analizar el fenómeno del teletrabajo en Asunción para concienciar a las empresas sobre la desconexión».\n• *Propuesta B:* «Aplicar una encuesta a trabajadores remotos para conocer sus hábitos».",
            "question": "Aplica la tabla de los 3 planos y las 2 pruebas de la cátedra para diagnosticar por qué fallan las propuestas A y B, y formula el objetivo general y específicos correctos.",
            "hints": [
                "¿En qué plano está «analizar» y qué introduce la palabra «para concienciar»?",
                "En la Propuesta B, ¿«aplicar una encuesta» es el conocimiento buscado o una tarea del método?"
            ],
            "analysis": "• **Diagnóstico de A:** «Analizar» pertenece al **Plano 2 (operación)** y es subdeterminado (no pasa la prueba del resultado enunciable); «el fenómeno del teletrabajo» es vago; y «para concienciar a las empresas» agrega una **cláusula de finalidad práctica (Plano 3)** que pertenece a la justificación.\n• **Diagnóstico de B:** «Aplicar una encuesta» es un **objetivo-actividad** con complemento material (la encuesta) y «conocer» es un verbo subdeterminado.\n\n**Formulación ejemplar (Plano 1 · Alcance Exploratorio):**\n• **Objetivo general:** *Identificar las prácticas de desconexión digital que emplean los trabajadores en modalidad remota de empresas de servicios de Asunción durante 2026.*\n• **Objetivos específicos:**\n  1.º Identificar las conductas de delimitación temporal de la jornada referidas por los trabajadores.\n  2.º Identificar los recursos técnicos que utilizan para restringir la comunicación laboral fuera de horario.\n  3.º Describir las condiciones organizacionales que los trabajadores asocian a la posibilidad de desconectarse.",
            "keyConcept": "Verbo «Identificar» en alcance exploratorio y exclusión de actividades/finalidades"
        },
        {
            "id": "m05_c2",
            "title": "Caso 2 · Redes sociales y autoestima en adolescentes (Encarnación · Correlacional)",
            "context": "Psicología Social · Encarnación (Caso oficial de cátedra)",
            "scenario": "Se busca responder: *¿Qué relación existe entre el tiempo de uso de redes sociales y la autoestima en adolescentes escolarizados de Encarnación?*\n\n**Tres intentos de objetivo general en el taller:**\n1. «Analizar la relación entre el uso de redes sociales y la autoestima».\n2. «Demostrar que el uso excesivo de redes sociales disminuye la autoestima».\n3. «Correlacionar las variables mediante el coeficiente r de Pearson para promover un uso responsable».",
            "question": "¿Por qué los tres intentos son metodológicamente defectuosos y cuál es la formulación que supera la prueba del resultado enunciable?",
            "hints": [
                "Pasa el intento 1 a tiempo pasado («Se analizó la relación»): ¿informa algún hallazgo?",
                "En el intento 2, ¿qué hace el verbo «demostrar» y la palabra «disminuye»?"
            ],
            "analysis": "1. **«Analizar la relación...»:** Falla la **prueba del resultado enunciable**. Decir en las conclusiones «Se analizó la relación» informa una tarea hecha, no qué se descubrió.\n2. **«Demostrar que... disminuye...»:** Usa un **verbo confirmatorio** (presupone el resultado antes de tener los datos) y atribuye **causalidad** sin un diseño experimental.\n3. **«Correlacionar con Pearson para promover...»:** Confunde el procedimiento estadístico (Plano 2) y le adosa una finalidad práctica (Plano 3).\n\n**Formulación ejemplar (Plano 1):**\n• **Objetivo general:** *Determinar el grado y la dirección de la relación entre el tiempo de uso de redes sociales y el nivel de autoestima en adolescentes escolarizados de instituciones educativas de Encarnación durante 2026.*\n• **Objetivos específicos (Derivabilidad horizontal):**\n  1.º Estimar el tiempo diario de uso de redes sociales en la muestra estudiada.\n  2.º Estimar el nivel de autoestima de los participantes.\n  3.º Determinar la magnitud y la dirección de la asociación entre ambas variables.\n  4.º Establecer si la asociación se mantiene al considerar el sexo y la edad de los participantes.",
            "keyConcept": "Diferencia entre «analizar la relación» (medio) y «determinar el grado y dirección de la relación» (logro)"
        },
        {
            "id": "m05_c3",
            "title": "Caso 3 · Burnout en enfermería (Central · Comparativo) y Procrastinación (Ciudad del Este · Descriptivo)",
            "context": "Psicología de la Salud y Educativa · Central y Ciudad del Este (Casos de cátedra)",
            "scenario": "Compara estos dos proyectos de grado en Paraguay:\n• **Proyecto 1 (Ciudad del Este · Descriptivo):** *¿Cómo se manifiesta la procrastinación académica en estudiantes universitarios de Ciudad del Este?* El alumno propone como específico 3: «Determinar las causas psicológicas de la procrastinación» y formula una hipótesis causal.\n• **Proyecto 2 (Departamento Central · Comparativo):** *¿Qué diferencias existen en el agotamiento emocional entre el personal de enfermería de hospitales públicos y privados de Central?* La alumna escribe como específicos: «1) Revisar bibliografía sobre burnout; 2) Aplicar el Maslach Burnout Inventory; 3) Tabular los puntajes en SPSS».",
            "question": "Identifica el error lógico del Proyecto 1 y el error estructural del Proyecto 2, indicando cómo corregir ambos.",
            "hints": [
                "En el Proyecto 1, compara el nivel epistémico de «Describir» (general) con «Determinar las causas» (específico).",
                "En el Proyecto 2, ¿esos tres puntos descomponen el conocimiento o listan la agenda de tareas?"
            ],
            "analysis": "• **Proyecto 1 (Ciudad del Este):** Comete **inversión jerárquica** (un específico causal dentro de un estudio descriptivo) e incluye una hipótesis causal improcedente. En un estudio descriptivo (*Describir la procrastinación académica...*), los específicos deben: 1.º *Estimar el nivel general de procrastinación*; 2.º *Describir el comportamiento de las dimensiones de postergación, autorregulación y evitación*; 3.º *Establecer el perfil según curso y turno*, sin hipótesis causal.\n• **Proyecto 2 (Central):** Cayó en el **objetivo-cronograma** (listar pasos del trabajo en vez de descomponer el conocimiento). Si el general es *Establecer las diferencias en el nivel de agotamiento emocional entre enfermeros de hospitales públicos y privados de Central*, los específicos correctos son: 1.º *Estimar el nivel en hospitales públicos*; 2.º *Estimar el nivel en hospitales privados*; 3.º *Determinar la significación estadística de la diferencia entre ambos grupos*; 4.º *Establecer si la diferencia se mantiene al controlar antigüedad y turno* (y aquí sí corresponde hipótesis de diferencia de grupos).",
            "keyConcept": "Jerarquía vertical, derivabilidad horizontal y criterio de presencia de hipótesis"
        }
    ],
    "m06": [
        {
            "id": "m06_c1",
            "title": "Caso 1 · Cuando el marco dice una cosa y la escala mide otra",
            "context": "Psicología Clínica y de la Salud · Coherencia conceptual-operacional",
            "scenario": "En su marco conceptual, Julián define el **uso problemático de redes sociales** como «un patrón persistente de pérdida de control, abstinencia e interferencia en la vida cotidiana y académica (no equivalente a la mera cantidad de horas conectado)». Sin embargo, en su matriz de operacionalización define operacionalmente la variable con una sola pregunta: «¿Cuántas horas al día pasas en Instagram y TikTok?».",
            "question": "¿Dónde se rompió la cadena constructo → definición conceptual → definición operacional y qué consecuencia tendrá sobre las conclusiones del estudio?",
            "hints": [
                "Compara lo que Julián dijo que excluía en su definición conceptual con lo que terminó midiendo.",
                "¿Tiempo de pantalla es lo mismo que interferencia y pérdida de control?"
            ],
            "analysis": "Hay una **fractura de validez de constructo** entre la definición conceptual y la definición operacional. Mientras el marco conceptual distingue explícitamente entre *frecuencia de exposición* y *uso problemático* (que exige dimensiones como pérdida de control, saliencia e interferencia), la definición operacional reduce todo el constructo a una medida unidimensional de horas de pantalla.\n\n**Corrección:** operacionalizar el constructo mediante una escala validada que contemple las dimensiones declaradas en la definición conceptual (interferencia cotidiana, tolerancia/pérdida de control y modificación del estado de ánimo), pudiendo registrar las horas diarias como una variable complementaria de exposición, pero no como sinónimo de uso problemático.",
            "keyConcept": "Isomorfismo entre definición conceptual, dimensiones e indicadores operacionales"
        },
        {
            "id": "m06_c2",
            "title": "Caso 2 · Forzar indicadores numéricos en un estudio cualitativo",
            "context": "Psicología Comunitaria · Categorización cualitativa",
            "scenario": "Elena realiza un estudio cualitativo fenomenológico sobre las **vivencias de duelo migratorio** en estudiantes del interior del país que se trasladan a estudiar a Asunción. Al llegar a la Clase 7, intenta forzar su tema en una tabla cuantitativa escribiendo: «Variable independiente: kilómetros de distancia al pueblo; Variable dependiente: porcentaje de llanto semanal medido de 1 a 5».",
            "question": "¿Por qué es un error forzar la lógica de VI/VD e indicadores métricos en este estudio y cómo debe construir su matriz de categorización?",
            "hints": [
                "Recuerda el propósito de la Clase 7 del Plan 2026: «sin forzar una lógica cuantitativa sobre proyectos cualitativos».",
                "¿Qué papel cumplen los conceptos sensibilizadores y las categorías iniciales y emergentes?"
            ],
            "analysis": "En un estudio cualitativo orientado a comprender significados y vivencias, forzar variables independientes/dependientes y puntajes numéricos desnaturaliza el enfoque. La Clase 7 distingue dos rutas:\n\n**Ruta cualitativa adecuada para Elena (Matriz de Categorización):**\n• **Concepto orientador / sensibilizador:** Transición y adaptación psicosocial universitaria.\n• **Categorías iniciales (apriorísticas):** 1) Reconfiguración de redes de apoyo; 2) Tensiones identitarias y desarraigo cotidiano; 3) Estrategias de afrontamiento y pertenencia en la ciudad.\n• **Apertura a categorías emergentes:** dejar espacio explícito para que del relato de los estudiantes surjan dimensiones no previstas antes de ir al campo.",
            "keyConcept": "Diferenciación entre operacionalización cuantitativa y categorización cualitativa"
        },
        {
            "id": "m06_c3",
            "title": "Caso 3 · Confundir constructo, dimensión, indicador e ítem",
            "context": "Psicología Educacional · Operacionalización",
            "scenario": "Un equipo quiere operacionalizar el constructo **Clima Social Escolar**. En la columna «Dimensiones» escribe: «Pregunta 4 del cuestionario». En la columna «Indicadores» escribe: «El clima escolar según Moos (1974)». Y en «Definición conceptual» escribe: «Se aplicará una escala tipo Likert de 1 a 5».",
            "question": "Reordena correctamente las piezas desubicadas y explica la secuencia lógica desde el constructo hasta el ítem.",
            "hints": [
                "Recuerda la dirección del descenso de abstracción: Constructo → Definición conceptual → Dimensiones → Indicadores → Definición operacional / Ítems."
            ],
            "analysis": "El equipo invirtió todas las columnas de la matriz:\n1. **Constructo:** Clima Social Escolar.\n2. **Definición conceptual:** Percepción compartida por los miembros de la comunidad educativa sobre la calidad de las relaciones, el apoyo al aprendizaje y la claridad normativa (Moos, 1974).\n3. **Dimensiones (facetas teóricas):** Relaciones interpersonales, Autorrealización/orientación a la tarea y Estabilidad/claridad de normas.\n4. **Indicadores (manifestaciones observables):** Grado de ayuda mutua entre compañeros, apoyo percibido del docente y conocimiento de las reglas del aula.\n5. **Definición operacional / Ítems:** Puntajes obtenidos en los reactivos específicos de la escala (de 1 = totalmente en desacuerdo a 5 = totalmente de acuerdo).",
            "keyConcept": "Secuencia lógica: Constructo → Dimensión → Indicador → Ítem"
        }
    ],
    "m07": [
        {
            "id": "m07_c1",
            "title": "Caso 1 · El taller del gabinete y Antes y después (Casos 1 y 2 · Clase 8)",
            "context": "Psicología Educacional y Comunitaria · Banco de casos de cátedra",
            "scenario": "Analiza estos dos diseños reales de proyectos de grado:\n• **Caso A (El taller del gabinete):** Un gabinete psicopedagógico de Asunción dicta un taller de habilidades sociales a noveno grado durante un mes. Al terminar, aplica un cuestionario y obtiene un puntaje alto. Concluye que «el taller fue efectivo».\n• **Caso B (Antes y después):** Una tesista aplica una escala de regulación emocional a 20 adolescentes antes y después de un programa de 8 semanas. Los puntajes mejoran y concluye que «el programa causó la mejora».",
            "question": "Dibuja ambos diseños en notación X / O / R, identifica qué criterio de Kish sacrifican, qué amenazas quedan sueltas y cómo corregir o el diseño o el verbo del objetivo.",
            "hints": [
                "En el Caso A (`X   O`), ¿sabemos cómo estaban los alumnos en marzo antes del taller?",
                "En el Caso B (`O1  X  O2`), ¿qué más les pasa a los adolescentes durante 8 semanas además de ir al taller?"
            ],
            "analysis": "• **Caso A (`X   O`):** Diseño preexperimental de un solo grupo con solo postest. **Control nulo:** sin medición previa (`O1`) ni grupo de comparación, no hay inferencia causal posible (esos alumnos podían tener altas habilidades sociales desde antes).\n• **Caso B (`O1   X   O2`):** Prioriza **realismo**, pero sacrifica **control**. Deja sueltas tres amenazas clásicas a la validez interna:\n  1. **Historia:** eventos externos ocurridos en esas 8 semanas.\n  2. **Maduración:** son adolescentes y sus procesos regulatorios cambian con el desarrollo.\n  3. **Efecto de la prueba previa:** responder la escala en la semana 1 pudo sensibilizarlos para la semana 8.\n\n**Dos salidas legítimas:**\n1. **Subir el diseño:** agregar un grupo de comparación (`O1  O2`).\n2. **Ajustar el objetivo a lo que el diseño paga:** cambiar «Determinar el efecto del programa» por «Describir el cambio observado en los participantes antes y después del programa», declarando como límite que no permite aislar causalidad.",
            "keyConcept": "Coherencia entre dibujo del diseño (X/O/R), amenazas a la validez interna y verbo del objetivo"
        },
        {
            "id": "m07_c2",
            "title": "Caso 2 · Los que se anotaron vs. Los que peor estaban (Casos 3 y 5 · Clase 8)",
            "context": "Psicología Organizacional y Clínica · Banco de casos de cátedra",
            "scenario": "• **Caso C (Los que se anotaron):** Se ofrece un taller voluntario de manejo del estrés a funcionarios: 40 se anotan y 60 no. Se mide estrés antes y dos meses después en ambos grupos (`O1 X O2 / --- / O1 O2`). Los que participaron mejoran más.\n• **Caso D (Los que peor estaban):** Un servicio de salud mental selecciona a los 30 pacientes con los puntajes MÁS ALTOS de depresión en lista de espera y les aplica activación conductual (`O1 X O2` con selección por puntaje extremo). A los tres meses los puntajes bajan notablemente.",
            "question": "¿Cuál es la amenaza central en el Caso C (voluntarios) y cuál es la amenaza estadística oculta en el Caso D (puntajes extremos)? ¿Qué solución práctica propone la cátedra para cada uno?",
            "hints": [
                "En el Caso C, ¿en qué se diferencian desde el día uno quienes se anotan voluntariamente a un taller de estrés respecto de quienes no se anotan?",
                "En el Caso D, ¿qué ocurre estadísticamente en una segunda medición cuando seleccionas solo a quienes tuvieron el puntaje más extremo en la primera?"
            ],
            "analysis": "• **Caso C (Los que se anotaron):** La amenaza central es **Selección** (e interacción selección-maduración), representada por la línea punteada `---`. Quienes se inscriben voluntariamente suelen tener mayor motivación al cambio o mayor urgencia percibida. **Solución brillante y sin costo:** si hay más inscriptos que cupos, **sortear los cupos** (convierte una limitación administrativa en asignación aleatoria `R`, dejando a los demás en lista de espera como grupo control equivalente).\n• **Caso D (Los que peor estaban):** La amenaza central es la **Regresión estadística hacia la media**. Cuando se selecciona un grupo por tener puntajes extremos en `O1`, en `O2` los puntajes tienden a acercarse al promedio por razones puramente estadísticas (el error aleatorio extremo no se repite igual), aunque la intervención no tuviera efecto. **Solución:** comparar con otro grupo seleccionado con el mismo criterio de puntaje extremo.",
            "keyConcept": "Sesgo de autoselección, sorteo de cupos por lista de espera y regresión a la media"
        },
        {
            "id": "m07_c3",
            "title": "Caso 3 · La encuesta grande, la etiqueta prestada y el falso mixto (Casos 4, 7 y 8 · Clase 8)",
            "context": "Auditoría de Diseños · Banco de casos de cátedra",
            "scenario": "Tres errores reales en apartados de Método de tesis de Psicología:\n1. **La encuesta grande:** Muestreo aleatorio estratificado de 800 universitarios en 5 universidades; se mide uso de redes y ansiedad en un solo momento (`O`) y se halla correlación moderada. El objetivo dice: *«Determinar el efecto del uso de redes sobre la ansiedad»*.\n2. **La etiqueta prestada:** Se compara en un solo momento el bienestar de adultos mayores que asisten hace >1 año vs. <6 meses a un centro de día, y se escribe: *«Diseño cuasiexperimental, descriptivo-correlacional, transversal»*.\n3. **El mixto de una pregunta:** Se aplica una escala de 20 ítems Likert a 90 trabajadores y al final se agrega `¿Algún comentario adicional?`, declarando *«enfoque mixto»*.",
            "question": "Desarma cada uno de los tres casos aplicando los criterios de Kish y las reglas de precisión metodológica de la Clase 8.",
            "hints": [
                "En el 1, el diseño es excelente en representación (Kish), pero ¿puede una sola observación transversal (`O`) sostener la palabra «efecto»?",
                "En el 2, ¿hubo intervención `X` para llamarlo cuasiexperimental? En el 3, ¿una pregunta abierta suelta hace un diseño mixto?"
            ],
            "analysis": "1. **La encuesta grande (`O`):** Prioriza **representación** de forma impecable, pero sacrifica **control**. El error no está en el diseño sino en el **verbo del objetivo**: sin manipulación (`X`) ni precedencia temporal, una correlación no prueba «efecto» (la ansiedad podría llevar a usar más redes, o el insomnio causar ambas). **Solución:** cambiar el objetivo a *«Determinar el grado y dirección de la relación...»*.\n2. **La etiqueta prestada:** **No es cuasiexperimental** porque nadie intervino sobre nada (no hay `X`), y «descriptivo-correlacional» junta dos alcances con guion para no elegir. Es un diseño **no experimental, transversal comparativo** entre dos grupos preexistentes.\n3. **El mixto de una pregunta:** Una pregunta abierta de comentarios al final de una encuesta **no constituye un diseño mixto**. Un diseño mixto exige justificar para qué se combinan datos cuantitativos y cualitativos, en qué secuencia y cómo se integran. Si solo es un campo de comentarios, debe declararse estudio cuantitativo con comentarios ilustrativos.",
            "keyConcept": "Las encuestas no son experimentos de segunda: el error es pedirles inferencias causales que no dan"
        }
    ],
    "m08": [
        {
            "id": "m08_c1",
            "title": "Caso 1 · «Encuesté a 1.500 personas en mi historia de Instagram, así que es representativa»",
            "context": "Psicología Social · Muestreo y Validez Externa",
            "scenario": "Un estudiante sube un enlace de Google Forms a sus historias de Instagram y grupos de WhatsApp para estudiar actitudes hacia la psicoterapia en adultos paraguayos. Consigue 1.500 respuestas en tres días y escribe en su método: «Dado el gran tamaño alcanzado (n = 1.500), la muestra es altamente representativa de la población adulta del Paraguay».",
            "question": "¿Por qué es falsa la conclusión del estudiante pese a tener 1.500 casos? Distingue entre tamaño muestral y procedimiento de selección.",
            "hints": [
                "¿Quiénes vieron la historia de Instagram del estudiante y quiénes decidieron hacer clic?",
                "¿Qué corrige un n grande: el error aleatorio o el sesgo sistemático de selección?"
            ],
            "analysis": "La representatividad estadística depende del **procedimiento de selección (muestreo probabilístico sobre un marco muestral conocido)**, no del mero volumen de respuestas. Difundir un enlace en redes personales es un **muestreo no probabilístico por conveniencia y autoselección**: sobrerrepresenta a jóvenes urbanos conectados al círculo de un estudiante de Psicología (que suelen tener actitudes mucho más favorables hacia la terapia) y excluye a quienes no usan esas redes.\n\n**Regla clave:** Aumentar *n* de 150 a 1.500 reduce el error muestral aleatorio, pero **mantiene intacto el sesgo de selección**. Debe declararse como muestreo no probabilístico y acotar las conclusiones a la muestra participante.",
            "keyConcept": "Un tamaño muestral grande no corrige el sesgo de un muestreo por conveniencia"
        },
        {
            "id": "m08_c2",
            "title": "Caso 2 · ¿Quién es la unidad de análisis y quién la unidad de observación?",
            "context": "Psicología del Desarrollo y Educacional · Unidades y Marco",
            "scenario": "Una investigadora quiere comparar las prácticas de inclusión escolar entre **45 escuelas primarias** del Departamento Central. Para obtener la información, entrevista al director y aplica una escala a tres docentes de primer ciclo en cada escuela.",
            "question": "Distingue en este estudio cuál es la población, cuál es la unidad de análisis y cuáles son las unidades de observación.",
            "hints": [
                "¿Sobre qué entidad hablarán las conclusiones comparativas del estudio: sobre las escuelas o sobre los individuos?",
                "¿Quiénes proporcionan empíricamente los datos en el trabajo de campo?"
            ],
            "analysis": "• **Población:** El conjunto de escuelas primarias del Departamento Central que cumplen los criterios de inclusión en 2026.\n• **Muestra:** Las 45 escuelas primarias seleccionadas.\n• **Unidad de análisis (el «qué» o «quién» sobre el cual se predica la conclusión):** **Cada escuela primaria** (n = 45).\n• **Unidades de observación / informantes (quienes proveen el dato):** El director y los tres docentes entrevistados/encuestados dentro de cada institución. Confundir ambas unidades lleva a errores graves al calcular el tamaño muestral o al analizar los datos como si 180 docentes fueran independientes entre sí.",
            "keyConcept": "Distinción entre unidad de análisis (sobre quién se concluye) y unidad de observación (quién informa)"
        },
        {
            "id": "m08_c3",
            "title": "Caso 3 · ¿Cuántas entrevistas bastan en un estudio cualitativo?",
            "context": "Psicología de la Salud · Muestreo Intencional y Suficiencia",
            "scenario": "En un estudio cualitativo sobre la experiencia de cuidadores primarios de familiares con Alzheimer, el estudiante escribe: «Aplicaremos la fórmula estadística de poblaciones finitas con 95 % de confianza y 5 % de margen de error para elegir al azar a los cuidadores que entrevistaremos en profundidad».",
            "question": "¿Por qué es incoherente usar la fórmula de error muestral aleatorio en este diseño y qué criterios de selección corresponden en la ruta cualitativa?",
            "hints": [
                "¿El estudio cualitativo busca estimar un porcentaje poblacional con margen de error o comprender en profundidad una experiencia compleja?",
                "Recuerda los conceptos de muestreo intencional por criterios y saturación/suficiencia de información."
            ],
            "analysis": "La fórmula de cálculo muestral con nivel de confianza y margen de error responde a la lógica de la **inferencia estadística cuantitativa**, no a la indagación cualitativa en profundidad. En un estudio fenomenológico o interpretativo corresponde un **muestreo intencional (o propositivo) guiado por criterios teóricos** (ej. ser cuidador principal conviviente desde hace al menos un año, buscando variedad en parentesco y nivel socioeconómico).\n\nEl número final de entrevistas (por ejemplo, entre 10 y 18 casos) se justifica por el criterio de **suficiencia de la información y saturación de categorías**: cuando las nuevas entrevistas dejan de aportar núcleos de sentido novedosos para responder la pregunta de investigación.",
            "keyConcept": "Muestreo intencional por criterios y saturación teórica en investigación cualitativa"
        }
    ],
    "m09": [
        {
            "id": "m09_c1",
            "title": "Caso 1 · El cuestionario inventado el domingo a la noche",
            "context": "Psicometría y Medición · Calidad del instrumento",
            "scenario": "Para medir «Resiliencia y Afrontamiento» en su proyecto, un estudiante redacta por su cuenta 8 preguntas improvisadas (entre ellas: *«¿Eres una persona fuerte que supera todo rápido y nunca se deprime ni se estresa?»*) sin revisar escalas validadas ni hacer prueba piloto. En la columna «Técnica» escribe «Formulario de Google» y en «Instrumento» escribe «Encuesta».",
            "question": "Señala tres errores técnicos en la propuesta del estudiante (clasificación de técnica/instrumento, redacción de ítems y evidencias de validez/confiabilidad).",
            "hints": [
                "Primero: ¿«Encuesta» es la técnica o el instrumento? ¿Y qué es «Google Forms»?",
                "Segundo: mira el ítem que redactó: ¿cuántas ideas mezcla a la vez?"
            ],
            "analysis": "1. **Confusión Técnica vs. Instrumento vs. Soporte:** La **técnica** es la *encuesta*; el **instrumento** es la *escala o cuestionario específico* (p. ej. Escala de Resiliencia CD-RISC); y *Google Forms* es solo el soporte digital de administración.\n2. **Ítem defectuoso (doble o triple barra y sesgo de deseabilidad):** La pregunta mezcla fortaleza, rapidez, ausencia de depresión y ausencia de estrés en un solo reactivo. Si alguien responde «No», es imposible saber a cuál de las cuatro partes se refiere.\n3. **Ausencia de validez y confiabilidad:** Antes de inventar preguntas sin sustento, debe buscarse un instrumento con evidencias psicométricas de validez y confiabilidad (o seguir los 10 pasos de construcción, juicio de expertos y pilotaje).",
            "keyConcept": "Cadena Objetivo → Dato → Fuente → Técnica → Instrumento y criterios de calidad de ítems"
        },
        {
            "id": "m09_c2",
            "title": "Caso 2 · «Subí las entrevistas con nombres reales a un chatbot para que las resuma»",
            "context": "Ética de la Investigación e IA · Protección de participantes",
            "scenario": "En un estudio sobre violencia en el noviazgo en jóvenes universitarios, el equipo planea grabar entrevistas utilizando los nombres y apellidos reales de las participantes, guardar los audios en una carpeta pública de Google Drive sin contraseña y subir las transcripciones completas a un servicio público gratuito de IA para «pedirle que arme las categorías».",
            "question": "Audita todos los riesgos éticos y de confidencialidad de este procedimiento y diseña el protocolo ético correcto según la Clase 11.",
            "hints": [
                "Revisa las reglas del Plan 2026 sobre datos sensibles e IA pública.",
                "¿Qué elementos debe incluir el consentimiento informado, la anonimización y el protocolo de derivación?"
            ],
            "analysis": "El procedimiento vulnera principios éticos esenciales de confidencialidad, no maleficencia y autonomía:\n1. **Prohibición estricta en IA pública:** Jamás deben subirse entrevistas identificables ni datos clínicos/sensibles a servicios públicos de IA (pérdida de control y confidencialidad de los datos).\n2. **Anonimización desde la transcripción:** Cada participante debe identificarse con un código alfanumérico (ej. `P01`, `P02`), suprimiendo nombres propios, lugares de trabajo o detalles que permitan rastrear su identidad.\n3. **Custodia y eliminación:** Los archivos deben resguardarse en carpetas cifradas o con acceso restringido solo al equipo investigador por un plazo definido.\n4. **Consentimiento informado y contención:** Tratándose de violencia en el noviazgo, debe informarse el derecho a no responder o retirarse sin perjuicio y contar con un **protocolo de información y derivación a servicios de apoyo psicológico**.",
            "keyConcept": "Consentimiento informado, anonimización, custodia segura y prohibición de datos sensibles en IA pública"
        },
        {
            "id": "m09_c3",
            "title": "Caso 3 · Alta confiabilidad sin validez: la báscula descalibrada",
            "context": "Calidad de la Medición · Validez vs. Confiabilidad",
            "scenario": "Un equipo aplica una escala traducida literalmente de otro idioma para medir «Ansiedad Social» en adolescentes paraguayos. Al calcular el Alfa de Cronbach obtienen $\\alpha = .89$, por lo que aseguran que «el instrumento tiene validez total y mide perfectamente la ansiedad social». Sin embargo, al leer los ítems, un juez experto nota que las preguntas en realidad evalúan introversión y preferencia por la lectura solitaria, sin medir temor a la evaluación negativa.",
            "question": "Explica por qué un Alfa de Cronbach alto ($\\alpha = .89$) no garantiza por sí mismo la validez del instrumento.",
            "hints": [
                "Recuerda la diferencia entre consistencia de las puntuaciones (confiabilidad) y medir efectivamente el constructo teórico propuesto (validez)."
            ],
            "analysis": "El coeficiente Alfa de Cronbach ($\\alpha = .89$) informa únicamente sobre la **consistencia interna (confiabilidad)**: indica que los ítems covarían entre sí de manera homogénea. Sin embargo, **la confiabilidad es condición necesaria pero no suficiente para la validez**.\n\nSi todos los ítems miden consistentemente *introversión* en lugar de *temor a la evaluación social negativa*, el instrumento será muy confiable (consistente), pero **carecerá de validez de contenido y de constructo** para medir ansiedad social. Por eso siempre se requiere verificar la correspondencia teórica entre las dimensiones del constructo y los ítems, además de la adaptación lingüística y cultural al contexto paraguayo.",
            "keyConcept": "Un instrumento puede ser consistente (confiable) sin medir el constructo correcto (válido)"
        }
    ],
    "m10": [
        {
            "id": "m10_c1",
            "title": "Caso 1 · Promediar códigos nominales y aplicar Pearson a todo",
            "context": "Ruta Cuantitativa · Coherencia nivel de medición–estadístico",
            "scenario": "En su matriz de análisis cuantitativo (Clase 12), un estudiante codifica la variable *Estado civil* como `1 = Soltero, 2 = Casado, 3 = Divorciado, 4 = Viudo` y propone calcular la **media aritmética y la desviación estándar del estado civil** (imaginando concluir «el estado civil promedio es 1,8»). Además, para comparar el nivel de ansiedad (variable continua con distribución fuertemente asimétrica en una muestra pequeña de $n = 18$) entre dos grupos, propone usar únicamente una prueba paramétrica sin verificar supuestos.",
            "question": "¿Por qué es un error calcular la media del estado civil y qué ajustes requiere su plan de análisis descriptivo e inferencial?",
            "hints": [
                "¿Qué nivel de medición tiene la variable Estado civil aunque se codifique con números 1, 2, 3, 4?",
                "¿Qué estadísticos corresponden a variables nominales y qué alternativa no paramétrica existe cuando no se cumplen supuestos?"
            ],
            "analysis": "1. **Error con variable nominal:** En *Estado civil*, los números `1, 2, 3, 4` son simples etiquetas de clasificación (**nivel nominal**), sin orden ni distancia métrica. Calcular su media aritmética carece de sentido matemático y sustantivo. Corresponde reportar **frecuencias absolutas ($n$) y porcentajes (%)**, y como medida de posición, la **moda**.\n2. **Verificación de supuestos en inferencial:** Con $n = 18$ y fuerte asimetría, el plan de análisis debe prever comprobar primero la normalidad (p. ej. prueba de Shapiro-Wilk). Si no se cumple el supuesto paramétrico, debe declararse el uso de **mediana y rango intercuartílico (RIC)** para describir, y la prueba no paramétrica **U de Mann-Whitney** para comparar los dos grupos independientes.",
            "keyConcept": "El nivel de medición (nominal, ordinal, intervalo, razón) y los supuestos gobiernan el estadístico"
        },
        {
            "id": "m10_c2",
            "title": "Caso 2 · El análisis cualitativo no es «elegir tres frases que me gustaron»",
            "context": "Ruta Cualitativa · Trazabilidad y Rigor Analítico",
            "scenario": "En su plan de análisis cualitativo para 15 entrevistas semiestructuradas sobre maternidad adolescente, un grupo escribe: «Leeremos las entrevistas y seleccionaremos las frases más interesantes que confirmen nuestra idea inicial para pegarlas en los resultados».",
            "question": "¿Por qué este procedimiento carece de rigor cualitativo y cuáles son los eslabones que debe explicitar el plan de análisis en la Clase 12?",
            "hints": [
                "Seleccionar solo las citas que confirman tu idea previa se llama sesgo de confirmación o «cherry-picking».",
                "Revisa la secuencia de la ruta cualitativa del Plan 2026: preparación → codificación → categorización → memos y casos divergentes."
            ],
            "analysis": "Elegir discrecionalmente citas que confirman la expectativa del investigador anula el rigor cualitativo. Un plan de análisis cualitativo trazable (Clase 12) debe especificar cinco pasos:\n1. **Preparación del corpus:** transcripción literal, anonimización y lectura flotante completa.\n2. **Segmentación y codificación inicial:** identificación de unidades de significado y asignación de códigos descriptivos/in vivo.\n3. **Agrupación categorial y temática:** comparación constante de códigos para construir o refinar categorías y ejes temáticos.\n4. **Memos analíticos y casos negativos/divergentes:** documentar las decisiones e incluir explícitamente los relatos que **matizan o contradicen** el patrón dominante.\n5. **Presentación:** matrices de sentido acompañadas de fragmentos textuales verificables (identificados con código de participante).",
            "keyConcept": "Codificación sistemática, comparación constante y análisis de casos divergentes"
        },
        {
            "id": "m10_c3",
            "title": "Caso 3 · Planificar el análisis sin inventar resultados",
            "context": "Integridad Metodológica · Plan vs. Ejecución",
            "scenario": "Al redactar el apartado «Plan de análisis de datos» de su borrador de proyecto, una estudiante incluye un gráfico de barras con porcentajes inventados y escribe: «Como se observa en el Gráfico 1, el 78 % de los encuestados presentó alto estrés laboral, confirmando nuestra hipótesis».",
            "question": "¿Por qué incluir porcentajes o conclusiones de resultados en un proyecto/anteproyecto es un error metodológico y ético grave?",
            "hints": [
                "En un proyecto o protocolo de investigación (antes de ir al campo), ¿qué diferencia hay entre diseñar el plan de análisis y reportar resultados?"
            ],
            "analysis": "En un anteproyecto o borrador de proyecto **no se han recolectado datos reales**, por lo que presentar porcentajes, gráficos con cifras o dar por confirmada la hipótesis constituye **fabricación de resultados** y confunde el *proyecto* con el *informe final de tesis*.\n\n**Lo que sí corresponde en la Clase 12:**\n• Especificar en tiempo futuro cómo se codificarán y limpiarán los datos.\n• Declarar qué estadísticos o procedimientos de codificación se aplicarán para responder cada objetivo específico.\n• Presentar **esqueletos o maquetas de tablas vacías** (sin datos inventados) y explicar qué regla de decisión se usará sin adelantar conclusiones.",
            "keyConcept": "Distinción entre Plan de Análisis (anteproyecto) y Resultados Ejecutados (informe final)"
        }
    ],
    "m11": [
        {
            "id": "m11_c1",
            "title": "Caso 1 · El «patchwriting» (maquillaje de sinónimos) vs. la paráfrasis real",
            "context": "Escritura Académica y APA 7 · Clase 13",
            "scenario": "**Texto original de Kerlinger y Lee (2002, p. 14):** *«Una teoría es un conjunto de constructos (conceptos), definiciones y proposiciones relacionadas entre sí, que presentan un punto de vista sistemático de fenómenos especificando relaciones entre variables, con el objeto de explicar y predecir los fenómenos».*\n\n**Borrador del estudiante (sin comillas ni cita):** *«Una teoría representa un grupo de conceptos, definiciones y proposiciones vinculadas entre sí, que muestran una visión sistemática de los hechos detallando vínculos entre variables, con la meta de explicar y pronosticar los fenómenos».*",
            "question": "¿Por qué el texto del estudiante constituye plagio por «patchwriting» (paráfrasis mecánica) y cómo debería reescribirse correctamente en APA 7?",
            "hints": [
                "Observa que el estudiante mantuvo exactamente la misma estructura de la oración y solo cambió palabras sueltas («conjunto» por «grupo», «objeto» por «meta»).",
                "Además, ¿qué falta al final o al inicio de la oración?"
            ],
            "analysis": "Reemplazar palabras por sinónimos conservando el esqueleto sintáctico del original —y más aún omitiendo la cita— es **plagio por paráfrasis mecánica (*patchwriting*)**.\n\n**Cómo hacerlo con integridad académica:**\n1. Comprender la idea central y redactarla con estructura propia en función del argumento del párrafo.\n2. Atribuir siempre la autoría mediante cita narrativa o parentética en APA 7.\n\n**Ejemplo de paráfrasis genuina:** *Desde la perspectiva de Kerlinger y Lee (2002), las teorías científicas no son simples listas de conceptos aislados, sino sistemas articulados de proposiciones que permiten comprender cómo se vinculan determinadas variables para explicar y anticipar el comportamiento de un fenómeno.*",
            "keyConcept": "Paráfrasis comprensiva y atribución APA 7 vs. reemplazo mecánico de sinónimos"
        },
        {
            "id": "m11_c2",
            "title": "Caso 2 · Citas huérfanas y metadatos sucios en Zotero",
            "context": "Gestión Bibliográfica · Auditoría APA y Zotero",
            "scenario": "En la revisión final de su borrador (Clase 13), Andrea detecta tres situaciones en su documento generado con Zotero:\n1. En el texto aparece citado `Bandura (1997)`, pero en la lista final de Referencias no figura ninguna obra de Bandura.\n2. En la lista de Referencias aparecen 8 artículos que nunca fueron citados en ningún párrafo del trabajo.\n3. Una referencia exportada automáticamente por Zotero dice: `PÉREZ, JUAN (2021). ANSIEDAD EN UNIVERSITARIOS. PDF DESCARGADO DE SCIELO.`",
            "question": "Explica cómo corregir las tres anomalías aplicando las normas APA 7 y el principio de «Zotero como apoyo, no como garantía automática».",
            "hints": [
                "Recuerda la regla de correspondencia biunívoca entre citas en el texto y lista de referencias en APA 7.",
                "¿Por qué Zotero a veces exporta mayúsculas o datos rotos?"
            ],
            "analysis": "1. **Cita sin referencia (`Bandura, 1997`):** Es un error grave de trazabilidad. Debe incorporarse la referencia completa verificada en la lista final.\n2. **Referencias no citadas en el texto:** En APA 7 la sección se denomina **Referencias** (no «Bibliografía general») e incluye **únicamente las fuentes citadas en el cuerpo del documento**. Las 8 fuentes no citadas deben retirarse o integrarse genuinamente donde correspondan.\n3. **Metadatos defectuosos en Zotero:** Los conectores web suelen capturar metadatos incompletos o en mayúsculas sostenidas desde PDFs mal etiquetados. El estudiante debe **editar manualmente los campos dentro de Zotero** (apellido e inicial `Pérez, J.`, año `(2021)`, título en formato oración, nombre de la revista en cursiva, volumen, número, páginas y enlace DOI) antes de actualizar el documento.",
            "keyConcept": "Correspondencia 1 a 1 entre citas y referencias y curaduría manual de metadatos en Zotero"
        },
        {
            "id": "m11_c3",
            "title": "Caso 3 · Auditoría de la cadena completa antes de la defensa",
            "context": "Integración del Proyecto · Clases 13 y 14",
            "scenario": "Antes de entregar su borrador integrado, Martín aplica la lista de cotejo de coherencia global y descubre lo siguiente:\n• **Pregunta general:** *¿Qué relación existe entre el apoyo social percibido y la sintomatología depresiva en adultos mayores de Luque?*\n• **Objetivo general:** *Comparar el nivel de deterioro cognitivo entre adultos mayores institucionalizados y no institucionalizados de Asunción.*\n• **Instrumento previsto:** *Escala de Autoestima de Rosenberg.*",
            "question": "Realiza la auditoría de coherencia de este proyecto: ¿qué pasa entre la pregunta, el objetivo y el instrumento, y cómo debe alinearse la cadena antes de la defensa?",
            "hints": [
                "Subraya los constructos y la población en las tres piezas: parece que fueran tres proyectos distintos pegados en un mismo archivo."
            ],
            "analysis": "El borrador sufre una **fractura total en la cadena de coherencia**:\n• La **pregunta** habla de *apoyo social y depresión en Luque* (correlacional).\n• El **objetivo** cambia a *deterioro cognitivo según institucionalización en Asunción* (comparativo).\n• El **instrumento** mide un quinto constructo distinto (*autoestima*).\n\n**Regla de oro para el borrador final y la defensa:** Una sola línea conductora debe atravesar todo el documento. Si el proyecto estudia la relación entre **apoyo social percibido** y **sintomatología depresiva** en **adultos mayores de Luque**, entonces:\n1. El **objetivo general** debe ser *Determinar el grado y dirección de la relación entre el apoyo social percibido y la sintomatología depresiva en adultos mayores de Luque en 2026*.\n2. La **matriz de variables** debe operacionalizar *apoyo social percibido* y *sintomatología depresiva*.\n3. Los **instrumentos** deben medir exactamente esos dos constructos (p. ej. Escala Multidimensional de Apoyo Social de Zimet y Escala de Depresión Geriátrica de Yesavage).\n4. El **plan de análisis** debe prever un análisis de correlación (Pearson/Spearman) entre ambas puntuaciones.",
            "keyConcept": "Auditoría de coherencia global: Pregunta ↔ Objetivo ↔ Variables ↔ Diseño ↔ Instrumento ↔ Análisis"
        }
    ]
}

SIMULATIONS = {
    "m01": {
        "title": "Simulación 01 · Del mito cotidiano al planteamiento científico",
        "context": "Eres integrante de un equipo de investigación en Psicología en la UNIBE. Una organización afirma que «escuchar música clásica durante 10 minutos antes de rendir garantiza aprobar cualquier examen universitario» y te pide avalarlo.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "Paso 1 · Diagnosticar el tipo de afirmación inicial",
                "prompt": "Antes de diseñar cualquier estudio, ¿cómo clasificas epistemológicamente la afirmación de la organización («garantiza aprobar porque un famoso divulgador lo dijo en televisión»)?",
                "options": [
                    {
                        "text": "Es una teoría científica consolidada porque apela a una figura de autoridad reconocida en medios de comunicación.",
                        "isOptimal": False,
                        "feedback": "Cuidado: aceptar una afirmación por el prestigio mediático de quien la emite corresponde al método de autoridad (Peirce/Kerlinger), no al enfoque científico."
                    },
                    {
                        "text": "Es una creencia apoyada en el método de autoridad y el sentido común; para la ciencia es, a lo sumo, una conjetura que debe traducirse en una relación contrastable y refutable.",
                        "isOptimal": True,
                        "feedback": "¡Excelente! El enfoque científico exige someter las creencias a control empírico y formularlas de modo que puedan ser refutadas por los datos."
                    },
                    {
                        "text": "Es una verdad a priori evidente por sí misma que no requiere contrastación empírica.",
                        "isOptimal": False,
                        "feedback": "El método a priori se basa en lo que «parece razonable», pero la ciencia exige evidencia empírica sistemática y controlada."
                    }
                ]
            },
            {
                "stepNumber": 2,
                "title": "Paso 2 · Incorporar la noción de control",
                "prompt": "Un compañero propone: «Hagamos que 30 alumnos escuchen Mozart antes del parcial de Metodología; si la mayoría aprueba, queda probado». ¿Qué le respondes desde Kerlinger y Lee?",
                "options": [
                    {
                        "text": "Que es un diseño perfecto porque tiene evidencia empírica directa de 30 estudiantes reales.",
                        "isOptimal": False,
                        "feedback": "Tener datos no basta si no hay control: esos 30 estudiantes podrían aprobar porque estudiaron toda la semana o porque el examen fue sencillo."
                    },
                    {
                        "text": "Que carece de control de explicaciones alternativas: sin comparar con condiciones equivalentes y sin controlar cuánto estudiaron, confundiremos el efecto de la música con otras variables extrañas.",
                        "isOptimal": True,
                        "feedback": "¡Exacto! Lo que distingue a la investigación científica del sentido común es el control sistemático de variables extrañas y explicaciones rivales."
                    },
                    {
                        "text": "Que la ciencia nunca utiliza observaciones empíricas, sino únicamente deducciones filosóficas.",
                        "isOptimal": False,
                        "feedback": "La ciencia articula el razonamiento teórico-lógico con la observación empírica controlada."
                    }
                ]
            },
            {
                "stepNumber": 3,
                "title": "Paso 3 · Articular el proceso con la teoría",
                "prompt": "Al revisar la literatura psicológica, descubres que el efecto de la música no actúa mágicamente sobre la memoria, sino regulando el nivel de activación fisiológica y ansiedad previa. ¿Qué haces con tu esquema inicial?",
                "options": [
                    {
                        "text": "Ignoro esos estudios porque en el método científico está prohibido modificar la idea inicial una vez pensado el tema.",
                        "isOptimal": False,
                        "feedback": "Falso: el proceso de investigación es dinámico e iterativo; la teoría orienta qué variables observar y cómo precisar el problema."
                    },
                    {
                        "text": "Ajusto mi problema a la luz de la teoría, enfocando el estudio en la relación entre la escucha musical previa, la ansiedad estado y el desempeño en la prueba.",
                        "isOptimal": True,
                        "feedback": "¡Brillante! Has conectado teoría, reformulación no lineal del problema y control metodológico como un verdadero investigador."
                    }
                ]
            }
        ]
    },
    "m02": {
        "title": "Simulación 02 · Delimitación, búsqueda booleana y protocolo VERA",
        "context": "Estás en la Clase 3 armando tu ficha de selección, delimitación y primera búsqueda académica sobre bienestar en estudiantes universitarios que trabajan y estudian.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "Paso 1 · Delimitar el tema con viabilidad",
                "prompt": "Tu idea inicial era «El estrés en el Paraguay». ¿Cuál de las siguientes opciones transforma ese campo amplio en un tema delimitado y viable para tu proyecto semestral?",
                "options": [
                    {
                        "text": "La historia mundial del estrés laboral y académico desde la Revolución Industrial hasta el presente.",
                        "isOptimal": False,
                        "feedback": "Sigue siendo un tema monográfico inabarcable y sin delimitación empírica ni poblacional viable."
                    },
                    {
                        "text": "Conflicto trabajo-estudio y agotamiento académico en estudiantes universitarios que trabajan de una universidad privada de Asunción durante 2026.",
                        "isOptimal": True,
                        "feedback": "¡Muy bien! Delimita con precisión los constructos centrales, la población, el espacio institucional y el periodo temporal."
                    },
                    {
                        "text": "Medición diaria de cortisol salival durante tres años en los 50.000 universitarios trabajadores de todo el país.",
                        "isOptimal": False,
                        "feedback": "Incumple los factores objetivos de viabilidad temporal, económica y logística para un proyecto semestral."
                    }
                ]
            },
            {
                "stepNumber": 2,
                "title": "Paso 2 · Construir la ecuación de búsqueda",
                "prompt": "Vas a buscar antecedentes en SciELO y PsycINFO. ¿Qué ecuación booleana aplica correctamente los operadores OR y AND?",
                "options": [
                    {
                        "text": "(\"conflicto trabajo-estudio\" OR \"work-study conflict\") AND (\"agotamiento académico\" OR \"academic burnout\") AND (\"estudiantes universitarios\" OR \"university students\")",
                        "isOptimal": True,
                        "feedback": "¡Exacto! Usa comillas para frases exactas, OR dentro de paréntesis para agrupar sinónimos/idiomas y AND para intersectar los tres componentes clave."
                    },
                    {
                        "text": "conflicto trabajo estudio NOT agotamiento NOT universitarios NOT Paraguay",
                        "isOptimal": False,
                        "feedback": "El operador NOT excluye términos: esa cadena eliminaría precisamente los artículos que necesitas encontrar."
                    },
                    {
                        "text": "\"artículos sobre conflicto entre el trabajo y el estudio en alumnos de Asunción en 2026\"",
                        "isOptimal": False,
                        "feedback": "Buscar una oración larga entre comillas exige coincidencia literal exacta y devolverá cero resultados."
                    }
                ]
            },
            {
                "stepNumber": 3,
                "title": "Paso 3 · Aplicar el protocolo VERA ante la IA",
                "prompt": "Usaste un asistente de IA para explorar sinónimos y además el chatbot te sugirió un supuesto artículo clave de «Martínez (2023)». ¿Cuál es tu decisión responsable?",
                "options": [
                    {
                        "text": "Copio la cita de Martínez (2023) directamente en mi matriz porque el chatbot redacta en formato APA 7 muy prolijo.",
                        "isOptimal": False,
                        "feedback": "Peligro de alucinación bibliográfica: nunca se cita una referencia sugerida por IA sin localizar y abrir la fuente original."
                    },
                    {
                        "text": "Busco el artículo en las bases de datos; si existe, abro el PDF original para verificar método y hallazgos (VERA), y registro en mi declaración que usé IA para generar descriptores.",
                        "isOptimal": True,
                        "feedback": "¡Excelente! Aplicaste íntegramente el protocolo VERA: Ver fuente, Examinar correspondencia, Revisar alcance y Anotar el uso."
                    }
                ]
            }
        ]
    },
    "m03": {
        "title": "Simulación 03 · De las fichas dispersas al estado del arte y el vacío",
        "context": "Tienes 6 artículos verificados sobre uso de pantallas, calidad del sueño y rendimiento académico en jóvenes. Debes organizar tu síntesis de la Clase 4.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "Paso 1 · Clasificar la función de cada enunciado",
                "prompt": "Uno de tus textos define el modelo neurobiológico mediante el cual la luz azul nocturna inhibe la melatonina y retrasa el sueño, afectando la consolidación de la memoria. ¿Qué función cumple este aporte en tu proyecto?",
                "options": [
                    {
                        "text": "Forma parte del Marco Teórico, porque propone el mecanismo explicativo de por qué y cómo se relacionan las variables.",
                        "isOptimal": True,
                        "feedback": "¡Correcto! Cuando un sistema de proposiciones explica el mecanismo por el cual X se vincula con Y, cumple una función teórica explicativa."
                    },
                    {
                        "text": "Es únicamente el registro técnico del proceso de búsqueda en bases de datos.",
                        "isOptimal": False,
                        "feedback": "El registro de bases y ecuaciones describe el proceso de revisión, no el mecanismo teórico explicativo."
                    },
                    {
                        "text": "Es una nota periodística de divulgación sin valor conceptual.",
                        "isOptimal": False,
                        "feedback": "Se trata de un modelo teórico-explicativo que orienta las hipótesis y la interpretación de los datos."
                    }
                ]
            },
            {
                "stepNumber": 2,
                "title": "Paso 2 · Superar el error de la «lista de compras»",
                "prompt": "Al leer tu matriz por columnas, notas que 4 estudios hallan que el uso nocturno del celular deteriora el sueño, pero 2 estudios muestran que el impacto sobre el promedio académico desaparece cuando se controla el apoyo académico. ¿Cómo redactas tu párrafo?",
                "options": [
                    {
                        "text": "Escribo seis párrafos separados: «Autor 1 dijo esto. Autor 2 dijo esto. Autor 3 dijo esto...» sin compararlos.",
                        "isOptimal": False,
                        "feedback": "Eso es una lista de compras descriptiva: el lector no percibe qué patrón converge ni qué tensión metodológica existe."
                    },
                    {
                        "text": "Omito los 2 estudios que contradicen mi idea para que parezca que todos los autores me dan la razón.",
                        "isOptimal": False,
                        "feedback": "Ocultar evidencia divergente es un sesgo grave: las tensiones entre estudios son justamente las que enriquecen el estado del arte."
                    },
                    {
                        "text": "Redacto un párrafo integrador mostrando la convergencia sobre el deterioro del sueño y contrastando la discrepancia sobre el rendimiento según las variables de control empleadas.",
                        "isOptimal": True,
                        "feedback": "¡Excelente! Pones a dialogar las fuentes mediante operaciones de convergencia, contraste y explicación metodológica."
                    }
                ]
            },
            {
                "stepNumber": 3,
                "title": "Paso 3 · Redactar el vacío de conocimiento",
                "prompt": "¿Cómo formulas el cierre de tu síntesis para justificar tu problema de investigación en Paraguay?",
                "options": [
                    {
                        "text": "«Como nadie en la historia mundial ha investigado jamás el sueño en estudiantes, este estudio es totalmente inédito».",
                        "isOptimal": False,
                        "feedback": "Exageración insostenible: afirma algo falso y contradice los mismos antecedentes que acabas de citar."
                    },
                    {
                        "text": "«Aunque la evidencia internacional converge en asociar el uso nocturno de pantallas con menor calidad de sueño, predominan estudios que no distinguen el turno de cursado y existe escasa evidencia situada en universitarios paraguayos que trabajan y estudian».",
                        "isOptimal": True,
                        "feedback": "¡Impecable! Es un vacío contextual y metodológico preciso, honesto y directamente conectado con tu pregunta de investigación."
                    }
                ]
            }
        ]
    },
    "m04": {
        "title": "Simulación 04 · Clínica de planteamiento y preguntas de investigación",
        "context": "Estás en la Clase 5 construyendo el planteamiento del problema y las preguntas para un estudio sobre sobrecarga del cuidador familiar de adultos mayores dependientes en Asunción.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "Paso 1 · Ordenar la estructura argumentativa",
                "prompt": "¿Qué secuencia argumentativa eliges para redactar las dos páginas de tu planteamiento del problema?",
                "options": [
                    {
                        "text": "Contar una anécdota personal sin citas, opinar que las familias ya no tienen valores y cerrar pidiendo que el Estado construya más hogares.",
                        "isOptimal": False,
                        "feedback": "Sustituye la evidencia científica por opiniones personales y cierra con una demanda de política pública en vez de un problema cognitivo."
                    },
                    {
                        "text": "Contexto del envejecimiento y cuidado familiar → Evidencia empírica previa sobre sobrecarga → Vacío local sobre su relación con las estrategias de afrontamiento → Relevancia del estudio → Delimitación y pregunta central.",
                        "isOptimal": True,
                        "feedback": "¡Exacto! Esta es la arquitectura de 5 movimientos del Plan 2026: cada eslabón sostiene lógicamente la pregunta final."
                    },
                    {
                        "text": "Pegar directamente el cuestionario de Zarit sin explicar cuál es el problema ni qué dice la literatura.",
                        "isOptimal": False,
                        "feedback": "El instrumento pertenece al método (Clase 11); el planteamiento debe fundamentar qué se desconoce y por qué importa investigarlo."
                    }
                ]
            },
            {
                "stepNumber": 2,
                "title": "Paso 2 · Formular la pregunta central",
                "prompt": "¿Cuál de las siguientes preguntas centrales cumple con los criterios de Kerlinger y Lee?",
                "options": [
                    {
                        "text": "¿Sufren sobrecarga los cuidadores familiares de Asunción? (Sí / No)",
                        "isOptimal": False,
                        "feedback": "Es una pregunta dicotómica cerrada que no especifica nivel, dimensiones ni relación con otra variable."
                    },
                    {
                        "text": "¿Cómo organizar un taller de fin de semana para aliviar a los cuidadores familiares?",
                        "isOptimal": False,
                        "feedback": "Formula una actividad práctica de intervención, no una pregunta de investigación científica."
                    },
                    {
                        "text": "¿Qué relación existe entre las estrategias de afrontamiento y el nivel de sobrecarga percibida en cuidadores familiares de adultos mayores dependientes que acuden a un hospital general de Asunción durante 2026?",
                        "isOptimal": True,
                        "feedback": "¡Excelente! Expresa con claridad una relación entre variables observables en una población, contexto y tiempo bien delimitados."
                    }
                ]
            },
            {
                "stepNumber": 3,
                "title": "Paso 3 · Alinear las preguntas específicas",
                "prompt": "A partir de tu pregunta central correlacional, ¿qué conjunto de preguntas específicas guarda coherencia y derivabilidad?",
                "options": [
                    {
                        "text": "1) ¿Cuáles son las estrategias de afrontamiento predominantes en los cuidadores?; 2) ¿Cuál es el nivel de sobrecarga percibida?; 3) ¿Cuál es la magnitud y dirección de la asociación entre las estrategias de afrontamiento y la sobrecarga?",
                        "isOptimal": True,
                        "feedback": "¡Perfecto! Las específicas desglosan las variables por separado y luego su asociación, permitiendo responder íntegramente la pregunta central."
                    },
                    {
                        "text": "1) ¿Qué alteraciones genéticas causan el Alzheimer?; 2) ¿Cuál es el efecto de un fármaco antidepresivo en los cuidadores?",
                        "isOptimal": False,
                        "feedback": "Introduce variables y diseños biomédicos que no guardan ninguna correspondencia con la pregunta central."
                    }
                ]
            }
        ]
    },
    "m05": {
        "title": "Simulación 05 · Auditoría de objetivos (3 planos y 2 pruebas) e hipótesis",
        "context": "Estás en la Clase 6 traduciendo tu pregunta (*¿Qué diferencias existen en el agotamiento emocional entre enfermeros de hospitales públicos y privados del Departamento Central en 2026?*) en objetivos e hipótesis.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "Paso 1 · Elegir el verbo del Objetivo General (Plano 1)",
                "prompt": "Debes redactar el objetivo general de tu estudio comparativo. ¿Cuál de estos enunciados supera las dos pruebas de la cátedra (resultado enunciable y complemento de conocimiento)?",
                "options": [
                    {
                        "text": "Analizar los datos del Maslach Burnout Inventory en enfermeros para mejorar su salud mental en los hospitales de Central.",
                        "isOptimal": False,
                        "feedback": "Triple error: «Analizar» es Plano 2 (operación), «los datos del MBI» es un complemento material (falla Prueba 2) y «para mejorar su salud» es Plano 3 (finalidad práctica)."
                    },
                    {
                        "text": "Comprobar que los enfermeros de hospitales públicos sufren mucho más agotamiento emocional que los de hospitales privados.",
                        "isOptimal": False,
                        "feedback": "«Comprobar que...» es un verbo confirmatorio que presupone la conclusión antes de recolectar y analizar la evidencia."
                    },
                    {
                        "text": "Establecer las diferencias en el nivel de agotamiento emocional entre el personal de enfermería de hospitales públicos y privados del Departamento Central durante 2026.",
                        "isOptimal": True,
                        "feedback": "¡Impecable! «Establecer» es del Plano 1 (propósito cognitivo), rige un objeto de conocimiento («las diferencias en el nivel...») y al pasarlo a pasado en las conclusiones informa un hallazgo claro."
                    }
                ]
            },
            {
                "stepNumber": 2,
                "title": "Paso 2 · Formular los Objetivos Específicos sin caer en el cronograma",
                "prompt": "¿Qué conjunto de objetivos específicos cumple con la derivabilidad horizontal (conjuntamente suficientes e individualmente necesarios)?",
                "options": [
                    {
                        "text": "1) Revisar la bibliografía sobre burnout; 2) Solicitar permiso a los directores de hospital; 3) Aplicar el cuestionario MBI; 4) Tabular los gráficos en Excel.",
                        "isOptimal": False,
                        "feedback": "¡Alerta de objetivo-cronograma! Estás listando las tareas operativas de tu agenda de trabajo (Plano 2), no los conocimientos parciales que componen el objetivo general."
                    },
                    {
                        "text": "1) Estimar el nivel de agotamiento emocional en enfermeros de hospitales públicos; 2) Estimar el nivel de agotamiento emocional en enfermeros de hospitales privados; 3) Determinar la significación estadística de la diferencia entre ambos grupos; 4) Establecer si la diferencia se mantiene según antigüedad y turno.",
                        "isOptimal": True,
                        "feedback": "¡Excelente! Cada específico enuncia un logro de conocimiento de nivel igual o menor al general, y alcanzarlos todos equivale a responder el objetivo general."
                    }
                ]
            },
            {
                "stepNumber": 3,
                "title": "Paso 3 · Decidir sobre la hipótesis del estudio",
                "prompt": "Dado que tu estudio es cuantitativo de alcance comparativo entre dos sectores con antecedentes que reportan mayor sobrecarga en el sector público, ¿qué decisión tomas respecto a la hipótesis?",
                "options": [
                    {
                        "text": "Formulo una hipótesis de diferencia de grupos (Hi: el nivel de agotamiento emocional difiere significativamente entre enfermeros de hospitales públicos y privados) y su correspondiente hipótesis nula (H0).",
                        "isOptimal": True,
                        "feedback": "¡Correcto! Al comparar grupos con sustento en antecedentes teóricos y empíricos, corresponde formular hipótesis contrastables (Hi y H0)."
                    },
                    {
                        "text": "Formulo una hipótesis causal experimental afirmando que trabajar en el hospital público causa depresión clínica severa en el 100 % de los casos.",
                        "isOptimal": False,
                        "feedback": "Un diseño comparativo transversal sin manipulación no permite sostener causalidad experimental ni afirmaciones absolutas del 100 %."
                    }
                ]
            }
        ]
    },
    "m06": {
        "title": "Simulación 06 · Operacionalización y categorización con rigor teórico",
        "context": "Estás en la Clase 7 construyendo la matriz de variables de un estudio sobre Procrastinación Académica y Autoeficacia en universitarios de Ciudad del Este.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "Paso 1 · Redactar la definición conceptual (constitutiva)",
                "prompt": "Necesitas definir conceptualmente «Autoeficacia académica». ¿Qué opción eliges?",
                "options": [
                    {
                        "text": "Copio la definición de la palabra «eficaz» del diccionario general de la lengua.",
                        "isOptimal": False,
                        "feedback": "El diccionario común define el uso cotidiano del idioma, no el constructo psicológico científico dentro de una teoría."
                    },
                    {
                        "text": "La defino a partir de la Teoría Social Cognitiva (Bandura) como las creencias del estudiante sobre su propia capacidad para organizar y ejecutar las acciones requeridas para alcanzar un desempeño académico exitoso.",
                        "isOptimal": True,
                        "feedback": "¡Exacto! Una definición conceptual rigurosa se fundamenta en el marco teórico adoptado y delimita con precisión la naturaleza del constructo."
                    },
                    {
                        "text": "Escribo directamente «Puntaje de 10 a 50 en la escala EACA» como definición conceptual.",
                        "isOptimal": False,
                        "feedback": "Eso corresponde a la definición operacional de medida, no a la definición conceptual."
                    }
                ]
            },
            {
                "stepNumber": 2,
                "title": "Paso 2 · Desglosar Dimensiones e Indicadores",
                "prompt": "Ahora operacionalizas «Procrastinación académica» siguiendo tu marco conceptual. ¿Cuál es la cadena correcta Constructo → Dimensión → Indicador?",
                "options": [
                    {
                        "text": "Constructo: Procrastinación académica → Dimensiones: Postergación de actividades y Autorregulación académica → Indicadores: Frecuencia con que deja el estudio para último momento y planificación semanal de entregas.",
                        "isOptimal": True,
                        "feedback": "¡Muy bien! Pasaste ordenadamente del constructo abstracto a sus facetas teóricas (dimensiones) y de estas a sus manifestaciones empíricas observables (indicadores)."
                    },
                    {
                        "text": "Indicador: Procrastinación académica → Constructo: Ítem 3 → Dimensión: Estadística descriptiva.",
                        "isOptimal": False,
                        "feedback": "La jerarquía lógica está invertida y mezcla procedimientos estadísticos con niveles de abstracción conceptual."
                    }
                ]
            },
            {
                "stepNumber": 3,
                "title": "Paso 3 · Articular con una fase cualitativa complementaria",
                "prompt": "Si otro equipo del curso realiza un estudio cualitativo sobre los motivos subjetivos por los que los estudiantes postergan su tesis, ¿qué matriz debe construir?",
                "options": [
                    {
                        "text": "Una matriz de categorización con conceptos orientadores, categorías iniciales (ej. temor a la evaluación, bloqueos en la escritura, demandas laborales) y apertura a categorías emergentes.",
                        "isOptimal": True,
                        "feedback": "¡Excelente! Respetaste la especificidad de la ruta cualitativa sin forzar una escala numérica artificial."
                    },
                    {
                        "text": "Obligarlos a inventar una variable independiente manipulada en laboratorio.",
                        "isOptimal": False,
                        "feedback": "En un estudio cualitativo comprensivo no se manipulan variables independientes; se trabaja con categorías de análisis."
                    }
                ]
            }
        ]
    },
    "m07": {
        "title": "Simulación 07 · Selección del diseño, criterios de Kish y validez",
        "context": "Estás en la Clase 8. Un centro estudiantil de Asunción quiere evaluar un programa breve de regulación emocional de 6 semanas para disminuir la ansiedad ante los exámenes. Hay 80 estudiantes inscriptos voluntariamente, pero por capacidad de las salas solo pueden ingresar 40 en esta primera edición.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "Paso 1 · Evitar el diseño roto (`X  O` o `O1  X  O2`)",
                "prompt": "El coordinador del centro te sugiere: «Atendamos a los primeros 40 que llegaron y apliquémosles el test solo el último día (`X  O`)». ¿Qué problema tendría esa decisión?",
                "options": [
                    {
                        "text": "Ninguno, porque ahorraríamos papel y tiempo.",
                        "isOptimal": False,
                        "feedback": "Con el diseño `X  O` (Caso 1 de la Clase 8) el control es nulo: no sabrás cómo estaban antes ni qué habría ocurrido sin el programa."
                    },
                    {
                        "text": "Impediría determinar el efecto del programa: sin medición previa (`O1`) ni grupo de comparación, amenazas como la historia, la maduración y la selección invalidarían cualquier conclusión causal.",
                        "isOptimal": True,
                        "feedback": "¡Exacto! Diagnosticaste con precisión por qué el diseño `X  O` no permite sostener un objetivo de efectividad."
                    }
                ]
            },
            {
                "stepNumber": 2,
                "title": "Paso 2 · Transformar una restricción de cupo en un diseño más fuerte",
                "prompt": "Tienes 80 inscriptos motivados y solo 40 cupos ahora (los otros 40 recibirán el taller el mes siguiente en una segunda tanda). ¿Qué decisión metodológica tomas?",
                "options": [
                    {
                        "text": "Sorteo aleatoriamente (`R`) los 40 cupos de la primera tanda (Grupo Experimental) y dejo a los otros 40 en lista de espera como Grupo Control (`R O1 X O2 / R O1 O2`), midiendo a ambos al inicio y a las 6 semanas.",
                        "isOptimal": True,
                        "feedback": "¡Jugada maestra de la Clase 8! El sorteo de cupos con grupo en lista de espera introduce asignación aleatoria (`R`) de forma ética y sin costo, controlando la amenaza de autoselección."
                    },
                    {
                        "text": "Elijo manualmente para el taller solo a los 40 que tuvieron el puntaje más extremo de ansiedad y los comparo con alumnos que nunca quisieron anotarse.",
                        "isOptimal": False,
                        "feedback": "Eso introduciría simultáneamente regresión estadística a la media (por elegir puntajes extremos) y sesgo de selección (voluntarios vs. no voluntarios)."
                    }
                ]
            },
            {
                "stepNumber": 3,
                "title": "Paso 3 · Reconocer qué criterio de Kish se priorizó y cuál es el límite",
                "prompt": "Con tu diseño experimental en lista de espera (`R O1 X O2 / R O1 O2`) aplicado en esta universidad de Asunción, ¿qué debes declarar en las limitaciones?",
                "options": [
                    {
                        "text": "Que al priorizar el control interno sobre estudiantes voluntarios de una institución, la validez externa (representación a todos los universitarios del país) es limitada y debe evitarse generalizar sin cautela.",
                        "isOptimal": True,
                        "feedback": "¡Excelente! Aplicaste el equilibrio de Kish: ganaste control interno para probar el efecto del programa, y declaras honestamente el límite de representación."
                    },
                    {
                        "text": "Que los resultados representan estadísticamente a toda la población joven de América del Sur sin ninguna limitación.",
                        "isOptimal": False,
                        "feedback": "Ningún diseño maximiza al 100 % los tres criterios de Kish a la vez; reconocer los límites de generalización es signo de madurez metodológica."
                    }
                ]
            }
        ]
    },
    "m08": {
        "title": "Simulación 08 · Diseño del plan de muestreo y límites de inferencia",
        "context": "Estás en la Clase 9 definiendo el plan de selección de participantes para estudiar el bienestar psicológico en estudiantes de una facultad que cuenta con 1.200 alumnos matriculados distribuidos en 5 cursos y 2 turnos (mañana y noche).",
        "steps": [
            {
                "stepNumber": 1,
                "title": "Paso 1 · Identificar población, marco y unidad",
                "prompt": "La decanatura te facilita el padrón actualizado de los 1.200 matriculados activos con su curso y turno. ¿Qué representa ese listado?",
                "options": [
                    {
                        "text": "Es el marco muestral, que coincide con la población accesible de estudiantes matriculados (siendo cada estudiante la unidad de análisis y observación).",
                        "isOptimal": True,
                        "feedback": "¡Correcto! Tienes claramente diferenciados la población, el marco muestral (el padrón) y la unidad de análisis."
                    },
                    {
                        "text": "Es el instrumento psicométrico de medición.",
                        "isOptimal": False,
                        "feedback": "El listado de donde se extraen los casos es el marco muestral, no el instrumento de recolección."
                    }
                ]
            },
            {
                "stepNumber": 2,
                "title": "Paso 2 · Elegir el procedimiento de muestreo óptimo",
                "prompt": "Sabes que el 70 % cursa en el turno noche (muchos trabajan) y el 30 % en el turno mañana, y quieres que los 5 cursos y ambos turnos estén proporcionalmente representados con selección al azar. ¿Qué muestreo eliges?",
                "options": [
                    {
                        "text": "Muestreo aleatorio estratificado proporcional (estratificando por curso y turno, y sorteando al azar dentro de cada estrato).",
                        "isOptimal": True,
                        "feedback": "¡Excelente! Al contar con marco muestral completo y subgrupos relevantes (curso y turno), el muestreo aleatorio estratificado garantiza precisión y representatividad en todos los estratos."
                    },
                    {
                        "text": "Encuestar únicamente a mis 15 amigos del tercer curso turno noche a la salida del recreo.",
                        "isOptimal": False,
                        "feedback": "Teniendo acceso al marco muestral, recurrir a una muestra de amigos por conveniencia desaprovecha la posibilidad de representatividad y sesga los resultados."
                    }
                ]
            },
            {
                "stepNumber": 3,
                "title": "Paso 3 · Anticipar qué ocurre si el acceso cambia",
                "prompt": "Supongamos que en otro proyecto NO existe padrón disponible y el investigador solo puede evaluar a quienes acepten voluntariamente en tres centros comunitarios. ¿Cómo debe redactar su alcance de generalización?",
                "options": [
                    {
                        "text": "Declarar un muestreo no probabilístico con criterios explícitos de inclusión/exclusión y acotar las conclusiones a los participantes estudiados, sin extrapolar porcentajes a nivel nacional.",
                        "isOptimal": True,
                        "feedback": "¡Muy bien! Un muestreo no probabilístico bien justificado es válido si sus criterios de inclusión son claros y sus conclusiones respetan los límites de generalización."
                    },
                    {
                        "text": "Ocultar cómo se seleccionó la muestra y afirmar que fue aleatoria aunque haya sido por conveniencia.",
                        "isOptimal": False,
                        "feedback": "Ocultar o falsear el procedimiento de muestreo vulnera la transparencia metodológica y la ética científica."
                    }
                ]
            }
        ]
    },
    "m09": {
        "title": "Simulación 09 · Selección de instrumentos, psicometría y protocolo ético",
        "context": "Estás en la Clase 11 armando la matriz Objetivo → Dato → Fuente → Técnica → Instrumento y el apartado ético para un estudio sobre ansiedad social y apoyo familiar en adolescentes de 15 a 17 años.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "Paso 1 · Alinear técnica, instrumento y calidad psicométrica",
                "prompt": "Para medir «Ansiedad social», tienes dos opciones: A) redactar 5 preguntas propias sin pilotaje; B) utilizar una escala estandarizada validada en adolescentes hispanohablantes y reportar su consistencia interna ($\\alpha$ / $\\omega$). ¿Qué decides?",
                "options": [
                    {
                        "text": "Elijo la Opción B (escala con evidencias previas de validez y confiabilidad en población comparable), verifico su adecuación lingüística local mediante prueba piloto y reporto sus propiedades psicométricas.",
                        "isOptimal": True,
                        "feedback": "¡Excelente decisión! Usar instrumentos con evidencias documentadas de validez y confiabilidad —y verificar su comprensión local— protege la calidad de tus datos."
                    },
                    {
                        "text": "Elijo la Opción A porque inventar preguntas sin validación ni piloto es más rápido.",
                        "isOptimal": False,
                        "feedback": "Improvisar un instrumento sin validación de contenido ni estudio piloto compromete gravemente la validez y confiabilidad de los resultados."
                    }
                ]
            },
            {
                "stepNumber": 2,
                "title": "Paso 2 · Diseñar el consentimiento y asentimiento (menores de edad)",
                "prompt": "Tus participantes son adolescentes escolarizados de 15 a 17 años. ¿Qué requisito ético debes prever antes de aplicar cualquier instrumento?",
                "options": [
                    {
                        "text": "Aplicar el cuestionario por sorpresa sin avisar a las familias ni a los alumnos para que no mientan.",
                        "isOptimal": False,
                        "feedback": "Viola el principio ético de autonomía y las normativas de protección de niños, niñas y adolescentes."
                    },
                    {
                        "text": "Contar con autorización institucional, consentimiento informado de los padres o tutores legales y asentimiento informado libre y voluntario de los propios adolescentes.",
                        "isOptimal": True,
                        "feedback": "¡Correcto! Al trabajar con menores de edad se requiere tanto el consentimiento de los representantes legales como el asentimiento de los adolescentes."
                    }
                ]
            },
            {
                "stepNumber": 3,
                "title": "Paso 3 · Custodia de datos y prohibición en IA pública",
                "prompt": "Una vez recogidos los datos (o en la simulación del procedimiento), ¿cómo aseguras la privacidad y el manejo ético de la información?",
                "options": [
                    {
                        "text": "Reemplazo cualquier dato identificatorio por códigos (`ID_001`), resguardo la base en almacenamiento seguro con acceso restringido y prohíbo subir datos individuales o sensibles a chatbots de IA pública.",
                        "isOptimal": True,
                        "feedback": "¡Impecable! Cumples con los estándares de privacidad, custodia responsable e integridad en el uso de tecnologías."
                    },
                    {
                        "text": "Subo la planilla con nombres, teléfonos y puntajes de ansiedad a una IA pública gratuita para que redacte un informe por alumno.",
                        "isOptimal": False,
                        "feedback": "Línea roja ética absoluta: nunca se cargan datos personales o clínicos en plataformas públicas de IA."
                    }
                ]
            }
        ]
    },
    "m10": {
        "title": "Simulación 10 · Construcción del plan de análisis cuantitativo y cualitativo",
        "context": "Estás en la Clase 12 diseñando el plan de análisis para un proyecto que combina una fase cuantitativa (correlación entre horas de sueño y fatiga académica en 150 estudiantes) y una fase cualitativa (12 entrevistas sobre hábitos de estudio nocturnos).",
        "steps": [
            {
                "stepNumber": 1,
                "title": "Paso 1 · Planificar la preparación y el análisis descriptivo",
                "prompt": "En la ruta cuantitativa, antes de cruzar las variables, ¿qué pasos debes declarar en tu plan?",
                "options": [
                    {
                        "text": "Codificación y limpieza de la matriz de datos, revisión de valores perdidos/atípicos, cálculo de consistencia interna de la escala de fatiga y estadísticos descriptivos (media y DE, o mediana y RIC según normalidad).",
                        "isOptimal": True,
                        "feedback": "¡Excelente! Diferencias claramente la preparación de los datos y el análisis descriptivo previo a la contrastación inferencial."
                    },
                    {
                        "text": "Saltar directamente a escribir que la hipótesis fue probada sin revisar la base ni describir las variables.",
                        "isOptimal": False,
                        "feedback": "Sin limpieza de datos, análisis descriptivo ni verificación de supuestos, cualquier prueba inferencial puede ser espuria."
                    }
                ]
            },
            {
                "stepNumber": 2,
                "title": "Paso 2 · Seleccionar la prueba bivariada coherente",
                "prompt": "Para responder el objetivo *«Determinar el grado y la dirección de la relación entre las horas de sueño y el nivel de fatiga académica»*, ¿qué procedimiento especificas?",
                "options": [
                    {
                        "text": "Coeficiente de correlación r de Pearson (si se cumplen los supuestos de normalidad y linealidad) o rho de Spearman (si la distribución es asimétrica u ordinal), reportando magnitud, dirección y valor p.",
                        "isOptimal": True,
                        "feedback": "¡Exacto! Vinculaste un objetivo correlacional entre dos variables cuantitativas con el coeficiente bivariado correspondiente y su alternativa no paramétrica."
                    },
                    {
                        "text": "Una tabla de frecuencias simples de la variable sexo únicamente.",
                        "isOptimal": False,
                        "feedback": "Una tabla univariada de sexo no responde en absoluto a la relación entre horas de sueño y fatiga académica."
                    }
                ]
            },
            {
                "stepNumber": 3,
                "title": "Paso 3 · Planificar la ruta cualitativa con trazabilidad",
                "prompt": "Para las 12 entrevistas sobre hábitos nocturnos, ¿cómo describes el plan de análisis cualitativo en tu proyecto?",
                "options": [
                    {
                        "text": "Transcripción literal y anonimización del corpus, segmentación en unidades de significado, codificación inicial y axial, construcción de categorías temáticas, registro de memos y análisis de casos divergentes.",
                        "isOptimal": True,
                        "feedback": "¡Brillante! Has estructurado un plan de análisis mixto (cuantitativo y cualitativo) con total trazabilidad y sin inventar datos."
                    },
                    {
                        "text": "Inventar hoy mismo tres citas textuales falsas y ponerlas como si ya hubiéramos entrevistado a los alumnos.",
                        "isOptimal": False,
                        "feedback": "En el proyecto se planifica el procedimiento analítico; jamás se fabrican datos numéricos ni fragmentos textuales inexistentes."
                    }
                ]
            }
        ]
    },
    "m11": {
        "title": "Simulación 11 · Auditoría final de escritura, APA 7, Zotero e IA antes de la defensa",
        "context": "Estás en las Clases 13 y 14 realizando la auditoría final de tu borrador integrado antes de subirlo a Moodle y preparar tu defensa oral.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "Paso 1 · Auditar citación y paráfrasis en el marco teórico",
                "prompt": "Revisando un párrafo de un compañero de equipo, encuentras 6 líneas copiadas literalmente de un artículo de 2023 sin comillas y sin página, aunque al final puso `(Gómez, 2023)`. ¿Qué corrección aplicas?",
                "options": [
                    {
                        "text": "Lo dejo así porque como puso el apellido al final ya no es plagio.",
                        "isOptimal": False,
                        "feedback": "Copiar un texto literal sin comillas ni número de página, aunque se mencione al autor, sigue siendo una citación defectuosa e impropia en APA 7."
                    },
                    {
                        "text": "Reelaboramos la idea mediante una paráfrasis genuina escrita con nuestra propia estructura sintáctica y conectada con el argumento del párrafo (manteniendo la cita `Gómez, 2023`), o si la frase literal es indispensable, colocamos comillas y número de página.",
                        "isOptimal": True,
                        "feedback": "¡Excelente! Distingues con rigor entre paráfrasis genuina y cita textual directa según APA 7."
                    }
                ]
            },
            {
                "stepNumber": 2,
                "title": "Paso 2 · Verificar Zotero y la lista de Referencias",
                "prompt": "Generas la lista de referencias con Zotero. ¿Qué verificación realizas antes de dar por cerrado el apartado?",
                "options": [
                    {
                        "text": "Compruebo la correspondencia 1 a 1 entre todas las citas del texto y las referencias finales, y reviso en Zotero que cada entrada tenga autoría, año, título, revista en cursiva, volumen y DOI correctos.",
                        "isOptimal": True,
                        "feedback": "¡Exacto! Zotero automatiza el formato, pero la calidad de la referencia depende de tu revisión y curaduría de los metadatos."
                    },
                    {
                        "text": "Confío ciegamente en el botón automático de Zotero sin leer la lista final.",
                        "isOptimal": False,
                        "feedback": "Si los metadatos importados tenían errores (mayúsculas, autores incompletos o páginas faltantes), Zotero reproducirá esos errores en tu bibliografía."
                    }
                ]
            },
            {
                "stepNumber": 3,
                "title": "Paso 3 · Transparencia de IA y preparación de la defensa",
                "prompt": "Usaste un asistente de IA para pedir diagnóstico de claridad en dos párrafos escritos por ti y luego decidiste qué correcciones aceptar. ¿Cómo cierras tu entrega y preparas tu defensa?",
                "options": [
                    {
                        "text": "Incluyo la declaración final de uso de IA (herramienta, propósito, sección, verificación y decisión propia) y preparo una síntesis oral defendiendo la cadena Problema → Objetivo → Variables → Diseño → Muestra → Instrumento → Análisis y sus principales límites.",
                        "isOptimal": True,
                        "feedback": "¡Felicitaciones! Has completado los 11 módulos del Centro de Entrenamiento con rigor metodológico, integridad académica y autonomía intelectual."
                    },
                    {
                        "text": "Oculto el uso de la herramienta y en la defensa leo diapositivas llenas de texto sin explicar por qué elegí mi diseño.",
                        "isOptimal": False,
                        "feedback": "En la defensa del Plan 2026 se evalúa la coherencia de la cadena metodológica, la capacidad de justificar límites y la transparencia en el uso de herramientas."
                    }
                ]
            }
        ]
    }
}

EXTRA_QUIZ_ITEMS = {
    "m02": [
        {
            "id": "m02-extra-01",
            "tipo": "opcion_multiple",
            "subtema": "busqueda",
            "enunciado": "En una ecuación de búsqueda bibliográfica, ¿qué efecto tiene utilizar el operador booleano **OR** entre dos sinónimos dentro de un paréntesis, por ejemplo `(\"agotamiento laboral\" OR \"burnout\")`?",
            "opciones": [
                "Amplía la recuperación, incluyendo documentos que contengan cualquiera de los dos términos",
                "Restringe la búsqueda únicamente a documentos que contengan ambos términos a la vez",
                "Excluye todos los artículos publicados en idioma inglés",
                "Sustituye la necesidad de verificar el texto completo del artículo"
            ],
            "correcta": 0,
            "dificultad": 2,
            "feedback": {
                "correcta": "¡Exacto! El operador OR reúne sinónimos o equivalentes en distintos idiomas y amplía la sensibilidad de la búsqueda; luego se combina con AND para intersectar conceptos distintos.",
                "incorrecta": "Recuerda la diferencia clave: OR une sinónimos y amplía la búsqueda; AND intersecta conceptos distintos y restringe los resultados."
            }
        },
        {
            "id": "m02-extra-02",
            "tipo": "opcion_multiple",
            "subtema": "ia_responsable",
            "enunciado": "Según el **Protocolo VERA** de la cátedra para el uso ético de Inteligencia Artificial en la revisión y búsqueda, ¿qué exige el primer paso (**V — Ver fuente**)?",
            "opciones": [
                "Abrir y comprobar el documento original en una base o repositorio real, sin citar jamás desde la respuesta del chatbot",
                "Verificar únicamente que la referencia sugerida por la IA tenga sangría francesa y formato APA 7",
                "Pedirle a un segundo chatbot que confirme si la cita generada por el primero existe",
                "Confiar en las referencias generadas por IA siempre que incluyan un número de DOI de apariencia válida"
            ],
            "correcta": 0,
            "dificultad": 1,
            "feedback": {
                "correcta": "¡Correcto! Los modelos de lenguaje pueden «alucinar» autores, títulos y DOIs verosímiles pero inexistentes. Toda fuente debe localizarse, abrirse y leerse en su publicación original.",
                "incorrecta": "Cuidado: un DOI o formato APA generado por un chatbot puede ser una alucinación estadística. El paso V (Ver fuente) exige abrir siempre el documento original."
            }
        },
        {
            "id": "m02-extra-03",
            "tipo": "opcion_multiple",
            "subtema": "ia_responsable",
            "enunciado": "Un estudiante introduce su tema en un chatbot, le pide que «elija cuál debe ser el problema de investigación y redacte la justificación con 5 referencias», y entrega ese texto como propio. Según el Plan 2026, esta práctica es:",
            "opciones": [
                "No permitida, porque delega decisiones intelectuales nucleares y arriesga incluir citas inventadas sin declaración ni verificación",
                "Recomendable, porque garantiza que el planteamiento no tenga errores ortográficos",
                "Aceptable siempre que el estudiante cambie el tipo de letra antes de subirlo a Moodle",
                "Obligatoria para ahorrar tiempo en la etapa de delimitación"
            ],
            "correcta": 0,
            "dificultad": 2,
            "feedback": {
                "correcta": "¡Muy bien! En la asignatura la IA puede usarse para explorar sinónimos, detectar ambigüedades o autoevaluarse, pero jamás para delegar la lectura, la elección del problema ni inventar referencias.",
                "incorrecta": "Revisa la sección 4 del Plan 2026: delegar las decisiones metodológicas o presentar texto e referencias generadas por IA sin verificación está expresamente prohibido."
            }
        },
        {
            "id": "m02-extra-04",
            "tipo": "opcion_multiple",
            "subtema": "delimitacion",
            "enunciado": "Un estudiante pasa de proponer **«La salud mental»** a proponer **«Sintomatología ansiosa y calidad del sueño en estudiantes de primer año de Psicología de una universidad de Asunción durante 2026»**. ¿Qué operación metodológica realizó?",
            "opciones": [
                "Pasó de un campo general a un tema delimitado especificando fenómeno, población, espacio y tiempo",
                "Realizó el análisis inferencial de los resultados finales de la tesis",
                "Reemplazó un problema empírico por un dilema filosófico no verificable",
                "Eliminó las variables para no tener que revisar literatura científica"
            ],
            "correcta": 0,
            "dificultad": 3,
            "feedback": {
                "correcta": "¡Excelente! Recortar el fenómeno específico, la población/unidad de análisis, el contexto geográfico/institucional y el periodo temporal convierte un campo inabarcable en un tema viable.",
                "incorrecta": "Observa los cuatro componentes que agregó al enunciado: variables concretas, quiénes (estudiantes de 1.er año), dónde (Asunción) y cuándo (2026). Eso es delimitar el tema."
            }
        }
    ],
    "m06": [
        {
            "id": "m06-0021",
            "tipo": "opcion_multiple",
            "subtema": "definiciones",
            "enunciado": "En el proceso de operacionalización de un concepto complejo, ¿cuál es la secuencia lógica que va de lo más abstracto a lo más concreto y observable?",
            "opciones": [
                "Constructo → dimensión → indicador",
                "Indicador → dimensión → constructo",
                "Constructo → indicador → marco teórico",
                "Dimensión → constructo → hipótesis"
            ],
            "correcta": 0,
            "dificultad": 2,
            "feedback": {
                "correcta": "¡Correcto! En la operacionalización se parte del constructo teórico abstracto, se lo desglosa en sus facetas o dimensiones y, finalmente, en indicadores observables que permiten construir o elegir los ítems.",
                "incorrecta": "Revisa la jerarquía de abstracción de la Clase 7: primero está el constructo teórico, luego sus dimensiones y finalmente los indicadores empíricos observables."
            }
        }
    ],
    "m09": [
        {
            "id": "m09-fix-01",
            "tipo": "opcion_multiple",
            "subtema": "calidad_medicion",
            "enunciado": "En psicometría y metodología de la investigación, la **confiabilidad (o fiabilidad)** de un instrumento se refiere principalmente a:",
            "opciones": [
                "La consistencia y precisión de las puntuaciones obtenidas al medir una variable",
                "La extensión geográfica de la población donde se aplica el estudio",
                "La cantidad de páginas que ocupa el marco teórico del proyecto",
                "La originalidad literaria con que se redactan las conclusiones finales"
            ],
            "correcta": 0,
            "dificultad": 1,
            "feedback": {
                "correcta": "¡Exacto! La confiabilidad indica el grado en que las puntuaciones de un instrumento son consistentes, reproducibles y libres de error aleatorio de medición.",
                "incorrecta": "Recuerda que la confiabilidad es una propiedad psicométrica de las puntuaciones del instrumento vinculada a su consistencia y precisión."
            }
        },
        {
            "id": "m09-fix-02",
            "tipo": "opcion_multiple",
            "subtema": "instrumentos",
            "enunciado": "Construir o seleccionar un instrumento de recolección de datos **sin haber definido ni operacionalizado previamente las variables** implica:",
            "opciones": [
                "Un alto riesgo de incoherencia metodológica y pérdida de validez de constructo",
                "Una garantía automática de obtener resultados estadísticamente significativos",
                "Una mayor velocidad para aprobar el comité de ética sin consentimiento",
                "Una ventaja técnica que evita realizar la revisión de la literatura"
            ],
            "correcta": 0,
            "dificultad": 2,
            "feedback": {
                "correcta": "¡Muy bien! Los ítems de un instrumento deben responder a los indicadores y dimensiones de las variables; sin operacionalización previa se mide a ciegas.",
                "incorrecta": "En la cadena de coherencia, el instrumento depende directamente de los objetivos y de las variables operacionalizadas (o categorías definidas)."
            }
        },
        {
            "id": "m09-fix-03",
            "tipo": "opcion_multiple",
            "subtema": "instrumentos",
            "enunciado": "¿Cómo se define con precisión un **instrumento de medición** dentro del diseño metodológico?",
            "opciones": [
                "Un conjunto estructurado de reactivos o pautas diseñado para registrar indicadores de las variables",
                "Un procedimiento matemático utilizado para calcular el tamaño de la muestra probabilística",
                "Un resumen bibliográfico de los antecedentes internacionales de los últimos cinco años",
                "Una suposición tentativa sobre la dirección causal entre dos constructos teóricos"
            ],
            "correcta": 0,
            "dificultad": 1,
            "feedback": {
                "correcta": "¡Correcto! El instrumento es la herramienta concreta (escala, cuestionario, pauta de observación o guía de entrevista) donde se operacionalizan los indicadores para registrar los datos.",
                "incorrecta": "Distingue el instrumento de recolección de otras piezas del proyecto como la fórmula muestral, los antecedentes o la hipótesis."
            }
        },
        {
            "id": "m09-extra-04",
            "tipo": "opcion_multiple",
            "subtema": "tecnicas",
            "enunciado": "En la cadena **Objetivo → Información → Fuente → Técnica → Instrumento** (Clase 11), si un estudio aplica la *Escala de Ansiedad de Beck (BAI)* mediante una encuesta a estudiantes universitarios, ¿cuál es la distinción correcta?",
            "opciones": [
                "Fuente: los estudiantes; Técnica: la encuesta / autoinforme; Instrumento: la Escala de Ansiedad de Beck (BAI)",
                "Fuente: la Escala de Beck; Técnica: los estudiantes; Instrumento: la universidad",
                "Fuente: el software estadístico; Técnica: la hipótesis; Instrumento: el marco teórico",
                "No existe ninguna diferencia entre fuente, técnica e instrumento porque son sinónimos"
            ],
            "correcta": 0,
            "dificultad": 2,
            "feedback": {
                "correcta": "¡Excelente! La fuente es quién o qué provee el dato (los estudiantes), la técnica es el procedimiento general de obtención (encuesta/autoinforme) y el instrumento es la herramienta específica (Escala BAI).",
                "incorrecta": "Revisa la cadena de la Clase 11: Fuente (de quién proviene el dato) ≠ Técnica (cómo se aborda) ≠ Instrumento (con qué herramienta específica se registra)."
            }
        },
        {
            "id": "m09-extra-05",
            "tipo": "opcion_multiple",
            "subtema": "calidad_medicion",
            "enunciado": "Un equipo obtiene un coeficiente Alfa de Cronbach de **$\\alpha = .91$** en una escala, pero el juicio de expertos advierte que los ítems evalúan *extroversión social* en lugar de *empatía cognitiva*, que era la variable del estudio. ¿Qué ocurre en este caso?",
            "opciones": [
                "El instrumento presenta alta consistencia interna (confiabilidad), pero carece de validez de contenido y de constructo para ese estudio",
                "El instrumento es totalmente válido porque cualquier Alfa mayor a .80 demuestra validez de constructo automática",
                "El estudio no necesita marco conceptual porque el Alfa de Cronbach reemplaza la teoría",
                "La muestra fue seleccionada por muestreo aleatorio estratificado"
            ],
            "correcta": 0,
            "dificultad": 3,
            "feedback": {
                "correcta": "¡Brillante! Un instrumento puede medir de forma muy consistente ($\\alpha = .91$) el constructo equivocado. La confiabilidad es necesaria, pero no garantiza por sí sola que estés midiendo lo que pretendes medir (validez).",
                "incorrecta": "No confundas confiabilidad (consistencia de las puntuaciones) con validez (que el instrumento mida efectivamente el constructo teórico propuesto)."
            }
        },
        {
            "id": "m09-extra-06",
            "tipo": "opcion_multiple",
            "subtema": "etica",
            "enunciado": "Respecto al manejo ético de los datos y el uso de Inteligencia Artificial (Clase 11 del Plan 2026), ¿cuál de las siguientes acciones constituye una **falta ética grave**?",
            "opciones": [
                "Subir transcripciones de entrevistas con nombres reales o datos clínicos sensibles de participantes a servicios públicos de IA",
                "Sustituir los nombres de los participantes por códigos alfanuméricos desde el momento de la recolección o transcripción",
                "Explicitar en el consentimiento informado el objetivo del estudio, la voluntariedad y el derecho a retirarse sin perjuicio",
                "Establecer un plan de custodia con acceso restringido y plazo de eliminación de los registros crudos"
            ],
            "correcta": 0,
            "dificultad": 1,
            "feedback": {
                "correcta": "¡Exacto! El Plan 2026 prohíbe taxativamente cargar datos personales, sensibles o confidenciales en plataformas públicas de IA, pues vulnera la privacidad y el secreto profesional.",
                "incorrecta": "Las opciones de anonimización por códigos, consentimiento informado y custodia segura son buenas prácticas éticas; lo prohibido es subir datos sensibles o identificables a IAs públicas."
            }
        },
        {
            "id": "m09-extra-07",
            "tipo": "opcion_multiple",
            "subtema": "etica",
            "enunciado": "Si una investigación en Psicología involucra a **adolescentes escolarizados de 14 a 16 años**, ¿qué recaudo ético específico debe preverse en el procedimiento?",
            "opciones": [
                "Obtener autorización institucional, el consentimiento informado de los padres o tutores legales y el asentimiento informado de los propios adolescentes",
                "Aplicar las escalas sin informar a los padres ni a los estudiantes para evitar el efecto Hawthorne",
                "Pedir autorización únicamente al delegado estudiantil del curso el mismo día de la prueba",
                "Exigir que los adolescentes firmen un contrato obligándose a no abandonar jamás el estudio"
            ],
            "correcta": 0,
            "dificultad": 3,
            "feedback": {
                "correcta": "¡Muy bien! En investigaciones con personas menores de edad es indispensable combinar el consentimiento de los representantes legales con el asentimiento libre e informado de los propios adolescentes.",
                "incorrecta": "Con participantes menores de edad no basta el permiso de la escuela: se requiere consentimiento de padres/tutores y asentimiento del adolescente, garantizando siempre el derecho a retirarse."
            }
        }
    ],
    "m11": [
        {
            "id": "m11-0009",
            "tipo": "opcion_multiple",
            "subtema": "escritura",
            "enunciado": "¿Cuál es la finalidad primordial de un informe o borrador académico de investigación?",
            "opciones": [
                "Exponer opiniones personales sin respaldo empírico ni teórico",
                "Comunicar resultados o decisiones de investigación de forma sistemática y trazable",
                "Resumir textos aislados sin conectarlos con una pregunta propia",
                "Presentar datos crudos o extensos anexos sin ningún análisis"
            ],
            "correcta": 1,
            "dificultad": 1,
            "feedback": {
                "correcta": "¡Correcto! La escritura académica busca comunicar de manera clara, estructurada, argumentada y verificable el proceso y las decisiones de la investigación.",
                "incorrecta": "Un trabajo académico no es un ensayo de opinión libre ni una acumulación de resúmenes sueltos: exige sistematicidad, coherencia y trazabilidad."
            }
        },
        {
            "id": "m11-extra-01",
            "tipo": "opcion_multiple",
            "subtema": "citacion",
            "enunciado": "Un estudiante toma un párrafo de un artículo científico, mantiene exactamente su estructura sintáctica original y solo cambia cuatro palabras por sinónimos usando un diccionario, sin comillas. En escritura académica (Clase 13), esto constituye:",
            "opciones": [
                "Una copia encubierta o falsa paráfrasis («patchwriting»), que vulnera la integridad académica",
                "Una síntesis comparada de alto nivel recomendada por el manual APA 7",
                "Una cita narrativa ejemplar que demuestra dominio conceptual",
                "Un procedimiento válido siempre que se utilice el gestor bibliográfico Zotero"
            ],
            "correcta": 0,
            "dificultad": 2,
            "feedback": {
                "correcta": "¡Exacto! Cambiar solo algunas palabras por sinónimos manteniendo el calco sintáctico del autor es una falsa paráfrasis (*patchwriting*). Parafrasear exige comprender la idea y explicarla con estructura propia más la cita correspondiente.",
                "incorrecta": "Recuerda que la paráfrasis genuina no consiste en reemplazar palabras sueltas por sinónimos, sino en reformular la idea con tu propia estructura argumentativa y atribuir la fuente."
            }
        },
        {
            "id": "m11-extra-02",
            "tipo": "opcion_multiple",
            "subtema": "citacion",
            "enunciado": "¿Cuál es el principio correcto respecto al uso del gestor bibliográfico **Zotero** en la preparación del borrador (Clase 13)?",
            "opciones": [
                "Zotero es un apoyo valioso para organizar y citar, pero el estudiante debe revisar y corregir manualmente los metadatos importados antes de entregar",
                "Zotero garantiza al 100 % que ninguna referencia tenga errores de mayúsculas, autores o DOI, por lo que no requiere revisión humana",
                "Zotero redacta automáticamente el marco teórico y decide cuáles son los vacíos de conocimiento del proyecto",
                "Zotero solo sirve para libros impresos del siglo XX y no admite artículos con DOI"
            ],
            "correcta": 0,
            "dificultad": 2,
            "feedback": {
                "correcta": "¡Muy bien! Como señala el Plan 2026, Zotero se usa como apoyo y no como garantía automática: los metadatos capturados de la web o de PDFs suelen requerir limpieza manual (autores, títulos, revista, DOI).",
                "incorrecta": "Zotero facilita enormemente la citación, pero si el registro importado tiene errores de carga (ej. todo en mayúsculas o falta de revista), el programa reproducirá ese error a menos que lo verifiques."
            }
        },
        {
            "id": "m11-extra-03",
            "tipo": "opcion_multiple",
            "subtema": "apa",
            "enunciado": "Al realizar la auditoría de correspondencia entre citas en el texto y lista final de Referencias en formato **APA 7**, ¿qué regla debe cumplirse sin excepción?",
            "opciones": [
                "Toda fuente citada en el texto debe aparecer en la lista de Referencias y toda entrada de la lista de Referencias debe haber sido citada en el texto",
                "La lista de Referencias debe incluir al menos veinte libros adicionales que el autor nunca citó en el cuerpo del trabajo",
                "Las citas parentéticas del texto solo llevan el nombre de pila del autor sin el año de publicación",
                "Solo se incluyen en las Referencias las citas textuales con comillas, omitiendo las fuentes parafraseadas"
            ],
            "correcta": 0,
            "dificultad": 1,
            "feedback": {
                "correcta": "¡Correcto! En APA 7 la correspondencia entre citas en el cuerpo del texto (tanto textuales como parafraseadas) y la lista final de Referencias es estrictamente biunívoca (1 a 1).",
                "incorrecta": "En APA 7 no deben existir «citas huérfanas» (citadas en el texto pero ausentes al final) ni «referencias de relleno» (enlistadas al final pero jamás citadas en el texto)."
            }
        },
        {
            "id": "m11-extra-04",
            "tipo": "opcion_multiple",
            "subtema": "ia_responsable",
            "enunciado": "En la Clase 13, una estudiante escribe su propio párrafo de síntesis y le pide a una herramienta de IA que «señale oraciones ambiguas o saltos lógicos sin reescribir el texto», decidiendo luego qué ajustes aplicar. ¿Qué debe hacer al entregar su trabajo?",
            "opciones": [
                "Incluir la declaración de uso de IA indicando herramienta, propósito (revisión diagnóstica de claridad), sección afectada, verificación y decisión final propia",
                "Ocultar que utilizó la herramienta porque cualquier mención de IA anula automáticamente la entrega",
                "Poner al chatbot como primer coautor del proyecto en la portada institucional",
                "Sustituir sus fuentes verificadas por las que el chatbot invente en ese momento"
            ],
            "correcta": 0,
            "dificultad": 2,
            "feedback": {
                "correcta": "¡Excelente! Usar IA para auditar claridad sobre un texto propio conservando la autoría y declarándolo de forma transparente cumple ejemplarmente con el protocolo de la asignatura.",
                "incorrecta": "Un chatbot no puede ser autor ni debe ocultarse su uso cuando la asignatura pide declararlo: el uso ético para revisión diagnóstica es válido y se acompaña con la declaración mínima."
            }
        },
        {
            "id": "m11-extra-05",
            "tipo": "opcion_multiple",
            "subtema": "escritura",
            "enunciado": "Durante el taller de integración y preparación de defensa (Clase 14), al auditar el borrador completo se detecta que el objetivo general habla de **«burnout»**, el marco conceptual define **«estrés agudo»** y el instrumento mide **«depresión»**. ¿Cómo se clasifica esta corrección?",
            "opciones": [
                "Corrección esencial de alto impacto, porque rompe la cadena de coherencia estructural del proyecto",
                "Corrección meramente editorial o estética que puede ignorarse hasta después de la defensa",
                "Ventaja metodológica que demuestra variedad de vocabulario y uso de sinónimos elegantes",
                "Detalle menor de formato que se soluciona cambiando el interlineado a doble espacio"
            ],
            "correcta": 0,
            "dificultad": 3,
            "feedback": {
                "correcta": "¡Exacto! En terminología científica, cambiar el nombre del constructo entre secciones no es «riqueza estilística», sino ruptura de la cadena de coherencia (error esencial de alto impacto).",
                "incorrecta": "En escritura literaria se buscan sinónimos para no repetir palabras; en metodología científica, en cambio, los constructos centrales deben nombrarse con total consistencia desde la pregunta hasta el instrumento."
            }
        },
        {
            "id": "m11-extra-06",
            "tipo": "opcion_multiple",
            "subtema": "citacion",
            "enunciado": "¿Qué diferencia fundamental existe entre una **paráfrasis** de una fuente y una **síntesis** en la redacción del estado del arte?",
            "opciones": [
                "La paráfrasis reformula con palabras propias la idea de una fuente; la síntesis integra y pone en diálogo los aportes, coincidencias o tensiones de varias fuentes torno a un eje",
                "La paráfrasis lleva cita en APA 7, mientras que la síntesis nunca debe citar a ningún autor",
                "La paráfrasis solo se usa en estudios cualitativos y la síntesis solo en diseños experimentales",
                "La síntesis consiste en copiar y pegar los resúmenes textuales de cinco artículos uno debajo del otro"
            ],
            "correcta": 0,
            "dificultad": 3,
            "feedback": {
                "correcta": "¡Impecable! Mientras la paráfrasis trabaja sobre la comprensión y reformulación de un texto, la síntesis articula múltiples fuentes en torno a una idea rectora (convergencia, contraste, límites).",
                "incorrecta": "Tanto la paráfrasis como la síntesis llevan citas APA 7: la diferencia es que la síntesis integra varias fuentes en diálogo temático en lugar de resumir un texto aislado."
            }
        }
    ]
}


def generate_formative_feedback(item, mod_id):
    """
    Genera retroalimentación formativa específica, rigurosa y clara para aquellos
    ítems del banco que tenían feedback: null o incompleto.
    """
    q = item["enunciado"].strip()
    opts = item["opciones"]
    corr_idx = item["correcta"]
    corr_text = opts[corr_idx].strip()
    sub = item.get("subtema", "")
    tipo = item.get("tipo", "opcion_multiple")
    ql = q.lower()
    cl = corr_text.lower()

    rationale = ""
    hint = ""

    if "empíric" in ql or "empiric" in cl or "observación" in cl:
        rationale = "En el enfoque científico, la evidencia empírica proviene de observaciones y registros sistemáticos de la realidad que permiten contrastar las conjeturas teóricas."
        hint = "Distingue entre datos observables y verificables (evidencia empírica) frente a opiniones personales o suposiciones sin contrastar."
    elif "reproducibilidad" in cl or "repetirse" in ql or "replic" in ql or "replic" in cl:
        rationale = "La reproducibilidad y el carácter público de los procedimientos permiten que otros investigadores verifiquen de forma independiente los hallazgos."
        hint = "Piensa en qué propiedad del método científico permite que otro equipo repita el procedimiento para comprobar los resultados."
    elif "deducción" in cl or "deductiv" in cl or "general a lo particular" in ql:
        rationale = "El razonamiento deductivo parte de principios o teorías generales para derivar consecuencias o hipótesis particulares contrastables."
        hint = "Recuerda: de lo general (teoría) a lo particular (consecuencia observable) es deducción; de casos particulares a generalizaciones es inducción."
    elif "inducción" in cl or "inductiv" in cl or "específicas a principios generales" in ql:
        rationale = "El razonamiento inductivo parte de la observación de casos particulares para formular regularidades o generalizaciones empíricas."
        hint = "Distingue la dirección del razonamiento: partir de observaciones singulares hacia patrones generales corresponde a la inducción."
    elif "falsable" in cl or "falsabilidad" in cl or "refut" in ql or "popper" in ql:
        rationale = "Para que una proposición sea científica debe ser falsable o contrastable: debe existir alguna observación empírica posible capaz de refutarla si fuera falsa."
        hint = "Una afirmación que se acomoda a cualquier resultado y nunca puede ponerse a prueba empírica no cumple el criterio de contrastabilidad."
    elif "grupo de control" in ql or "grupo control" in ql or "grupo de comparación" in cl:
        rationale = "El grupo de control o comparación permite establecer qué habría ocurrido en ausencia de la intervención (X) y descartar explicaciones rivales como historia o maduración."
        hint = "En el diseño experimental, comparar la condición tratada frente a un grupo control es indispensable para aislar el efecto de la variable independiente."
    elif mod_id == "m01":
        rationale = "El enfoque científico se caracteriza por ser sistemático, empírico, controlado y crítico, articulando teoría y observación para superar los sesgos del sentido común."
        hint = "Repasa las características de la ciencia según Kerlinger y Lee (Cap. 1): sistematicidad, control de explicaciones alternativas y carácter público/autocorrectivo."
    elif mod_id == "m02":
        if "delimit" in ql or "delimit" in cl or "población" in cl or "específic" in cl:
            rationale = "Delimitar un tema implica acotar con precisión el fenómeno, la población o unidades de análisis, el contexto espacial/institucional y el alcance temporal."
            hint = "Un tema bien delimitado evita tanto la vaguedad inabarcable como la falta de viabilidad práctica."
        elif "subjetiv" in ql or "objetiv" in ql or "factibilidad" in ql or "viabilidad" in ql or "recurso" in cl:
            rationale = "La elección responsable del tema equilibra factores subjetivos (interés, preparación, tiempo disponible) y factores objetivos (fuentes accesibles, viabilidad empírica y pertinencia)."
            hint = "Evalúa si la condición mencionada depende del investigador y sus posibilidades reales de acceso, tiempo y recursos bibliográficos."
        else:
            rationale = "Una buena elección y búsqueda inicial parte de un tema delimitado y localiza fuentes académicas verificables mediante descriptores pertinentes."
            hint = "Revisa en la Clase 3 cómo pasar de un campo de interés amplio a un tema viable y verificable en bases académicas."
    elif mod_id == "m03":
        if "marco teórico" in ql or "teoría" in ql or "teoria" in sub:
            rationale = "La teoría no es un adorno formal: proporciona el sistema de conceptos y proposiciones que permite explicar por qué ocurre el fenómeno y orientar las preguntas e hipótesis."
            hint = "Recuerda la heurística de la Clase 4: el marco conceptual define («X es...»), mientras que el marco teórico explica el mecanismo («X se relaciona con Y porque...»)."
        else:
            rationale = "La revisión de la literatura es un proceso sistemático de búsqueda, evaluación y síntesis crítica de fuentes verificadas para establecer qué se sabe y qué vacío persiste."
            hint = "Distingue entre resumir textos aislados («lista de compras») y sintetizar críticamente antecedentes de fuentes arbitradas y trazables."
    elif mod_id == "m04":
        rationale = "El planteamiento del problema articula contexto, evidencia previa, vacío de conocimiento y relevancia, desembocando en preguntas claras, delimitadas y empíricamente investigables."
        hint = "Verifica los tres criterios de Kerlinger para el problema: relación entre variables (o caracterización precisa), formulación clara como pregunta y posibilidad de prueba empírica."
    elif mod_id == "m05":
        if sub == "hipotesis" or "hipótesis" in ql or "hipotesis" in ql:
            rationale = "Una hipótesis científica es una proposición tentativa y contrastable empíricamente que anticipa una relación entre variables (mientras que la hipótesis nula H0 plantea la ausencia de relación o diferencia)."
            hint = "Recuerda que las hipótesis se formulan antes de recolectar los datos a partir del marco teórico y deben ser específicas, conceptualmente claras y empíricamente verificables."
        else:
            rationale = "Un objetivo de investigación vive en el Plano 1 (propósito cognitivo: identificar, describir, estimar, determinar, establecer) y enuncia el conocimiento nuevo que el estudio producirá, no tareas del método ni finalidades prácticas."
            hint = "Aplica las 2 pruebas de la Clase 6: ¿el enunciado puede pasarse a pasado como un hallazgo en las conclusiones? ¿Su verbo rige un objeto de conocimiento y no una tarea metodológica?"
    elif mod_id == "m06":
        rationale = "En la operacionalización se traduce un constructo abstracto en dimensiones e indicadores observables; en diseños causales o asociativos, la variable independiente (VI) es el antecedente o factor manipulado y la dependiente (VD) es el efecto o resultado medido."
        hint = "Distingue entre definición conceptual (qué significa el constructo en la teoría) y definición operacional (cómo se medirá u observará concretamente a través de sus indicadores)."
    elif mod_id == "m07":
        rationale = "El diseño de investigación es la arquitectura lógica para responder la pregunta y controlar varianza extraña: los diseños experimentales manipulan la VI (X) y asignan al azar (R), mientras que los no experimentales (transversales o longitudinales) observan los fenómenos sin manipularlos."
        hint = "Revisa si existe manipulación deliberada de la variable independiente (experimental/cuasiexperimental) o medición sin intervención en uno (transversal) o varios momentos (longitudinal)."
    elif mod_id == "m08":
        rationale = "La muestra es el subconjunto extraído de la población; en el muestreo probabilístico todos los elementos del marco muestral tienen probabilidad conocida de selección (permitiendo estimar el error muestral), mientras que en el no probabilístico o intencional la selección responde a criterios o accesibilidad."
        hint = "Recuerda que aumentar el tamaño de la muestra reduce el error muestral aleatorio, pero solo el procedimiento de selección probabilístico evita el sesgo de selección para generalizar estadísticamente."
    elif mod_id == "m09":
        rationale = "Los instrumentos de recolección traducen las variables operacionalizadas en ítems claros y comprensibles, cuya calidad exige evidencias de validez, confiabilidad, pilotaje previo y resguardo ético."
        hint = "Distingue entre técnica e instrumento y recuerda que ningún instrumento forma parte del problema o de la hipótesis: es la herramienta empírica para registrar los datos."
    elif mod_id == "m10":
        if sub == "analisis_cualitativo" or "cualitativ" in ql or "saturación" in ql or "triangulación" in ql:
            rationale = "En el análisis cualitativo se organiza y codifica sistemáticamente el corpus textual para construir categorías y temas con trazabilidad, empleando criterios de rigor como la triangulación y la saturación teórica."
            hint = "Repasa los conceptos de la ruta cualitativa (Clase 12): codificación de unidades de significado, categorización, saturación (cuando no emergen nuevos temas) y triangulación."
        else:
            rationale = "El plan de análisis cuantitativo selecciona estadísticos descriptivos (frecuencias, media, mediana, desviación estándar) e inferenciales en estricta correspondencia con el objetivo, el diseño y el nivel de medición de las variables."
            hint = "Distingue entre estadística descriptiva (resumir y caracterizar los datos de la muestra) y estadística inferencial (contrastar hipótesis y estimar parámetros poblacionales)."
    else:
        rationale = "La escritura científica y el estilo APA 7 garantizan claridad argumentativa, atribución ética de las fuentes y correspondencia exacta entre citas en el texto y referencias finales."
        hint = "Verifica las normas de integridad académica, citación y estructura del informe de investigación."

    if tipo == "verdadero_falso":
        correcta_fb = f"¡Correcto! La afirmación es **{corr_text}**. {rationale}"
        incorrecta_fb = f"Respuesta incorrecta (la opción correcta es **{corr_text}**). {rationale} {hint}"
    else:
        correcta_fb = f"¡Correcto! «{corr_text}» es la respuesta adecuada. {rationale}"
        incorrecta_fb = f"No es correcto. La respuesta acertada es «{corr_text}». {rationale} {hint}"

    return {
        "correcta": correcta_fb,
        "incorrecta": incorrecta_fb,
        "correct": correcta_fb,
        "incorrect": incorrecta_fb,
        "origen": "cátedra_2026"
    }


def infer_difficulty(item, idx):
    """Asigna dificultad 1 (Fácil), 2 (Intermedio) o 3 (Difícil) si era None."""
    d = item.get("dificultad")
    if d in (1, 2, 3):
        return d
    q_len = len(item.get("enunciado", "")) + sum(len(o) for o in item.get("opciones", []))
    if item.get("tipo") == "verdadero_falso" or q_len < 160:
        return 1 if idx % 3 != 0 else 2
    elif q_len > 250 or idx % 4 == 0:
        return 3
    return 2


def difficulty_label(d):
    return {1: "Fácil", 2: "Intermedio", 3: "Difícil"}.get(d, "Intermedio")


def main():
    DATA_OUT.mkdir(parents=True, exist_ok=True)
    modulos_src = json.loads((BANCO_ROOT / "modulos.json").read_text(encoding="utf-8"))
    flipcards_src = json.loads((BANCO_ROOT / "banco" / "flipcards.json").read_text(encoding="utf-8"))

    modulos_index = []

    for idx, mod in enumerate(modulos_src):
        mod_id = mod["id"]
        num = idx + 1
        etapa_num, etapa_label, icon = ETAPAS[mod_id]
        res = RESOURCES_BY_MODULE[mod_id]

        # 1. Flipcards
        raw_cards = [
            {
                "front": fc["frente"],
                "back": fc["dorso"],
                "tag": SUBTEMA_LABELS.get(mod["subtemas"][0], "Concepto clave")
            }
            for fc in flipcards_src
            if fc["modulo_id"] == mod_id
        ]
        extra_cards = EXTRA_FLIPCARDS.get(mod_id, [])
        all_cards = raw_cards + extra_cards

        sub_labels = [SUBTEMA_LABELS.get(s, s) for s in mod["subtemas"]]
        for c_i, card in enumerate(all_cards):
            if not card.get("tag") or card["tag"] == SUBTEMA_LABELS.get(mod["subtemas"][0], "Concepto clave"):
                card["tag"] = sub_labels[c_i % len(sub_labels)]

        # 2. Quiz items (solo aprobados + extras/reparados curados, excluyendo ítems descartados)
        EXCLUDED_QUIZ_IDS = {
            "m05-0113",  # Da 'Comprobar' como verbo explicativo y feedback dice 'DEMOSTRAR'
            "m05-0088",  # Define el objetivo específico como 'pasos concretos'
            "m05-0132",  # Define el objetivo específico como 'pasos para alcanzar el general'
            "m05-0134",  # 'Establecer los pasos que se deben seguir…'
            "m05-0105",  # Afirma que el objetivo general responde a '¿qué se va a hacer y para qué?'
            "m05-0087",  # SMART 'T': objetivos definidos en el tiempo para marcar etapas
            "m05-0096",  # SMART 'M': objetivo debe 'definir el método o sistema de medición'
            "m05-0098",  # Feedback dice 'los objetivos son acciones concretas'
            "m05-0115",  # Feedback dice 'los objetivos son acciones específicas'
        }
        banco_file = BANCO_ROOT / "banco" / f"{mod_id}.json"
        banco_data = json.loads(banco_file.read_text(encoding="utf-8"))
        aprobados = [x for x in banco_data["items"] if x.get("estado") == "aprobado" and x.get("id") not in EXCLUDED_QUIZ_IDS]
        extras = EXTRA_QUIZ_ITEMS.get(mod_id, [])

        seen_ids = {x["id"] for x in aprobados}
        for ex in extras:
            if ex["id"] not in seen_ids:
                aprobados.append(ex)
                seen_ids.add(ex["id"])

        quiz_out = []
        for q_i, item in enumerate(aprobados):
            dif = infer_difficulty(item, q_i)
            fb = item.get("feedback")
            if not fb or not fb.get("correcta") or not fb.get("incorrecta"):
                fb_obj = generate_formative_feedback(item, mod_id)
            else:
                corr_str = fb["correcta"].strip()
                inc_str = fb["incorrecta"].strip()
                corr_opt = item["opciones"][item["correcta"]]
                if len(inc_str) < 85 and corr_opt not in inc_str:
                    inc_str = f"{inc_str} La opción correcta es: «{corr_opt}»."
                fb_obj = {
                    "correcta": corr_str,
                    "incorrecta": inc_str,
                    "correct": corr_str,
                    "incorrect": inc_str,
                    "origen": fb.get("origen", "original")
                }

            sub_code = item.get("subtema") or mod["subtemas"][0]
            quiz_out.append({
                "id": item["id"],
                "tipo": item.get("tipo", "opcion_multiple"),
                "question": item["enunciado"].strip(),
                "options": [o.strip() for o in item["opciones"]],
                "correctIndex": int(item["correcta"]),
                "dificultad": dif,
                "dificultad_label": difficulty_label(dif),
                "subtema": sub_code,
                "subtema_label": SUBTEMA_LABELS.get(sub_code, sub_code.replace("_", " ").capitalize()),
                "feedback": fb_obj
            })

        first_video = res["videos"][0]["videoId"] if res["videos"] else None
        first_pdf = next((r["url"] for r in res["readings"] if r["type"] == "pdf"), None)
        first_web = next((r["url"] for r in res["readings"] if r["type"] == "web"), None)
        first_nb = res["notebooks"][0]["url"] if res["notebooks"] else None

        module_payload = {
            "id": mod_id,
            "slug": mod_id,
            "number": num,
            "title": mod["titulo"],
            "clase_2026": str(mod["clase_2026"]),
            "titulo_clase_plan_2026": mod["titulo_clase_plan_2026"],
            "etapa": etapa_label,
            "etapa_num": etapa_num,
            "icon": icon,
            "proposito": mod["proposito"],
            "subtemas": mod["subtemas"],
            "subtemas_labels": [SUBTEMA_LABELS.get(s, s) for s in mod["subtemas"]],
            "resultados": mod["resultados"],
            "resultados_rutas": mod.get("resultados_rutas"),
            "videoId": first_video,
            "readingFile": first_pdf,
            "webReadingUrl": first_web,
            "notebookUrl": first_nb,
            "resources": res,
            "keyTakeaways": CAPSULAS[mod_id],
            "capsula": CAPSULAS[mod_id],
            "flipCards": all_cards,
            "miniCases": MINICASES[mod_id],
            "simulation": SIMULATIONS[mod_id],
            "quiz": quiz_out
        }

        out_path = DATA_OUT / f"{mod_id}.json"
        out_path.write_text(json.dumps(module_payload, ensure_ascii=False, indent=2), encoding="utf-8")

        modulos_index.append({
            "id": mod_id,
            "slug": mod_id,
            "number": num,
            "title": mod["titulo"],
            "clase_2026": str(mod["clase_2026"]),
            "titulo_clase_plan_2026": mod["titulo_clase_plan_2026"],
            "etapa": etapa_label,
            "etapa_num": etapa_num,
            "icon": icon,
            "proposito": mod["proposito"],
            "subtemas": mod["subtemas"],
            "subtemas_labels": [SUBTEMA_LABELS.get(s, s) for s in mod["subtemas"]],
            "resultados": mod["resultados"],
            "counts": {
                "videos": len(res["videos"]),
                "readings": len(res["readings"]),
                "notebooks": len(res["notebooks"]),
                "flipCards": len(all_cards),
                "miniCases": len(MINICASES[mod_id]),
                "simulationSteps": len(SIMULATIONS[mod_id]["steps"]),
                "quiz": len(quiz_out)
            }
        })

        print(
            f"[OK] {mod_id} ({mod['titulo']}): "
            f"{len(res['videos'])} videos, {len(res['readings'])} lecturas, "
            f"{len(all_cards)} flip-cards, {len(MINICASES[mod_id])} minicasos, "
            f"{len(SIMULATIONS[mod_id]['steps'])} pasos sim, {len(quiz_out)} preguntas quiz."
        )

    (DATA_OUT / "modulos.json").write_text(
        json.dumps(modulos_index, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"\nGenerados exitosamente data/modulos.json y data/m01.json .. data/m11.json en {DATA_OUT}")


if __name__ == "__main__":
    main()
