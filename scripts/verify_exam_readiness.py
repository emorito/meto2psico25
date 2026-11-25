#!/usr/bin/env python3
"""Auditoría mecánica de preparación del sitio para el final 2026."""

from __future__ import annotations

import json
import random
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
EVALUATED_MODULES = [f"m{i:02d}" for i in range(1, 11)]
EXPECTED_WEIGHTS = {
    "m01": 2, "m02": 1, "m03": 2, "m04": 4.5, "m05": 8,
    "m06": 5.5, "m07": 5.5, "m08": 4.5, "m09": 3.5, "m10": 3.5,
}
EXCLUDED_IDS = {
    "m05-0113", "m05-0088", "m05-0132", "m05-0134", "m05-0105",
    "m05-0087", "m05-0096", "m05-0098", "m05-0115",
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def assert_no_dialogs() -> None:
    pattern = re.compile(r"\b(?:alert|confirm)\s*\(")
    for relative in ("assets/js/app.js", "assets/js/examen.js"):
        text = (REPO_ROOT / relative).read_text(encoding="utf-8")
        assert not pattern.search(text), f"Queda un diálogo bloqueante en {relative}"
    print("[OK] app.js y examen.js no usan alert() ni confirm().")


def assert_exam_config() -> None:
    exam = load(REPO_ROOT / "data/examen.json")
    assert exam["fecha"] == "2026-12-10"
    assert exam["modalidad"] == "presencial_en_papel"
    assert exam["modulos"] == EVALUATED_MODULES
    assert exam["modulo_consulta"] == "m11"
    assert exam["duracion_max_min"] == 120
    assert exam["estructura"]["parte_1"] == {
        "nombre": "Parte I",
        "descripcion": "20 ítems cerrados de opción múltiple y verdadero/falso",
        "preguntas": 20,
        "puntos": 20,
    }
    assert exam["estructura"]["parte_2"]["preguntas"] == 8
    assert exam["estructura"]["parte_2"]["puntos"] == 20
    assert exam["estructura"]["puntos_totales"] == 40
    assert exam["pesos_por_modulo"] == EXPECTED_WEIGHTS
    assert sum(exam["pesos_por_modulo"].values()) == 40
    assert "texto_moodle" not in exam
    print("[OK] data/examen.json coincide con el formato presencial de 40 puntos.")


def assert_banks() -> None:
    legacy_m05 = load(REPO_ROOT / "data/m05.json").get("quiz", [])
    found = [item["id"] for item in legacy_m05 if item.get("id") in EXCLUDED_IDS]
    assert not found, f"Ítems excluidos en data/m05.json: {found}"
    for path in (REPO_ROOT / "data").glob("m*.json"):
        if path.name == "modulos.json":
            continue
        for item in load(path).get("quiz", []):
            assert item.get("id") not in EXCLUDED_IDS, f"Ítem excluido {item['id']} en {path.name}"
    for _ in range(300):
        for item in random.sample(legacy_m05, min(random.choice([5, 10, 16, 25]), len(legacy_m05))):
            assert item["id"] not in EXCLUDED_IDS
    for module_id in [*EVALUATED_MODULES, "m11"]:
        legacy = load(REPO_ROOT / f"data/{module_id}.json")
        bank = load(REPO_ROOT / f"data/banco/{module_id}.json")
        assert len(legacy.get("quiz", [])) >= 16, f"{module_id} tiene menos de 16 preguntas legadas"
        assert len(legacy.get("flipCards", [])) >= 10, f"{module_id} tiene menos de 10 tarjetas"
        assert len(legacy.get("miniCases", [])) >= 3, f"{module_id} tiene menos de 3 minicasos"
        assert all(item.get("estado") in {"aprobado", "revisar"} for item in bank.get("items", []))
    print("[OK] Bancos íntegros y lista de exclusión respetada.")


def assert_student_filters() -> None:
    review = (REPO_ROOT / "assets/js/review-app.js").read_text(encoding="utf-8")
    simulation = (REPO_ROOT / "assets/js/simulacro-app.js").read_text(encoding="utf-8")
    engine = (REPO_ROOT / "assets/js/engine.js").read_text(encoding="utf-8")
    assert "approvedReviewEntries" in review
    assert 'item?.estado === "aprobado"' in engine
    assert 'item.estado === "aprobado"' in simulation
    assert 'item?.estado === "aprobado"' in simulation
    print("[OK] Repaso, simulacro e integradores filtran contenido no aprobado.")


def main() -> None:
    print("=== VERIFICACIÓN DEL SITIO PARA EL EXAMEN FINAL 2026 ===")
    assert_exam_config()
    assert_banks()
    assert_student_filters()
    assert_no_dialogs()
    print("=== TODAS LAS VERIFICACIONES PASARON ===")


if __name__ == "__main__":
    main()
