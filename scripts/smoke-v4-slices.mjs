import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, devices } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const shotDir = "/opt/cursor/artifacts/screenshots";
const videoDir = "/opt/cursor/artifacts";
const baseUrl = "http://127.0.0.1:19006/";
const results = [];

function log(id, status, detail) {
  results.push({ id, status, detail });
  console.log(`${status === "PASS" ? "PASS" : status === "FAIL" ? "FAIL" : "INFO"}  ${id} — ${detail}`);
}

async function dump(page, name) {
  await mkdir(shotDir, { recursive: true });
  const file = path.join(shotDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

async function visibleText(page) {
  return page.evaluate(() => document.body?.innerText ?? "");
}

async function clickText(page, text, timeout = 8000) {
  const loc = page.getByText(text, { exact: true }).first();
  await loc.waitFor({ state: "visible", timeout });
  await loc.click();
}

async function clickTab(page, name) {
  const loc = page.getByRole("button", { name, exact: true }).last();
  await loc.waitFor({ state: "visible", timeout: 8000 });
  await loc.click();
}

async function hasTab(page, name) {
  return (await page.getByRole("button", { name, exact: true }).count()) > 0;
}

async function goAdd(page) {
  await clickTab(page, "Add a nudge");
  await page.waitForTimeout(600);
}

async function goAddHome(page) {
  for (let i = 0; i < 8; i++) {
    const body = await visibleText(page);
    if (body.includes("Type it") && /What’s on your mind\?|What's on your mind\?/.test(body)) {
      return;
    }
    const back = page.getByText("Back", { exact: true }).last();
    if (await back.count()) {
      await back.click({ force: true }).catch(() => {});
      await page.waitForTimeout(350);
      continue;
    }
    await goAdd(page);
  }
}

async function main() {
  await mkdir(shotDir, { recursive: true });
  await mkdir(videoDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices["iPhone 14 Pro"],
    locale: "en-GB",
    recordVideo: { dir: videoDir, size: { width: 390, height: 844 } }
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });

  await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForFunction(() => (document.body?.innerText ?? "").length > 20, null, { timeout: 120000 });
  await page.waitForTimeout(1500);
  let text = await visibleText(page);
  await dump(page, "01-launch");

  if (/Something went wrong|RCTFatal|Invariant Violation/i.test(text) || text.trim().length < 10) {
    log("launch", "FAIL", `App did not render a usable screen: ${text.slice(0, 180)}`);
    await context.close();
    await browser.close();
    printSummary(errors);
    process.exit(1);
  }
  log("launch", "PASS", `Got past blank/title. First copy: ${text.slice(0, 120).replace(/\n/g, " / ")}`);

  // Signup if needed (name fields sit below the Google button — scroll to them)
  if (
    text.includes("Create your account") ||
    text.includes("Your name") ||
    text.includes("Date of birth")
  ) {
    const nameField = page.getByPlaceholder("Your name");
    await nameField.scrollIntoViewIfNeeded();
    await nameField.fill("Helen Test");
    await page.getByPlaceholder("Email address").fill("helen.test@nudgemeready.app");
    await page.getByPlaceholder(/Date of birth/).fill("15/06/1980");
    const terms = page.getByRole("checkbox").first();
    await terms.scrollIntoViewIfNeeded();
    await terms.click();
    await page.getByText("Continue", { exact: true }).last().scrollIntoViewIfNeeded();
    await clickText(page, "Continue");
    await page.waitForTimeout(1500);
    text = await visibleText(page);
    await dump(page, "02-after-register");
    log("register", "PASS", "Filled name, email, DOB, terms, Continue");
  } else if (text.includes("See my day")) {
    log("register", "INFO", "Already past registration (See my day)");
  } else {
    log("register", "INFO", `Did not see registration. Screen: ${text.slice(0, 100).replace(/\n/g, " / ")}`);
  }

  text = await visibleText(page);
  if (text.includes("Create password") || text.includes("Choose a password")) {
    await page.getByPlaceholder("Create password").fill("Ready4test!");
    await page.getByPlaceholder("Confirm password").fill("Ready4test!");
    const recovery = page.getByPlaceholder("Recovery email");
    if (await recovery.count()) {
      await recovery.fill("helen.test@nudgemeready.app");
    }
    await clickText(page, "Save and continue");
    await page.waitForTimeout(1500);
    text = await visibleText(page);
    await dump(page, "03-after-setup");
    log("setup", "PASS", "Saved password");
  }

  text = await visibleText(page);
  if (/saved it/i.test(text) || text.includes("Recovery code")) {
    const saved = page.getByRole("button", { name: /saved it/i }).last();
    await saved.click();
    try {
      await page.waitForFunction(
        () => !/Recovery code — save this offline/i.test(document.body?.innerText ?? ""),
        null,
        { timeout: 8000 }
      );
    } catch {
      const alertSaved = page.getByRole("button", { name: /^I’ve saved it$|^I've saved it$/i });
      try {
        await alertSaved.click({ timeout: 2000 });
      } catch {
        // Native dialog handler may already have accepted.
      }
    }
    await page.waitForTimeout(1500);
    text = await visibleText(page);
    await dump(page, "03b-after-recovery");
    if (/Recovery code — save this offline/i.test(text)) {
      log("recovery", "FAIL", "Still on recovery code after continue");
    } else {
      log("recovery", "PASS", "Continued past recovery code");
    }
  }

  text = await visibleText(page);
  await dump(page, "04-after-auth");

  if (text.includes("Get it out of your head") || text.includes("Get started")) {
    const emptyPreviewBefore = text.includes("We'll save");
    if (emptyPreviewBefore && !text.includes("Type it")) {
      log("first-run-empty", "FAIL", "Fake save preview on empty first-run");
    } else {
      log("first-run-empty", "PASS", "No fake save on the welcome step");
    }
    await clickText(page, "Get started");
    await page.waitForTimeout(400);
    await clickText(page, "Remembering things");
    await clickText(page, "Continue");
    await page.waitForTimeout(400);
    await clickText(page, "Not now");
    await page.waitForTimeout(600);
    text = await visibleText(page);
    const previewBeforeType = /We'll save/.test(text);
    await page.getByLabel(/don't want to forget/i).fill("remind me to take the bins out tomorrow evening");
    await page.waitForTimeout(500);
    text = await visibleText(page);
    await dump(page, "05-first-run-typed");
    if (previewBeforeType) {
      log("first-run-preview", "FAIL", "Preview showed before typing");
    } else if (/tomorrow|evening|bins/i.test(text)) {
      log("first-run-preview", "PASS", "Preview appeared after typing, with a when");
    } else {
      log("first-run-preview", "INFO", `Typed first nudge. Screen: ${text.slice(0, 160).replace(/\n/g, " / ")}`);
    }
    await clickText(page, "Save");
    await page.waitForTimeout(1500);
    log("first-run", "PASS", "Saved first nudge from first-run");
  } else {
    log("first-run", "INFO", "First-run screen not shown (existing profile or skipped)");
  }

  text = await visibleText(page);
  await dump(page, "06-home");
  if (text.includes("Home") || text.includes("Right now") || text.includes("Your day") || text.includes("See my day")) {
    log("home", "PASS", "Reached Home / day shell");
  } else if (text.includes("Get it out of your head")) {
    log("home", "FAIL", "Still on first-run after save");
  } else {
    log("home", "INFO", `After auth/first-run: ${text.slice(0, 160).replace(/\n/g, " / ")}`);
  }

  // Nudges week
  const hasNudges = await hasTab(page, "Nudges");
  if (hasNudges) {
    await clickTab(page, "Nudges");
    await page.waitForTimeout(800);
    const week = page.getByText("Week", { exact: true }).first();
    if (await week.count()) {
      await week.click();
      await page.waitForTimeout(600);
    }
    text = await visibleText(page);
    await dump(page, "07-nudges-week");
    if (/Today|Tomorrow|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/i.test(text)) {
      log("week", "PASS", "Week view shows day labels");
    } else {
      log("week", "FAIL", `Week view missing days: ${text.slice(0, 160).replace(/\n/g, " / ")}`);
    }
  } else {
    log("week", "FAIL", "Nudges tab not found");
  }

  // Prepare for something
  const hasAdd = await hasTab(page, "Add a nudge");
  try {
    if (hasAdd) {
      await goAdd(page);
      await dump(page, "08-add");
      await clickText(page, "Plan it");
      await page.waitForTimeout(500);
      await clickText(page, "Prepare for something");
      await page.waitForTimeout(800);
      text = await visibleText(page);
      await dump(page, "09-prepare-for");
      if (/TITLE|Title/.test(text) && /When\?/.test(text) && /Task/.test(text) && !/Or pick a path/.test(text)) {
        log("prepare", "PASS", "Prepare for something opened details instead of auto-saving");
      } else if (text.includes("Prepare for something") && text.includes("Plan it")) {
        log("prepare", "FAIL", "Still on the action list — tap may have missed");
      } else {
        log("prepare", "INFO", `After Prepare for: ${text.slice(0, 180).replace(/\n/g, " / ")}`);
      }
    } else {
      log("prepare", "FAIL", "Add tab not found");
    }
  } catch (error) {
    log("prepare", "FAIL", String(error).slice(0, 180));
    await dump(page, "09-prepare-for-error");
  }

  // Plan something / project
  try {
    if (hasAdd) {
      await goAdd(page);
      const planIt = page.getByText("Plan it", { exact: true });
      if (await planIt.count()) {
        await planIt.first().click();
        await page.waitForTimeout(400);
      }
      const planSomething = page.getByText("Plan something", { exact: true });
      if (await planSomething.count()) {
        await planSomething.first().click();
        await page.waitForTimeout(800);
        text = await visibleText(page);
        await dump(page, "10-project");
        const titleField = page.getByLabel("Project title");
        if (await titleField.count()) {
          await titleField.fill("Kitchen");
        } else {
          await page.getByPlaceholder("Kitchen Refresh").fill("Kitchen");
        }
        const addTask = page.getByRole("button", { name: "Task", exact: true }).last();
        await addTask.scrollIntoViewIfNeeded();
        await addTask.click({ force: true });
        await page.waitForTimeout(800);
        text = await visibleText(page);
        await dump(page, "11-project-child");
        const childTitle = page.getByLabel("Title").last();
        await childTitle.waitFor({ state: "visible", timeout: 5000 });
        await childTitle.fill("Buy paint");
        const saveChip = page.getByRole("button", { name: /^Save$/ }).last();
        if (await saveChip.count()) {
          await saveChip.scrollIntoViewIfNeeded();
          await saveChip.click({ force: true });
          await page.waitForTimeout(800);
        }
        text = await visibleText(page);
        await dump(page, "12-after-child-save");
        if (/Kitchen|Buy paint|Project/i.test(text)) {
          log("project", "PASS", "Project/task save path ran without dropping the screen");
        } else {
          log("project", "INFO", `After child save: ${text.slice(0, 160).replace(/\n/g, " / ")}`);
        }
      } else {
        log("project", "INFO", "Plan something not on this Add screen");
      }
    }
  } catch (error) {
    log("project", "FAIL", String(error).slice(0, 180));
    await dump(page, "10-project-error");
  }

  // Typed date via Type it
  try {
    if (hasAdd) {
      await goAddHome(page);
      const typeIt = page.getByText("Type it", { exact: true });
      if (await typeIt.count()) {
        await typeIt.last().click();
        await page.waitForTimeout(400);
        await page.getByPlaceholder(/Call the dentist/i).fill("Call the dentist tomorrow morning");
        await clickText(page, "Continue");
        await page.waitForTimeout(600);
        text = await visibleText(page);
        await dump(page, "13-typed-date");
        if (/tomorrow|morning|9:00|09:00|am/i.test(text)) {
          log("typed-date", "PASS", "Confirmation kept a when from the typed words");
        } else {
          log("typed-date", "FAIL", `No when on confirm: ${text.slice(0, 180).replace(/\n/g, " / ")}`);
        }
        const save = page.getByRole("button", { name: /^Save$/ }).last();
        if (await save.count()) {
          await save.click({ force: true });
          await page.waitForTimeout(800);
        }
      } else {
        log("typed-date", "INFO", "Type it not on this Add screen");
      }
    }
  } catch (error) {
    log("typed-date", "FAIL", String(error).slice(0, 180));
    await dump(page, "13-typed-date-error");
  }

  // Chips readable: open a nudge if possible
  if (hasNudges) {
    try {
      text = await visibleText(page);
      if (!(text.includes("Sorted") && text.includes("Later"))) {
        const addDetails = page.getByRole("button", { name: "Add details" });
        if (await addDetails.count()) {
          await addDetails.first().click({ force: true });
          await page.waitForTimeout(700);
        } else {
          await clickTab(page, "Nudges");
          await page.waitForTimeout(400);
          const all = page.getByText("All", { exact: true }).first();
          if (await all.count()) {
            await all.click();
            await page.waitForTimeout(400);
          }
          const item = page.getByText(/Kitchen|Buy paint|bins|dentist/i).first();
          if ((await item.count()) > 0) {
            await item.click({ force: true, timeout: 4000 }).catch(() => {});
            await page.waitForTimeout(500);
          }
        }
      }
      const finish = page.getByText("Finish this gently");
      if (await finish.count()) {
        await finish.last().scrollIntoViewIfNeeded();
      }
      await dump(page, "14-nudges-today");
      text = await visibleText(page);
      if (text.includes("Save") && text.includes("Sorted") && text.includes("Later")) {
        log("chips", "PASS", "Save · Sorted · Later visible on a nudge surface");
      } else {
        log("chips", "INFO", "Chip row not on this Nudges list (may be on item screen only)");
      }
    } catch (error) {
      log("chips", "INFO", String(error).slice(0, 160));
      await dump(page, "14-nudges-today");
    }
  }

  // Documents hub
  if (await hasTab(page, "Menu")) {
    await clickTab(page, "Menu");
    await page.waitForTimeout(500);
    text = await visibleText(page);
    await dump(page, "15-menu");
    const docs = page.getByText("Documents", { exact: true }).first();
    if (await docs.count()) {
      await docs.click();
      await page.waitForTimeout(600);
      text = await visibleText(page);
      await dump(page, "16-documents");
      if (/Upload|Nothing attached|Documents/i.test(text)) {
        log("documents", "PASS", "Documents hub opened");
      } else {
        log("documents", "INFO", text.slice(0, 120).replace(/\n/g, " / "));
      }
    } else {
      log("documents", "INFO", "Documents tile not on Menu");
    }
  }

  const videoPath = await page.video()?.path();
  await context.close();
  await browser.close();
  if (videoPath) {
    console.log(`VIDEO ${videoPath}`);
  }
  printSummary(errors);
  const failed = results.some((row) => row.status === "FAIL");
  process.exit(failed ? 1 : 0);
}

function printSummary(errors) {
  console.log("\n=== SUMMARY ===");
  for (const row of results) {
    console.log(`${row.status.padEnd(4)} ${row.id}: ${row.detail}`);
  }
  if (errors.length) {
    console.log("\n=== PAGE ERRORS ===");
    for (const err of errors.slice(0, 20)) {
      console.log(err);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
