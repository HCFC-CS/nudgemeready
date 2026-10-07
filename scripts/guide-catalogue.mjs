/**
 * Parse Ready4 pack TypeScript sources into JSON for user-guide generation.
 */
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const packDir = path.join(root, "src/data/readyPacks/ready4");

const INTENT_LABEL = {
  plan: "Plan it",
  remember: "Remember it",
  do: "Do it",
  book_go: "Book & go",
  buy_pay: "Buy & pay",
  life_people: "Life & people"
};

function extractQuoted(block, key) {
  const re = new RegExp(`${key}:\\s*"([^"]+)"`);
  return block.match(re)?.[1];
}

function extractTemplateBlock(text) {
  const start = text.indexOf("templates: [");
  if (start < 0) {
    return [];
  }
  const templates = [];
  const re =
    /\{\s*id:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*type:\s*"([^"]+)"([\s\S]*?)(?=\n\s*\{|\n\s*\])/g;
  const slice = text.slice(start);
  let match;
  while ((match = re.exec(slice))) {
    const notesMatch = match[4].match(/notes:\s*"([^"]+)"/);
    const notesConcat = match[4].match(/notes:\s*organisationalHealthNote/);
    const listTitles = [...match[4].matchAll(/\{\s*title:\s*"([^"]+)"\s*\}/g)].map((row) => row[1]);
    const repeat = match[4].match(/frequency:\s*"([^"]+)"/)?.[1];
    templates.push({
      id: match[1],
      title: match[2],
      type: match[3],
      notes: notesMatch?.[1] ?? (notesConcat ? "Organisational support only — not medical advice." : undefined),
      repeat,
      listItems: listTitles
    });
  }
  return templates;
}

function extractStringArray(block, key) {
  const re = new RegExp(`${key}:\\s*\\[([\\s\\S]*?)\\]`);
  const inner = block.match(re)?.[1];
  if (!inner) {
    return [];
  }
  return [...inner.matchAll(/"([^"]+)"/g)].map((row) => row[1]);
}

function extractSummary(block) {
  const oneLine = block.match(/summary:\s*"([^"]+)"/);
  if (oneLine) {
    return oneLine[1];
  }
  const multi = block.match(/summary:\s*\n\s*"([^"]+)"/);
  if (multi) {
    return multi[1];
  }
  const joined = block.match(/summary:\s*\n\s*"([^"]*)"\s*\+\s*\n\s*"([^"]+)"/);
  if (joined) {
    return `${joined[1]}${joined[2]}`;
  }
  return "";
}

function parseExtensions(source) {
  const byPack = {};
  const packBlocks = source.split(/packId:\s*"/).slice(1);
  for (const block of packBlocks) {
    const packId = `ready4-${block.split('"')[0]}`.replace(/^ready4-ready4-/, "ready4-");
    const id = block.match(/^([^"]+)"/)?.[1];
    if (!id) {
      continue;
    }
    const fullId = id.startsWith("ready4-") ? id : `ready4-${id}`;
    const extRe = /ext\(\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"/g;
    const extensions = [];
    let match;
    while ((match = extRe.exec(block))) {
      if (match[1] !== fullId && !block.slice(0, 40).includes(match[1])) {
        // still accept — ext first arg is packId
      }
      extensions.push({
        packId: match[1],
        intent: match[2],
        intentLabel: INTENT_LABEL[match[2]] ?? match[2],
        id: match[3],
        label: match[4]
      });
    }
    byPack[fullId] = extensions;
  }
  return byPack;
}

function parseBudgets(source) {
  const byPack = {};
  const blocks = source.split(/packId:\s*"/).slice(1);
  for (const block of blocks) {
    const packId = block.match(/^([^"]+)"/)?.[1];
    const budgetName = block.match(/budgetName:\s*"([^"]+)"/)?.[1];
    if (packId && budgetName) {
      byPack[packId] = budgetName;
    }
  }
  return byPack;
}

export async function loadGuideCatalogue() {
  const files = (await readdir(packDir)).filter((name) => name.endsWith(".ts") && name !== "index.ts");
  const packs = [];
  for (const file of files) {
    const text = await readFile(path.join(packDir, file), "utf8");
    if (!text.includes("ready4Pack(")) {
      continue;
    }
    const slug = extractQuoted(text, "slug");
    const name = extractQuoted(text, "name");
    if (!slug || !name) {
      continue;
    }
    packs.push({
      id: `ready4-${slug}`,
      file,
      name,
      title: `Ready4 ${name}`,
      slug,
      summary: extractSummary(text) || "",
      features: extractStringArray(text, "features"),
      productId: extractQuoted(text, "productId") ?? null,
      health: /healthDisclaimer/.test(text),
      templates: extractTemplateBlock(text)
    });
  }

  const order = [
    "ready4-study",
    "ready4-home",
    "ready4-finance",
    "ready4-medication",
    "ready4-work",
    "ready4-family",
    "ready4-travel",
    "ready4-wellbeing",
    "ready4-shopping",
    "ready4-independence",
    "ready4-appointments",
    "ready4-pets",
    "ready4-digital-life",
    "ready4-life-admin",
    "ready4-emergencies",
    "ready4-baby",
    "ready4-moving",
    "ready4-wedding"
  ];
  packs.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

  const extSource = await readFile(path.join(root, "src/services/ready4NudgeExtensions.ts"), "utf8");
  const budgetSource = await readFile(path.join(root, "src/services/ready4BudgetExtensions.ts"), "utf8");
  const extensions = parseExtensions(extSource);
  const budgets = parseBudgets(budgetSource);

  for (const pack of packs) {
    pack.addActions = extensions[pack.id] ?? [];
    pack.budgetName = budgets[pack.id] ?? null;
    pack.access = pack.productId
      ? "Paid catalogue (no charge on TestFlight while billing is off)"
      : "Free — included with the app";
    if (pack.id === "ready4-wellbeing") {
      const titles = new Set(pack.templates.map((row) => row.id));
      const extras = [
        { id: "hydration", title: "Have a drink of water", type: "list", notes: "A quiet check-in, not a target." },
        { id: "meal-check", title: "I ate something", type: "list", notes: "A gentle meal check. Not a calorie log." },
        { id: "movement", title: "Move a little", type: "list", notes: "A tiny stretch or walk. Skip is fine." },
        { id: "gratitude", title: "Gratitude / good thing note", type: "note", notes: "Optional. One good thing is enough." }
      ];
      for (const extra of extras) {
        if (!titles.has(extra.id)) {
          pack.templates.push(extra);
        }
      }
    }
  }

  return packs;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const packs = await loadGuideCatalogue();
  const outDir = path.join(root, "website/manual/library");
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "catalogue.json"), JSON.stringify(packs, null, 2));
  console.log(`Exported ${packs.length} packs`);
}
