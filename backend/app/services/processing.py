from datetime import datetime, timezone
from pathlib import Path
from uuid import UUID

from sqlalchemy import delete

from app.config import settings
from app.database import SessionLocal
from app.models import Chunk, Document, DocumentStatus
from app.services.chunking import split_pages
from app.services.embeddings import embed_texts
from app.services.extraction import extract_pages

def process_document(document_id: UUID) -> None:
    """Idempotently replace a document's index and set a terminal processing state."""
    with SessionLocal() as db:
        document = db.get(Document, document_id)
        if document is None:
            return
        document.status = DocumentStatus.PROCESSING
        document.error_message = None
        db.commit()
        try:
            pages = extract_pages(Path(document.file_path))
            if not any(page.text.strip() for page in pages):
                raise ValueError("No readable text was found. Scanned PDFs may need OCR.")
            chunks = split_pages(pages, settings.chunk_size, settings.chunk_overlap)
            vectors = embed_texts([chunk.text for chunk in chunks])
            db.execute(delete(Chunk).where(Chunk.document_id == document_id))
            db.add_all([Chunk(document_id=document_id, page_number=chunk.page_number,
                              chunk_index=chunk.chunk_index, text=chunk.text, embedding=vector)
                        for chunk, vector in zip(chunks, vectors, strict=True)])
            document.page_count = max((page.page_number for page in pages), default=0)
            document.status = DocumentStatus.READY
            document.processed_at = datetime.now(timezone.utc)
            db.commit()
        except Exception as exc:
            db.rollback()
            document = db.get(Document, document_id)
            if document:
                document.status = DocumentStatus.FAILED
                document.error_message = str(exc)[:1000]
                db.commit()
            raise
