# Convertit un sous-ensemble de Noto Sans (SIL OFL) en police "typeface" three.js.
import json, sys
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen

src, out = sys.argv[1], sys.argv[2]
chars = (" !\"#%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]_abcdefghijklmnopqrstuvwxyz{|}~"
         "«»·–—’…×→←↔✓€ΣÀÂÄÇÉÈÊËÎÏÔÖÙÛÜàâäçéèêëîïôöùûüœŒ−≤≥")
f = TTFont(src)
gs = f.getGlyphSet()
cmap = f.getBestCmap()
upm = f['head'].unitsPerEm
hmtx = f['hmtx']

class P(BasePen):
    def __init__(s, gs): super().__init__(gs); s.o = []
    def _moveTo(s, p): s.o += ['m', round(p[0]), round(p[1])]
    def _lineTo(s, p): s.o += ['l', round(p[0]), round(p[1])]
    def _qCurveToOne(s, c, p): s.o += ['q', round(p[0]), round(p[1]), round(c[0]), round(c[1])]
    def _curveToOne(s, c1, c2, p): s.o += ['b', round(p[0]), round(p[1]), round(c1[0]), round(c1[1]), round(c2[0]), round(c2[1])]
    def _closePath(s): pass

glyphs = {}
for ch in chars:
    cp = ord(ch)
    if cp not in cmap: print('absent', ch); continue
    name = cmap[cp]
    pen = P(gs); gs[name].draw(pen)
    xs = pen.o
    glyphs[ch] = {'ha': hmtx[name][0], 'o': ' '.join(str(v) for v in xs)}
hhea = f['hhea']; post = f['post']; head = f['head']
data = {
    'glyphs': glyphs, 'familyName': 'Noto Sans Bold (subset, SIL OFL 1.1)',
    'ascender': hhea.ascent, 'descender': hhea.descent,
    'underlinePosition': post.underlinePosition, 'underlineThickness': post.underlineThickness,
    'boundingBox': {'xMin': head.xMin, 'yMin': head.yMin, 'xMax': head.xMax, 'yMax': head.yMax},
    'resolution': upm, 'original_font_information': {'license': 'SIL Open Font License 1.1'},
}
json.dump(data, open(out, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
print('glyphes', len(glyphs), 'octets', len(json.dumps(data, ensure_ascii=False)))
