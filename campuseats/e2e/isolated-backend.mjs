import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const apiDir = resolve(projectDir, "..", "campuseats-api");
const windows = process.platform === "win32";
const shell = windows;
const apiEnv = {
  ...process.env,
  APP_ENV: "local",
  DB_CONNECTION: "sqlite",
  AUTH_RATE_LIMIT: "1000",
  CACHE_STORE: "array",
  SESSION_DRIVER: "array",
  QUEUE_CONNECTION: "sync",
};
let activeCommand;

function run(command, args, cwd, env) {
  return new Promise((resolveRun, rejectRun) => {
    const isPlaywright = cwd === projectDir && args[0] === "playwright";
    const runCommand = isPlaywright ? process.execPath : command;
    const runArgs = isPlaywright
      ? [resolve(projectDir, "node_modules/@playwright/test/cli.js"), ...args.slice(1)]
      : args;
    const child = spawn(runCommand, runArgs, {
      cwd,
      env,
      shell: isPlaywright ? false : shell,
      stdio: isPlaywright ? ["ignore", "pipe", "pipe"] : "inherit",
    });
    activeCommand = child;
    let settled = false;
    let completedTests = 0;
    let expectedTests = null;
    let failedTests = 0;
    let completionTimer;
    let pendingLines = "";
    const finish = (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(completionTimer);
      if (activeCommand === child) activeCommand = undefined;
      resolveRun(code ?? 1);
    };
    const consumeOutput = (stream, chunk) => {
      const output = chunk.toString();
      (stream === "stdout" ? process.stdout : process.stderr).write(output);
      if (!isPlaywright || !windows) return;
      pendingLines += output;
      const lines = pendingLines.split(/\r?\n/);
      pendingLines = lines.pop() ?? "";
      for (const line of lines) {
        const count = line.match(/Running (\d+) tests? using/);
        if (count) expectedTests = Number(count[1]);
        if (/^\s*x\s+\d+\s+\[/.test(line)) {
          completedTests += 1;
          failedTests += 1;
        } else if (/^\s*ok\s+\d+\s+\[/.test(line)) {
          completedTests += 1;
        }
      }
      if (expectedTests && completedTests >= expectedTests && !completionTimer) {
        completionTimer = setTimeout(async () => {
          console.error("[e2e:isolated] Playwright reported all tests but did not exit; stopping its completed test process.");
          if (child.exitCode === null) child.kill();
          finish(failedTests ? 1 : 0);
        }, 15_000);
      }
    };
    if (isPlaywright) {
      child.stdout.on("data", (chunk) => consumeOutput("stdout", chunk));
      child.stderr.on("data", (chunk) => consumeOutput("stderr", chunk));
    }
    child.once("error", (error) => {
      if (activeCommand === child) activeCommand = undefined;
      if (!settled) {
        settled = true;
        clearTimeout(completionTimer);
        rejectRun(error);
      }
    });
    child.once("exit", (code, signal) => {
      if (signal) {
        if (activeCommand === child) activeCommand = undefined;
        if (!settled) {
          settled = true;
          clearTimeout(completionTimer);
          rejectRun(new Error(`${command} stopped by ${signal}`));
        }
      } else finish(code);
    });
  });
}

function portIsFree(port) {
  return new Promise((resolvePort) => {
    const server = createServer();
    server.once("error", () => resolvePort(false));
    server.listen(port, "127.0.0.1", () => server.close(() => resolvePort(true)));
  });
}

async function stopServer(child) {
  if (!child || child.exitCode !== null) return;
  child.kill(windows ? undefined : "SIGTERM");
  await new Promise((resolveStop) => {
    const timeout = setTimeout(() => {
      child.kill(windows ? undefined : "SIGKILL");
      resolveStop();
    }, 3000);
    child.once("close", () => {
      clearTimeout(timeout);
      resolveStop();
    });
  });
}

let tempDir;
let apiProcess;
let interrupted = false;
let cleanupPromise;
const cleanup = () => {
  cleanupPromise ??= (async () => {
    await stopServer(activeCommand);
    await stopServer(apiProcess);
    if (tempDir) await rm(tempDir, { recursive: true, force: true });
  })();
  return cleanupPromise;
};
const onInterrupt = () => {
  interrupted = true;
  void cleanup().finally(() => process.exit(130));
};
process.once("SIGINT", onInterrupt);
process.once("SIGTERM", onInterrupt);

let exitCode = 1;
process.once("exit", () => {
  if (tempDir) rmSync(tempDir, { recursive: true, force: true });
});
try {
  const webPort = Number(process.env.E2E_WEB_PORT || 5174);
  const apiPort = Number(process.env.E2E_API_PORT || 8011);
  apiEnv.CORS_ALLOWED_ORIGINS = `http://localhost:${webPort},http://127.0.0.1:${webPort},http://localhost:5173,http://127.0.0.1:5173`;
  for (const port of [apiPort, webPort]) {
    if (!(await portIsFree(port))) {
      throw new Error(`Port ${port} is already in use. Stop its owner and retry; this runner will not kill it.`);
    }
  }

  tempDir = await mkdtemp(resolve(tmpdir(), "campuseats-e2e-"));
  apiEnv.DB_DATABASE = resolve(tempDir, "campuseats.sqlite");
  await writeFile(apiEnv.DB_DATABASE, "");

  for (const args of [["artisan", "optimize:clear"], ["artisan", "migrate:fresh", "--seed", "--force"]]) {
    const code = await run("php", args, apiDir, apiEnv);
    if (code !== 0) throw new Error(`php ${args.join(" ")} exited with code ${code}`);
  }

  let serverStderr = "";
  const routerPath = resolve(apiDir, "vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php");
  const serverCwd = windows ? resolve(apiDir, "public") : apiDir;
  const serverArgs = windows
    ? ["-S", `127.0.0.1:${apiPort}`, "-t", ".", routerPath]
    : ["-S", `127.0.0.1:${apiPort}`, "-t", "public", "vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php"];
  apiProcess = spawn(
    "php",
    serverArgs,
    { cwd: serverCwd, env: apiEnv, shell: false, stdio: ["ignore", "pipe", "pipe"] },
  );
  apiProcess.stdout.on("data", (chunk) => process.stdout.write(chunk));
  apiProcess.stderr.on("data", (chunk) => {
    serverStderr += chunk.toString();
    process.stderr.write(chunk);
  });

  const deadline = Date.now() + 60_000;
  let ready = false;
  while (Date.now() < deadline) {
    if (apiProcess.exitCode !== null) {
      process.stderr.write(`API server stderr:\n${serverStderr}\n`);
      throw new Error(`API server exited early (code ${apiProcess.exitCode}).`);
    }
    try {
      const [health, restaurants] = await Promise.all([
        fetch(`http://127.0.0.1:${apiPort}/up`),
        fetch(`http://127.0.0.1:${apiPort}/api/restaurants`),
      ]);
      if (health.status === 200 && restaurants.status === 200) {
        ready = true;
        break;
      }
      serverStderr += `Readiness response: /up=${health.status}, /api/restaurants=${restaurants.status}\n`;
    } catch {
      // The server may still be starting.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 500));
  }
  if (!ready) {
    process.stderr.write(`API readiness timed out after 60 seconds. Server stderr:\n${serverStderr}\n`);
    throw new Error("Isolated API did not become ready.");
  }

  const code = await run("npx", ["playwright", "test", ...process.argv.slice(2)], projectDir, {
    ...process.env,
    CI: "1",
    E2E_API_URL: `http://127.0.0.1:${apiPort}/api`,
    E2E_WEB_PORT: String(webPort),
  });
  exitCode = code;
} catch (error) {
  if (!interrupted) console.error(`[e2e:isolated] ${error.message}`);
} finally {
  await cleanup();
  process.removeListener("SIGINT", onInterrupt);
  process.removeListener("SIGTERM", onInterrupt);
}

process.exit(exitCode);
