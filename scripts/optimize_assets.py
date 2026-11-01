"""Regenerate lossless WOFF2 fonts and versioned public assets.

Run from the repository root with fonttools[woff] installed.
Original fonts remain as reproducible sources; all glyphs and variable axes stay.
"""
from pathlib import Path
from hashlib import sha256
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/assets'

def versioned(stem, suffix, content):
    name = f'{stem}.{sha256(content).hexdigest()[:12]}{suffix}'
    (ASSETS / name).write_bytes(content)
    return name

def main():
    css = (ASSETS / 'styles.css').read_text(encoding='utf-8')
    for name in ('inter', 'space-grotesk'):
        source = ASSETS / f'{name}.ttf'
        font = TTFont(source, recalcTimestamp=False)
        font.flavor = 'woff2'
        from io import BytesIO
        output = BytesIO()
        font.save(output)
        filename = versioned(name, '.woff2', output.getvalue())
        css = css.replace(f"url('{name}.ttf') format('truetype')",
                          f"url('{filename}') format('woff2')")
        print(f'{name}: {source.stat().st_size} -> {len(output.getvalue())} bytes')
    css_name = versioned('styles', '.css', css.encode('utf-8'))
    js_name = versioned('app', '.js', (ASSETS / 'app.js').read_bytes())
    import re
    for page in (ROOT / 'public').rglob('*.html'):
        text = page.read_text(encoding='utf-8')
        text = re.sub(r'/assets/styles(?:\.[0-9a-f]{12})?\.css', '/assets/' + css_name, text)
        text = re.sub(r'/assets/app(?:\.[0-9a-f]{12})?\.js', '/assets/' + js_name, text)
        if 'class="light-field' in text or ' light-field' in text:
            preload = '<link rel="preload" href="/assets/orange-trails.webp" as="image" type="image/webp" fetchpriority="high">'
            if preload not in text:
                text = text.replace('<link rel="stylesheet"', preload + '<link rel="stylesheet"', 1)
        page.write_text(text, encoding='utf-8', newline='')
    print(css_name, js_name)

if __name__ == '__main__':
    main()
