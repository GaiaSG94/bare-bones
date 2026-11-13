# Génère les vignettes du sommaire à partir des captures plein cadre.
import sys, os
from PIL import Image

shots, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
for n in range(1, 11):
    src = os.path.join(shots, f'p{n:02d}.png')
    if not os.path.exists(src):
        print('absente', src); continue
    im = Image.open(src).convert('RGB')
    w, h = im.size
    # retire le liseré de page autour du cadre 16:9 (≈ 1,7 % de chaque côté)
    mx, my = round(w * 0.018), round(h * 0.018)
    im = im.crop((mx, my, w - mx, h - my)).resize((640, 360), Image.LANCZOS)
    im.save(os.path.join(out, f'planche-{n:02d}.jpg'), quality=82, optimize=True, progressive=True)
    print('ok', n)
