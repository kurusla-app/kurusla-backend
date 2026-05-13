import pytest
from app.services.savings_service import calculate_round_up

def test_calculate_round_up_normal():
    # Senaryo 1: Standart küsuratlı rakam (12.01 -> 10'luk adıma göre 20'ye yuvarlar, fark 7.99)
    assert calculate_round_up(12.01, 10.0) == 7.99

def test_calculate_round_up_halfway():
    # Senaryo 2: Tam ortadaki bir rakam (15.00 -> 20'ye yuvarlar, fark 5.00)
    assert calculate_round_up(15.00, 10.0) == 5.00

def test_calculate_round_up_exact_multiple():
    # Senaryo 3: Zaten adımın tam katı olan bir rakam (20.00 -> 20'ye yuvarlar, fark 0.0)
    assert calculate_round_up(20.00, 10.0) == 0.0

def test_calculate_round_up_zero_or_negative():
    # Senaryo 4: Sıfır veya negatif harcama (Hata vermemeli, 0 dönmeli)
    assert calculate_round_up(0, 10.0) == 0.0
    assert calculate_round_up(-5.50, 10.0) == 0.0

def test_calculate_round_up_large_step():
    # Senaryo 5: Daha büyük bir yuvarlama adımı (42.30 -> 50'lik adıma göre 50'ye yuvarlar, fark 7.70)
    assert calculate_round_up(42.30, 50.0) == 7.70
