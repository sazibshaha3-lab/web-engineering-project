# CampusEats

CampusEats is a campus food-ordering app with a React/Vite customer and operations frontend, a Laravel API, restaurant order processing, rider delivery workflows, and cash on delivery.

## Repository layout

- `campuseats/` — React/Vite frontend
- `campuseats-api/` — Laravel API, database migrations, and queue worker
- [Production deployment guide](DEPLOYMENT_GUIDE.md) — hosting setup, Aiven TLS, environment variables, release steps, and live verification checklist

## Local development (PowerShell)

### API

```powershell
cd campuseats-api
composer install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
if (-not (Test-Path database/database.sqlite)) { New-Item -ItemType File database/database.sqlite }
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Run the database queue worker in a second API terminal so queued email notifications are processed:

```powershell
cd campuseats-api
php artisan queue:work database --queue=emails,default --tries=5 --timeout=150 --sleep=2
```

The seeder creates demo users and sample restaurants for local use. Do not run it against production; production onboarding instructions use real accounts and data instead.

### Frontend

```powershell
cd campuseats
npm.cmd ci
if (-not (Test-Path .env.local)) { Copy-Item .env.production.example .env.local }
```

Edit `campuseats/.env.local` and set `VITE_API_URL=http://127.0.0.1:8000/api`. Set `VITE_GOOGLE_CLIENT_ID` only if Google sign-in is configured. Then run:

```powershell
npm.cmd run dev
```

Use separate terminals for the API, queue worker, and frontend. Local email delivery requires working mail credentials; orders use cash on delivery.

## Production status

The repository contains deployment configuration and a release runbook, but CampusEats is not deployed or verified against live provider accounts. Production hosting, Aiven database credentials and CA certificate, and SMTP credentials still need to be supplied.

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for the complete launch checklist.
