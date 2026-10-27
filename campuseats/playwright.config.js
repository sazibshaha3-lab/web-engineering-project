import { defineConfig, devices } from "@playwright/test";

const e2ePort = Number(process.env.E2E_WEB_PORT || 5173);

// Prerequisites (the tests do NOT start Laravel/MySQL for you):
//   1. XAMPP MySQL running
//   2. cd campuseats-api && php artisan migrate:fresh --seed && php artisan serve
// The Vite dev server below is started automatically (or reused if already running).
// E2E_API_URL lets the frontend talk to a different backend (e.g. an isolated SQLite one).
export default defineConfig({
  testDir: "./e2e",
  timeout: 180_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL || `http://127.0.0.1:${e2ePort}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    webServer: {
    command: `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port ${e2ePort} --strictPort`,
    url: `http://127.0.0.1:${e2ePort}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      VITE_API_URL: process.env.E2E_API_URL || "http://127.0.0.1:8000/api",
      VITE_SHOW_DEMO_LOGINS: "true",
    },
  },
});
