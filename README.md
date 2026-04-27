
# Investment Insights

A Django REST API + React/TypeScript SPA for creating and browsing investment insights.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- Node.js 18+ with [corepack](https://nodejs.org/api/corepack.html) enabled

## Getting Started

### 1. Clone the repo

```bash
git clone <repo-url>
cd insights
```

### 2. Setup

Create environment files

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

The defaults work for local development as-is. The only value you may want to change is `DJANGO_SECRET_KEY` in `.env`.

Build the frontend

```bash
cd frontend
corepack enable && corepack prepare yarn@stable --activate
yarn install
yarn build
rm .yarnrc.yml  # yarn writes this during install; removing it avoids version conflicts on re-runs
cd ..
```

### 3. Run

```bash
docker compose up --build
```

| Service  | URL                         |
|----------|-----------------------------|
| Frontend | http://localhost:5173        |
| Backend  | http://localhost:8000        |
| API Docs | http://localhost:8000/api/docs/ |

### 4. Create admin account

```bash
docker exec -it <backend container name> bash
python manage.py createsuperuser
```

You can also use the POST url: `/auth/users` to create an account but for test purposes an admin account is ideal.
Should you wish to use the url instead, please send the following information:

- username
- email
- password
- re_password

Backend uses a custom User account (as you always should) so simply sign in using your **username**.
