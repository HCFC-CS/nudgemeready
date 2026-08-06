import { defineContentPack, organisationalHealthNote } from "../packFactory";

export const adhdStarterPack = defineContentPack({
  meta: {
    id: "adhd-starter",
    version: "1.6.1",
    icon: "flash-outline",
    category: "neurodiversity",
    title: "ADHD Starter",
    summary:
      "Gentle routines, focus blocks, overwhelm timeouts, puzzles, bedtime audio, charities, and optional supplies like fidgets and headphones — organisational support only.",
    features: [
      "Morning routine",
      "Today's top 3",
      "Medication organisation",
      "Focus timers",
      "Hyperfocus breaks",
      "Overwhelm timeout",
      "Puzzle distractions",
      "Bedtime binaural / calm playlists",
      "ADHD charities & support links",
      "Fidgets, lanyards, headphones & supplies",
      "Hydration",
      "Leaving-home check",
      "Evening reset",
      "What would help today?"
    ],
    healthDisclaimer: organisationalHealthNote,
    productId: "ready.pack.adhd_starter"
  },
  templates: [
    {
      id: "what-would-help",
      title: "What would help today?",
      type: "list",
      notes:
        "Tick one or two options. There is no wrong answer. Edit freely to match your day.",
      listItems: [
        { title: "A short focus timer" },
        { title: "A body-double / someone nearby" },
        { title: "A planned break" },
        { title: "A timeout — feeling overwhelmed" },
        { title: "A short puzzle distraction" },
        { title: "Sudoku" },
        { title: "A word puzzle" },
        { title: "Look at ADHD support / charity links" },
        { title: "Browse fidgets / headphones / lanyards" },
        { title: "Water and a snack" },
        { title: "One tiny task only" },
        { title: "Quiet / headphones" },
        { title: "Not sure yet — that is okay" }
      ],
      priority: "soon"
    },
    {
      id: "morning-routine",
      title: "Morning start routine",
      type: "routine",
      notes: "Keep it short. Skip steps that do not fit. No shame for an imperfect morning.",
      repeatRule: { frequency: "daily" },
      listItems: [
        { title: "Drink water" },
        { title: "Take morning medication if prescribed" },
        { title: "Eat or drink something" },
        { title: "Phone on charge / in usual place" },
        { title: "Glance at today's top 3" },
        { title: "One kind check-in with yourself" }
      ],
      speakingReminderText: "A soft nudge for your morning start.",
      priority: "soon"
    },
    {
      id: "todays-top-3",
      title: "Today's top 3",
      type: "list",
      notes: "Only three. If everything feels urgent, pick the kindest useful three.",
      listItems: [
        { title: "Top 1 — (edit me)" },
        { title: "Top 2 — (edit me)" },
        { title: "Top 3 — (edit me)" }
      ],
      repeatRule: { frequency: "daily" },
      priority: "important"
    },
    {
      id: "medication-reminder",
      title: "Medication organisation check-in",
      type: "reminder",
      notes: `${organisationalHealthNote} Edit the time to match your routine. This does not change doses or prescribe anything.`,
      repeatRule: { frequency: "daily" },
      speakingReminderText: "Medication organisation reminder. Follow your clinician's advice.",
      priority: "important"
    },
    {
      id: "medication-refill",
      title: "Medication supply check",
      type: "list",
      notes: `${organisationalHealthNote} A practical stock check only.`,
      listItems: [
        { title: "Enough for the next few days" },
        { title: "Repeat / refill arranged if needed" },
        { title: "Stored in the usual place" }
      ],
      repeatRule: { frequency: "weekly" },
      priority: "soon"
    },
    {
      id: "focus-timer",
      title: "Focus timer block",
      type: "reminder",
      notes:
        "Pick a short window (for example 10, 15 or 25 minutes). A break afterwards is part of the plan, not a failure.",
      speakingReminderText: "Time for a gentle focus block when you are ready.",
      priority: "soon"
    },
    {
      id: "focus-length-choices",
      title: "Choose a focus length",
      type: "list",
      notes: "Tick the length that feels doable today. You can stop early.",
      listItems: [
        { title: "5 minutes — tiny start" },
        { title: "10 minutes" },
        { title: "15 minutes" },
        { title: "25 minutes" },
        { title: "I'll decide when I sit down" }
      ],
      priority: "not_urgent"
    },
    {
      id: "hyperfocus-break",
      title: "Hyperfocus break reminder",
      type: "reminder",
      notes: "Stand, stretch, drink water, glance at the clock. You can pause without losing progress.",
      speakingReminderText: "Break reminder. You can pause without losing progress.",
      priority: "soon"
    },
    {
      id: "overwhelm-timeout",
      title: "Timeout — feeling overwhelmed",
      type: "reminder",
      notes:
        "Use this when everything feels too much. You do not have to finish anything first. Pause, step away if you can, then come back only when you are ready.",
      speakingReminderText:
        "Timeout. It is okay to stop. Take a short break. You can come back later.",
      priority: "needs_attention"
    },
    {
      id: "overwhelm-timeout-checklist",
      title: "Overwhelm timeout steps",
      type: "list",
      notes: "No order required. Do whatever feels possible. Skipping steps is allowed.",
      listItems: [
        { title: "Stop the current task (permission granted)" },
        { title: "Move somewhere quieter if you can" },
        { title: "Slow breaths or sit still for a minute" },
        { title: "Drink water or have a snack" },
        { title: "Tell someone you need a short timeout (optional)" },
        { title: "Open a gentle puzzle if your brain wants a soft landing" },
        { title: "Choose: rest, one tiny next step, or leave it for later" }
      ],
      priority: "soon"
    },
    {
      id: "puzzle-distraction",
      title: "Puzzle distraction break",
      type: "reminder",
      notes:
        "Sudoku and word puzzles work especially well when your mind needs somewhere calmer to go. This is a valid break — not avoidance to feel bad about.",
      speakingReminderText:
        "Puzzle break if you need a soft distraction. Sudoku or a word puzzle can help. Stop whenever you like.",
      priority: "soon"
    },
    {
      id: "puzzle-choices",
      title: "Pick a puzzle style",
      type: "list",
      notes:
        "Sudoku and word puzzles are good defaults. Tick what sounds doable, then open a link on this card.",
      listItems: [
        { title: "Sudoku" },
        { title: "Easy Sudoku" },
        { title: "Word search" },
        { title: "Mini crossword" },
        { title: "Wordle-style word puzzle" },
        { title: "Anagram / word scramble" },
        { title: "Number puzzle (2048)" },
        { title: "Jigsaw" },
        { title: "Something else I choose" }
      ],
      priority: "not_urgent"
    },
    {
      id: "break-reset-checklist",
      title: "Break reset checklist",
      type: "list",
      notes: "Use during a hyperfocus break or whenever you feel stuck in a loop.",
      listItems: [
        { title: "Stand up or change posture" },
        { title: "Drink water" },
        { title: "Look away from the screen" },
        { title: "Notice the time" },
        { title: "Decide: continue, switch, or stop for now" }
      ],
      priority: "not_urgent"
    },
    {
      id: "hydration",
      title: "Hydration nudge",
      type: "reminder",
      notes: "A quiet reminder only. No streak pressure.",
      repeatRule: { frequency: "daily" },
      speakingReminderText: "A quiet reminder to have some water.",
      priority: "not_urgent"
    },
    {
      id: "leaving-home",
      title: "Leaving-home check",
      type: "list",
      notes: "Edit to match your bag and day. Skip what you do not need.",
      listItems: [
        { title: "Keys" },
        { title: "Phone" },
        { title: "Wallet / cards" },
        { title: "Medication if you take it out" },
        { title: "Headphones / comfort item" },
        { title: "Water or snack" }
      ],
      priority: "soon"
    },
    {
      id: "evening-reset",
      title: "Evening reset",
      type: "routine",
      notes: "Close the day kindly. Doing one step still counts. You can open a bedtime playlist from the links on this card.",
      repeatRule: { frequency: "daily" },
      listItems: [
        { title: "Clear one small surface" },
        { title: "Set out tomorrow's bag or outfit" },
        { title: "Phone on charge" },
        { title: "Write tomorrow's top 3 (or leave a blank)" },
        { title: "One gentle wind-down" },
        { title: "Optional: calm audio / binaural playlist" }
      ],
      speakingReminderText: "Evening reset when you are ready.",
      priority: "soon"
    },
    {
      id: "bedtime-wind-down",
      title: "Bedtime wind-down",
      type: "reminder",
      notes:
        "Dim lights if you can, put the phone face-down when you are ready, and optionally play binaural beats, brown noise or a soft sleep playlist. Keep volume low. This is a comfort option, not medical advice.",
      speakingReminderText: "Bedtime wind-down. A calm playlist is optional if it helps you settle.",
      repeatRule: { frequency: "daily" },
      priority: "soon"
    },
    {
      id: "bedtime-audio-choices",
      title: "Bedtime audio choices",
      type: "list",
      notes: "Tick what you might like tonight. Open a playlist link on this card when you are ready.",
      listItems: [
        { title: "Binaural beats for sleep" },
        { title: "Brown or pink noise" },
        { title: "Soft piano / calm music" },
        { title: "Spoken sleep story (optional)" },
        { title: "Silence is fine too" }
      ],
      priority: "not_urgent"
    },
    {
      id: "support-resources",
      title: "ADHD support & charities",
      type: "reminder",
      notes: `${organisationalHealthNote} Open the charity and support links on this card when you want information, community or someone to talk to. These organisations are independent of Nudge Me Ready.`,
      speakingReminderText: "ADHD support links are here if you want them. No pressure.",
      priority: "not_urgent"
    },
    {
      id: "support-resource-list",
      title: "Support resources to explore",
      type: "list",
      notes: "Tick anything you might look at later. Links open on this card.",
      listItems: [
        { title: "ADHD UK" },
        { title: "ADHD Foundation" },
        { title: "AADD-UK (adult ADHD)" },
        { title: "ADHD Aware" },
        { title: "NHS ADHD information" },
        { title: "Mind" },
        { title: "YoungMinds" },
        { title: "Samaritans if I need to talk" }
      ],
      priority: "not_urgent"
    },
    {
      id: "adhd-supplies",
      title: "ADHD-friendly supplies (optional)",
      type: "reminder",
      notes:
        "Optional shop links to suppliers (Amazon, Argos, John Lewis, Etsy, eBay, Loop, Sensory Direct and more). These are affiliate links where supported — we may earn a small commission if you buy, at no extra cost to you. Nothing here is required.",
      speakingReminderText: "Optional supplier links are here if fidgets, headphones or a lanyard might help.",
      priority: "not_urgent"
    },
    {
      id: "adhd-supplies-list",
      title: "Supplies I might find useful",
      type: "list",
      notes: "Tick what you might want. Open a supplier link on this card when you are ready. Skip anything that does not appeal. Links may be affiliate links.",
      listItems: [
        { title: "Fidget toy" },
        { title: "Fidget cube / clicker" },
        { title: "Noise-cancelling headphones" },
        { title: "Soft earplugs" },
        { title: "Key / ID lanyard" },
        { title: "Hidden Disabilities Sunflower lanyard" },
        { title: "Visual / focus timer" },
        { title: "Notebook for brain dumps" },
        { title: "Day / pill organiser (if useful)" },
        { title: "Nothing right now — that is fine" }
      ],
      priority: "not_urgent"
    },
    {
      id: "brain-dump",
      title: "Brain dump note",
      type: "note",
      notes: "Park thoughts here so they do not have to stay only in your head. Sort later if you want."
    }
  ],
  aiCoachPrompts: [
    "Help me choose one small next step without pressure.",
    "Suggest a short focus plan with built-in breaks.",
    "Help me turn an overwhelming list into today's top 3.",
    "Give me a kind script for restarting after I got stuck.",
    "Help me take a timeout when I feel overwhelmed without guilt.",
    "Suggest a short puzzle distraction when my brain needs a soft landing.",
    "Suggest a calm bedtime playlist with binaural beats or soft noise.",
    "Point me to reputable ADHD charities or support organisations.",
    "Suggest optional ADHD-friendly supplies like fidgets or headphones without pressure to buy."
  ],
  badges: [
    { id: "adhd-showed-up", title: "You showed up", description: "Starting counts." },
    { id: "adhd-tiny-focus", title: "Tiny focus", description: "Even a short block matters." },
    { id: "adhd-timeout-taken", title: "Timeout taken", description: "You protected your calm." },
    { id: "adhd-puzzle-break", title: "Puzzle pause", description: "A soft distraction still counts as care." },
    { id: "adhd-bedtime-calm", title: "Bedtime calm", description: "You gave your evening a softer landing." },
    { id: "adhd-found-support", title: "Found support", description: "You looked for community and information." },
    { id: "adhd-tools-ready", title: "Tools ready", description: "You considered tools that might make life easier." },
    { id: "adhd-kind-reset", title: "Kind reset", description: "You closed the day gently." }
  ],
  crewRecommendations: [
    {
      roleHint: "cheerleader",
      reason: "Encouragement without nagging — celebrate starts, not perfection."
    },
    {
      roleHint: "guardian",
      reason: "Someone who can be a calm body-double for tricky admin or leaving the house."
    }
  ]
});
