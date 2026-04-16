# Ecommerce Online Shopping Webapp (ClothStore)

Full‑stack e‑commerce app with a **Django REST API** backend and a **React + Redux** frontend.

## Features

- Customer: OTP-based signup/login, product browsing + filters, product details + reviews, cart, checkout, orders, wishlist, wallet, refunds, support.
- Admin: dashboard + analytics, product management (variants/images), order management, payments, coupons, refunds, customer management.
- Payments: Razorpay integration
- OTP: Twilio integration

## Tech Stack

- Backend: Django 4.x, Django REST Framework, SimpleJWT, django-filter, WhiteNoise, Gunicorn
- Frontend: React 18, Redux Toolkit, React Router, Axios

## Repo Structure

```
backend/   Django project (API)
frontend/  React app (UI)
```

## Run Locally

### Backend (Django)

```bash
cd backend

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

python manage.py migrate
python manage.py runserver
```

Backend runs at `http://localhost:8000`.

### Frontend (React)

```bash
cd frontend
npm install

# create a frontend env file
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env

npm start
```

Frontend runs at `http://localhost:3000`.

For a more detailed walkthrough (including creating an admin user and sample categories), see `SETUP.md`.

## Environment Variables

The backend reads config from environment variables (and from `backend/.env` in local development).

Common variables:

- `DEBUG` (`False` in production)
- `SECRET_KEY`
- `ALLOWED_HOSTS` (comma-separated)
- `DATABASE_URL` (e.g. Postgres in production; defaults to SQLite locally)
- `CORS_ALLOWED_ORIGINS` (comma-separated)
- `CSRF_TRUSTED_ORIGINS` (comma-separated, for HTTPS domains)
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `FRONTEND_URL`

Do not commit secrets. Use `backend/.env.example` as a template.

## Deployment Notes (High Level)

- Backend: run migrations, set env vars, and serve with Gunicorn.
- Static files: WhiteNoise is enabled; run `python manage.py collectstatic` during build.
- Frontend: build with `npm run build` and deploy on Vercel/Netlify (or host the build output on your server/CDN).

## Deploy with GitHub (Frontend on GitHub Pages)

This repo includes a GitHub Actions workflow that builds the React app and deploys it to **GitHub Pages** on every push to `main`.

1. In your GitHub repo: **Settings → Pages → Build and deployment → Source = GitHub Actions**
2. Add a repo variable: **Settings → Secrets and variables → Actions → Variables**
   - `REACT_APP_API_URL` = your backend API URL (example: `https://your-backend.com/api`)
3. Push to `main` (or run the workflow manually from the Actions tab).

Note: GitHub Pages hosts only the frontend. Deploy the Django backend on a server platform (Render/Railway/Fly.io/etc) and point `REACT_APP_API_URL` to it.
