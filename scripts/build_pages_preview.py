"""Build a static GitHub Pages preview without changing the cPanel source."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import argparse
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public"


def build(base_path: str, destination: Path) -> None:
    base = "/" + base_path.strip("/") if base_path.strip("/") else ""
    assert not destination.exists(), "Use a new output directory."
    destination.mkdir(parents=True)
    for source in SOURCE.rglob("*"):
        relative = source.relative_to(SOURCE)
        if not source.is_file() or relative.parts[0] in {"api", "admin"}:
            continue
        if source.suffix not in {".html", ".css", ".js", ".svg", ".png", ".webp", ".ttf", ".txt"}:
            continue
        if relative.as_posix() == "robots.txt":
            continue
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        if source.suffix == ".html":
            text = source.read_text(encoding="utf-8")
            text = re.sub(r'\b(href|src|action)=("|\')/(?!/)',
                          lambda m: m[1] + "=" + m[2] + base + "/", text)
            text = text.replace('<html lang="en">', '<html lang="en" data-static-preview="true">')
            text = text.replace("</head>", '<meta name="robots" content="noindex,nofollow"></head>')
            if 'id="consultation"' in text:
                text = text.replace('<form id="consultation"',
                    '<p role="status">Design preview: request submission is unavailable on GitHub Pages. Use the cPanel site to test the form.</p><form id="consultation"')
                text = re.sub(r'<(input|select|textarea|button)\b', r'<\1 disabled', text)
                # Keep navigation buttons functional; disable only the form's controls.
                text = text.replace('<button disabled class="menu-toggle"', '<button class="menu-toggle"')
                text = text.replace('<button disabled class="solutions-toggle"', '<button class="solutions-toggle"')
            target.write_text(text, encoding="utf-8", newline="")
        elif relative.as_posix() == "assets/app.js":
            text = source.read_text(encoding="utf-8")
            original = "const form = document.getElementById('consultation');"
            assert original in text, "Review form initialization before publishing."
            text = text.replace(original, "const form = document.documentElement.dataset.staticPreview ? null : document.getElementById('consultation');")
            target.write_text(text, encoding="utf-8", newline="")
        else:
            shutil.copyfile(source, target)
    (destination / ".nojekyll").touch()
    (destination / "robots.txt").write_text("User-agent: *\nDisallow: /\n", encoding="utf-8")

    class Links(HTMLParser):
        def handle_starttag(self, tag, attrs):
            for key, value in attrs:
                if key not in {"href", "src", "action"} or not value:
                    continue
                url = urlsplit(value)
                if url.scheme or url.netloc or not url.path:
                    continue
                assert url.path.startswith(base + "/"), (page, value)
                relative_path = url.path[len(base):].lstrip("/")
                target = destination / relative_path
                if url.path.endswith("/"):
                    target = target / "index.html"
                assert target.is_file(), (page, value)

    for page in destination.rglob("*.html"):
        Links().feed(page.read_text(encoding="utf-8"))
    assert not list(destination.rglob("*.php"))
    print(f"Built and checked {len(list(destination.rglob('*.html')))} preview pages at {destination}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-path", required=True)
    parser.add_argument("--output", default="_pages_preview")
    args = parser.parse_args()
    build(args.base_path, Path(args.output))
