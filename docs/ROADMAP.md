# Build roadmap

This repository implements the complete project shape and local workflow in a compact v1. The following sequence is a practical study/build order matching the original ten-week plan:

1. FastAPI, Pydantic, and document metadata.
2. Upload validation, local storage, duplicate detection, and page-aware extraction.
3. Configurable page-preserving chunks, local embeddings, and pgvector search.
4. Ollama provider, grounded RAG, and source records.
5. Validated technical-manual JSON extraction.
6. Celery processing, job status, and retries.
7. React library, document detail, search, and Q&A screens.
8. Build a representative question set and compare chunk/top-k settings with `evaluation/run.py`.
9. Expand integration coverage against temporary PostgreSQL/Redis/Ollama services, audit local attack surfaces.
10. Run the Compose stack on the target machine, capture screenshots, and publish measured results.

The sample evaluation JSONL is format-only and deliberately does not include claimed benchmark results. Replace it with a licensed or user-owned corpus and roughly fifty questions, expected source filenames, and pages.
