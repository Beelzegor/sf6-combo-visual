import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent


def incrustar(html_path, salida):
    html = (RAIZ / html_path).read_text(encoding="utf-8")
    html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', lambda m: "<style>\n" + (RAIZ / m.group(1)).read_text(encoding="utf-8") + "\n</style>", html)
    html = re.sub(r'<script src="((?!https?:)[^"]+)"></script>', lambda m: "<script>\n" + (RAIZ / m.group(1)).read_text(encoding="utf-8") + "\n</script>", html)
    destino = RAIZ / salida
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(html, encoding="utf-8")
    print(f"{salida}: {destino.stat().st_size // 1024} KB")


if __name__ == "__main__":
    incrustar("index.html", "dist/sf6-combo-visual.html")
    incrustar("overlay.html", "dist/sf6-combo-overlay.html")
    sys.exit(0)
