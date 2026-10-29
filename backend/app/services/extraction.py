from pathlib import Path

import pymupdf

from app.services.chunking import TextPage

SUPPORTED_SUFFIXES = {".pdf", ".txt", ".md", ".markdown"}
MIME_BY_SUFFIX = {
    ".pdf": "application/pdf", ".txt": "text/plain",
    ".md": "text/markdown", ".markdown": "text/markdown",
}

def extract_pages(path: Path) -> list[TextPage]:
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        pages = []
        with pymupdf.open(path) as document:
            for number, page in enumerate(document, start=1):
                text = page.get_text("text").strip()
                if text:
                    pages.append(TextPage(number, text))
        return pages
    if suffix in {".txt", ".md", ".markdown"}:
        return [TextPage(1, path.read_text(encoding="utf-8-sig").strip())]
    raise ValueError("Unsupported document type")
