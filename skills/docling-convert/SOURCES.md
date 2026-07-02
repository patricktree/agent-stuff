# Docling Convert Sources

## Source Inventory

| Source | Use | Notes |
| --- | --- | --- |
| Docling README, `https://github.com/docling-project/docling` | Feature and format overview | Confirms supported formats and Markdown/JSON exports. |
| Docling CLI reference, `https://docling-project.github.io/docling/reference/cli/` | CLI contract | Confirms `docling convert`, `--to`, `--output`, OCR flags, image export mode, and other options. |
| Docker CLI local validation | Runtime boundary | Confirms Docker daemon availability and that `ghcr.io/docling-project/docling:latest` is not usable as a public default in this environment. |

## Decisions

- Primary output is Markdown; JSON is optional via `--json`.
- The skill is script-backed because path handling, overwrite safety, Docker
  mounts, image build behavior, and output normalization are brittle as prose.
- No local Python fallback is allowed.
- The default container image is built locally from the bundled `Dockerfile`
  instead of relying on unofficial Docker Hub images.
- The helper supports one file at a time; batch conversion is documented as an
  explicit shell loop.
- Docker network is disabled by default.
- The default Docker image is saved outside Docker under the skill-local
  `.cache/docker-images/` directory so it can be restored after
  `docker system prune -a` removes unused images, and removing the skill also
  removes its cache.
- Docker runs as current UID/GID by default on macOS/Linux to avoid root-owned
  outputs.
- The skill replaces general PDF extraction/conversion behavior; keep
  `convert-pdf-to-image` for raster rendering.

## Gaps

- The Dockerfile currently installs the latest Docling at image build time. Pin a
  version after observing real-world stability or if reproducibility requires it.
- Office-file sample conversions were not validated unless sample files are added
  to a local test fixture.

## Validation Log

- Docker daemon was verified available after the user started Docker.
- Pulling `ghcr.io/docling-project/docling:latest` returned registry denied, so a
  bundled Dockerfile strategy was selected.
- The Dockerfile was adjusted to preinstall CPU PyTorch wheels before Docling to
  avoid pulling CUDA packages into the local image.
- The Dockerfile downloads Docling `layout` and `tableformer` models into
  `/opt/docling/models`; the helper passes `--artifacts-path` so PDF conversion
  works with Docker network disabled.
- `node --check scripts/docling-convert.mjs` passed.
- `node scripts/docling-convert.mjs --help` passed.
- Docker image `agent-docling-convert:2026-07-02` built successfully.
- Sample DOCX conversion to Markdown succeeded with Docker network disabled.
- Sample PDF conversion to Markdown succeeded with Docker network disabled.
- Exact `--output` mode with `--json` sidecar succeeded.
- Helper archive save/load behavior was added to survive Docker image pruning.
- Existing-output and unsupported-extension failure paths were verified.
