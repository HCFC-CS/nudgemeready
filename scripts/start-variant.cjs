/**
 * Start Expo with APP_VARIANT set (works on Windows/macOS/Linux).
 * Usage: node scripts/start-variant.cjs v2
 */
const { spawn } = require("child_process");

const variant = process.argv[2] === "v2" ? "v2" : "v3";
const child = spawn("npx", ["expo", "start", ...process.argv.slice(3)], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, APP_VARIANT: variant }
});

child.on("exit", (code) => process.exit(code ?? 0));
