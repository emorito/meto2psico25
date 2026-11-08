#!/usr/bin/env python3
"""Migra los datos de los módulos al esquema de meto2psico25 v3.

La migración lee solamente los datos versionados en ``data/mNN.json``. Puede
ejecutarse varias veces: cuando un ítem ya existe en ``data/banco/`` conserva
siempre ``estado``, ``nota_revision`` y ``origen``, que son campos editables
por Claude o por el docente.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_ROOT = REPO_ROOT / "data"
BANK_ROOT = DATA_ROOT / "banco"
CONTENT_ROOT = DATA_ROOT / "contenido"
CLAUDE_CONTENT_ROOT = DATA_ROOT / "contenido_claude"
MODULE_IDS = tuple(f"m{number:02d}" for number in range(1, 12))

# Ítems eliminados por decisión docente. Si reaparecen en una fuente, no se
# vuelven a publicar en el banco v3.
EXCLUDED_QUIZ_IDS = {
    "m05-0113",
    "m05-0088",
    "m05-0132",
    "m05-0134",
    "m05-0105",
    "m05-0087",
    "m05-0096",
    "m05-0098",
    "m05-0115",
}

# Ítems activos que esperan una decisión docente. La explicación proviene de
# la sección 2 de ESTADO.md; no se modifica el contenido del ítem.
REVIEW_NOTES = {
    "m05-0091": "Revisión docente pendiente: objetivo metodológico; verificar su alcance frente a los criterios de cátedra.",
    "m05-0095": "Revisión docente pendiente: objetivo metodológico; verificar su alcance frente a los criterios de cátedra.",
    "m05-0106": "Revisión docente pendiente: objetivo metodológico; verificar su alcance frente a los criterios de cátedra.",
}

PRESERVED_ITEM_FIELDS = ("estado", "nota_revision", "origen")
NEW_MODULE_FIELDS = (
    "fecha_clase",
    "preguntas_orientadoras",
    "autoauditoria",
    "evidencia_moodle",
    "eslabon_cadena",
)


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def existing_items(path: Path) -> dict[str, dict[str, Any]]:
    """Read existing bank items, accepting both a list and the v3 envelope."""

    if not path.exists():
        return {}
    raw = read_json(path)
    if isinstance(raw, list):
        items = raw
    else:
        items = raw.get("items", [])
    return {
        item["id"]: item
        for item in items
        if isinstance(item, dict) and item.get("id")
    }


def normalize_feedback(item: dict[str, Any]) -> dict[str, Any]:
    feedback = item.get("feedback", {})
    if isinstance(feedback, dict):
        return dict(feedback)
    if isinstance(feedback, str):
        return {"correcta": feedback}
    return {}


def claude_content(module_id: str) -> dict[str, Any]:
    """Return Claude's optional integration payload without writing to it."""

    path = CLAUDE_CONTENT_ROOT / f"{module_id}.json"
    if not path.exists():
        return {}
    value = read_json(path)
    return value if isinstance(value, dict) else {}


def normalize_item(
    module_id: str,
    module: dict[str, Any],
    source_item: dict[str, Any],
    previous: dict[str, Any] | None,
    audit: dict[str, dict[str, Any]] | None = None,
) -> dict[str, Any]:
    options = source_item.get("opciones", source_item.get("options", []))
    correct = source_item.get("correcta", source_item.get("correctIndex", 0))
    try:
        correct = int(correct)
    except (TypeError, ValueError):
        correct = 0

    audit_entry = (audit or {}).get(source_item["id"], {})
    item = {
        "id": source_item["id"],
        "tipo": source_item.get("tipo", "opcion_multiple"),
        "enunciado": source_item.get("enunciado", source_item.get("question", "")),
        "opciones": list(options) if isinstance(options, list) else [],
        "correcta": correct,
        "feedback": normalize_feedback(source_item),
        "dificultad": source_item.get("dificultad", 2),
        "subtema": source_item.get(
            "subtema",
            (module.get("subtemas") or [""])[0],
        ),
        "lectura_ref": source_item.get("lectura_ref", module.get("readingFile", "")),
        "estado": "revisar" if source_item["id"] in REVIEW_NOTES or audit_entry else "aprobado",
        "origen": source_item.get("origen", "original"),
        "nota_revision": REVIEW_NOTES.get(
            source_item["id"], audit_entry.get("nota_revision", "")
        ),
    }

    # Existing values win for the three fields that are maintained outside the
    # migration. This also preserves a manually assigned blank note.
    if previous:
        for field in PRESERVED_ITEM_FIELDS:
            if field in previous:
                item[field] = previous[field]

    # La auditoría explícita de Claude es una instrucción de integración: se
    # aplica también si el banco ya había sido generado antes de que llegara
    # REVISION.md. En ejecuciones posteriores queda conservada como cualquier
    # otro estado manual.
    if audit_entry:
        item["estado"] = "revisar"
        item["nota_revision"] = audit_entry.get("nota_revision", "")

    return item


def migrate_module(module_id: str, modules_by_id: dict[str, dict[str, Any]]) -> tuple[int, int, int]:
    source = read_json(DATA_ROOT / f"{module_id}.json")
    module = modules_by_id.get(module_id, source)
    claude = claude_content(module_id)
    audit = {
        entry["id"]: entry
        for entry in claude.get("auditoria_items_existentes", [])
        if isinstance(entry, dict) and entry.get("id")
    }
    previous = existing_items(BANK_ROOT / f"{module_id}.json")

    migrated_items: list[dict[str, Any]] = []
    excluded = 0
    review = 0
    for source_item in source.get("quiz", []):
        item_id = source_item.get("id")
        if not item_id or item_id in EXCLUDED_QUIZ_IDS:
            excluded += 1
            continue
        item = normalize_item(
            module_id,
            module,
            source_item,
            previous.get(item_id),
            audit,
        )
        migrated_items.append(item)
        review += item["estado"] == "revisar"

    write_json(
        BANK_ROOT / f"{module_id}.json",
        {"modulo_id": module_id, "items": migrated_items},
    )

    mini_cases = source.get("miniCases", [])
    simulation = source.get("simulation")
    write_json(
        CONTENT_ROOT / f"{module_id}.json",
        {
            "modulo_id": module_id,
            "capsula": claude.get(
                "capsula", source.get("capsula", source.get("keyTakeaways", {}))
            ),
            "casos": {
                "miniCases": mini_cases,
                "simulation": simulation,
            },
            "recursos": source.get("resources", {}),
            **{
                key: claude[key]
                for key in (
                    "arbol",
                    "calculadora",
                    "galeria_pseudocalculos",
                    "autoauditoria",
                    "auditoria_items_existentes",
                    "subtemas_nuevos",
                )
                if key in claude
            },
        },
    )
    return len(migrated_items), excluded, review


def migrate_flipcards() -> int:
    cards: list[dict[str, Any]] = []
    for module_id in MODULE_IDS:
        source = read_json(DATA_ROOT / f"{module_id}.json")
        for index, card in enumerate(source.get("flipCards", []), start=1):
            cards.append(
                {
                    "id": f"{module_id}-fc-{index:04d}",
                    "modulo_id": module_id,
                    "frente": card.get("frente", card.get("front", "")),
                    "dorso": card.get("dorso", card.get("back", "")),
                    "tag": card.get("tag", ""),
                }
            )
    write_json(BANK_ROOT / "flipcards.json", cards)
    return len(cards)


def migrate_modules() -> tuple[int, list[str]]:
    modules_path = DATA_ROOT / "modulos.json"
    raw_modules = read_json(modules_path) if modules_path.exists() else []
    modules_by_id = {
        module["id"]: module
        for module in raw_modules
        if isinstance(module, dict) and module.get("id")
    }

    result: list[dict[str, Any]] = []
    missing_fields: list[str] = []
    for module_id in MODULE_IDS:
        source = read_json(DATA_ROOT / f"{module_id}.json")
        module = dict(modules_by_id.get(module_id, {}))
        claude = claude_content(module_id)
        for key in ("id", "slug", "number", "title", "clase_2026", "subtemas", "resultados"):
            if key not in module and key in source:
                module[key] = source[key]

        for field in NEW_MODULE_FIELDS:
            if field == "autoauditoria" and "autoauditoria" in claude:
                module[field] = claude["autoauditoria"]
            if field not in module:
                module[field] = source.get(field, "" if field in {"fecha_clase", "evidencia_moodle", "eslabon_cadena"} else [])
            if not module[field]:
                missing_fields.append(f"{module_id}.{field}")

        if claude.get("subtemas_nuevos"):
            existing_subtemas = list(module.get("subtemas", []))
            existing_labels = list(module.get("subtemas_labels", []))
            for code, label in claude["subtemas_nuevos"].items():
                if code not in existing_subtemas:
                    existing_subtemas.append(code)
                    existing_labels.append(label)
            module["subtemas"] = existing_subtemas
            module["subtemas_labels"] = existing_labels
        result.append(module)

    write_json(modules_path, result)
    return len(result), missing_fields


def main() -> None:
    module_count, missing_fields = migrate_modules()
    total_items = 0
    total_excluded = 0
    total_review = 0
    for module_id in MODULE_IDS:
        count, excluded, review = migrate_module(module_id, {})
        total_items += count
        total_excluded += excluded
        total_review += review
    total_cards = migrate_flipcards()

    print(f"Módulos migrados: {module_count}")
    print(f"Ítems en banco v3: {total_items}")
    print(f"Ítems excluidos por lista negra: {total_excluded}")
    print(f"Ítems marcados revisar: {total_review}")
    print(f"Flipcards migradas: {total_cards}")
    if missing_fields:
        print("Campos nuevos sin fuente: " + ", ".join(missing_fields))


if __name__ == "__main__":
    main()
