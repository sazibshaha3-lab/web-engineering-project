// Checks that the Laravel API is up and seeded before Playwright starts, and says clearly what to do if not.
const API = process.env.E2E_API_URL || "http://127.0.0.1:8000/api";

function fail(message) {
  console.error(`\n[e2e preflight] ${message}\n`);
  process.exit(1);
}

try {
  const res = await fetch(`${API}/restaurants`, { headers: { Accept: "application/json" } });
  if (!res.ok) fail(`API answered HTTP ${res.status} at ${API}/restaurants. Check the Laravel server output / storage/logs/laravel.log.`);
  const list = await res.json();
  if (!Array.isArray(list) || list.length < 6) {
    fail(`API is up but only ${Array.isArray(list) ? list.length : "no"} restaurants were returned. Seed it: cd campuseats-api && php artisan migrate:fresh --seed`);
  }
  console.log(`[e2e preflight] OK: ${list.length} restaurants at ${API}`);
} catch (err) {
  fail(`Cannot reach the API at ${API} (${err.cause?.code || err.message}). Start MySQL (XAMPP), then: cd campuseats-api && php artisan migrate:fresh --seed && php artisan serve`);
}
