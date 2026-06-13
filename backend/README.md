# CoApply Backend

## Running the Server Locally
To start the backend dev server locally, run:
```bash
uv sync
uv run fastapi dev app/main.py
```

## Ollama Configuration
Ensure Ollama is installed and running on your machine. Make sure to pull the desired model:
```bash
ollama pull llama3
```

The backend is configured to work seamlessly in both local and Docker environments:
- **Local Dev**: Defaults to `http://localhost:11434`.
- **Docker/Compose**: Automatically routes requests to the host machine using `http://host.docker.internal:11434` (with `extra_hosts` setup in `docker-compose.yml` for compatibility across Windows, Mac, and Linux).

You can override these settings using the following environment variables:
- `OLLAMA_BASE_URL`: Base URL of the Ollama service.
- `OLLAMA_MODEL`: The Ollama model name (defaults to `llama3`).