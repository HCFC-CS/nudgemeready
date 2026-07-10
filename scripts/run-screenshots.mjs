import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const port = 19006;
const isWindows = process.platform === "win32";
const expoCmd = path.join(projectRoot, "node_modules", ".bin", isWindows ? "expo.cmd" : "expo");

function waitForServer(url, timeoutMs = 180000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = async () => {
      try {
        const response = await fetch(url);
        if (response.ok || response.status === 200) {
          resolve();
          return;
        }
      } catch {
        // Server not ready yet.
      }

      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Timed out waiting for ${url}`));
        return;
      }

      setTimeout(check, 1500);
    };

    check();
  });
}

const server = spawn(expoCmd, ["start", "--web", "--port", String(port), "--non-interactive"], {
  cwd: projectRoot,
  stdio: "inherit",
  shell: isWindows
});

let captureError;

try {
  await waitForServer(`http://127.0.0.1:${port}`);
  const capture = spawn(process.execPath, [path.join(__dirname, "capture-screenshots.mjs")], {
    cwd: projectRoot,
    stdio: "inherit"
  });

  const exitCode = await new Promise((resolve) => {
    capture.on("close", resolve);
  });

  if (exitCode !== 0) {
    captureError = new Error(`Screenshot capture failed with exit code ${exitCode}`);
  }
} catch (error) {
  captureError = error;
} finally {
  if (!server.killed) {
    server.kill("SIGTERM");
  }
}

if (captureError) {
  throw captureError;
}
