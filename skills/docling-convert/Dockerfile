FROM python:3.12-slim

ENV DEBIAN_FRONTEND=noninteractive \
    PIP_NO_CACHE_DIR=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libgl1 \
        libglib2.0-0 \
        libxcb1 \
    && rm -rf /var/lib/apt/lists/*

RUN python -m pip install --upgrade pip \
    && python -m pip install --index-url https://download.pytorch.org/whl/cpu torch==2.12.1 torchvision==0.27.1 \
    && python -m pip install docling==2.110.0

RUN docling-tools models download layout tableformer rapidocr --output-dir /opt/docling/models \
    && chmod -R a+rX /opt/docling/models

ENTRYPOINT ["docling", "convert"]
