Local Postgres (Docker) — quick start

1. Start Postgres with Docker Compose

```bash
cd /Users/rachithak/Downloads/clothstore_project
docker compose up -d db
```

This will start a Postgres instance on `127.0.0.1:5432` with:
- user: postgres
- password: clothbrand
- db: postgres

2. Configure backend env

Copy the example env and edit if needed:

```bash
cp backend/.env.local.example backend/.env.local
# Edit backend/.env.local if you need to change credentials
```

3. Run migrations & collectstatic

Activate your venv and install requirements if not already done:

```bash
cd backend
source ../venv311/bin/activate
pip install -r requirements.txt

export $(cat .env.local | xargs)
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py runserver 127.0.0.1:8000
```

4. Frontend

Start frontend locally and point it to the API:

```bash
cd frontend
REACT_APP_API_URL=http://127.0.0.1:8000 npm start
```

Notes
- If Postgres is already running locally on 5432, stop it or change the `docker-compose.yml` port mapping.
- For production, use a managed Postgres (Neon/AWS RDS) and set `DATABASE_URL` accordingly in your hosting environment.
