FROM python:3.12-slim

ENV PIP_NO_CACHE_DIR=1 \
    PYTHONUNBUFFERED=1

RUN python -m pip install --upgrade pip \
    && python -m pip install --index-url https://download.pytorch.org/whl/cpu torch torchvision \
    && python -m pip install docling

RUN docling-tools models download layout tableformer --output-dir /opt/docling/models \
    && chmod -R a+rX /opt/docling/models

ENTRYPOINT ["docling", "convert"]
