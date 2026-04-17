Local Postgres (Docker) — quick start


1. Start Postgres + Django with Docker Compose

```bash
cd /Users/rachithak/Downloads/clothstore_project
# Start both db and web services (builds backend image if needed)
docker compose up -d
```

This will start:
- Postgres on `127.0.0.1:5432` (user=postgres, password=clothbrand, db=postgres)
- Django development server on `127.0.0.1:8000`

2. Configure backend env

Copy the example env and edit if needed:

```bash
cp backend/.env.local.example backend/.env.local
# Edit backend/.env.local if you need to change credentials
```

3. (If needed) View logs, run migrations manually or interact with the container

Run migrations / collectstatic manually inside the container:

```bash
# open a shell to the web container
docker compose exec web sh
# inside container
python manage.py migrate
python manage.py collectstatic --noinput
exit
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

