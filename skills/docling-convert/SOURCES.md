# Docling Convert Sources

## Source Inventory

| Source | Use | Notes |
| --- | --- | --- |
| Docling README, `https://github.com/docling-project/docling` | Feature and format overview | Confirms supported formats and Markdown/JSON exports. |
| Docling CLI reference, `https://docling-project.github.io/docling/reference/cli/` | CLI contract | Confirms `docling convert`, `--to`, `--output`, OCR flags, image export mode, and other options. |
| Docker CLI local validation | Runtime boundary | Confirms Docker daemon availability, default-image build behavior, and that `ghcr.io/docling-project/docling:latest` is not usable as a public default in this environment. |
| Local failure/retry evidence from Dell monitor PDF conversion, 2026-07-06 | Failure handling | Exposed missing OpenCV native libraries and missing RapidOCR artifacts in the prior default image. |

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
- The default image includes native OpenCV runtime libraries and RapidOCR models so Docling's default OCR path works offline.
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
- 2026-07-06: PDF conversion failed in the prior image because `cv2` could not
  load `libxcb.so.1`, then `libGL.so.1`; the Dockerfile now installs `libxcb1`,
  `libgl1`, and `libglib2.0-0`.
- 2026-07-06: PDF conversion then failed because default OCR expected missing
  RapidOCR model files under `/opt/docling/models/RapidOcr`; the Dockerfile now
  downloads Docling `layout`, `tableformer`, and `rapidocr` models into
  `/opt/docling/models`.
- The helper passes `--artifacts-path` so PDF conversion works with Docker network
  disabled.
- `node --check scripts/docling-convert.mjs` passed.
- `node scripts/docling-convert.mjs --help` passed.
- Docker image `agent-docling-convert:2026-07-02` built successfully.
- Docker image `agent-docling-convert:2026-07-06` built successfully with native
  OpenCV runtime libraries and RapidOCR model artifacts.
- Verified the default image contains RapidOCR detection, classification, and
  recognition model files under `/opt/docling/models/RapidOcr`.
- Sample DOCX conversion to Markdown succeeded with Docker network disabled.
- Sample PDF conversion to Markdown succeeded with Docker network disabled.
- 2026-07-06: two Dell PDF conversions succeeded with default OCR enabled and
  Docker network disabled.
- 2026-07-06: a Dell PDF conversion succeeded with `-- --ocr --force-ocr`,
  confirming OCR can run offline from bundled RapidOCR artifacts.
- 2026-07-06: a local image/scanned PDF conversion succeeded with
  `-- --ocr --force-ocr`, confirming OCR extraction works on an image-based
  input without Docker network access.
- Exact `--output` mode with `--json` sidecar succeeded.
- Helper archive save/load behavior was added to survive Docker image pruning.
- Existing-output and unsupported-extension failure paths were verified.
