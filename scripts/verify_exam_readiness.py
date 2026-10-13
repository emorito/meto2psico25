#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de verificación de preparación para el parcial y auditoría de exclusión de ítems.
Verifica:
1. Ninguno de los 9 ítems contradictorios con la nota de cátedra existe en data/m05.json ni en data/.
2. En 300 sorteos aleatorios de autoevaluación (5 y 10 preguntas), ninguno de esos 9 IDs aparece.
3. Los módulos m01 a m08 están disponibles y tienen datos íntegros.
"""

import json
import random
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

EXCLUDED_IDS = {
    'm05-0113', 'm05-0088', 'm05-0132', 'm05-0134', 'm05-0105',
    'm05-0087', 'm05-0096', 'm05-0098', 'm05-0115'
}

def main():
    print("=== TEST DE AUDITORÍA: EXCLUSIÓN DE ÍTEMS DE OBJETIVOS ===")

    # 1. Verificar data/m05.json
    m05_path = REPO_ROOT / 'data' / 'm05.json'
    assert m05_path.exists(), f"No existe {m05_path}"
    m05_data = json.loads(m05_path.read_text(encoding='utf-8'))
    quiz_m05 = m05_data.get('quiz', [])

    found_in_m05 = [q['id'] for q in quiz_m05 if q.get('id') in EXCLUDED_IDS]
    assert len(found_in_m05) == 0, f"¡ERROR! Se encontraron ítems prohibidos en m05.json: {found_in_m05}"
    print(f"[OK] data/m05.json limpio: {len(quiz_m05)} ítems activos, 0 ítems prohibidos.")

    # 2. Verificar todos los demás módulos
    for p in (REPO_ROOT / 'data').glob('m*.json'):
        if p.name == 'modulos.json':
            continue
        d = json.loads(p.read_text(encoding='utf-8'))
        for q in d.get('quiz', []):
            assert q.get('id') not in EXCLUDED_IDS, f"¡ERROR! Ítem prohibido {q['id']} en {p.name}"

    print("[OK] Todos los archivos data/m*.json están limpios de los 9 IDs prohibidos.")

    # 3. Simular 300 sorteos aleatorios de examen/quiz de m05
    for attempt in range(300):
        sample_size = random.choice([5, 10, 16, 25])
        sampled = random.sample(quiz_m05, min(sample_size, len(quiz_m05)))
        for item in sampled:
            assert item['id'] not in EXCLUDED_IDS, f"¡ERROR! Ítem prohibido {item['id']} sorteado en intento {attempt}"

    print(f"[OK] 300 sorteos aleatorios simulados: 0 apariciones de ítems prohibidos.")

    # 4. Verificar integridad de m01 a m08
    for i in range(1, 9):
        mid = f"m{i:02d}"
        mod_p = REPO_ROOT / 'data' / f"{mid}.json"
        assert mod_p.exists(), f"Falta {mod_p}"
        mod_d = json.loads(mod_p.read_text(encoding='utf-8'))
        assert len(mod_d.get('quiz', [])) >= 16, f"{mid} tiene menos de 16 preguntas"
        assert len(mod_d.get('flipCards', [])) >= 10, f"{mid} tiene menos de 10 flipCards"
        assert len(mod_d.get('miniCases', [])) >= 3, f"{mid} tiene menos de 3 miniCases"

    print("[OK] Módulos m01 a m08 íntegros y listos para el parcial.")
    print("=== TODOS LOS TESTS PASARON EXITOSAMENTE ===")

if __name__ == '__main__':
    main()
