from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.config import settings

app = FastAPI(title="DocIntel API", version="0.1.0",
              description="Local-first document intelligence with source-grounded answers.")
app.add_middleware(CORSMiddleware, allow_origins=settings.allowed_origins,
                   allow_credentials=False, allow_methods=["GET", "POST"], allow_headers=["*"])
app.include_router(router)

@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}
