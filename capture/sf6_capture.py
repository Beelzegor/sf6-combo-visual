import os
import sys
import json
import time
import asyncio
import argparse
import threading
from datetime import datetime

os.environ["SDL_JOYSTICK_ALLOW_BACKGROUND_EVENTS"] = "1"
os.environ["PYGAME_HIDE_SUPPORT_PROMPT"] = "1"

import pygame
import websockets

FPS = 60
DIRS = ["ARRIBA", "ABAJO", "IZQUIERDA", "DERECHA"]
ESQUEMAS = {
    "classic": {
        "nombre": "clásico",
        "botones": {"LP": 1, "MP": 2, "HP": 4, "LK": 8, "MK": 16, "HK": 32},
        "atajos": {"PARRY": 2 | 16, "IMPACT": 4 | 32, "AGARRE": 1 | 8, "OD_PUNOS": 1 | 2, "OD_PATADAS": 8 | 16},
    },
    "modern": {
        "nombre": "moderno",
        "botones": {"L": 1, "M": 2, "H": 4, "SP": 8, "AUTO": 16},
        "atajos": {"IMPACT": 32, "PARRY": 64, "AGARRE": 128},
    },
}
CARPETA = os.path.dirname(os.path.abspath(__file__))
ARCHIVO_PERFILES = os.path.join(CARPETA, "perfiles_control.json")
CARPETA_GRABACIONES = os.path.join(CARPETA, "grabaciones")


def elegir_control():
    pygame.joystick.init()
    total = pygame.joystick.get_count()
    if total == 0:
        print("No se detecta ningún control. Conéctalo y vuelve a ejecutar el capturador.")
        sys.exit(1)
    for i in range(total):
        print(f"  [{i}] {pygame.joystick.Joystick(i).get_name()}")
    indice = 0
    if total > 1:
        texto = input("Número del control a usar: ").strip()
        indice = int(texto) if texto.isdigit() and int(texto) < total else 0
    control = pygame.joystick.Joystick(indice)
    control.init()
    print(f"Usando: {control.get_name()}")
    return control


def esperar_entrada(control, usadas, limite=None):
    pygame.event.clear()
    inicio = time.perf_counter()
    while True:
        if limite is not None and time.perf_counter() - inicio > limite:
            return None
        for ev in pygame.event.get():
            if ev.type == pygame.JOYBUTTONDOWN:
                clave = ["boton", ev.button]
            elif ev.type == pygame.JOYHATMOTION and ev.value != (0, 0):
                clave = ["hat", ev.hat, list(ev.value)]
            elif ev.type == pygame.JOYAXISMOTION and abs(ev.value) > 0.6:
                clave = ["eje", ev.axis, 1 if ev.value > 0 else -1]
            else:
                continue
            if clave in usadas:
                continue
            return clave
        time.sleep(0.005)


def esperar_reposo(control):
    while True:
        pygame.event.pump()
        botones = any(control.get_button(i) for i in range(control.get_numbuttons()))
        hats = any(control.get_hat(i) != (0, 0) for i in range(control.get_numhats()))
        ejes = any(abs(control.get_axis(i)) > 0.6 for i in range(min(2, control.get_numaxes())))
        if not (botones or hats or ejes):
            return
        time.sleep(0.01)


def calibrar(control, esquema):
    datos = ESQUEMAS[esquema]
    print(f"\nCalibración ({datos['nombre']}): pulsa cada entrada cuando se te pida.")
    print("Las direcciones son las del control (no importa el lado del personaje).")
    mapeo = {}
    usadas = []
    for nombre in DIRS + list(datos["botones"]) + ["GRABAR"]:
        esperar_reposo(control)
        print(f"  Pulsa {nombre}...", end=" ", flush=True)
        clave = esperar_entrada(control, usadas)
        mapeo[nombre] = clave
        usadas.append(clave)
        print(clave)
    print("\nAtajos opcionales (una acción en un solo botón). Espera 4 segundos para omitir cada uno.")
    for nombre in datos["atajos"]:
        esperar_reposo(control)
        print(f"  Pulsa {nombre}...", end=" ", flush=True)
        clave = esperar_entrada(control, usadas, 4)
        mapeo[nombre] = clave
        if clave:
            usadas.append(clave)
        print(clave if clave else "omitido")
    esperar_reposo(control)
    return mapeo


def leer_perfiles():
    if os.path.exists(ARCHIVO_PERFILES):
        with open(ARCHIVO_PERFILES, encoding="utf-8") as f:
            return json.load(f)
    return {}


def guardar_perfiles(perfiles):
    with open(ARCHIVO_PERFILES, "w", encoding="utf-8") as f:
        json.dump(perfiles, f, indent=2, ensure_ascii=False)


def elegir_perfil(control):
    perfiles = leer_perfiles()
    nombres = list(perfiles.keys())
    if nombres:
        print("\nPerfiles guardados:")
        for i, n in enumerate(nombres):
            p = perfiles[n]
            print(f"  [{i}] {n} ({ESQUEMAS[p.get('esquema', 'classic')]['nombre']}, {p.get('control', '')})")
        print("  [n] Crear un perfil nuevo")
        r = input("Elige un perfil: ").strip().lower()
        if r.isdigit() and int(r) < len(nombres):
            p = perfiles[nombres[int(r)]]
            return nombres[int(r)], p.get("esquema", "classic"), p["mapeo"]
    nombre = input("Nombre del perfil nuevo: ").strip() or f"Perfil {len(nombres) + 1}"
    r = input("Esquema de controles (1 = clásico, 2 = moderno) [1]: ").strip()
    esquema = "modern" if r == "2" else "classic"
    mapeo = calibrar(control, esquema)
    perfiles[nombre] = {"control": control.get_name(), "esquema": esquema, "mapeo": mapeo}
    guardar_perfiles(perfiles)
    print(f"Perfil \"{nombre}\" guardado en {ARCHIVO_PERFILES}\n")
    return nombre, esquema, mapeo


def activa(control, clave):
    if not clave:
        return False
    tipo = clave[0]
    if tipo == "boton":
        return clave[1] < control.get_numbuttons() and control.get_button(clave[1]) == 1
    if tipo == "hat":
        if clave[1] >= control.get_numhats():
            return False
        x, y = control.get_hat(clave[1])
        cx, cy = clave[2]
        return (cx != 0 and x == cx) or (cy != 0 and y == cy)
    if tipo == "eje":
        if clave[1] >= control.get_numaxes():
            return False
        return control.get_axis(clave[1]) * clave[2] > 0.5
    return False


def leer(control, mapeo, esquema):
    arriba = activa(control, mapeo["ARRIBA"])
    abajo = activa(control, mapeo["ABAJO"])
    izq = activa(control, mapeo["IZQUIERDA"])
    der = activa(control, mapeo["DERECHA"])
    y = 1 if arriba else (-1 if abajo else 0)
    x = 0 if izq == der else (1 if der else -1)
    m = 0
    datos = ESQUEMAS[esquema]
    for b, bit in list(datos["botones"].items()) + list(datos["atajos"].items()):
        if activa(control, mapeo.get(b)):
            m |= bit
    return 5 + x + 3 * y, m, activa(control, mapeo["GRABAR"])


def recortar(frames):
    ocupados = [i for i, f in enumerate(frames) if f[0] != 5 or f[1] != 0]
    if not ocupados:
        return []
    return frames[max(0, ocupados[0] - 10):min(len(frames), ocupados[-1] + 11)]


def guardar(frames, lado, esquema):
    os.makedirs(CARPETA_GRABACIONES, exist_ok=True)
    ruta = os.path.join(CARPETA_GRABACIONES, datetime.now().strftime("combo_%Y%m%d_%H%M%S.json"))
    with open(ruta, "w", encoding="utf-8") as f:
        json.dump({"version": 2, "fps": FPS, "scheme": esquema, "side": lado, "frames": frames}, f, separators=(",", ":"))
    return ruta


class Capturador:
    def __init__(self, control, mapeo, esquema, lado, perfil):
        self.control = control
        self.mapeo = mapeo
        self.esquema = esquema
        self.lado = lado
        self.perfil = perfil
        self.grabando = False
        self.frames = []
        self.pedir_toggle = threading.Event()
        self.activo = True
        self.n = 0
        self.emitir = None

    def info(self):
        return {"t": "info", "control": self.control.get_name(), "perfil": self.perfil, "sc": self.esquema, "side": self.lado}

    def alternar(self):
        if not self.grabando:
            self.grabando = True
            self.frames = []
            print("● Grabando...", flush=True)
            self.publicar({"t": "rec", "on": True, "n": self.n, "sc": self.esquema})
        else:
            self.grabando = False
            limpios = recortar(self.frames)
            ruta = guardar(limpios, self.lado, self.esquema) if limpios else ""
            print(f"■ Guardado: {ruta} ({len(limpios)} frames)" if ruta else "■ No hubo inputs, no se guardó nada.", flush=True)
            self.publicar({"t": "rec", "on": False, "n": self.n, "side": self.lado, "file": os.path.basename(ruta)})

    def publicar(self, msg):
        if self.emitir:
            self.emitir(msg)

    def bucle(self):
        paso = 1.0 / FPS
        siguiente = time.perf_counter()
        previo = False
        while self.activo:
            pygame.event.pump()
            d, m, grabar = leer(self.control, self.mapeo, self.esquema)
            if (grabar and not previo) or self.pedir_toggle.is_set():
                self.pedir_toggle.clear()
                self.alternar()
            previo = grabar
            if self.grabando:
                self.frames.append([d, m])
            self.publicar({"t": "f", "n": self.n, "d": d, "m": m})
            self.n += 1
            siguiente += paso
            espera = siguiente - time.perf_counter()
            if espera > 0.002:
                time.sleep(espera - 0.0015)
            while time.perf_counter() < siguiente:
                pass
            if time.perf_counter() - siguiente > 0.25:
                siguiente = time.perf_counter()


async def servidor(cap, puerto):
    clientes = set()
    loop = asyncio.get_running_loop()

    def emitir(msg):
        if not clientes:
            return
        texto = json.dumps(msg, separators=(",", ":"))
        loop.call_soon_threadsafe(lambda: [asyncio.ensure_future(enviar(c, texto)) for c in list(clientes)])

    async def enviar(c, texto):
        try:
            await c.send(texto)
        except Exception:
            clientes.discard(c)

    async def atender(ws, *args):
        clientes.add(ws)
        print(f"Página conectada ({len(clientes)} en total).", flush=True)
        try:
            await ws.send(json.dumps(cap.info()))
            async for texto in ws:
                try:
                    msg = json.loads(texto)
                except ValueError:
                    continue
                if msg.get("t") == "toggle":
                    cap.pedir_toggle.set()
                elif msg.get("t") == "hello":
                    await ws.send(json.dumps(cap.info()))
        except Exception:
            pass
        finally:
            clientes.discard(ws)

    cap.emitir = emitir
    async with websockets.serve(atender, "127.0.0.1", puerto):
        print(f"Puente activo en ws://127.0.0.1:{puerto}. Pulsa Conectar en la página o abre el overlay.", flush=True)
        await asyncio.Future()


def main():
    parser = argparse.ArgumentParser(description="Capturador de inputs para SF6 Combo Visual")
    parser.add_argument("--puerto", type=int, default=8765)
    parser.add_argument("--lado", choices=["1", "2"], default=None)
    args = parser.parse_args()
    pygame.init()
    control = elegir_control()
    perfil, esquema, mapeo = elegir_perfil(control)
    lado = args.lado or input("¿Lado inicial del personaje? (1 = P1 izquierda, 2 = P2 derecha) [1]: ").strip()
    lado = "P2" if lado == "2" else "P1"
    cap = Capturador(control, mapeo, esquema, lado, perfil)
    print(f"\nPerfil {perfil} ({ESQUEMAS[esquema]['nombre']}), lado {lado}.")
    print("Cambia al juego y pulsa GRABAR en el control para empezar y terminar cada combo.")
    print("Ctrl+C en esta ventana para salir.\n")
    hilo = threading.Thread(target=cap.bucle, daemon=True)
    hilo.start()
    try:
        asyncio.run(servidor(cap, args.puerto))
    except KeyboardInterrupt:
        print("\nSaliendo.")
    finally:
        cap.activo = False
        pygame.quit()


if __name__ == "__main__":
    main()
