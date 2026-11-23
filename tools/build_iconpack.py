import io
import json
import base64
from pathlib import Path
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ICONOS = RAIZ / "assets" / "icons"


def main():
    paquete = {}
    for ruta in sorted(ICONOS.glob("*.png")):
        clave = ruta.stem
        img = Image.open(ruta).convert("RGBA")
        if clave[0] in "DS" and clave[1:].replace("05", "").isdigit():
            img = img.crop(img.getbbox())
            img.thumbnail((240, 60), Image.LANCZOS)
        else:
            img.thumbnail((96, 96), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, "PNG", optimize=True)
        paquete[clave] = {"src": "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode(), "w": img.size[0], "h": img.size[1]}
    (RAIZ / "js" / "iconpack.js").write_text("const ICON_PACK = " + json.dumps(paquete) + ";\n", encoding="utf-8")
    print(f"{len(paquete)} iconos empaquetados")


if __name__ == "__main__":
    main()
