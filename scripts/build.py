#!/usr/bin/env python3
"""Build the single-file app.

Concatenates src/css/*.css and src/js/*.js in file-name order, inserts the English
dictionary (src/i18n/en.js) and the icon sprite (src/icons.svg), and writes the result
into the shell (src/index.html) as ./index.html, the file that is deployed.

Usage: python3 scripts/build.py
Only uses the Python standard library. If Node.js is installed, each JS file is
syntax-checked first.
"""
import pathlib, shutil, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"


def read(path):
    return path.read_text(encoding="utf-8")


def concat(folder, pattern):
    files = sorted((SRC / folder).glob(pattern))
    if not files:
        sys.exit(f"No files in src/{folder}")
    return files, "".join(read(f) for f in files)


def check_js(files):
    node = shutil.which("node")
    if not node:
        return
    for f in files:
        r = subprocess.run([node, "--check", str(f)], capture_output=True, text=True)
        if r.returncode:
            sys.exit(f"Syntax error in {f.relative_to(ROOT)}:\n{r.stderr}")


def main():
    css_files, css = concat("css", "*.css")
    js_files, js = concat("js", "*.js")
    check_js(js_files + [SRC / "i18n" / "en.js"])
    app = js.replace("/*@i18n*/\n", read(SRC / "i18n" / "en.js"), 1)
    html = (
        read(SRC / "index.html")
        .replace("/*@styles*/", css, 1)
        .replace("<!--@icons-->", read(SRC / "icons.svg"), 1)
        .replace("<!--@app-->", app, 1)
    )
    (ROOT / "index.html").write_text(html, encoding="utf-8")
    print(f"index.html built from {len(css_files)} CSS and {len(js_files)} JS files "
          f"({len(html.encode('utf-8')) // 1024} KB)")


if __name__ == "__main__":
    main()
