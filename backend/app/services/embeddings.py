from functools import lru_cache
from pathlib import Path

from sentence_transformers import SentenceTransformer

from app.config import settings

@lru_cache(maxsize=1)
def _model() -> SentenceTransformer:
    settings.model_cache_dir.mkdir(parents=True, exist_ok=True)
    return SentenceTransformer(settings.embedding_model, cache_folder=str(settings.model_cache_dir))

def embed_texts(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    vectors = _model().encode(texts, normalize_embeddings=True, show_progress_bar=False)
    return vectors.tolist()
