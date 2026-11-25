#!/usr/bin/env python3
"""Build the single-file app: inlines src/styles.css, src/icons.svg, src/i18n/en.js and src/app.js
into src/index.html and writes ./index.html (the file that is deployed).

Usage: python3 scripts/build.py
Only uses the Python standard library. If Node.js is installed, the JavaScript is syntax-checked first.
"""
import pathlib, shutil, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"


def read(name):
    return (SRC / name).read_text(encoding="utf-8")


def check_js(*files):
    node = shutil.which("node")
    if not node:
        return
    for f in files:
        r = subprocess.run([node, "--check", str(SRC / f)], capture_output=True, text=True)
        if r.returncode:
            sys.exit(f"Syntax error in src/{f}:\n{r.stderr}")


def main():
    check_js("app.js", "i18n/en.js")
    app = read("app.js").replace("/*@i18n*/\n", read("i18n/en.js"), 1)
    html = (
        read("index.html")
        .replace("/*@styles*/", read("styles.css"), 1)
        .replace("<!--@icons-->", read("icons.svg"), 1)
        .replace("<!--@app-->", app, 1)
    )
    (ROOT / "index.html").write_text(html, encoding="utf-8")
    print(f"index.html built ({len(html.encode('utf-8')) // 1024} KB)")


if __name__ == "__main__":
    main()
