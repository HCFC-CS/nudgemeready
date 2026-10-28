const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const { EventEmitter } = require("node:events");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  assertExplicitV4Submit,
  main,
  parseBuildJson,
  readBuildId,
  submitArgs,
  verifyV4Build,
  viewArgs
} = require("./submit-ios-v4.cjs");

const root = path.join(__dirname, "..");
const buildId = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";

function v4Build(overrides = {}) {
  return {
    id: buildId,
    status: "FINISHED",
    platform: "IOS",
    distribution: "STORE",
    buildProfile: "v4",
    appIdentifier: "com.helencunliffe.nudgeme.v4",
    appVersion: "0.4.0",
    appBuildVersion: "3",
    runtime: { version: "0.4.0" },
    updateChannel: { name: "v4" },
    isForIosSimulator: false,
    ...overrides
  };
}

function argv(id) {
  return ["node", "submit-ios-v4.cjs", id];
}

test("requires one explicit EAS build ID", () => {
  assert.equal(readBuildId(["node", "script"]).ok, false);
  assert.match(readBuildId(["node", "script"]).message, /does not submit --latest/i);
  assert.equal(readBuildId(argv("--latest")).ok, false);
  assert.equal(readBuildId(argv("latest")).ok, false);
  assert.equal(readBuildId(["node", "script", buildId, "--latest"]).ok, false);
  assert.equal(readBuildId(argv("2cfa133c62292fc8585db2f84471fa34f0010354")).ok, false);
  assert.equal(readBuildId(argv(buildId)).buildId, buildId);
  assert.equal(readBuildId(argv(`https://expo.dev/accounts/hcfc/projects/nudge-me/builds/${buildId}`)).buildId, buildId);
});

test("accepts the current EAS build record for v4", () => {
  const verdict = verifyV4Build(v4Build(), buildId);
  assert.equal(verdict.ok, true, verdict.problems?.join("\n"));
});

test("accepts a flattened channel and runtime when the rest is v4", () => {
  const build = v4Build();
  delete build.updateChannel;
  delete build.runtime;
  build.channel = "v4";
  build.runtimeVersion = "0.4.0";
  assert.equal(verifyV4Build(build, buildId).ok, true);
});

test("rejects other apps and incomplete records", () => {
  assert.equal(verifyV4Build(v4Build({ buildProfile: "production" }), buildId).ok, false);
  assert.equal(verifyV4Build(v4Build({ buildProfile: "v3", updateChannel: { name: "v3" } }), buildId).ok, false);
  assert.equal(verifyV4Build(v4Build({ appIdentifier: "com.helencunliffe.nudgeme" }), buildId).ok, false);
  assert.equal(verifyV4Build(v4Build({ appVersion: "0.2.0" }), buildId).ok, false);
  assert.equal(verifyV4Build(v4Build({ runtime: { version: "0.3.1" } }), buildId).ok, false);
  assert.equal(verifyV4Build(v4Build({ status: "IN_PROGRESS" }), buildId).ok, false);
  assert.equal(verifyV4Build(v4Build({ isForIosSimulator: true }), buildId).ok, false);
  assert.equal(verifyV4Build(v4Build({ platform: "ANDROID" }), buildId).ok, false);
  const missingChannel = v4Build();
  delete missingChannel.updateChannel;
  assert.equal(verifyV4Build(missingChannel, buildId).ok, false);
  assert.equal(verifyV4Build(v4Build({ id: "bbbbbbbb-bbbb-4ccc-8ddd-eeeeeeeeeeee" }), buildId).ok, false);
});

test("submit arguments name the v4 profile and the build ID", () => {
  const args = submitArgs(buildId);
  assert.deepEqual(args, ["eas-cli", "submit", "--platform", "ios", "--profile", "v4", "--id", buildId]);
  assert.equal(args.includes("--latest"), false);
  assert.doesNotThrow(() => assertExplicitV4Submit(args));
  assert.throws(() => assertExplicitV4Submit(["eas-cli", "submit", "--platform", "ios", "--profile", "v4", "--latest"]));
  assert.deepEqual(viewArgs(buildId), ["eas-cli", "build:view", buildId, "--json"]);
});

test("parseBuildJson reads an EAS JSON record", () => {
  const raw = `\n${JSON.stringify(v4Build(), null, 2)}\n`;
  assert.equal(parseBuildJson(raw).buildProfile, "v4");
  assert.equal(parseBuildJson(`note\n${JSON.stringify(v4Build())}\n`).id, buildId);
  assert.throws(() => parseBuildJson(""));
  assert.throws(() => parseBuildJson("not json"));
});

function fakeRunner(events) {
  const calls = [];
  function runner(command, args) {
    calls.push({ command, args: [...args] });
    const child = new EventEmitter();
    child.stdout = new EventEmitter();
    child.stdout.setEncoding = () => {};
    process.nextTick(() => {
      const step = events[calls.length - 1];
      if (step?.stdout) child.stdout.emit("data", step.stdout);
      child.emit("exit", step?.code ?? 0);
    });
    return child;
  }
  return { runner, calls };
}

test("missing ID does not call EAS", async () => {
  const { runner, calls } = fakeRunner([]);
  const code = await main(["node", "submit-ios-v4.cjs"], { runner });
  assert.equal(code, 1);
  assert.equal(calls.length, 0);
});

test("a failed lookup does not submit", async () => {
  const { runner, calls } = fakeRunner([{ code: 1, stdout: "" }]);
  const code = await main(argv(buildId), { runner });
  assert.equal(code, 1);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].args[1], "build:view");
});

test("an unreadable build record does not submit", async () => {
  const { runner, calls } = fakeRunner([{ code: 0, stdout: "not json" }]);
  const code = await main(argv(buildId), { runner });
  assert.equal(code, 1);
  assert.equal(calls.length, 1);
});

test("a v2 build record does not submit", async () => {
  const { runner, calls } = fakeRunner([
    { code: 0, stdout: JSON.stringify(v4Build({ buildProfile: "production", updateChannel: { name: "production" } })) }
  ]);
  const code = await main(argv(buildId), { runner });
  assert.equal(code, 1);
  assert.equal(calls.length, 1);
});

test("a checked v4 build is submitted by that ID", async () => {
  const { runner, calls } = fakeRunner([{ code: 0, stdout: JSON.stringify(v4Build()) }, { code: 0 }]);
  const code = await main(argv(buildId), { runner });
  assert.equal(code, 0);
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[1].args, submitArgs(buildId));
  assert.equal(calls[1].args.includes("--latest"), false);
});

test("release files stay consistent", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.equal(pkg.scripts["build:ios:v4"], "npx eas-cli build --platform ios --profile v4");
  assert.equal(pkg.scripts["submit:ios:v4"], "node scripts/submit-ios-v4.cjs");
  assert.equal(pkg.scripts["update:ios:v4"], "node scripts/update-ios-v4.cjs");
  assert.equal(pkg.scripts["build:ios:v2"], "eas build --platform ios --profile production");
  assert.equal(pkg.scripts["build:ios:v3"], "eas build --platform ios --profile v3");
  assert.equal(pkg.scripts["submit:ios:v3"], "eas submit --platform ios --profile v3 --latest");
  assert.equal(pkg.scripts["submit:ios:v4"].includes("--latest"), false);
  assert.equal(pkg.scripts["build:ios:v4"].includes("production"), false);

  const doc = fs.readFileSync(path.join(root, "docs", "TESTFLIGHT_V4.md"), "utf8");
  assert.match(doc, /HCFC-CS\/nudgemeready/);
  assert.match(doc, /cursor\/ready4-platform-audit-fixes/);
  assert.match(doc, /C:\\Users\\HCCun\\Documents\\nudgemeready/);
  assert.doesNotMatch(doc, /nudgemeready-v4/);
  assert.doesNotMatch(doc, /NUDGEMEREADY_V4_REPO/);
  assert.doesNotMatch(doc, /own GitHub repository/);
  assert.match(doc, /0\.4\.0 \(3\)/);
  assert.match(doc, /2cfa133c62292fc8585db2f84471fa34f0010354/);
  assert.match(doc, /3c9a6ebecb4df264d59324eda511cddc16e1f277/);
  assert.match(doc, /fa281984-4221-41db-b99c-f15ca78f8519/);
  assert.match(doc, /build:ios:v4/);
  assert.match(doc, /submit:ios:v4/);
  assert.match(doc, /update:ios:v4/);
  assert.doesNotMatch(doc, /--latest/);
  assert.doesNotMatch(doc, /--profile production/);
  assert.doesNotMatch(doc, /--profile v3/);

  function bat(name) {
    const text = fs.readFileSync(path.join(root, name), "utf8");
    assert.equal(text.includes("\r\n"), true, `${name} should use Windows line endings`);
    return text;
  }

  const buildV4 = bat("Build-TestFlight-v4.bat");
  const submitV4 = bat("Submit-TestFlight-v4.bat");
  const updateV4 = bat("Update-iOS-v4.bat");
  const buildV2 = bat("Build-TestFlight-v2.bat");
  const submitV2 = bat("Submit-TestFlight-v2.bat");
  const buildGeneric = bat("Build-TestFlight.bat");
  const submitGeneric = bat("Submit-TestFlight.bat");

  assert.match(buildV4, /npm\.cmd run build:ios:v4/);
  assert.doesNotMatch(buildV4, /production|--latest/);
  assert.match(submitV4, /npm\.cmd run submit:ios:v4/);
  assert.doesNotMatch(submitV4, /production|--latest/);
  assert.match(updateV4, /npm\.cmd run update:ios:v4/);
  assert.doesNotMatch(updateV4, /eas-cli build|eas-cli submit|production|--latest/);
  assert.match(buildV2, /--profile production/);
  assert.match(buildV2, /v2/);
  assert.doesNotMatch(buildV2, /profile v4/);
  assert.match(submitV2, /--profile production/);
  assert.match(submitV2, /--latest/);
  assert.match(submitV2, /v2/);
  assert.doesNotMatch(submitV2, /profile v4/);
  assert.doesNotMatch(buildGeneric, /--profile production|eas-cli|--latest|npm\.cmd run build/);
  assert.match(buildGeneric, /Build-TestFlight-v4\.bat/);
  assert.match(buildGeneric, /Build-TestFlight-v2\.bat/);
  assert.doesNotMatch(submitGeneric, /--profile production|eas-cli|--latest|npm\.cmd run submit/);
  assert.match(submitGeneric, /Submit-TestFlight-v4\.bat/);
  assert.match(submitGeneric, /Submit-TestFlight-v2\.bat/);

  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "nmr-bats-"));
  for (const name of [
    "Build-TestFlight.bat",
    "Build-TestFlight-v2.bat",
    "Build-TestFlight-v4.bat",
    "Submit-TestFlight.bat",
    "Submit-TestFlight-v2.bat",
    "Submit-TestFlight-v4.bat",
    "Update-iOS-v4.bat"
  ]) {
    const neutered = bat(name)
      .replace(/\bnpm\.cmd\b/g, "echo npm.cmd")
      .replace(/\bnpx\.cmd\b/g, "echo npx.cmd")
      .replace(/\bstart\b/g, "echo start");
    const plain = neutered.replace(/\r/g, "");
    assert.equal(/\bnpm\.cmd\b/.test(plain.replace(/echo npm\.cmd/g, "")), false);
    assert.equal(/\bnpx\.cmd\b/.test(plain.replace(/echo npx\.cmd/g, "")), false);
    assert.equal(/(^|\n)start /.test(plain), false);
    const dest = path.join(scratch, name);
    fs.writeFileSync(dest, neutered);
    const parsed = spawnSync("cmd.exe", ["/d", "/c", dest], { cwd: scratch, encoding: "utf8" });
    const output = `${parsed.stdout || ""}\n${parsed.stderr || ""}`;
    assert.doesNotMatch(output, /was unexpected at this time/i, output);
    assert.match(output, /start "/i, `${name}\n${output}`);
    assert.ok(parsed.status === 0 || parsed.status === 1, output);
  }
});
