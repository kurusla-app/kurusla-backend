from app.services.savings_service import calculate_percentage_saving, calculate_round_up

def run_tests():
    print("\n--- KURUSLA PYTHON MIKRO BIRIKIM TEST SONUCLARI ---\n")
    
    harcama = 49.99
    oran = 10
    hedef = 10
    
    yuzde = calculate_percentage_saving(harcama, oran)
    yuvarlama = calculate_round_up(harcama, hedef)
    
    print(f"Harcama: {harcama} TL")
    print(f"Oran: %{oran} | Biriken: {yuzde} TL")
    print(f"Hedef: {hedef} | Biriken: {yuvarlama} TL")
    
    print("\n--- DIGER ORNEKLER ---")
    print(f"42.30 TL harcama, 10'a yuvarla: {calculate_round_up(42.30, 10)} TL")
    print(f"150.00 TL harcama, %5 birikim: {calculate_percentage_saving(150, 5)} TL")
    
    print("\n" + "-"*46 + "\n")

if __name__ == "__main__":
    run_tests()
