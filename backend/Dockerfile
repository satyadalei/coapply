# Use a python base with uv pre-installed
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

# Enable bytecode compilation and copy link mode for efficiency
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

WORKDIR /app

# Install dependencies first (for caching)
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project --no-dev

# Copy application source code
COPY . /app

# Sync project (which installs the project packages themselves)
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

# Second stage: final runtime image
FROM python:3.12-slim-bookworm

WORKDIR /app

# Copy the virtual environment from the builder
COPY --from=builder /app /app

# Ensure we use the virtual environment by default
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1

# Default to host's Ollama instance when running in Docker container
ENV OLLAMA_BASE_URL=http://host.docker.internal:11434

EXPOSE 8000

# Default command runs the production server
CMD ["fastapi", "run", "app/main.py", "--host", "0.0.0.0", "--port", "8000"]
