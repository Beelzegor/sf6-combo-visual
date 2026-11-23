# SF6 Combo Visual

Convierte lo que haces con tu control en una imagen limpia de tu combo de **Street Fighter 6**, con el mismo estilo de franjas de los combo trials del juego. Está pensado para creadores de contenido y para cualquiera que quiera compartir sus combos sin depender de notaciones como `236LK` o `qcb+K`.

**Úsalo aquí:** https://beelzegor.github.io/sf6-combo-visual/

## Qué hace

- **Graba tus inputs** desde el control (o el teclado) y los **limpia como lo haría el juego**:
  - Reconoce motions (236, 214, 623, dobles de Super Art y cargas como `[4]6`) aunque tengan frames de más o diagonales sueltas.
  - Usa el **frame data** de cada personaje: un botón solo sale si el personaje ya terminó la animación anterior (con el buffer de 4 frames) o si cae en una ventana de cancel válida.
  - Descarta el machaqueo durante las animaciones y une las repeticiones cuando hubo machaqueo de verdad.
  - Detecta target combos, Drive Rush (cancel y desde Parry), Drive Impact, OD, saltos y seguimientos.
  - Tiene en cuenta el lado (P1 o P2) y permite marcar cambios de lado por cross-up.
- **Editor visual**: corrige pasos, añade notas, coste de Drive y de Super, link o cancel.
- **Exporta PNG** en formato panel o vertical 9:16 para Shorts y TikTok.
- **Comparte por enlace**: el combo viaja dentro de la URL, sin servidor.
- **Overlay para OBS**:
  - Modo trial: muestra tu combo y marca cada paso cuando lo haces, como el modo de combo trials.
  - Modo en vivo: muestra los movimientos limpios a medida que los haces.
- **Perfiles de control** con asignación libre de botones y atajos (Parry, Impact, agarre, OD en un botón).
- **Controles clásicos y modernos.**

## Personajes

| Personaje | Clásico | Moderno |
|---|---|---|
| Juri | Completo con frame data | Especiales asistidos por verificar |
| Ken | Completo con frame data | Especiales asistidos por verificar |
| Guile | Completo con frame data y cargas | Especiales asistidos por verificar |

Cada personaje es un archivo en `data/characters/`. Añadir uno nuevo es copiar uno existente y cambiar sus movimientos y su frame data (ver [Añadir un personaje](#añadir-un-personaje)).

## Uso rápido

1. Abre [la web](https://beelzegor.github.io/sf6-combo-visual/) o `index.html` directamente en Chrome o Edge.
2. Elige personaje y esquema (clásico o moderno) arriba.
3. Pulsa **Grabar**, haz el combo y vuelve a pulsar. El combo limpio aparece al momento.
4. Ajusta lo que quieras y exporta con **Generar PNG** o **Copiar enlace**.

> El navegador solo lee el control mientras la página está en primer plano. Para grabar con el juego abierto usa el capturador.

## Capturador (para grabar con SF6 abierto)

```bash
cd capture
pip install -r requirements.txt
python sf6_capture.py
```

1. Elige tu control y un perfil, o crea uno nuevo: te pide pulsar cada botón una vez.
2. El capturador queda escuchando en `ws://127.0.0.1:8765`.
3. En la web pulsa **Conectar** en "Capturador local".
4. Con el juego en primer plano, pulsa el botón **Grabar** de tu control para empezar y terminar. El combo aparece limpio en la web y además se guarda en `capture/grabaciones/`.

Opciones: `--puerto 9000`, `--lado 2`.

## Overlay en OBS

1. Arma tu combo en la web y pulsa **Overlay OBS: este combo** (o **inputs en vivo**). Se copia un enlace.
2. En OBS añade una fuente **Navegador** con ese enlace. Ancho recomendado: 920 px.
3. Deja abierto el capturador: el overlay se conecta solo.

Parámetros del enlace: `w` (ancho), `port`, `side` (`P1` o `P2`), `n` (pasos visibles en modo en vivo), `bg=1` (con fondo).

## Estructura

```
index.html            Editor
overlay.html          Overlay para OBS
css/app.css
js/engine.js          Motor de limpieza (motions, frame data, clásico y moderno)
js/render.js          Dibujo de las franjas e iconos
js/controls.js        Control, teclado y perfiles
js/bridge.js          Conexión con el capturador
js/app.js             Lógica del editor
js/overlay.js
js/iconpack.js        Iconos incrustados (generado con tools/build_iconpack.py)
js/demos.js           Grabaciones de prueba
data/characters/      Un archivo por personaje
capture/              Capturador en Python
tools/                Scripts de construcción
tests/                Pruebas del motor
assets/icons/         Iconos originales
```

## Pruebas

```bash
node tests/engine.test.js
```

Cada caso es una grabación sintética con ruido (diagonales sueltas, machaqueo, cargas, lado P2) y el resultado limpio que se espera.

## Versión de un solo archivo

```bash
python3 tools/build_single.py
```

Genera `dist/sf6-combo-visual.html` y `dist/sf6-combo-overlay.html`, que funcionan sin conexión con doble clic.

## Añadir un personaje

Copia `data/characters/juri.js` y cambia:

- `command`: normales con dirección (únicos).
- `tc`: target combos, paso por paso.
- `specials`: motion (`236`, `214`, `623`, `236236`, `214214`, `[4]6`, `[2]8`, `[4]646`), botones y tipo (`special` o `super` con su `tag` SA1, SA2 o SA3). El orden importa: primero Super Arts, luego OD y al final los especiales normales.
- `followups`: seguimientos que salen después de un especial.
- `fd`: frame data por notación o nombre: `[arranque, activos, total, cancels]`, donde los cancels son `c` (chain), `s` (especial), `S` (super) y `t` (target combo).
- `modern.sp`: especial asistido por dirección (`N`, `F`, `D`, `B`) y `modern.air`.

Luego añade el `<script>` en `index.html` y `overlay.html`, y crea casos en `tests/engine.test.js`.

## Datos y créditos

- Frame data de [Ultimate Frame Data](https://ultimateframedata.com/sf6).
- Street Fighter 6, sus personajes e iconos pertenecen a Capcom. Este proyecto no está afiliado a Capcom.
- El código está bajo licencia MIT. Los iconos de `assets/icons` no están cubiertos por esa licencia.

## Pendiente

- Más personajes (Ryu es el siguiente).
- Verificar los especiales asistidos de los controles modernos y sus iconos.
- Tiempos exactos de Super Arts, Drive Rush y Parry (hoy aproximados).
