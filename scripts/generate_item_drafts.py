#!/usr/bin/env python3
"""Genera borradores deterministas desde modelos de ítem explícitos.

El script no usa red ni modifica ítems existentes. Cada instancia queda fuera de
publicación con estado `revisar`; la promoción a `aprobado` requiere decisión
docente.
"""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent


def render(value, variables):
    if isinstance(value, str):
        return value.format(**variables)
    if isinstance(value, list):
        return [render(item, variables) for item in value]
    if isinstance(value, dict):
        return {key: render(item, variables) for key, item in value.items()}
    return value


def generate(model_path):
    spec = json.loads(model_path.read_text(encoding="utf-8"))
    generated = []
    for index, model in enumerate(spec["models"], start=1):
        variables = {key: value for group in model.get("variables", []) for key, value in group.items()}
        item = {
            key: render(value, variables)
            for key, value in model.items()
            if key not in {"modelo_id", "variables", "feedback"}
        }
        feedback = render(model["feedback"], variables)
        item["id"] = f"{spec['module_id']}-gen-{index:03d}"
        item["tipo"] = "opcion_multiple"
        item["feedback"] = {
            "correcto": f"Correcto. {feedback}",
            "incorrecto": f"Revisá este punto. {feedback}",
        }
        item["origen"] = "borrador_ia"
        item["estado"] = "revisar"
        item["nota_revision"] = "Revisar exactitud, distractores, dificultad y referencia antes de aprobar."
        item["modelo_id"] = model["modelo_id"]
        item["generado_en"] = str(date.today())
        generated.append(item)
    return generated


def validate(items, module_id):
    ids = [item["id"] for item in items]
    assert len(ids) == len(set(ids)), f"IDs duplicados en {module_id}"
    for item in items:
        assert item["estado"] == "revisar"
        assert item["origen"] == "borrador_ia"
        assert item["modelo_id"]
        assert 0 <= item["correcta"] < len(item["opciones"])
        assert len(item["opciones"]) >= 2
        assert item["lectura_ref"]
    return items


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--module", action="append", dest="modules", help="módulo específico; por defecto todos los modelos")
    parser.add_argument("--replace", action="store_true", help="reemplaza el borrador generado del módulo")
    args = parser.parse_args()
    model_paths = sorted((ROOT / "data" / "item_models").glob("m??.json"))
    if args.modules:
        wanted = set(args.modules)
        model_paths = [path for path in model_paths if path.stem in wanted]
    for model_path in model_paths:
        module_id = model_path.stem
        output_path = ROOT / "data" / "borradores" / f"{module_id}.json"
        if output_path.exists() and not args.replace:
            raise SystemExit(f"{output_path} ya existe; usar --replace solo con revisión explícita")
        items = validate(generate(model_path), module_id)
        output_path.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{module_id}: {len(items)} borradores generados en {output_path}")


if __name__ == "__main__":
    main()
