FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-progress --prefer-dist --no-scripts --optimize-autoloader

FROM php:8.3-apache
RUN apt-get update \
 && apt-get install -y --no-install-recommends gosu libzip-dev libonig-dev unzip \
 && docker-php-ext-install pdo_mysql zip bcmath mbstring \
 && a2enmod rewrite headers \
 && rm -rf /var/lib/apt/lists/*

RUN php -r 'foreach (["ctype", "fileinfo", "mbstring", "openssl", "pdo", "pdo_mysql", "tokenizer", "zip", "bcmath"] as $extension) { if (! extension_loaded($extension)) { fwrite(STDERR, "Missing required PHP extension: {$extension}\\n"); exit(1); } }'

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf \
 && sed -ri 's!AllowOverride None!AllowOverride All!g' /etc/apache2/apache2.conf

WORKDIR /var/www/html
COPY . .
COPY --from=vendor /app/vendor ./vendor
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh \
 && chmod +x /usr/local/bin/entrypoint.sh \
 && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
 && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 10000
ENTRYPOINT ["entrypoint.sh"]
