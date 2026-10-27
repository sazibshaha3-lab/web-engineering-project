import { defineConfig } from "@playwright/test";
import base from "./playwright.config.js";

export default defineConfig({
  ...base,
  timeout: 420_000,
  use: { ...base.use, trace: "on", video: "on" },
  webServer: {
    ...base.webServer,
    command: `node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port ${Number(process.env.E2E_WEB_PORT || 5174)} --strictPort`,
  },
});
