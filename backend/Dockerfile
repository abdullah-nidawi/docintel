FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /app
COPY pyproject.toml ./
COPY app ./app
COPY alembic.ini ./
COPY migrations ./migrations
# Local inference runs on the host CPU. Installing PyTorch's CPU build avoids
# pulling CUDA libraries into the Docker image on machines without an NVIDIA GPU.
RUN pip install --index-url https://download.pytorch.org/whl/cpu torch && pip install .
EXPOSE 8000
