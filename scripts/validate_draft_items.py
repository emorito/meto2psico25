#!/usr/bin/env python3
"""Audita el banco de borradores sin promover contenido a publicación.

La validación es estructural y de trazabilidad. La exactitud conceptual, la
calidad de los distractores y la aprobación siguen siendo decisiones docentes.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
REQUIRED = {
    "id",
    "tipo",
    "enunciado",
    "opciones",
    "correcta",
    "feedback",
    "dificultad",
    "subtema",
    "lectura_ref",
    "origen",
    "estado",
    "nota_revision",
}


def fail(message: str) -> None:
    raise SystemExit(f"[ERROR] {message}")


def main() -> None:
    paths = sorted((ROOT / "data" / "borradores").glob("m??.json"))
    if not paths:
        fail("no se encontraron archivos data/borradores/mNN.json")

    seen_ids: set[str] = set()
    total = 0
    by_module: dict[str, int] = {}
    for path in paths:
        module_id = path.stem
        try:
            items = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            fail(f"{path}: JSON inválido ({error})")
        if not isinstance(items, list):
            fail(f"{path}: la raíz debe ser una lista")
        by_module[module_id] = len(items)
        positions = Counter()
        for item in items:
            missing = REQUIRED - item.keys()
            if missing:
                fail(f"{path.name}/{item.get('id', '?')}: faltan {sorted(missing)}")
            item_id = item["id"]
            if item_id in seen_ids:
                fail(f"ID duplicado: {item_id}")
            seen_ids.add(item_id)
            if not item_id.startswith(f"{module_id}-"):
                fail(f"{path.name}/{item_id}: el ID no corresponde al módulo")
            if item["estado"] != "revisar" or item["origen"] != "borrador_ia":
                fail(f"{path.name}/{item_id}: todo borrador debe quedar como revisar/borrador_ia")
            options = item["opciones"]
            correct = item["correcta"]
            if not isinstance(options, list) or len(options) < 2:
                fail(f"{path.name}/{item_id}: se necesitan al menos dos opciones")
            if not isinstance(correct, int) or not 0 <= correct < len(options):
                fail(f"{path.name}/{item_id}: respuesta correcta fuera de rango")
            if not item["enunciado"].strip() or not str(item["lectura_ref"]).strip():
                fail(f"{path.name}/{item_id}: enunciado y lectura_ref son obligatorios")
            if "modelo_id" in item:
                if not item["modelo_id"] or not item.get("generado_en"):
                    fail(f"{path.name}/{item_id}: falta trazabilidad de generación")
                positions[correct] += 1
            total += 1
        if positions and len(positions) > 1:
            spread = max(positions.values()) - min(positions.values())
            if spread > 1:
                fail(f"{path.name}: distribución de respuesta correcta demasiado sesgada: {dict(positions)}")

    print(f"[OK] {total} borradores estructuralmente válidos en {len(paths)} módulos")
    print("[OK] Todos conservan estado revisar y origen borrador_ia")
    for module_id, count in by_module.items():
        print(f"[OK] {module_id}: {count} borradores")


if __name__ == "__main__":
    main()
