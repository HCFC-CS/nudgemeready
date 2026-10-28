const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const test = require("node:test");

const { formatUpdateCommand, main, updateArgs, verifyV4UpdateConfig } = require("./update-ios-v4.cjs");

const sha = "3c9a6ebecb4df264d59324eda511cddc16e1f277";
const otherSha = "2cfa133c62292fc8585db2f84471fa34f0010354";

function v4Config(overrides = {}) {
  return {
    name: "Nudge me Ready v4",
    version: "0.4.0",
    runtimeVersion: { policy: "appVersion" },
    ios: { bundleIdentifier: "com.helencunliffe.nudgeme.v4" },
    extra: {
      appVariant: "v4",
      eas: { projectId: "6ca4ec88-2487-43ae-a858-5c3d96abf41e" }
    },
    ...overrides
  };
}

function goodArgv(extra = []) {
  return [
    "node",
    "update-ios-v4.cjs",
    "--sha",
    sha,
    "--channel",
    "v4",
    "--platform",
    "ios",
    "--message",
    "short note",
    ...extra
  ];
}

function publisher() {
  const calls = [];
  function runner(command, args) {
    calls.push({ command, args: [...args] });
    const child = new EventEmitter();
    process.nextTick(() => child.emit("exit", 0));
    return child;
  }
  return { calls, runner };
}

function optionsFor(overrides = {}) {
  const published = publisher();
  return {
    published,
    env: { APP_VARIANT: "v4" },
    gitHead: () => sha,
    gitStatus: () => "",
    readConfig: () => v4Config(),
    runner: published.runner,
    ...overrides
  };
}

async function run(argv, overrides) {
  const options = optionsFor(overrides);
  const code = await main(argv, options);
  return { code, calls: options.published.calls };
}

test("a missing SHA does not publish", async () => {
  const { code, calls } = await run(["node", "update-ios-v4.cjs", "--channel", "v4", "--platform", "ios", "--message", "short note"]);
  assert.equal(code, 1);
  assert.equal(calls.length, 0);
});

test("a HEAD mismatch does not publish", async () => {
  const { code, calls } = await run(goodArgv(), { gitHead: () => otherSha });
  assert.equal(code, 1);
  assert.equal(calls.length, 0);
});

test("a dirty tree does not publish", async () => {
  const { code, calls } = await run(goodArgv(), { gitStatus: () => "?? untracked.txt\n" });
  assert.equal(code, 1);
  assert.equal(calls.length, 0);
});

test("an unset APP_VARIANT does not publish or read the default config", async () => {
  let read = false;
  const { code, calls } = await run(goodArgv(), {
    env: {},
    readConfig() {
      read = true;
      return v4Config();
    }
  });
  assert.equal(code, 1);
  assert.equal(read, false);
  assert.equal(calls.length, 0);
});

test("APP_VARIANT other than v4 does not publish", async () => {
  const { code, calls } = await run(goodArgv(), { env: { APP_VARIANT: "v3" } });
  assert.equal(code, 1);
  assert.equal(calls.length, 0);
});

test("the wrong EAS project id does not publish", async () => {
  const config = v4Config();
  config.extra = {
    appVariant: "v4",
    eas: { projectId: "00000000-0000-0000-0000-000000000000" }
  };
  const { code, calls } = await run(goodArgv(), { readConfig: () => config });
  assert.equal(code, 1);
  assert.equal(calls.length, 0);
  assert.equal(verifyV4UpdateConfig(config).ok, false);
});

test("the wrong channel or platform does not publish", async () => {
  const channel = await run([
    "node",
    "update-ios-v4.cjs",
    "--sha",
    sha,
    "--channel",
    "production",
    "--platform",
    "ios",
    "--message",
    "short note"
  ]);
  const platform = await run([
    "node",
    "update-ios-v4.cjs",
    "--sha",
    sha,
    "--channel",
    "v4",
    "--platform",
    "android",
    "--message",
    "short note"
  ]);
  assert.equal(channel.code, 1);
  assert.equal(platform.code, 1);
  assert.equal(channel.calls.length, 0);
  assert.equal(platform.calls.length, 0);
});

test("a passing dry-run prints the command and does not publish", async () => {
  const lines = [];
  const original = console.log;
  console.log = (...parts) => lines.push(parts.join(" "));
  try {
    const { code, calls } = await run(goodArgv(["--dry-run"]));
    const output = lines.join("\n");
    assert.equal(code, 0);
    assert.equal(calls.length, 0);
    assert.match(output, /APP_VARIANT=v4 npx eas-cli update --channel v4 --platform ios --message "short note"/);
    assert.doesNotMatch(output, /EXPO_TOKEN|secret|process\.env/i);
    assert.equal(output.includes("--latest"), false);
  } finally {
    console.log = original;
  }
});

test("the publish command stays on channel v4 for ios", () => {
  assert.deepEqual(updateArgs("short note"), [
    "eas-cli",
    "update",
    "--channel",
    "v4",
    "--platform",
    "ios",
    "--message",
    "short note"
  ]);
  assert.equal(formatUpdateCommand("short note").includes("--latest"), false);
  assert.equal(verifyV4UpdateConfig(v4Config()).ok, true);
});
