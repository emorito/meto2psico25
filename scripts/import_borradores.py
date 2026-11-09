#!/usr/bin/env python3
"""Reimporta los borradores de Antigravity al banco v3 sin reescribirlos."""

from migrar_v3 import import_drafts


if __name__ == "__main__":
    imported = import_drafts()
    print("Borradores importados: " + ", ".join(
        f"{module_id}={count}" for module_id, count in imported.items()
    ))
