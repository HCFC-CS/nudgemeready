/**
 * Submit one finished Nudge me Ready v4 iOS build to TestFlight.
 *
 * Requires the EAS build ID from `npm run build:ios:v4`. Looks that build up
 * and submits it only after the record matches the v4 app. Never uses --latest.
 *
 * Usage:
 *   npm run submit:ios:v4 -- <eas-build-id>
 *   node scripts/submit-ios-v4.cjs <eas-build-id>
 */
const { spawn } = require("child_process");
const path = require("path");

const V4 = {
  buildProfile: "v4",
  channel: "v4",
  appVersion: "0.4.0",
  runtimeVersion: "0.4.0",
  appIdentifier: "com.helencunliffe.nudgeme.v4",
  platform: "IOS",
  distribution: "STORE",
  status: "FINISHED"
};

const BUILD_ID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const EXPO_BUILD_URL = /^https:\/\/expo\.dev\/\S+$/i;

function usageText() {
  return [
    "Nudge me Ready v4 needs the EAS build ID of the finished v4 iOS build you want on TestFlight.",
    "",
    "Example:",
    "  npm run submit:ios:v4 -- 12345678-1234-1234-1234-123456789abc",
    "  Submit-TestFlight-v4.bat 12345678-1234-1234-1234-123456789abc",
    "",
    "This submits that build only. It does not submit --latest.",
    "",
    "To see recent builds:",
    "  npx eas-cli build:list --platform ios --limit 10",
    "",
    "Use the ID whose profile is v4, version is 0.4.0, runtime is 0.4.0, and status is finished.",
    "Then run this command again with that ID.",
    "If you are not logged in, run: npx eas-cli login"
  ].join("\n");
}

function readBuildId(argv) {
  const args = argv.slice(2).filter((arg) => arg !== "--");
  const blocked = args.find((arg) => {
    const lower = arg.toLowerCase();
    return lower === "--latest" || lower === "latest";
  });
  if (blocked) {
    return {
      ok: false,
      message: [
        "This v4 submit does not accept --latest, because that could send a v2 or v3 build.",
        "Pass the EAS build ID from the v4 build you want.",
        "",
        usageText()
      ].join("\n")
    };
  }

  const values = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--id" || arg === "--build-id") {
      const value = args[index + 1];
      if (!value || value.startsWith("-")) {
        return { ok: false, message: usageText() };
      }
      values.push(value);
      index += 1;
      continue;
    }
    if (arg.startsWith("-")) {
      return {
        ok: false,
        message: [
          `This v4 submit does not accept ${arg}.`,
          "Pass only the EAS build ID. The script already uses the v4 submit profile.",
          "",
          usageText()
        ].join("\n")
      };
    }
    values.push(arg);
  }

  if (values.length === 0) {
    return { ok: false, message: usageText() };
  }
  if (values.length > 1) {
    return {
      ok: false,
      message: ["Pass one EAS build ID.", "", usageText()].join("\n")
    };
  }

  const raw = values[0].trim();
  const matches = raw.match(BUILD_ID_PATTERN) || [];
  if (matches.length !== 1) {
    return {
      ok: false,
      message: [
        "That is not one EAS build ID. An EAS build ID looks like 12345678-1234-1234-1234-123456789abc.",
        "A git commit is not an EAS build ID.",
        "",
        usageText()
      ].join("\n")
    };
  }

  const buildId = matches[0].toLowerCase();
  const bare = raw.toLowerCase() === buildId;
  const expoUrl = EXPO_BUILD_URL.test(raw) && raw.toLowerCase().endsWith(buildId);
  if (!bare && !expoUrl) {
    return {
      ok: false,
      message: ["Paste the EAS build ID on its own, or the expo.dev build page link.", "", usageText()].join("\n")
    };
  }

  return { ok: true, buildId };
}

function channelName(build) {
  if (build && build.updateChannel && typeof build.updateChannel.name === "string") {
    return build.updateChannel.name;
  }
  if (typeof build?.channel === "string") return build.channel;
  return null;
}

function runtimeVersionOf(build) {
  if (build && build.runtime && typeof build.runtime.version === "string") return build.runtime.version;
  if (typeof build?.runtimeVersion === "string") return build.runtimeVersion;
  return null;
}

function shown(value) {
  if (value == null || value === "") return "missing";
  return String(value);
}

function verifyV4Build(build, expectedId) {
  const problems = [];
  if (!build || typeof build !== "object" || Array.isArray(build)) {
    return {
      ok: false,
      problems: ["The build record was not a JSON object, so its v4 identity could not be checked."]
    };
  }

  const id = typeof build.id === "string" ? build.id.toLowerCase() : "";
  if (!id) problems.push("The build record has no id.");
  else if (id !== expectedId.toLowerCase()) {
    problems.push(`The build record id is ${build.id}, which is not the id you passed.`);
  }

  if (build.buildProfile !== V4.buildProfile) {
    problems.push(
      `Profile is ${shown(build.buildProfile)}. v4 submits need profile ${V4.buildProfile}. Profile production is v2, and profile v3 is the v3 app.`
    );
  }

  const channel = channelName(build);
  if (!channel) {
    problems.push("The build record has no update channel, so channel v4 could not be confirmed.");
  } else if (channel !== V4.channel) {
    problems.push(`Channel is ${channel}. v4 submits need channel ${V4.channel}.`);
  }

  if (build.appVersion !== V4.appVersion) {
    problems.push(`App version is ${shown(build.appVersion)}. v4 submits need ${V4.appVersion}.`);
  }

  const runtime = runtimeVersionOf(build);
  if (!runtime) {
    problems.push("The build record has no runtime version, so runtime 0.4.0 could not be confirmed.");
  } else if (runtime !== V4.runtimeVersion) {
    problems.push(`Runtime is ${runtime}. v4 submits need runtime ${V4.runtimeVersion}.`);
  }

  if (typeof build.appIdentifier !== "string" || build.appIdentifier.length === 0) {
    problems.push("The build record has no bundle id, so the v4 app could not be confirmed.");
  } else if (build.appIdentifier !== V4.appIdentifier) {
    problems.push(`Bundle id is ${build.appIdentifier}. v4 submits need ${V4.appIdentifier}.`);
  }

  const platform = typeof build.platform === "string" ? build.platform.toUpperCase() : "";
  if (platform !== V4.platform) {
    problems.push(`Platform is ${shown(build.platform)}. v4 TestFlight submit needs iOS.`);
  }

  const distribution = typeof build.distribution === "string" ? build.distribution.toUpperCase() : "";
  if (!distribution) {
    problems.push("The build record has no distribution, so a store build could not be confirmed.");
  } else if (distribution !== V4.distribution) {
    problems.push(`Distribution is ${build.distribution}. v4 TestFlight submit needs a store build.`);
  }

  const status = typeof build.status === "string" ? build.status.toUpperCase() : "";
  if (status !== V4.status) {
    problems.push(`Status is ${shown(build.status)}. Wait until this build is finished, then submit the same ID.`);
  }

  if (typeof build.isForIosSimulator !== "boolean") {
    problems.push("The build record does not say whether this is a simulator build, so it was not submitted.");
  } else if (build.isForIosSimulator) {
    problems.push("This is a simulator build. TestFlight needs the store build from the v4 profile.");
  }

  return { ok: problems.length === 0, problems };
}

function viewArgs(buildId) {
  return ["eas-cli", "build:view", buildId, "--json"];
}

function submitArgs(buildId) {
  return ["eas-cli", "submit", "--platform", "ios", "--profile", "v4", "--id", buildId];
}

function assertExplicitV4Submit(args) {
  const hasLatest = args.some((arg) => String(arg).toLowerCase() === "--latest" || String(arg).toLowerCase() === "latest");
  const profileIndex = args.indexOf("--profile");
  const idIndex = args.indexOf("--id");
  if (
    hasLatest ||
    profileIndex === -1 ||
    args[profileIndex + 1] !== "v4" ||
    idIndex === -1 ||
    !args[idIndex + 1]
  ) {
    throw new Error("Refusing to submit because the v4 build ID was not explicit.");
  }
}

function parseBuildJson(stdout) {
  const trimmed = String(stdout || "").trim();
  if (!trimmed) {
    throw new Error("EAS did not return a build record.");
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end <= start) {
      throw new Error("EAS did not return JSON for that build.");
    }
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

function couldNotCheckMessage(detail) {
  return [
    "That build could not be checked, so nothing was submitted.",
    detail,
    "",
    "Log in if you need to (npx eas-cli login), confirm the ID, then run this again with the same ID.",
    "This script will not fall back to --latest."
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}

function identityFailedMessage(problems) {
  return [
    "This build is not the finished v4 iOS app, so nothing was submitted.",
    "",
    ...problems.map((problem) => `- ${problem}`),
    "",
    "Build v4 with: npm run build:ios:v4",
    "Then submit that build's own EAS ID. This script will not fall back to --latest."
  ].join("\n");
}

function runNpx(args, { captureStdout, runner }) {
  if (args[1] === "submit") assertExplicitV4Submit(args);

  const spawnImpl = runner || spawn;
  return new Promise((resolve, reject) => {
    const child = spawnImpl("npx", args, {
      cwd: path.join(__dirname, ".."),
      shell: true,
      stdio: ["inherit", captureStdout ? "pipe" : "inherit", "inherit"],
      env: process.env
    });
    let stdout = "";
    if (captureStdout && child.stdout) {
      child.stdout.setEncoding("utf8");
      child.stdout.on("data", (chunk) => {
        stdout += chunk;
      });
    }
    child.on("error", reject);
    child.on("exit", (code) => resolve({ code: code ?? 1, stdout }));
  });
}

async function main(argv = process.argv, options = {}) {
  const parsed = readBuildId(argv);
  if (!parsed.ok) {
    console.error(parsed.message);
    return 1;
  }

  console.log(`Reading EAS build ${parsed.buildId} before submitting it.`);
  let viewed;
  try {
    viewed = await runNpx(viewArgs(parsed.buildId), { captureStdout: true, runner: options.runner });
  } catch (error) {
    console.error(couldNotCheckMessage(error instanceof Error ? error.message : String(error)));
    return 1;
  }
  if (!viewed || viewed.code !== 0) {
    console.error(
      couldNotCheckMessage("EAS could not show that build. Check the ID, your login, and the network, then try the same ID again.")
    );
    return 1;
  }

  let build;
  try {
    build = parseBuildJson(viewed.stdout);
  } catch (error) {
    console.error(couldNotCheckMessage(error instanceof Error ? error.message : String(error)));
    return 1;
  }

  const verdict = verifyV4Build(build, parsed.buildId);
  if (!verdict.ok) {
    console.error(identityFailedMessage(verdict.problems));
    return 1;
  }

  const args = submitArgs(parsed.buildId);
  try {
    assertExplicitV4Submit(args);
  } catch (error) {
    console.error(couldNotCheckMessage(error instanceof Error ? error.message : String(error)));
    return 1;
  }

  console.log("This build is Nudge me Ready v4 (0.4.0, runtime 0.4.0, channel v4). Submitting this build ID only.");
  try {
    const submitted = await runNpx(args, { captureStdout: false, runner: options.runner });
    return submitted.code;
  } catch (error) {
    console.error(couldNotCheckMessage(error instanceof Error ? error.message : String(error)));
    return 1;
  }
}

if (require.main === module) {
  main()
    .then((code) => process.exit(code))
    .catch((error) => {
      console.error(couldNotCheckMessage(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    });
}

module.exports = {
  V4,
  assertExplicitV4Submit,
  identityFailedMessage,
  main,
  parseBuildJson,
  readBuildId,
  submitArgs,
  usageText,
  verifyV4Build,
  viewArgs
};
