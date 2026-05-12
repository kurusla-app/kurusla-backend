import math

def calculate_percentage_saving(amount: float, ratio: float) -> float:
    """
    Harcama tutarının belirli bir yüzdesini hesaplayarak birikim tutarını döner.
    Örn: 49.99 TL harcama ve %10 oran -> 5.00 TL birikim (yuvarlanmış)
    
    :param amount: Harcama tutarı
    :param ratio: Birikim oranı (0-100 arası, örn: 10)
    :return: Birikim tutarı
    """
    if not amount or amount <= 0 or not ratio or ratio <= 0:
        return 0.0

    raw_saving = amount * (ratio / 100)
    
    # Python'da finansal yuvarlama için f-string formatlama en güvenli yoldur.
    # toFixed(2) karşılığıdır.
    return float(f"{raw_saving:.2f}")

def calculate_round_up(amount: float, step: float) -> float:
    """
    Klasik Yuvarlama Mantığı (Round-up)
    Tutarın bir sonraki 'step' katına olan uzaklığını hesaplar.
    Örn: 42.30 TL harcama ve step: 10 -> 50'ye tamamlar, 7.70 TL döner.
    
    :param amount: Harcama tutarı
    :param step: Yuvarlama hedefi (10, 50, 100 vb.)
    :return: Birikim tutarı
    """
    if not amount or amount <= 0 or not step or step <= 0:
        return 0.0

    target = math.ceil(amount / step) * step
    savings = target - amount
    
    return float(f"{savings:.2f}")
