"""Export generated garden cutouts, preserving a mathematically empty connector.

Usage: python scripts/build-garden-v3.py
Requires Pillow. Source PNGs stay outside public; only WebP exports reach clients.
No feathering, blending, edge repainting or artistic changes are applied here.
"""
from pathlib import Path
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'design-source' / 'garden-v3'
DEST = ROOT / 'public' / 'assets' / 'garden-v3'
DEST.mkdir(parents=True, exist_ok=True)
manifest = {'source_size': [1024, 1536], 'connector_rows': 128, 'scenes': {}}

for name in ('bench', 'ferns', 'planter', 'canopy', 'branch', 'trunk', 'fallen-log'):
    image = Image.open(SOURCE / f'{name}.png').convert('RGBA')
    assert image.size == (1024, 1536), (name, image.size)
    # Generated transparent regions contain occasional alpha=1 quantization noise.
    # Discard that invisible noise, without changing any visible painted pixels.
    image.putalpha(image.getchannel('A').point(lambda value: 0 if value <= 1 else value))
    alpha = image.getchannel('A')
    for area in ((0, 0, 1024, 128), (0, 1408, 1024, 1536)):
        assert alpha.crop(area).getextrema() == (0, 0), (name, 'connector is not empty')
    if name in ('canopy', 'branch', 'trunk', 'fallen-log'):
        edge = (0, 256, 2, 1280) if name in ('branch', 'trunk') else (1022, 256, 1024, 1280)
        assert alpha.crop(edge).getextrema()[1] >= 200, (name, 'object must extend through canvas edge')
    manifest['scenes'][name] = {}
    for width in (480, 1024):
        size = (width, width * 3 // 2)
        exported = image.resize(size, Image.Resampling.LANCZOS) if width != 1024 else image
        filename = DEST / f'{name}-{width}.webp'
        exported.save(filename, 'WEBP', quality=86, method=6, alpha_quality=100, exact=True)
        decoded = Image.open(filename).convert('RGBA')
        border = width // 8
        for area in ((0, 0, width, border), (0, size[1] - border, width, size[1])):
            assert decoded.getchannel('A').crop(area).getextrema() == (0, 0)
        manifest['scenes'][name][str(width)] = {'size': list(size), 'bytes': filename.stat().st_size}

(DEST / 'sizes.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
print(json.dumps(manifest, indent=2))
