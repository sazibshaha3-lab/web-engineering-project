#!/bin/sh
set -e

if [ "${APP_PROCESS:-web}" != "web" ] && [ "${APP_PROCESS}" != "worker" ]; then
  echo "APP_PROCESS must be 'web' or 'worker'." >&2
  exit 1
fi

if [ "${APP_ENV:-production}" = "production" ] && [ "${RUN_SEED:-false}" = "true" ]; then
  echo "RUN_SEED=true is forbidden in production. Create the production admin with php artisan campuseats:admin." >&2
  exit 1
fi

if [ "${APP_ENV:-production}" = "production" ] && [ "${DB_CONNECTION:-mysql}" = "mysql" ]; then
  if [ -z "${MYSQL_ATTR_SSL_CA:-}" ]; then
    echo "MYSQL_ATTR_SSL_CA must point to the Aiven CA certificate in production." >&2
    exit 1
  fi
  if [ ! -r "${MYSQL_ATTR_SSL_CA}" ]; then
    echo "MySQL CA certificate is missing or unreadable: ${MYSQL_ATTR_SSL_CA}" >&2
    exit 1
  fi
fi

# Render gives the port in $PORT; Apache has to listen on it.
PORT="${PORT:-10000}"
sed -ri "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf
sed -ri "s/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf

if [ "${APP_PROCESS:-web}" = "worker" ]; then
  gosu www-data php artisan package:discover --ansi
  gosu www-data php artisan campuseats:production-check
  gosu www-data php artisan config:cache
  exec gosu www-data php artisan queue:work database --queue=emails,default --tries=5 --timeout=150 --sleep=2
fi

gosu www-data php artisan package:discover --ansi
gosu www-data php artisan campuseats:production-check
gosu www-data php artisan config:cache
gosu www-data php artisan route:cache

# Migrations on every start; they are idempotent.
gosu www-data php artisan campuseats:migrate

# One-off demo data: set RUN_SEED=true for a single deploy, then back to false.
if [ "${RUN_SEED}" = "true" ]; then
  gosu www-data php artisan db:seed --force
fi

exec apache2-foreground
