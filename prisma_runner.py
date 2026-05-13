import os
import sys
from prisma.cli import main

if __name__ == "__main__":
    # venv/Scripts klasörünün tam yolunu al
    base_dir = os.path.dirname(os.path.abspath(__file__))
    venv_scripts = os.path.join(base_dir, "venv", "Scripts")
    
    # Sistemin PATH değişkenine bu yolu geçici olarak ekle
    os.environ["PATH"] = venv_scripts + os.pathsep + os.environ.get("PATH", "")
    
    # Prisma CLI'ı başlat
    sys.exit(main())
