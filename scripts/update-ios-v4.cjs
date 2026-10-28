/**
 * Publish one JavaScript update for Nudge me Ready v4 on iOS.
 *
 * Checks the commit, a clean tree, APP_VARIANT, and the v4 app config
 * before it runs `eas update`. A failed check does not publish.
 * This does not check out a commit and it does not build a new binary.
 *
 * Usage:
 *   npm run update:ios:v4 -- --sha <40-character SHA> --channel v4 --platform ios --message "short note"
 *   node scripts/update-ios-v4.cjs --dry-run --sha <40-character SHA> --channel v4 --platform ios --message "short note"
 */
const { execFileSync, spawn } = require("child_process");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SHA_PATTERN = /^[0-9a-f]{40}$/i;
const EXPECTED = {
  name: "Nudge me Ready v4",
  version: "0.4.0",
  runtimeVersion: "0.4.0",
  bundleIdentifier: "com.helencunliffe.nudgeme.v4",
  projectId: "6ca4ec88-2487-43ae-a858-5c3d96abf41e",
  channel: "v4",
  platform: "ios",
  appVariant: "v4"
};

function usageText() {
  return [
    "Nudge me Ready v4 publishes a JavaScript update only after every check passes.",
    "This does not build a new TestFlight binary, and it does not check out a commit.",
    "",
    "Set APP_VARIANT to v4, then run:",
    "  npm run update:ios:v4 -- --sha <full 40-character commit SHA> --channel v4 --platform ios --message \"short note\"",
    "",
    "To run the checks and print the command without publishing:",
    "  npm run update:ios:v4 -- --dry-run --sha <full 40-character commit SHA> --channel v4 --platform ios --message \"short note\"",
    "",
    "If a check fails, fix that and run the command again on its own."
  ].join("\n");
}

function parseArgs(argv) {
  const args = argv.slice(2).filter((arg) => arg !== "--");
  let sha = null;
  let message = null;
  let channel = null;
  let platform = null;
  let dryRun = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (arg === "--sha" || arg === "--commit") {
      const value = args[index + 1];
      if (!value || value.startsWith("-")) {
        return { ok: false, message: ["The commit SHA is missing.", "", usageText()].join("\n") };
      }
      sha = value;
      index += 1;
      continue;
    }
    if (arg === "--message") {
      const value = args[index + 1];
      if (!value || value.startsWith("-")) {
        return { ok: false, message: ["Add a short note with --message.", "", usageText()].join("\n") };
      }
      message = value;
      index += 1;
      continue;
    }
    if (arg === "--channel") {
      const value = args[index + 1];
      if (!value || value.startsWith("-")) {
        return { ok: false, message: ["Channel v4 is required.", "", usageText()].join("\n") };
      }
      channel = value;
      index += 1;
      continue;
    }
    if (arg === "--platform") {
      const value = args[index + 1];
      if (!value || value.startsWith("-")) {
        return { ok: false, message: ["Platform ios is required.", "", usageText()].join("\n") };
      }
      platform = value;
      index += 1;
      continue;
    }
    return {
      ok: false,
      message: [`This publish command does not accept ${arg}.`, "", usageText()].join("\n")
    };
  }

  if (!sha) {
    return { ok: false, message: ["Pass the full 40-character commit SHA you expect to publish.", "", usageText()].join("\n") };
  }
  if (!SHA_PATTERN.test(sha)) {
    return {
      ok: false,
      message: ["The commit SHA must be the full 40-character id, not a short one.", "", usageText()].join("\n")
    };
  }
  if (channel !== EXPECTED.channel) {
    return {
      ok: false,
      message: [`Channel must be ${EXPECTED.channel}. Nothing was published.`, "", usageText()].join("\n")
    };
  }
  if (platform !== EXPECTED.platform) {
    return {
      ok: false,
      message: [`Platform must be ${EXPECTED.platform}. Nothing was published.`, "", usageText()].join("\n")
    };
  }
  if (!message || message.trim() === "") {
    return { ok: false, message: ["Add a short note with --message.", "", usageText()].join("\n") };
  }

  return {
    ok: true,
    sha: sha.toLowerCase(),
    message,
    channel,
    platform,
    dryRun
  };
}

function resolvedRuntime(config) {
  const runtime = config && config.runtimeVersion;
  if (typeof runtime === "string") return runtime;
  if (runtime && typeof runtime === "object" && runtime.policy === "appVersion") {
    return typeof config.version === "string" ? config.version : null;
  }
  return null;
}

function verifyV4UpdateConfig(config) {
  const problems = [];
  if (!config || typeof config !== "object") {
    return { ok: false, problems: ["The app config could not be read, so nothing was published."] };
  }
  if (config.name !== EXPECTED.name) {
    problems.push(`App name is ${config.name || "missing"}. v4 updates need ${EXPECTED.name}.`);
  }
  if (config.version !== EXPECTED.version) {
    problems.push(`Version is ${config.version || "missing"}. v4 updates need ${EXPECTED.version}.`);
  }
  const runtime = resolvedRuntime(config);
  if (runtime !== EXPECTED.runtimeVersion) {
    problems.push(`Runtime is ${runtime || "missing"}. v4 updates need runtime ${EXPECTED.runtimeVersion}.`);
  }
  const bundleIdentifier = config.ios && config.ios.bundleIdentifier;
  if (bundleIdentifier !== EXPECTED.bundleIdentifier) {
    problems.push(`Bundle id is ${bundleIdentifier || "missing"}. v4 updates need ${EXPECTED.bundleIdentifier}.`);
  }
  const projectId = config.extra && config.extra.eas && config.extra.eas.projectId;
  if (projectId !== EXPECTED.projectId) {
    problems.push(`EAS project id is ${projectId || "missing"}. v4 updates need ${EXPECTED.projectId}.`);
  }
  if (config.extra && config.extra.appVariant && config.extra.appVariant !== EXPECTED.appVariant) {
    problems.push(`Resolved app variant is ${config.extra.appVariant}. v4 updates need ${EXPECTED.appVariant}.`);
  }
  return { ok: problems.length === 0, problems };
}

function formatUpdateCommand(message) {
  return `APP_VARIANT=v4 npx eas-cli update --channel v4 --platform ios --message ${JSON.stringify(message)}`;
}

function updateArgs(message) {
  return ["eas-cli", "update", "--channel", "v4", "--platform", "ios", "--message", message];
}

function readGit(args) {
  return execFileSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function readHead() {
  return readGit(["rev-parse", "HEAD"]).trim();
}

function readStatus() {
  return readGit(["status", "--porcelain", "--untracked-files=all"]);
}

function readAppConfig() {
  const configPath = require.resolve("../app.config.js");
  delete require.cache[configPath];
  return require(configPath);
}

function variantMessage() {
  return [
    "Set APP_VARIANT to v4 for this command. A missing APP_VARIANT is not treated as v4.",
    "Nothing was published.",
    "",
    "Example:",
    "  $env:APP_VARIANT = \"v4\"",
    "",
    usageText()
  ].join("\n");
}

function runNpx(args, env, runner) {
  const spawnImpl = runner || spawn;
  const command = process.platform === "win32" ? "npx.cmd" : "npx";
  return new Promise((resolve, reject) => {
    const child = spawnImpl(command, args, {
      cwd: ROOT,
      shell: false,
      stdio: "inherit",
      env
    });
    child.on("error", reject);
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

async function main(argv = process.argv, options = {}) {
  const parsed = parseArgs(argv);
  if (!parsed.ok) {
    console.error(parsed.message);
    return 1;
  }

  const env = options.env || process.env;
  if (env.APP_VARIANT !== EXPECTED.appVariant) {
    console.error(variantMessage());
    return 1;
  }

  let head;
  try {
    head = options.gitHead ? options.gitHead() : readHead();
  } catch (error) {
    console.error("The current commit could not be read, so nothing was published.");
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
  if (String(head).trim().toLowerCase() !== parsed.sha) {
    console.error(`HEAD is ${String(head).trim() || "missing"}, not ${parsed.sha}.`);
    console.error("Nothing was published. Check out that commit yourself, then run this command on its own.");
    return 1;
  }

  let status;
  try {
    status = options.gitStatus ? options.gitStatus() : readStatus();
  } catch (error) {
    console.error("The working tree could not be checked, so nothing was published.");
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
  if (String(status).trim() !== "") {
    console.error("The working tree is not clean, so nothing was published.");
    console.error("Commit or set aside every change, including untracked files, then run this command again.");
    console.error(String(status).replace(/\s+$/u, ""));
    return 1;
  }

  let config;
  try {
    config = options.readConfig ? options.readConfig() : readAppConfig();
  } catch (error) {
    console.error("The app config could not be read, so nothing was published.");
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
  const verdict = verifyV4UpdateConfig(config);
  if (!verdict.ok) {
    console.error("This is not the v4 iOS app config, so nothing was published.");
    for (const problem of verdict.problems) console.error(`- ${problem}`);
    return 1;
  }

  const command = formatUpdateCommand(parsed.message);
  if (parsed.dryRun) {
    console.log("Checks passed. This would publish a JavaScript update for Nudge me Ready v4. It would not build a new binary.");
    console.log(command);
    return 0;
  }

  console.log(`Publishing a JavaScript update for ${parsed.sha}. This does not build a new binary.`);
  try {
    return await runNpx(updateArgs(parsed.message), env, options.runner);
  } catch (error) {
    console.error("The update command could not be started, so nothing further was published.");
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if (require.main === module) {
  main()
    .then((code) => process.exit(code))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}

module.exports = {
  EXPECTED,
  formatUpdateCommand,
  main,
  parseArgs,
  updateArgs,
  usageText,
  verifyV4UpdateConfig
};
