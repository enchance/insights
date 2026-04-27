
# Investment Insights

A Django REST API + React/TypeScript SPA for creating and browsing investment insights.

**For the sake of transparency, this is an incomplete submission.**

- BACKEND: complete
- FRONTEND: not initiated (incomplete)

## Getting Started

### 1. Clone the repo

```bash
git clone <repo-url>
cd insight
```

### 2. Setup

Create environment files

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

Yarn

```
cd frontend
corepack enable && corepack prepare yarn@stable --activate
yarn install
rm .yarnrc.yml
```


The defaults work for local development as-is. The only value you may want to change is `DJANGO_SECRET_KEY` in `.env`.

### 4. Run

```bash
docker compose up --build
```

### 5. Create admin account

```bash
docker exec -it <backend container name> bash
chmod +x manage.py
./manage.py createsuperuser
```

You can also use the POST url: `/auth/users` to create an account but for test purposes an admin account is ideal.
Should you wish to use the url instead, please send the following information:

- username
- email
- password
- re_password

Backend uses a custom User account (as you always should) so simply sign in using your **username**.
