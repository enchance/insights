# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Investment Insights** is a full-stack web application for creating and browsing investment insights. It consists of:
- **Backend**: Django REST Framework API with JWT authentication (via Djoser)
- **Frontend**: React + TypeScript SPA (incomplete)

The application tracks investment insights by category (Macro, Equities, Fixed Income, Alternatives) with tags, supports filtering/search, and provides an analytics endpoint for top tags.

## Architecture

### Backend Stack
- **Framework**: Django 6.0.4 + Django REST Framework
- **Authentication**: Djoser + djangorestframework-simplejwt (JWT tokens)
- **API Documentation**: drf-spectacular (OpenAPI/Swagger)
- **Database**: SQLite (dev), supports migration to PostgreSQL
- **Testing**: pytest + pytest-django + pytest-cov
- **Code Quality**: ruff, black, isort

### Key Backend Patterns
- **DTSoftMixin**: Custom mixin providing soft deletes (`created_at`, `updated_at`, `deleted_at`) — used on the `Insight` model
- **IsOwner Permission**: Custom DRF permission class restricting write operations to insight owners
- **Query Parameter Filtering**: `get_queryset()` in InsightViewSet supports `search`, `category`, and `tag` query params
- **Multi-Role Auth**: Uses Django's built-in user model with custom User in authentication app

### Project Structure
```
backend/
├── project/
│   ├── settings/
│   │   ├── base.py       (shared config)
│   │   ├── dev.py        (dev overrides)
│   │   ├── prod.py       (prod overrides)
│   │   ├── staging.py    (staging overrides)
│   ├── urls.py           (main router)
│   ├── mixins.py         (DTSoftMixin, etc.)
│   └── utils.py          (shared utilities)
├── insights/
│   ├── models.py         (Insight model)
│   ├── views.py          (InsightViewSet, TopTagsView)
│   ├── serializers.py    (InsightSerializer)
│   ├── urls.py
│   └── tests/            (pytest tests)
├── authentication/
│   ├── views.py          (Custom auth views with cookie support)
│   ├── urls.py
│   └── ...
└── manage.py
```

### API Routes
- `POST /auth/login` — JWT login (Djoser override with cookie support)
- `POST /auth/logout` — JWT logout
- `GET /api/v1/insights/` — List insights (search, category, tag filters)
- `POST /api/v1/insights/` — Create insight (auth required)
- `GET /api/v1/insights/{id}/` — Retrieve insight
- `PUT/PATCH /api/v1/insights/{id}/` — Update insight (owner only)
- `DELETE /api/v1/insights/{id}/` — Delete insight (owner only)
- `GET /api/v1/insights/top-tags/` — Get top 10 tags with counts
- `GET /api/docs/` — Swagger UI
- `GET /api/schema/` — OpenAPI schema

## Development

### Backend Development

**One-time setup** (if not using Docker):
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

**Run migrations**:
```bash
cd backend
python manage.py migrate
```

**Create a superuser** (admin account):
```bash
cd backend
python manage.py createsuperuser
```

**Start the dev server**:
```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```

**Using Docker** (recommended):
```bash
docker compose up --build
# Then in another shell:
docker exec -it <container-name> bash
./manage.py createsuperuser
```

### Running Tests

**Backend tests**:
```bash
cd backend
pytest -q              # Quick summary
pytest -v             # Verbose
pytest --cov          # With coverage report
pytest -k test_name   # Run specific test
pytest -m focus       # Run tests marked with @pytest.mark.focus
```

Tests are in `backend/insights/tests/`. Pytest configuration: `backend/pytest.ini`

### Code Quality

**Backend formatting & linting**:
```bash
cd backend

# Check only (no changes)
ruff check .
black --check .
isort --check .

# Auto-fix
black .
isort .
```

These are also run via `make lint`.

### Requirements Management

Backend dependencies are pinned in `requirements.txt` (generated via pip-compile).

To add/update a dependency:
1. Edit `requirements.in`
2. Run `pip-compile requirements.in` (or use the Makefile if available)

## Frontend Development

**Current Status**: Frontend files are removed/incomplete. The React app was started but not completed.

**To re-enable the frontend service** in docker-compose.yml:
- Uncomment the `react` service block
- Run `docker compose up --build`
- Frontend will be available at http://localhost:5173

**One-time setup** (if working on frontend):
```bash
cd frontend
corepack enable && corepack prepare yarn@stable --activate
yarn install
```

**Development**:
```bash
cd frontend
yarn dev
```

**Linting & formatting**:
```bash
cd frontend
npx eslint "src/**/*.{ts,tsx}"
npx prettier -c .
```

## Authentication Details

The backend uses **JWT (JSON Web Tokens)** via Djoser + djangorestframework-simplejwt.

**Login flow**:
1. POST to `/auth/login` with `username` and `password`
2. Response contains `access` and `refresh` tokens (JWT format)
3. Include `Authorization: Bearer <access_token>` header in authenticated requests
4. Use `refresh` token to obtain new `access` token when expired

**Custom Djoser overrides** in `authentication/views.py`:
- `AuthLoginView`, `AuthLogoutView`, `AuthRegenerateTokenView` add cookie-based auth support alongside JWT headers

## Common Tasks

### Add a New Field to Insight Model
1. Edit `backend/insights/models.py` — add field to `Insight` class
2. Run `python manage.py makemigrations`
3. Run `python manage.py migrate`
4. Update `backend/insights/serializers.py` to include the new field
5. Add tests to `backend/insights/tests/`

### Create a New API Endpoint
1. Add a view to `backend/insights/views.py` (use `APIView` or `ViewSet`)
2. Register it in `backend/insights/urls.py`
3. Add tests covering happy path, error cases, and permissions
4. API docs auto-generate from DRF schema (drf-spectacular)

### Run a Single Test File or Test Function
```bash
cd backend
pytest insights/tests/test_models.py              # Single file
pytest insights/tests/test_models.py::test_name  # Single test
```

### Check Test Coverage
```bash
cd backend
pytest --cov=insights --cov-report=term-missing
```

## Important Files

- `.env` — Environment variables (Django secret key, debug mode, etc.)
- `docker-compose.yml` — Service definitions (backend, optional frontend)
- `backend/Dockerfile` — Backend image definition
- `backend/requirements.txt` — Python dependencies
- `.pre-commit-config.yaml` — Pre-commit hooks (ruff, black, isort, eslint, prettier)

## Database

**Local development** uses SQLite (`backend/db.sqlite3`). The database file is git-ignored.

**Migrations** are committed to git in `backend/insights/migrations/`. Always run `makemigrations` after model changes and commit the migration file.

## Deployment Notes

- Settings are environment-specific: `project/settings/{dev,staging,prod}.py` extend `base.py`
- Use environment variables to configure production secrets (via `django-environ`)
- Run `python manage.py migrate` during deployment to apply pending migrations
- Ensure `DEBUG = False` in production

