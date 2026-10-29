from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

class DocumentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    filename: str
    content_type: str
    status: str
    uploaded_at: datetime
    processed_at: datetime | None
    page_count: int | None
    error_message: str | None = None

class ChunkRead(BaseModel):
    id: UUID
    page_number: int
    chunk_index: int
    text: str

class SearchRequest(BaseModel):
    query: str = Field(min_length=2, max_length=2000)
    top_k: int = Field(default=5, ge=1, le=20)

class SearchHit(BaseModel):
    chunk_id: UUID
    document_id: UUID
    document: str
    page: int
    score: float
    text: str

class SearchResponse(BaseModel):
    results: list[SearchHit]

class AskRequest(BaseModel):
    question: str = Field(min_length=3, max_length=2000)
    top_k: int = Field(default=5, ge=1, le=20)

class Citation(BaseModel):
    document_id: UUID
    document: str
    page: int
    score: float
    excerpt: str

class AskResponse(BaseModel):
    answer: str
    sources: list[Citation]
    response_time_ms: float

class ExtractionResponse(BaseModel):
    run_id: UUID
    document_id: UUID
    status: str
    result: dict[str, Any]
