from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Chunk, Document
from app.services.embeddings import embed_texts

def retrieve(db: Session, query: str, top_k: int) -> list[tuple[Chunk, Document, float]]:
    vector = embed_texts([query])[0]
    distance = Chunk.embedding.cosine_distance(vector)
    statement = (select(Chunk, Document, distance.label("distance"))
                 .join(Document, Document.id == Chunk.document_id)
                 .where(Document.status == "READY")
                 .order_by(distance).limit(top_k))
    return [(chunk, document, max(0.0, 1.0 - float(distance_value)))
            for chunk, document, distance_value in db.execute(statement).all()]
