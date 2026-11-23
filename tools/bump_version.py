import re
import time
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
VERSION = time.strftime("%Y%m%d%H%M")

for nombre in ["index.html", "overlay.html"]:
    ruta = RAIZ / nombre
    html = ruta.read_text(encoding="utf-8")
    html = re.sub(r'((?:src|href)="(?!https?:)[^"?]+\.(?:js|css))(?:\?v=[^"]*)?"', lambda m: f'{m.group(1)}?v={VERSION}"', html)
    ruta.write_text(html, encoding="utf-8")
print(VERSION)
