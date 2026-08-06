import { withAffiliate } from "./affiliateLinks";

export type DistractionLink = {
  id: string;
  label: string;
  url: string;
};

export type DistractionSection = {
  id: string;
  title: string;
  hint: string;
  links: DistractionLink[];
};

export function getAdhdPuzzleLinks(): DistractionLink[] {
  return [
    {
      id: "puzzle-sudoku",
      label: "Sudoku",
      url: "https://sudoku.com/"
    },
    {
      id: "puzzle-sudoku-easy",
      label: "Easy Sudoku (Web Sudoku)",
      url: "https://www.websudoku.com/"
    },
    {
      id: "puzzle-wordsearch",
      label: "Word search",
      url: "https://thewordsearch.com/"
    },
    {
      id: "puzzle-crossword-mini",
      label: "Mini crossword",
      url: "https://www.nytimes.com/crosswords/game/mini"
    },
    {
      id: "puzzle-wordle",
      label: "Wordle-style word puzzle",
      url: "https://www.nytimes.com/games/wordle/index.html"
    },
    {
      id: "puzzle-anagram",
      label: "Anagram / word scramble",
      url: "https://www.wordplays.com/anagrammer"
    },
    {
      id: "puzzle-2048",
      label: "2048 number puzzle",
      url: "https://play2048.co/"
    },
    {
      id: "puzzle-jigsaw",
      label: "Simple jigsaw",
      url: "https://www.jigsawplanet.com/"
    },
    {
      id: "puzzle-amazon-books",
      label: "Browse Sudoku & word puzzle books (optional)",
      url: withAffiliate("https://www.amazon.co.uk/s?k=sudoku+and+word+search+puzzle+books")
    }
  ];
}

export function getAdhdBedtimeAudioLinks(): DistractionLink[] {
  const binauralQuery = encodeURIComponent("binaural beats sleep");
  const brownNoiseQuery = encodeURIComponent("brown noise sleep");
  const calmPianoQuery = encodeURIComponent("calm piano sleep playlist");

  return [
    {
      id: "bedtime-yt-binaural",
      label: "YouTube · binaural beats for sleep",
      url: `https://www.youtube.com/results?search_query=${binauralQuery}`
    },
    {
      id: "bedtime-yt-brown-noise",
      label: "YouTube · brown / pink noise",
      url: `https://www.youtube.com/results?search_query=${brownNoiseQuery}`
    },
    {
      id: "bedtime-spotify-binaural",
      label: "Spotify · binaural beats / sleep",
      url: withAffiliate(`https://open.spotify.com/search/${encodeURIComponent("binaural beats sleep")}`)
    },
    {
      id: "bedtime-spotify-sleep",
      label: "Spotify · sleep / wind-down playlists",
      url: withAffiliate(`https://open.spotify.com/search/${encodeURIComponent("sleep wind down")}`)
    },
    {
      id: "bedtime-yt-calm",
      label: "YouTube · calm piano / soft music",
      url: `https://www.youtube.com/results?search_query=${calmPianoQuery}`
    },
    {
      id: "bedtime-apple-sleep",
      label: "Apple Music · sleep search",
      url: `https://music.apple.com/search?term=${encodeURIComponent("binaural beats sleep")}`
    }
  ];
}

/** Charities, support groups and practical info — not medical advice. */
export function getAdhdSupportResourceLinks(): DistractionLink[] {
  return [
    {
      id: "support-adhd-uk",
      label: "ADHD UK",
      url: "https://adhduk.co.uk/"
    },
    {
      id: "support-adhd-foundation",
      label: "ADHD Foundation",
      url: "https://www.adhdfoundation.org.uk/"
    },
    {
      id: "support-aadd-uk",
      label: "AADD-UK (adult ADHD)",
      url: "https://aadduk.org/"
    },
    {
      id: "support-adhd-aware",
      label: "ADHD Aware",
      url: "https://adhdaware.org.uk/"
    },
    {
      id: "support-nhs-adhd",
      label: "NHS · ADHD overview",
      url: "https://www.nhs.uk/conditions/attention-deficit-hyperactivity-disorder-adhd/"
    },
    {
      id: "support-mind",
      label: "Mind · mental health support",
      url: "https://www.mind.org.uk/"
    },
    {
      id: "support-youngminds",
      label: "YoungMinds",
      url: "https://www.youngminds.org.uk/"
    },
    {
      id: "support-additude",
      label: "ADDitude · ADHD information",
      url: "https://www.additudemag.com/"
    },
    {
      id: "support-chadd",
      label: "CHADD · ADHD resources",
      url: "https://chadd.org/"
    },
    {
      id: "support-samaritans",
      label: "Samaritans · someone to talk to (116 123)",
      url: "https://www.samaritans.org/"
    }
  ];
}

/** Optional comfort / focus supplies via affiliate-ready supplier links. */
export function getAdhdSupplyLinks(): DistractionLink[] {
  return [
    {
      id: "supplier-amazon-fidget",
      label: "Amazon · fidget toys",
      url: withAffiliate("https://www.amazon.co.uk/s?k=fidget+toys+adults")
    },
    {
      id: "supplier-amazon-headphones",
      label: "Amazon · noise-cancelling headphones",
      url: withAffiliate("https://www.amazon.co.uk/s?k=noise+cancelling+headphones")
    },
    {
      id: "supplier-amazon-lanyard",
      label: "Amazon · lanyards & Sunflower lanyards",
      url: withAffiliate("https://www.amazon.co.uk/s?k=hidden+disabilities+sunflower+lanyard")
    },
    {
      id: "supplier-amazon-timer",
      label: "Amazon · visual / focus timers",
      url: withAffiliate("https://www.amazon.co.uk/s?k=visual+timer+focus")
    },
    {
      id: "supplier-amazon-organiser",
      label: "Amazon · day / pill organisers",
      url: withAffiliate("https://www.amazon.co.uk/s?k=weekly+pill+organiser")
    },
    {
      id: "supplier-argos-fidget",
      label: "Argos · fidget toys",
      url: withAffiliate("https://www.argos.co.uk/search/fidget-toys/")
    },
    {
      id: "supplier-argos-headphones",
      label: "Argos · headphones",
      url: withAffiliate("https://www.argos.co.uk/search/noise-cancelling-headphones/")
    },
    {
      id: "supplier-johnlewis-headphones",
      label: "John Lewis · noise-cancelling headphones",
      url: withAffiliate("https://www.johnlewis.com/search?search-term=noise+cancelling+headphones")
    },
    {
      id: "supplier-etsy-fidget",
      label: "Etsy · handmade fidgets & sensory tools",
      url: withAffiliate("https://www.etsy.com/uk/search?q=fidget+toy+adult")
    },
    {
      id: "supplier-etsy-lanyard",
      label: "Etsy · lanyards",
      url: withAffiliate("https://www.etsy.com/uk/search?q=key+lanyard")
    },
    {
      id: "supplier-ebay-fidget",
      label: "eBay · fidget toys",
      url: withAffiliate("https://www.ebay.co.uk/sch/i.html?_nkw=fidget+toys")
    },
    {
      id: "supplier-ebay-headphones",
      label: "eBay · noise-cancelling headphones",
      url: withAffiliate("https://www.ebay.co.uk/sch/i.html?_nkw=noise+cancelling+headphones")
    },
    {
      id: "supplier-loop",
      label: "Loop · earplugs",
      url: withAffiliate("https://www.loopearplugs.com/")
    },
    {
      id: "supplier-sensory-direct",
      label: "Sensory Direct · fidgets & sensory tools",
      url: withAffiliate("https://www.sensorydirect.com/collections/fidget-toys")
    },
    {
      id: "supplier-notonthehighstreet",
      label: "Notonthehighstreet · sensory / calm gifts",
      url: withAffiliate("https://www.notonthehighstreet.com/search?q=fidget+sensory")
    }
  ];
}

/** Show puzzle, bedtime, support and/or supply links for relevant ADHD Starter items. */
export function getAdhdDistractionSections(item: {
  sourcePackId?: string;
  sourceTemplateId?: string;
  title: string;
  notes?: string;
}): DistractionSection[] {
  if (item.sourcePackId !== "adhd-starter") {
    return [];
  }

  const templateId = item.sourceTemplateId ?? "";
  const blob = `${item.title} ${item.notes ?? ""}`.toLowerCase();
  const sections: DistractionSection[] = [];

  const wantsPuzzles =
    templateId === "puzzle-distraction" ||
    templateId === "puzzle-choices" ||
    templateId === "what-would-help" ||
    templateId === "overwhelm-timeout" ||
    templateId === "overwhelm-timeout-checklist" ||
    /\bpuzzle\b|\bdistract\b|\boverwhelm\b|\btimeout\b/.test(blob);

  const wantsBedtime =
    templateId === "bedtime-wind-down" ||
    templateId === "bedtime-audio-choices" ||
    templateId === "evening-reset" ||
    /\bbedtime\b|\bbinaural\b|\bsleep playlist\b|\bwind-?down\b|\bbrown noise\b/.test(blob);

  const wantsSupport =
    templateId === "support-resources" ||
    templateId === "support-resource-list" ||
    templateId === "what-would-help" ||
    /\bcharity\b|\bsupport group\b|\bADHD UK\b|\bresources?\b|\bhelpline\b/.test(blob);

  const wantsSupplies =
    templateId === "adhd-supplies" ||
    templateId === "adhd-supplies-list" ||
    templateId === "what-would-help" ||
    templateId === "leaving-home" ||
    /\bfidget\b|\blanyard\b|\bheadphones\b|\bearplugs\b|\bsensory\b|\bsupplies\b/.test(blob);

  if (wantsPuzzles) {
    sections.push({
      id: "puzzles",
      title: "Sudoku & word puzzles",
      hint: "Sudoku and word puzzles are especially good soft landings. Stop whenever you like — no score-keeping required.",
      links: getAdhdPuzzleLinks()
    });
  }

  if (wantsBedtime) {
    sections.push({
      id: "bedtime-audio",
      title: "Bedtime playlists & calm audio",
      hint: "Optional binaural beats, brown noise or soft playlists. Use headphones safely, keep volume low, and stop if anything feels uncomfortable. Not medical advice.",
      links: getAdhdBedtimeAudioLinks()
    });
  }

  if (wantsSupport) {
    sections.push({
      id: "support-resources",
      title: "ADHD charities & support",
      hint: "Independent organisations and information. These links are for support and learning only — they do not diagnose, prescribe or replace your clinician.",
      links: getAdhdSupportResourceLinks()
    });
  }

  if (wantsSupplies) {
    sections.push({
      id: "adhd-supplies",
      title: "Shop supplies via partner links",
      hint: "Affiliate links to suppliers such as Amazon, Argos, John Lewis, Etsy, eBay, Loop and Sensory Direct. We may earn a small commission if you buy — at no extra cost to you. Nothing here is required.",
      links: getAdhdSupplyLinks()
    });
  }

  return sections;
}
