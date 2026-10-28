/**
 * Start Expo with APP_VARIANT set (works on Windows/macOS/Linux).
 * Usage: node scripts/start-variant.cjs v4
 */
const { spawn } = require("child_process");

const requested = process.argv[2];
const variant = requested === "v2" || requested === "v3" ? requested : "v4";
const child = spawn("npx", ["expo", "start", ...process.argv.slice(3)], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, APP_VARIANT: variant }
});

child.on("exit", (code) => process.exit(code ?? 0));
