
# Investment Insights — Full-Stack Skeleton (Django + DRF + React/TS)

This is a **starter repository skeleton** for the take‑home exercise.
It provides a minimal Django REST API and a React + TypeScript frontend,
along with tooling for linting, testing, Docker, and CI (GitHub Actions + Bitbucket Pipelines).

## Quick start

```bash
# 1) Backend
python -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt
cp .env.example .env
python backend/manage.py migrate
python backend/manage.py runserver 0.0.0.0:8000

# 2) Frontend
cd frontend
npm install
npm run dev
```

### Docker (optional)
```bash
docker compose up --build
```

## Structure
```
backend/         # Django + DRF minimal project (insights app)
frontend/        # React + TypeScript (Vite)
.github/workflows/ci.yml            # GitHub Actions pipeline
bitbucket-pipelines.yml             # Bitbucket Pipelines CI
.pre-commit-config.yaml             # Lint/format hooks
```

## Notes
- Keep secrets out of VCS; use `.env` in local dev and CI secrets in pipelines.
- CI jobs run lint + tests for backend & frontend.
