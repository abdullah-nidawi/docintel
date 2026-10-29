from celery import Celery

from app.config import settings
from app.services.processing import process_document

celery_app = Celery("docintel", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.update(task_acks_late=True, worker_prefetch_multiplier=1,
                       task_reject_on_worker_lost=True)

@celery_app.task(bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 3})
def process_document_task(self, document_id: str) -> None:
    process_document(__import__("uuid").UUID(document_id))
