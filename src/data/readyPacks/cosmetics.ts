import { defineThemePack, defineVoicePack, defineCharacterPack } from "./packFactory";
import type { ReadyPack } from "../../types/readyPacks";

export const themePacks: ReadyPack[] = [
  defineThemePack(
    {
      id: "theme-classic-taupe",
      version: "1.0.0",
      icon: "color-palette-outline",
      title: "Classic Taupe",
      summary: "Warm ivory and soft taupe — the default Nudge Me Ready calm.",
      features: ["Warm taupe palette"],
      productId: undefined
    },
    {
      appearanceKey: "classic-taupe",
      background: "#D9D2C9",
      surface: "#C9C2B8",
      primary: "#7BA8C9",
      accent: "#B8954F",
      text: "#152038"
    }
  ),
  defineThemePack(
    {
      id: "theme-baby-blue",
      version: "1.0.0",
      icon: "color-palette-outline",
      title: "Baby Blue",
      summary: "Softer blue-led surfaces with the same calm contrast.",
      features: ["Baby blue emphasis"],
      productId: "ready.pack.theme_baby_blue"
    },
    {
      appearanceKey: "baby-blue",
      background: "#D6E4F0",
      surface: "#B4C9DC",
      primary: "#5A8AAF",
      accent: "#B8954F",
      text: "#152038"
    }
  ),
  defineThemePack(
    {
      id: "theme-gold",
      version: "1.0.0",
      icon: "color-palette-outline",
      title: "Gold",
      summary: "Restrained gold accents on warm neutrals.",
      features: ["Gold accents"],
      productId: "ready.pack.theme_gold"
    },
    {
      appearanceKey: "gold",
      background: "#E6E0D8",
      surface: "#D9D2C9",
      primary: "#B8954F",
      accent: "#7BA8C9",
      text: "#3A3F45"
    }
  ),
  defineThemePack(
    {
      id: "theme-dark-mode",
      version: "1.0.0",
      icon: "moon-outline",
      title: "Dark Mode",
      summary: "Midnight surfaces with soft blue highlights.",
      features: ["Dark surfaces"],
      productId: "ready.pack.theme_dark"
    },
    {
      appearanceKey: "dark",
      background: "#152038",
      surface: "#1F2C45",
      primary: "#7BA8C9",
      accent: "#B8954F",
      text: "#E6E0D8"
    }
  ),
  defineThemePack(
    {
      id: "theme-spring",
      version: "1.0.0",
      icon: "flower-outline",
      title: "Spring",
      summary: "Lighter airy neutrals with fresh blue.",
      features: ["Spring palette"],
      productId: "ready.pack.theme_spring"
    },
    {
      appearanceKey: "spring",
      background: "#E8EFE8",
      surface: "#D5E2D8",
      primary: "#6A9E8A",
      accent: "#B8954F",
      text: "#1E2A24"
    }
  ),
  defineThemePack(
    {
      id: "theme-autumn",
      version: "1.0.0",
      icon: "leaf-outline",
      title: "Autumn",
      summary: "Deeper taupe and soft gold for cooler months.",
      features: ["Autumn palette"],
      productId: "ready.pack.theme_autumn"
    },
    {
      appearanceKey: "autumn",
      background: "#D4C4B0",
      surface: "#C4B09A",
      primary: "#8B6B4A",
      accent: "#B8954F",
      text: "#2A2118"
    }
  ),
  defineThemePack(
    {
      id: "theme-christmas",
      version: "1.0.0",
      icon: "gift-outline",
      title: "Christmas",
      summary: "Festive soft red and evergreen accents on warm ivory.",
      features: ["Festive palette"],
      productId: "ready.pack.theme_christmas"
    },
    {
      appearanceKey: "christmas",
      background: "#E8DFD4",
      surface: "#D9D2C9",
      primary: "#6B8F71",
      accent: "#A65D5D",
      text: "#152038"
    }
  )
];

export const voicePacks: ReadyPack[] = [
  defineVoicePack(
    {
      id: "voice-calm-female-uk",
      version: "1.0.0",
      icon: "mic-outline",
      title: "Calm Female UK",
      summary: "Steady UK English voice for read-aloud reminders.",
      productId: undefined
    },
    { voiceKey: "calm-female-uk", label: "Calm Female UK", language: "en-GB", pitch: 1, rate: 0.92 }
  ),
  defineVoicePack(
    {
      id: "voice-friendly-grandad",
      version: "1.0.0",
      icon: "mic-outline",
      title: "Friendly Grandad",
      summary: "Warm, slower spoken reminders.",
      productId: "ready.pack.voice_friendly_grandad"
    },
    { voiceKey: "friendly-grandad", label: "Friendly Grandad", language: "en-GB", pitch: 0.85, rate: 0.85 }
  ),
  defineVoicePack(
    {
      id: "voice-cheerful-coach",
      version: "1.0.0",
      icon: "mic-outline",
      title: "Cheerful Coach",
      summary: "Upbeat but still kind coaching tone.",
      productId: "ready.pack.voice_cheerful_coach"
    },
    { voiceKey: "cheerful-coach", label: "Cheerful Coach", language: "en-GB", pitch: 1.05, rate: 1 }
  ),
  defineVoicePack(
    {
      id: "voice-soft-northern",
      version: "1.0.0",
      icon: "mic-outline",
      title: "Soft Northern",
      summary: "Gentle Northern-leaning spoken profile.",
      productId: "ready.pack.voice_soft_northern"
    },
    { voiceKey: "soft-northern", label: "Soft Northern", language: "en-GB", pitch: 0.95, rate: 0.95 }
  ),
  defineVoicePack(
    {
      id: "voice-scottish-warm",
      version: "1.0.0",
      icon: "mic-outline",
      title: "Scottish Warm",
      summary: "Warm Scottish-leaning spoken profile.",
      productId: "ready.pack.voice_scottish_warm"
    },
    { voiceKey: "scottish-warm", label: "Scottish Warm", language: "en-GB", pitch: 0.9, rate: 0.93 }
  )
];

const characterDefs: Array<{
  id: string;
  name: string;
  symbol: string;
  quotes: string[];
  voiceKey: string;
  productId?: string;
}> = [
  {
    id: "character-uncle-allan",
    name: "Uncle Allan",
    symbol: "🎩",
    quotes: ["One thing at a time, pet.", "You've got this — no rush."],
    voiceKey: "friendly-grandad",
    productId: "ready.pack.character_uncle_allan"
  },
  {
    id: "character-jake",
    name: "Jake",
    symbol: "🧢",
    quotes: ["Small step. Then another.", "Breaks are allowed."],
    voiceKey: "cheerful-coach",
    productId: "ready.pack.character_jake"
  },
  {
    id: "character-maya",
    name: "Maya",
    symbol: "🌸",
    quotes: ["Be kind to yourself today.", "Quiet progress still counts."],
    voiceKey: "calm-female-uk",
    productId: "ready.pack.character_maya"
  },
  {
    id: "character-sam",
    name: "Sam",
    symbol: "📘",
    quotes: ["Write it down, then rest.", "Clarity over perfection."],
    voiceKey: "calm-female-uk",
    productId: "ready.pack.character_sam"
  },
  {
    id: "character-liam",
    name: "Liam",
    symbol: "⚽",
    quotes: ["Ready when you are.", "We'll take the next bit together."],
    voiceKey: "soft-northern",
    productId: "ready.pack.character_liam"
  },
  {
    id: "character-zara",
    name: "Zara",
    symbol: "✨",
    quotes: ["You already started by opening this.", "Keep it light."],
    voiceKey: "cheerful-coach",
    productId: "ready.pack.character_zara"
  },
  {
    id: "character-aisha",
    name: "Aisha",
    symbol: "🌙",
    quotes: ["Steady breaths.", "Your pace is the right pace."],
    voiceKey: "calm-female-uk",
    productId: "ready.pack.character_aisha"
  },
  {
    id: "character-elaine",
    name: "Elaine",
    symbol: "🫖",
    quotes: ["Cup of tea, then the next tick.", "I'm proud of you for trying."],
    voiceKey: "calm-female-uk",
    productId: "ready.pack.character_elaine"
  },
  {
    id: "character-david",
    name: "David",
    symbol: "🧭",
    quotes: ["Let's sort the practical bit.", "One checklist row is enough."],
    voiceKey: "friendly-grandad",
    productId: "ready.pack.character_david"
  },
  {
    id: "character-mei",
    name: "Mei",
    symbol: "🎋",
    quotes: ["Gentle focus.", "Done is kinder than perfect."],
    voiceKey: "calm-female-uk",
    productId: "ready.pack.character_mei"
  },
  {
    id: "character-buddy",
    name: "Buddy",
    symbol: "🐶",
    quotes: ["Woof — water break!", "Good human. Stretch time."],
    voiceKey: "cheerful-coach",
    productId: undefined
  }
];

export const characterPacks: ReadyPack[] = characterDefs.map((def) =>
  defineCharacterPack(
    {
      id: def.id,
      version: "1.0.0",
      icon: "happy-outline",
      title: def.name,
      summary: `${def.name} — avatar, stickers, wallpapers, quotes and voice profile.`,
      productId: def.productId
    },
    {
      characterKey: def.id,
      displayName: def.name,
      avatarSymbol: def.symbol,
      stickers: [`${def.name} wave`, `${def.name} thumbs up`, `${def.name} calm`],
      wallpapers: [`${def.name} soft wash`, `${def.name} calm desk`],
      quotes: def.quotes,
      voiceKey: def.voiceKey
    }
  )
);
