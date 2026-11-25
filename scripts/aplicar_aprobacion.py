#!/usr/bin/env python3
"""Aplica las aprobaciones docentes marcadas en docs/APROBACION-RAPIDA.md.

Lee únicamente las casillas marcadas con `[x] aprobar` (o `[X] aprobar`) en
`docs/APROBACION-RAPIDA.md` y cambia `estado` a `"aprobado"` en los ítems o
casos correspondientes (`data/borradores/mNN.json`, `data/banco/mNN.json` si el
ítem ya figura allí, y `data/casos/practica.json`). No modifica ningún otro
campo ni aprueba elementos sin marca explícita.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent.parent
APPROVAL_DOC = ROOT / "docs" / "APROBACION-RAPIDA.md"
DRAFTS_DIR = ROOT / "data" / "borradores"
BANK_DIR = ROOT / "data" / "banco"
CASES_PATH = ROOT / "data" / "casos" / "practica.json"

# Reconoce filas de tabla markdown donde la primera columna tiene el ID
# (con o sin backticks) y la última columna contiene `[x] aprobar`.
ROW_PATTERN = re.compile(
    r"^\|\s*`?(?P<id>[a-z0-9]+-[a-z0-9-]+)`?\s*\|.*\[\s*[xX]\s*\]\s*aprobar\s*\|?\s*$"
)


def parse_approved_ids(doc_path: Path) -> set[str]:
    if not doc_path.exists():
        raise SystemExit(f"[ERROR] No existe el archivo {doc_path}")
    approved: set[str] = set()
    for line in doc_path.read_text(encoding="utf-8").splitlines():
        match = ROW_PATTERN.match(line.strip())
        if match:
            approved.add(match.group("id"))
    return approved


def update_json_items(path: Path, approved_ids: set[str], dry_run: bool = False) -> int:
    if not path.exists():
        return 0
    raw: Any = json.loads(path.read_text(encoding="utf-8"))
    items = raw if isinstance(raw, list) else raw.get("items", [])
    changed = 0
    for item in items:
        if not isinstance(item, dict):
            continue
        if item.get("id") in approved_ids and item.get("estado") != "aprobado":
            item["estado"] = "aprobado"
            changed += 1
    if changed and not dry_run:
        path.write_text(
            json.dumps(raw, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    return changed


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Pasa a estado 'aprobado' los ítems y casos marcados con [x] aprobar en docs/APROBACION-RAPIDA.md."
    )
    parser.add_argument(
        "--doc",
        type=Path,
        default=APPROVAL_DOC,
        help="Ruta al archivo markdown de aprobación rápida (por defecto: docs/APROBACION-RAPIDA.md).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Muestra qué ítems cambiarían sin escribir en disco.",
    )
    args = parser.parse_args()

    approved_ids = parse_approved_ids(args.doc)
    if not approved_ids:
        print("[INFO] No hay casillas marcadas con [x] aprobar. No se realizaron cambios.")
        return

    total_drafts = 0
    for draft_path in sorted(DRAFTS_DIR.glob("m??.json")):
        total_drafts += update_json_items(draft_path, approved_ids, dry_run=args.dry_run)

    total_bank = 0
    for bank_path in sorted(BANK_DIR.glob("m??.json")):
        total_bank += update_json_items(bank_path, approved_ids, dry_run=args.dry_run)

    total_cases = update_json_items(CASES_PATH, approved_ids, dry_run=args.dry_run)

    prefix = "[DRY-RUN]" if args.dry_run else "[OK]"
    print(f"{prefix} IDs marcados en {args.doc.name}: {len(approved_ids)}")
    print(f"{prefix} Actualizados en data/borradores/: {total_drafts}")
    print(f"{prefix} Actualizados en data/banco/: {total_bank}")
    print(f"{prefix} Actualizados en data/casos/practica.json: {total_cases}")


if __name__ == "__main__":
    main()
