import { mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, devices } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "screenshots");
const manualDir = path.join(projectRoot, "website", "manual", "images");
const port = 19006;
const baseUrl = `http://127.0.0.1:${port}`;

/** Keep in sync with src/navigation/screenshotState.ts */
const targets = [
  { id: "Splash", filename: "01-splash", guide: "guide-splash" },
  { id: "Home", filename: "02-home", guide: "guide-home" },
  { id: "Today", filename: "03-nudges", guide: "guide-nudges" },
  { id: "Capture", filename: "04-add", guide: "guide-add" },
  { id: "More", filename: "05-menu", guide: "guide-menu" },
  { id: "Focus", filename: "06-focus", guide: "guide-focus" },
  { id: "MyWorld", filename: "07-everything", guide: "guide-everything" },
  { id: "ComingUp", filename: "08-coming-up", guide: "guide-coming-up" },
  { id: "RewardBank", filename: "09-reward-bank", guide: "guide-rewards" },
  { id: "ReadyPacks", filename: "10-ready-packs", guide: "guide-packs" },
  { id: "Done", filename: "11-done", guide: "guide-done" },
  { id: "ItemDetails", filename: "12-item-details", guide: "guide-details" },
  { id: "Help", filename: "13-ask-for-help", guide: "guide-ask" },
  { id: "CrewHub", filename: "14-crew", guide: "guide-crew" },
  { id: "OrganisationDashboard", filename: "15-organisation-dashboard", guide: "guide-people" },
  { id: "InviteCrew", filename: "16-invite-crew", guide: "guide-invite" },
  { id: "Profile", filename: "17-profile", guide: "guide-profile" },
  { id: "Settings", filename: "18-settings", guide: "guide-settings" }
];

async function waitForApp(page) {
  await page.waitForFunction(
    () => {
      const root = document.getElementById("root");
      const text = (root?.innerText || document.body?.innerText || "").trim();
      return text.length > 20 && !/loading/i.test(text.split("\n")[0] || "");
    },
    undefined,
    { timeout: 180000 }
  );
  await page.waitForTimeout(1500);
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  await mkdir(manualDir, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices["iPhone 14 Pro"],
    locale: "en-GB"
  });
  const page = await context.newPage();

  console.log(`Capturing ${targets.length} screenshots to ${outputDir}`);

  for (const target of targets) {
    const url = `${baseUrl}/?screenshot=${encodeURIComponent(target.id)}`;
    console.log(`→ ${target.filename}.png (${target.id})`);
    await page.goto(url, { waitUntil: "load", timeout: 120000 });
    await waitForApp(page);
    if (target.id === "Today") {
      await page.mouse.wheel(0, 640);
      await page.waitForTimeout(700);
    }
    if (target.id === "Settings") {
      await page.mouse.wheel(0, 280);
      await page.waitForTimeout(400);
    }
    const dest = path.join(outputDir, `${target.filename}.png`);
    await page.screenshot({
      path: dest,
      fullPage: false
    });
    await copyFile(dest, path.join(manualDir, `${target.guide}.png`));
  }

  // Friendly aliases used by older website pages
  await copyFile(path.join(manualDir, "guide-home.png"), path.join(manualDir, "manual-home.png"));
  await copyFile(path.join(manualDir, "guide-crew.png"), path.join(manualDir, "manual-crew.png"));
  await copyFile(path.join(manualDir, "guide-add.png"), path.join(manualDir, "manual-capture.png"));
  await copyFile(path.join(manualDir, "guide-nudges.png"), path.join(manualDir, "manual-nudges.png"));
  await copyFile(path.join(manualDir, "guide-focus.png"), path.join(manualDir, "manual-focus.png"));
  await copyFile(path.join(manualDir, "guide-settings.png"), path.join(manualDir, "manual-settings.png"));
  await copyFile(path.join(manualDir, "guide-splash.png"), path.join(manualDir, "manual-register.png"));
  await copyFile(path.join(manualDir, "guide-settings.png"), path.join(manualDir, "manual-lock.png"));

  await browser.close();
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
