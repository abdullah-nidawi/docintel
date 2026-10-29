import pytest

from app.services.chunking import TextPage, split_pages

def test_chunks_preserve_source_pages_and_overlap() -> None:
    pages = [TextPage(4, "one two three four five"), TextPage(8, "six seven")]
    chunks = split_pages(pages, chunk_size=3, overlap=1)
    assert [(chunk.page_number, chunk.text) for chunk in chunks] == [
        (4, "one two three"), (4, "three four five"), (8, "six seven")]

@pytest.mark.parametrize("size,overlap", [(0, 0), (3, 3), (3, 4), (-1, 0)])
def test_invalid_chunk_configuration_is_rejected(size: int, overlap: int) -> None:
    with pytest.raises(ValueError):
        split_pages([TextPage(1, "some words")], size, overlap)

def test_empty_pages_do_not_create_chunks() -> None:
    assert split_pages([TextPage(1, "  ")], 10, 2) == []
