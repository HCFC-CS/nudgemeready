import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, devices } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "screenshots");
const port = 19006;
const baseUrl = `http://127.0.0.1:${port}`;

const targets = [
  { id: "Splash", filename: "01-splash" },
  { id: "Home", filename: "02-home" },
  { id: "Capture", filename: "03-capture" },
  { id: "Today", filename: "04-today" },
  { id: "Focus", filename: "05-focus" },
  { id: "More", filename: "06-more" },
  { id: "MyWorld", filename: "07-my-world" },
  { id: "Projects", filename: "08-projects" },
  { id: "Lists", filename: "09-lists" },
  { id: "Reminders", filename: "10-reminders" },
  { id: "Routines", filename: "11-routines" },
  { id: "Events", filename: "12-events" },
  { id: "Occasions", filename: "13-occasions" },
  { id: "Done", filename: "14-done" },
  { id: "ItemDetails", filename: "15-item-details" },
  { id: "AddTask", filename: "16-add-task" },
  { id: "VoiceAddTask", filename: "17-voice-add-task" },
  { id: "TaskBuddy", filename: "18-task-buddy" },
  { id: "Help", filename: "19-ask-for-help" },
  { id: "Circle", filename: "20-circle" },
  { id: "NudgyCrew", filename: "21-support-circle" },
  { id: "Profile", filename: "22-profile" },
  { id: "Settings", filename: "23-settings" }
];

async function waitForApp(page) {
  await page.waitForFunction(
    () => {
      const text = document.body?.innerText ?? "";
      return text.length > 20 && !text.includes("Loading");
    },
    undefined,
    { timeout: 120000 }
  );
  await page.waitForTimeout(1200);
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices["iPhone 14 Pro"],
    locale: "en-GB"
  });
  const page = await context.newPage();

  console.log(`Capturing ${targets.length} screenshots to ${outputDir}`);

  for (const target of targets) {
    const url = `${baseUrl}/?screen=${encodeURIComponent(target.id)}`;
    console.log(`→ ${target.filename}.png (${target.id})`);
    await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
    await waitForApp(page);
    await page.screenshot({
      path: path.join(outputDir, `${target.filename}.png`),
      fullPage: true
    });
  }

  await browser.close();
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
