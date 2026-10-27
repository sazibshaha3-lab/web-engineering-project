# Aiven CA certificate

Download the CA certificate from the Aiven service page under **Overview → CA certificate** and save it as `certs/aiven-ca.pem`.

The CA certificate is public and safe to commit. Do not commit database credentials or other secrets with it.

`MYSQL_ATTR_SSL_CA` must point to `/var/www/html/certs/aiven-ca.pem` inside the deployed container.
