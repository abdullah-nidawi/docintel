from dataclasses import dataclass

@dataclass(frozen=True)
class TextPage:
    page_number: int
    text: str

@dataclass(frozen=True)
class TextChunk:
    page_number: int
    chunk_index: int
    text: str

def split_pages(pages: list[TextPage], chunk_size: int, overlap: int) -> list[TextChunk]:
    """Split words into bounded chunks without crossing source-page boundaries."""
    if chunk_size <= 0 or overlap < 0 or overlap >= chunk_size:
        raise ValueError("chunk_size must be positive and overlap must be smaller than chunk_size")
    chunks: list[TextChunk] = []
    index = 0
    stride = chunk_size - overlap
    for page in pages:
        words = page.text.split()
        for start in range(0, len(words), stride):
            content = " ".join(words[start:start + chunk_size]).strip()
            if content:
                chunks.append(TextChunk(page.page_number, index, content))
                index += 1
            if start + chunk_size >= len(words):
                break
    return chunks
