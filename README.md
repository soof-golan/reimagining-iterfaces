

# Prerequisites

uv for running python scripts, fnm for managing node versions.

Install

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
curl -fsSL https://fnm.vercel.app/install | bash

fnm install 20
fnm use 20
```

Backend

```bash
uv run uvicorn backend.main:app --reload --host localhost --port 8000 --env-file .env
```

Frontend

```bash
cd src/frontend
npm install
npm run dev
```

