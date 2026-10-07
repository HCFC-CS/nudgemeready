import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, devices } from "playwright";
import { loadGuideCatalogue } from "./guide-catalogue.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const imageDir = path.join(projectRoot, "website", "manual", "library", "images");
const port = 19006;
const baseUrl = `http://127.0.0.1:${port}`;

const coreTargets = [
  { id: "Budget", file: "core-money.png" },
  { id: "CalendarHub", file: "core-calendar.png" },
  { id: "DocumentsHub", file: "core-documents.png" },
  { id: "SavedThings", file: "core-saved-things.png" },
  { id: "Profile", file: "core-profile.png" },
  { id: "MyWorld", file: "core-everything.png" }
];

async function waitForApp(page) {
  await page.waitForFunction(
    () => {
      const root = document.getElementById("root");
      const text = (root?.innerText || "").trim();
      return text.length > 20;
    },
    undefined,
    { timeout: 180000 }
  );
  await page.waitForTimeout(1200);
}

async function shot(page, query, file) {
  const url = `${baseUrl}/?${query}`;
  console.log(`→ ${file}`);
  await page.goto(url, { waitUntil: "load", timeout: 120000 });
  await waitForApp(page);
  await page.screenshot({ path: path.join(imageDir, file), fullPage: false });
}

async function main() {
  await mkdir(imageDir, { recursive: true });
  const packs = await loadGuideCatalogue();
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices["iPhone 14 Pro"],
    locale: "en-GB"
  });
  const page = await context.newPage();

  for (const target of coreTargets) {
    await shot(page, `screenshot=${target.id}`, target.file);
  }

  for (const pack of packs) {
    await shot(page, `screenshot=ReadyPackPreview&pack=${encodeURIComponent(pack.id)}`, `${pack.id}-preview.png`);
    await shot(page, `screenshot=PackPlanner&pack=${encodeURIComponent(pack.id)}`, `${pack.id}-planner.png`);
  }

  await browser.close();
  console.log("Guide library screenshots done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
