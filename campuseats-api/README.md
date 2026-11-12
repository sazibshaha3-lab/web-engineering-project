# CampusEats API

Laravel 12 JSON API for CampusEats. Local setup and queue-worker commands are in the [repository README](../README.md). Production infrastructure, Aiven TLS, environment variables, and release verification are in the [deployment guide](../DEPLOYMENT_GUIDE.md).

The API uses database migrations for its schema and a database-backed queue for email notifications. In production, deploy the web service before starting the continuously running background worker so migrations have completed.
