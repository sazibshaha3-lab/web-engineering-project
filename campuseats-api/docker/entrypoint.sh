#!/bin/sh
set -e

# Render gives the port in $PORT; Apache has to listen on it.
PORT="${PORT:-10000}"
sed -ri "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf
sed -ri "s/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf

php artisan package:discover --ansi || true
php artisan config:cache
php artisan route:cache || true

# Migrations on every start; they are idempotent.
php artisan migrate --force

# One-off demo data: set RUN_SEED=true for a single deploy, then back to false.
if [ "${RUN_SEED}" = "true" ]; then
  php artisan db:seed --force || echo "Seeding failed or data already exists; continuing"
fi

exec apache2-foreground
