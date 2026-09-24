import { mkdir, writeFile, copyFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { loadGuideCatalogue } from "./guide-catalogue.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const libDir = path.join(root, "website", "manual", "library");
const packHtmlDir = path.join(libDir, "packs");
const coreHtmlDir = path.join(libDir, "core");
const pdfDir = path.join(libDir, "pdfs");
const imgDir = path.join(libDir, "images");
const sharedImg = path.join(root, "website", "manual", "images");

const CORE_MODULES = [
  {
    id: "home",
    title: "Home and What’s coming up",
    summary: "See the next real thing first. One timeline for today, this week, and later.",
    where: "Bottom tab: Home. Also Menu → What’s coming up.",
    images: ["guide-home.png", "guide-coming-up.png"],
    steps: [
      "Open Home after See my day.",
      "Read What’s coming up — the next dated item is shown first.",
      "Tap See what’s coming up for Today / 7 days / Month / later.",
      "Use Show my appointments here if you want phone calendar events on the same timeline.",
      "Focus on this starts a calm session on the next item.",
      "If the timeline is empty, tap Add something you don’t want to forget."
    ],
    notes: ["No Ready4 pack is required.", "Holidays and similar calendar noise are skipped."]
  },
  {
    id: "nudges",
    title: "Nudges",
    summary: "Your working list. Later, Sorted, Smaller and Ask live on the row — no form, no guilt.",
    where: "Bottom tab: Nudges.",
    images: ["guide-nudges.png"],
    steps: [
      "Open Nudges to see open items.",
      "Tap Later to move something to tomorrow.",
      "Tap Sorted when it is done — a small Reward Bank point may be added.",
      "Tap Smaller if it feels like too much.",
      "Tap Ask to send a message about that item from this phone.",
      "Filter with Open / All / Done, or Dates / To-dos / Lists. Search if the list is long."
    ],
    notes: ["Skip, snooze and hard days never cost you anything in the app."]
  },
  {
    id: "add",
    title: "Add",
    summary: "Say it, pick one of six everyday paths, or Something else. Packs only add extra choices after install.",
    where: "Round Add button in the tab bar.",
    images: ["guide-add.png", "guide-details.png"],
    steps: [
      "Tap Add.",
      "Say it — for example, remind me to take the bins out tomorrow evening.",
      "If you said what and when, it saves straight away.",
      "Or pick Plan it, Remember it, Do it, Book & go, Buy & pay, or Life & people.",
      "Or tap Something else and type in your own words.",
      "The first save may ask to turn on quiet phone reminders."
    ],
    notes: [
      "The six paths work with no Ready4 pack.",
      "Wedding, moving, baby and other pack choices stay hidden until that pack is installed."
    ]
  },
  {
    id: "focus",
    title: "Focus",
    summary: "One thing, for a short while. Breaks are part of the plan.",
    where: "Bottom tab: Focus.",
    images: ["guide-focus.png"],
    steps: [
      "Open Focus.",
      "If it feels heavy, use Why is this hard today? or take the smaller step offered.",
      "Start the timer.",
      "Pause, skip or stop whenever you need — there is no failed streak."
    ],
    notes: []
  },
  {
    id: "rewards",
    title: "Reward Bank",
    summary: "One bank for the whole app. Small points. A quiet treat, not a score you can fail.",
    where: "Menu → Reward Bank. A glance also sits on Home.",
    images: ["guide-rewards.png"],
    steps: [
      "Sorted and I did something can add points.",
      "Keep saving toward Favourite coffee, a £10 treat, or a treat you rename.",
      "Claim when it feels kind."
    ],
    notes: ["There is only one Reward Bank. Packs do not create a second points system."]
  },
  {
    id: "crew",
    title: "Crew",
    summary: "People you trust. In this version Crew lives on this phone.",
    where: "Menu → Crew.",
    images: ["guide-crew.png", "guide-invite.png"],
    steps: [
      "Open Crew.",
      "Tap Invite when you are ready.",
      "Choose Email, SMS, WhatsApp or Copy link.",
      "They get a message you send — they do not see your list live on their own phone yet."
    ],
    notes: ["Everyday support only. In immediate danger, contact emergency services."]
  },
  {
    id: "ask",
    title: "Ask for help",
    summary: "Opens a message on this phone. It does not share your list live.",
    where: "A Nudges row → Ask, or Help routes in the app.",
    images: ["guide-ask.png"],
    steps: [
      "Choose Encourage me, Remind me, Stay with me, or Help break it down.",
      "Send via Messages, email or Share.",
      "If Crew is empty, invite someone first."
    ],
    notes: []
  },
  {
    id: "money",
    title: "My money",
    summary: "What’s coming in, going out, and left — no judgement. Works with no pack.",
    where: "Menu → My money.",
    images: ["core-money.png"],
    steps: [
      "Open My money.",
      "Add what’s coming in, going out, or a saving in your own words.",
      "Ready4 project budgets (moving, wedding, baby, travel, and similar) only appear when that pack is installed."
    ],
    notes: ["Not financial advice.", "There is no second wallet."]
  },
  {
    id: "settings",
    title: "Settings, lock and reminders",
    summary: "Push, quiet hours, daily summary, app lock, home place, and voice.",
    where: "Menu → Settings.",
    images: ["guide-settings.png", "guide-splash.png"],
    steps: [
      "Turn on Push so dated items can nudge the lock screen.",
      "Quiet hours hold alerts overnight.",
      "Daily summary names today’s real titles, or stays quiet if nothing is due.",
      "Security: password or PIN, optional Face ID, recovery email and recovery code.",
      "This is home saves a leaving-home place when you want that checklist."
    ],
    notes: ["Forgetting a PIN resets the lock — it does not delete nudges. Uninstalling the app does."]
  },
  {
    id: "calendar",
    title: "Calendar",
    summary: "Appointments and events can link to the phone calendar. Coming Up is still the life timeline.",
    where: "Menu → Calendar.",
    images: ["core-calendar.png", "guide-coming-up.png"],
    steps: [
      "Create an appointment or event.",
      "Optionally link it to the phone calendar from the item.",
      "Or tap Show my appointments here on Home.",
      "Open Calendar to see linked dated items."
    ],
    notes: ["There is no second calendar engine."]
  },
  {
    id: "documents",
    title: "Documents",
    summary: "Photos and files stay on the nudge they belong to.",
    where: "Menu → Documents, or Important documents on an item.",
    images: ["core-documents.png"],
    steps: [
      "Open any nudge.",
      "Attach a photo or file if it helps (tickets, letters, ID copies).",
      "Find them again from Documents."
    ],
    notes: ["Keep device passcode and app lock on for sensitive files."]
  },
  {
    id: "saved-things",
    title: "Saved Things",
    summary: "Ideas from Help me find it. Compare up to three. You never have to buy.",
    where: "Menu → Saved Things.",
    images: ["core-saved-things.png"],
    steps: [
      "On a nudge, open Help me find it if shop ideas are on.",
      "Tap Save on something you might want later.",
      "Compare up to three in Saved Things.",
      "Skip anytime — completing a nudge never requires a purchase."
    ],
    notes: ["Official help pages are never treated as affiliate shop links."]
  },
  {
    id: "profile",
    title: "Profile",
    summary: "Name, photo or emoji, and home places.",
    where: "Menu → Profile.",
    images: ["core-profile.png"],
    steps: [
      "Edit your name, email and picture.",
      "Save This is home if you want leaving reminders."
    ],
    notes: []
  },
  {
    id: "everything",
    title: "Everything",
    summary: "Search and filter all your nudges in one place.",
    where: "Menu → Everything.",
    images: ["core-everything.png"],
    steps: [
      "Open Everything.",
      "Search by words you remember.",
      "Filter if the list is long."
    ],
    notes: []
  },
  {
    id: "ready4packs",
    title: "Ready4Packs shop",
    summary: "Packs add templates into the same six Add paths. They are not separate apps.",
    where: "Home → Explore, or Menu → Ready4Packs.",
    images: ["guide-packs.png"],
    steps: [
      "Browse the catalogue.",
      "Open a pack to preview templates.",
      "Install. Items appear in Nudges and stay editable.",
      "Pack-specific Add choices only show after install."
    ],
    notes: ["Home and Wellbeing are free. Other packs say you will not be charged while TestFlight billing is off."]
  }
];

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function imgTag(src, alt) {
  return `<figure><img src="${esc(src)}" alt="${esc(alt)}" width="280" /><figcaption>${esc(alt)}</figcaption></figure>`;
}

function pageShell(title, body, { cssHref, homeHref }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)} — Nudge me Ready v3</title>
  <link rel="stylesheet" href="${cssHref}" />
  <style>
    .guide-actions { margin: 1rem 0 0; display: flex; flex-wrap: wrap; gap: 0.6rem; }
    @media print { .guide-actions, .site-nav { display: none !important; } }
  </style>
</head>
<body>
  <header class="site-header">
    <a class="brand-lockup" href="${homeHref}">
      <span class="brand-wordmark"><span class="nudge">Nudge</span><span class="me"> me </span><span class="ready">Ready</span></span>
    </a>
  </header>
  <main class="manual-wrap manual">
    ${body}
  </main>
</body>
</html>`;
}

function packBody(pack, { imagePrefix, pdfHref, indexHref }) {
  const preview = `${imagePrefix}${pack.id}-preview.png`;
  const planner = `${imagePrefix}${pack.id}-planner.png`;
  const addActions = pack.addActions.length
    ? `<h3>What Add shows after install</h3>
      <p>These choices appear under the six everyday paths only after this pack is installed.</p>
      <table><thead><tr><th>Path</th><th>Extra action</th></tr></thead><tbody>
      ${pack.addActions.map((row) => `<tr><td><span class="kbd">${esc(row.intentLabel)}</span></td><td>${esc(row.label)}</td></tr>`).join("")}
      </tbody></table>`
    : "";
  const budget = pack.budgetName
    ? `<h3>My money</h3><p>After install, Menu → My money can show a project budget named <span class="kbd">${esc(pack.budgetName)}</span>. Core My money still works without this pack.</p>`
    : "";
  const health = pack.health
    ? `<div class="callout warn">Organisational support only — not medical advice. Follow your clinician. In immediate danger, contact emergency services.</div>`
    : "";

  return `
    <p class="eyebrow">${esc(pack.access)}</p>
    <h1>${esc(pack.title)}</h1>
    <p class="lede">${esc(pack.summary)}</p>
    <p class="fine">Nudge me Ready v3 · 0.3.1 · Ready4 pack · Data stays on this phone</p>
    <p class="guide-actions">
      <a class="button" href="${pdfHref}">Download PDF</a>
      <a class="button quiet" href="${indexHref}">All guides</a>
    </p>
    ${health}
    <h2>What this pack is for</h2>
    <p>${esc(pack.features.join(" · "))}</p>
    <h2>How to find it</h2>
    <ol class="step-list">
      <li>Open <span class="kbd">Menu</span> → <span class="kbd">Ready4Packs</span> (or Home → Explore).</li>
      <li>Open <span class="kbd">${esc(pack.title)}</span>.</li>
      <li>Read the preview, then tap install. On TestFlight you will not be charged if billing is off.</li>
      <li>Editable items appear in <span class="kbd">Nudges</span> and <span class="kbd">What’s coming up</span>.</li>
    </ol>
    ${imgTag("../../images/guide-packs.png", "Ready4Packs catalogue")}
    ${imgTag(preview, `${pack.title} preview`)}
    <h2>What you will get</h2>
    <p>Everything stays editable. Skip, snooze or remove without penalty.</p>
    <table><thead><tr><th>Template</th><th>Type</th><th>Notes</th></tr></thead><tbody>
      ${pack.templates
        .map(
          (row) =>
            `<tr><td>${esc(row.title)}</td><td>${esc(row.type)}</td><td>${esc(row.notes ?? (row.repeat ? `Repeats ${row.repeat}` : "—"))}${
              row.listItems?.length ? `<br /><span class="kbd">${esc(row.listItems.slice(0, 6).join(" · "))}</span>` : ""
            }</td></tr>`
        )
        .join("")}
    </tbody></table>
    <h2>Everyday workflow</h2>
    <ol class="step-list">
      <li>Install the pack once.</li>
      <li>Open a template from Nudges and change the title, day or checklist to match your life.</li>
      <li>Use <span class="kbd">Later</span>, <span class="kbd">Sorted</span>, <span class="kbd">Smaller</span> or <span class="kbd">Ask</span> on the list.</li>
      <li>From <span class="kbd">Add</span>, use the extra pack actions if you need a new item in this area.</li>
      <li>Open the pack planner (Home pack tile, or Menu if shown) for today / this week in this pack.</li>
      <li>Optional: turn on Push so dated items can nudge the lock screen.</li>
    </ol>
    ${imgTag(planner, `${pack.title} planner`)}
    ${addActions}
    ${budget}
    <h2>Kind actions</h2>
    <p>Later, Sorted, Smaller, Ask, skip and remove never shame you. Progress over perfection.</p>
    <h2>Remove the pack</h2>
    <p>From the pack preview you can remove unedited items only, or everything from this pack. Unrelated nudges stay.</p>
    <p><a href="${indexHref}">Back to all guides</a></p>
  `;
}

function coreBody(mod, { pdfHref, indexHref }) {
  const figures = mod.images
    .map((file) => {
      const src = file.startsWith("core-") ? `../images/${file}` : `../../images/${file}`;
      return imgTag(src, mod.title);
    })
    .join("");
  return `
    <p class="eyebrow">Core module — no Ready4 pack required</p>
    <h1>${esc(mod.title)}</h1>
    <p class="lede">${esc(mod.summary)}</p>
    <p class="fine">Nudge me Ready v3 · 0.3.1 · ${esc(mod.where)}</p>
    <p class="guide-actions">
      <a class="button" href="${pdfHref}">Download PDF</a>
      <a class="button quiet" href="${indexHref}">All guides</a>
    </p>
    ${figures}
    <h2>Workflow</h2>
    <ol class="step-list">
      ${mod.steps.map((step) => `<li>${esc(step)}</li>`).join("")}
    </ol>
    ${
      mod.notes.length
        ? `<h2>Good to know</h2><ul>${mod.notes.map((note) => `<li>${esc(note)}</li>`).join("")}</ul>`
        : ""
    }
    <p><a href="${indexHref}">Back to all guides</a></p>
  `;
}

function indexBody(packs) {
  return `
    <p class="eyebrow">v3 0.3.1</p>
    <h1>User guides library</h1>
    <p class="lede">A separate illustrated guide for each Ready4 pack and each core module.</p>
    <h2>Core modules</h2>
    <table><thead><tr><th>Guide</th><th>PDF</th></tr></thead><tbody>
      ${CORE_MODULES.map(
        (mod) =>
          `<tr><td><a href="core/${mod.id}.html">${esc(mod.title)}</a></td><td><a href="pdfs/core-${mod.id}.pdf">PDF</a></td></tr>`
      ).join("")}
    </tbody></table>
    <h2>Ready4 packs</h2>
    <table><thead><tr><th>Pack</th><th>Access</th><th>PDF</th></tr></thead><tbody>
      ${packs
        .map(
          (pack) =>
            `<tr><td><a href="packs/${pack.id}.html">${esc(pack.title)}</a></td><td>${pack.productId ? "Catalogue" : "Free"}</td><td><a href="pdfs/${pack.id}.pdf">PDF</a></td></tr>`
        )
        .join("")}
    </tbody></table>
    <p><a href="/manual/">Main user manual</a></p>
  `;
}

async function printPdf(browser, htmlPath, pdfPath) {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load", timeout: 120000 });
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "14mm", bottom: "14mm", left: "12mm", right: "12mm" }
  });
  await page.close();
}

async function main() {
  const packs = await loadGuideCatalogue();
  await mkdir(packHtmlDir, { recursive: true });
  await mkdir(coreHtmlDir, { recursive: true });
  await mkdir(pdfDir, { recursive: true });

  const cssPacks = "../../../styles.css";
  const cssCore = "../../../styles.css";
  const cssIndex = "../../styles.css";

  await writeFile(
    path.join(libDir, "index.html"),
    pageShell("User guides library", indexBody(packs), { cssHref: cssIndex, homeHref: "/manual/" })
  );

  for (const pack of packs) {
    const html = pageShell(
      pack.title,
      packBody(pack, {
        imagePrefix: "../images/",
        pdfHref: `../pdfs/${pack.id}.pdf`,
        indexHref: "../index.html"
      }),
      { cssHref: cssPacks, homeHref: "/manual/" }
    );
    await writeFile(path.join(packHtmlDir, `${pack.id}.html`), html);
  }

  for (const mod of CORE_MODULES) {
    const html = pageShell(
      mod.title,
      coreBody(mod, { pdfHref: `../pdfs/core-${mod.id}.pdf`, indexHref: "../index.html" }),
      { cssHref: cssCore, homeHref: "/manual/" }
    );
    await writeFile(path.join(coreHtmlDir, `${mod.id}.html`), html);
  }

  const browser = await chromium.launch();
  for (const pack of packs) {
    console.log(`PDF ${pack.id}`);
    await printPdf(browser, path.join(packHtmlDir, `${pack.id}.html`), path.join(pdfDir, `${pack.id}.pdf`));
  }
  for (const mod of CORE_MODULES) {
    console.log(`PDF core-${mod.id}`);
    await printPdf(browser, path.join(coreHtmlDir, `${mod.id}.html`), path.join(pdfDir, `core-${mod.id}.pdf`));
  }
  await printPdf(browser, path.join(libDir, "index.html"), path.join(pdfDir, "library-index.pdf"));
  await browser.close();
  console.log("Guide library HTML + PDF complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
