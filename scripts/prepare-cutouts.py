"""Genera recortes con transparencia a partir de los originales (no los modifica).

- Personaje (4 vistas): elimina el fondo lavanda por relleno desde los bordes.
- Lettering lineal: convierte el trazo negro en una máscara alfa.
Salida: scripts/.cache/*.png (luego scripts/optimize-images.mjs los comprime).
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "scripts" / ".cache"
OUT.mkdir(parents=True, exist_ok=True)


def cutout(src: Path, dst: Path, tol=34.0, soft=14.0):
    im = Image.open(src).convert("RGB")
    a = np.asarray(im).astype(np.float32)
    h, w, _ = a.shape
    # Color de fondo estimado por fila con los bordes izquierdo y derecho
    edge = np.concatenate([a[:, :12, :], a[:, -12:, :]], axis=1)
    row_bg = np.median(edge, axis=1)  # (h,3)
    dist = np.sqrt(((a - row_bg[:, None, :]) ** 2).sum(axis=2))
    cand = (dist < tol + soft).astype(np.uint8) * 255
    # Relleno desde los bordes para quedarnos solo con el fondo conectado
    m = Image.fromarray(cand, "L").copy()
    seeds = [(x, 0) for x in range(0, w, 16)] + [(0, y) for y in range(0, h, 16)] + [(w - 1, y) for y in range(0, h, 16)]
    for s in seeds:
        if m.getpixel(s) == 255:
            ImageDraw.floodfill(m, s, 128)
    bg = np.asarray(m) == 128
    # Huecos cerrados (entre piernas, brazo-cuerpo): fondo con tolerancia estricta
    lav = (a.mean(axis=2) > 140) & (a[:, :, 2] >= a[:, :, 0]) & (a[:, :, 2] > a[:, :, 1] + 6)
    strict = Image.fromarray((lav & ~bg).astype(np.uint8) * 255, "L").copy()
    holes = np.zeros((h, w), bool)
    for y in range(0, h, 6):
        for x in range(0, w, 6):
            if strict.getpixel((x, y)) == 255:
                before = np.asarray(strict).copy()
                ImageDraw.floodfill(strict, (x, y), 100)
                region = (np.asarray(strict) == 100) & (before == 255)
                if region.sum() > 1500:
                    holes |= region
                strict.paste(0, mask=Image.fromarray((region * 255).astype(np.uint8), "L"))
    # Alfa suave en la transición
    alpha = np.ones((h, w), np.float32)
    ramp = np.clip((dist - tol) / soft, 0, 1)
    alpha[bg] = ramp[bg]
    if holes.any():
        hm = Image.fromarray((holes * 255).astype(np.uint8), "L").filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(5))
        hm = np.asarray(hm) > 127
        alpha[hm] = np.minimum(alpha[hm], ramp[hm] * 0.0)
    alpha_img = Image.fromarray((alpha * 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(0.7))
    rgba = im.copy()
    rgba.putalpha(alpha_img)
    bbox = alpha_img.point(lambda v: 255 if v > 8 else 0).getbbox()
    rgba = rgba.crop(bbox)
    rgba.save(dst)
    print(dst.name, rgba.size)


# Zonas del lettering que no se usan en la web (coordenadas tras recortar el papel sobrante).
# Firma y fecha "2024" con sus destellos, abajo a la derecha: retirada a petición de Rymone.
LETTERING_ERASE = [(1545, 585, 1872, 917)]


def line_mask(src: Path, dst: Path):
    im = Image.open(src).convert("L")
    a = np.asarray(im).astype(np.float32)
    alpha = np.clip((215 - a) / 150, 0, 1)  # trazo negro -> opaco; el papel (y su ruido JPEG) queda transparente
    # Recorte inicial al contenido para que LETTERING_ERASE use coordenadas estables
    ys, xs = np.nonzero(alpha > 10 / 255)
    alpha = alpha[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    for x0, y0, x1, y1 in LETTERING_ERASE:
        alpha[y0:y1, x0:x1] = 0
    im = Image.fromarray((alpha * 255).astype(np.uint8), "L")
    out = Image.new("LA", im.size)
    out.putdata([(255, int(v * 255)) for v in alpha.flatten()])
    bbox = Image.fromarray((alpha * 255).astype(np.uint8)).point(lambda v: 255 if v > 10 else 0).getbbox()
    out.crop(bbox).save(dst)
    print(dst.name, out.crop(bbox).size)


def word_mask(src: Path, dst: Path):
    """Palabra "Rymone" generada con IA (assets-ia/): tinta negra -> máscara alfa, sin papel ni líneas guía."""
    a = np.asarray(Image.open(src).convert("L")).astype(np.float32)
    alpha = np.clip((175 - a) / 115, 0, 1)
    ys, xs = np.nonzero(alpha > 0.08)
    alpha = alpha[max(ys.min() - 4, 0):ys.max() + 5, max(xs.min() - 4, 0):xs.max() + 5]
    out = Image.fromarray((alpha * 255).astype(np.uint8), "L")
    la = Image.merge("LA", (Image.new("L", out.size, 255), out))
    la.save(dst)
    print(dst.name, la.size)


def word_compact(src: Path, dst: Path, box=(540, 60, 2160, 816), fade=60):
    """Versión compacta de la palabra para usos pequeños (logo, texto): recorta los trazos largos
    y los desvanece en los bordes para que no acaben de golpe."""
    im = Image.open(src)
    im = im.crop(box)
    a = np.asarray(im.split()[1]).astype(np.float32)
    w = a.shape[1]
    ramp = np.ones(w, np.float32)
    ramp[:fade] = np.linspace(0, 1, fade)
    ramp[-fade:] = np.linspace(1, 0, fade)
    a = a * ramp[None, :]
    ys, xs = np.nonzero(a > 20)
    a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    out = Image.merge("LA", (Image.new("L", (a.shape[1], a.shape[0]), 255), Image.fromarray(a.astype(np.uint8), "L")))
    out.save(dst)
    print(dst.name, out.size)


def signature_mask(src: Path, dst: Path):
    """Firma de Rymone (foto de rotulador sobre papel): se compensa la luz desigual del papel
    y la tinta pasa a máscara alfa."""
    from PIL import ImageOps
    im = ImageOps.exif_transpose(Image.open(src)).convert("L")
    a = np.asarray(im).astype(np.float32)
    # Luz del papel: máximo local a 1/4 de escala (más ancho que cualquier trazo) y suavizado
    small = im.resize((im.width // 4, im.height // 4)).filter(ImageFilter.MaxFilter(41)).filter(ImageFilter.GaussianBlur(12))
    paper = np.asarray(small.resize(im.size, Image.BILINEAR)).astype(np.float32)
    norm = np.clip(a / np.maximum(paper, 1), 0, 1)  # 1 = papel, ~0.2 = tinta
    alpha = np.clip((0.8 - norm) / 0.2, 0, 1)
    # Encaje: solo filas/columnas con tinta de verdad (ignora motas sueltas del papel)
    solid = alpha > 0.5
    rows = np.nonzero(solid.sum(axis=1) > 25)[0]
    cols = np.nonzero(solid.sum(axis=0) > 25)[0]
    pad = 24
    alpha = alpha[max(rows.min() - pad, 0):rows.max() + pad, max(cols.min() - pad, 0):cols.max() + pad]
    out = Image.fromarray((alpha * 255).astype(np.uint8), "L").filter(ImageFilter.MedianFilter(3))
    Image.merge("LA", (Image.new("L", out.size, 255), out)).save(dst)
    print(dst.name, out.size)


def mosaico(size, block, seed):
    """Mosaico de píxeles con la paleta de la web: la obra o el disco "por desvelar"."""
    import random
    rnd = random.Random(seed)
    pal = [(19, 10, 22), (31, 16, 36), (109, 26, 91), (255, 91, 26), (70, 213, 230), (255, 134, 216), (60, 20, 60), (25, 12, 30)]
    w, h = size
    im = Image.new("RGB", size)
    px = im.load()
    cols, rows = w // block + 1, h // block + 1
    for cy in range(rows):
        for cx in range(cols):
            # más oscuro en los bordes, color concentrado en el centro
            d = ((cx / cols - 0.5) ** 2 + (cy / rows - 0.5) ** 2) ** 0.5
            c = pal[rnd.choice([0, 1, 6, 7])] if rnd.random() < 0.35 + d else pal[rnd.choice([2, 3, 4, 5, 2])]
            for y in range(cy * block, min(h, (cy + 1) * block)):
                for x in range(cx * block, min(w, (cx + 1) * block)):
                    px[x, y] = c
    return im


def locked_assets():
    """Obra y CD bloqueados: no muestran nada real, solo un mosaico de píxeles."""
    mosaico((1300, 700), 50, 7).save(OUT / "obra-proxima.png")
    case = Image.open(ROOT / "musica" / "cd 1.png").convert("RGB")
    case.paste(mosaico((885, 855), 55, 11), (200, 180))  # se sustituye la portada por el mosaico
    case.save(OUT / "cd-proximo.png")
    print("obra-proxima.png, cd-proximo.png")


def crop_painting(src: Path, dst: Path, tol=38.0):
    """Quita la pared blanca de la foto y deja solo el cuadro (marco incluido).
    No toca colores ni proporciones de la obra: solo recorta la pared que la rodea."""
    im = Image.open(src).convert("RGB")
    a = np.asarray(im).astype(np.float32)
    wall = np.median(np.concatenate([a[:8].reshape(-1, 3), a[-8:].reshape(-1, 3), a[:, :8].reshape(-1, 3), a[:, -8:].reshape(-1, 3)]), axis=0)
    dist = np.sqrt(((a - wall) ** 2).sum(axis=2))
    diff = dist > tol
    rows = np.nonzero(diff.mean(axis=1) > 0.15)[0]
    cols = np.nonzero(diff.mean(axis=0) > 0.15)[0]
    y0, y1, x0, x1 = rows.min(), rows.max() + 1, cols.min(), cols.max() + 1
    # Segunda pasada dentro de la caja: fuera bordes de sombra o pared (filas/columnas casi sin obra)
    inner = dist[y0:y1, x0:x1] > 95  # la sombra gris del suelo/pared no cuenta como obra
    r = np.nonzero(inner.mean(axis=1) > 0.6)[0]
    c = np.nonzero(inner.mean(axis=0) > 0.6)[0]
    box = (int(x0 + c.min()), int(y0 + r.min()), int(x0 + c.max()) + 1, int(y0 + r.max()) + 1)
    # Última pasada: fuera las filas/columnas de borde que siguen siendo claras (reflejo o pared)
    x0, y0, x1, y1 = box
    lum = a.mean(axis=2)
    while lum[y0, x0:x1].mean() > 120: y0 += 1
    while lum[y1 - 1, x0:x1].mean() > 120: y1 -= 1
    while lum[y0:y1, x0].mean() > 120: x0 += 1
    while lum[y0:y1, x1 - 1].mean() > 120: x1 -= 1
    box = (x0, y0, x1, y1)
    im.crop(box).save(dst)
    print(dst.name, box, im.crop(box).size)


if __name__ == "__main__":
    signature_mask(ROOT / "IMG_7088.jpeg", OUT / "firma.png")
    crop_painting(ROOT / "cuadro 1.png", OUT / "obra-01.png")
    crop_painting(ROOT / "cuadro 2.png", OUT / "obra-02.png")
    crop_painting(ROOT / "cuadro 3.png", OUT / "obra-03.png")
    locked_assets()
    for i in range(1, 5):
        cutout(ROOT / f"personaje para 3d vista {i}.png", OUT / f"personaje-vista-{i}.png")
    line_mask(ROOT / "implementar de manera organica.jpeg", OUT / "lettering-trazo.png")
