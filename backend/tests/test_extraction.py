from pathlib import Path

from app.services.extraction import extract_pages

def test_text_file_is_a_single_source_page(tmp_path: Path) -> None:
    source = tmp_path / "notes.md"
    source.write_text("# Notes\nUseful detail", encoding="utf-8")
    pages = extract_pages(source)
    assert len(pages) == 1
    assert pages[0].page_number == 1
    assert "Useful detail" in pages[0].text
