export type ListSuggestionResult = {
  category: string;
  confidence: number;
  items: string[];
};

type ListPattern = {
  id: string;
  category: string;
  keywords: string[];
  items: string[];
};

const listPatterns: ListPattern[] = [
  {
    id: "packing",
    category: "Packing",
    keywords: ["pack", "packing", "suitcase", "travel", "trip", "holiday", "flight", "away", "overnight"],
    items: [
      "Toothbrush",
      "Toothpaste",
      "Knickers",
      "Underwear",
      "Socks",
      "Pyjamas",
      "Deodorant",
      "Shampoo",
      "Hairbrush",
      "Phone charger",
      "Passport",
      "Medication",
      "Sunscreen"
    ]
  },
  {
    id: "shopping",
    category: "Shopping",
    keywords: ["shop", "shopping", "groceries", "grocery", "supermarket", "tesco", "sainsbury", "asda", "aldi", "lidl"],
    items: ["Milk", "Bread", "Eggs", "Butter", "Fruit", "Vegetables", "Tea", "Coffee", "Cereal", "Cheese", "Chicken", "Rice"]
  },
  {
    id: "house-jobs",
    category: "House jobs",
    keywords: ["house", "home", "diy", "jobs", "chores", "maintenance", "cleaning"],
    items: ["Bin bags", "Light bulbs", "Batteries", "Washing powder", "Dishwasher tablets", "Sponges", "Toilet roll", "Bleach"]
  },
  {
    id: "school",
    category: "School",
    keywords: ["school", "college", "uni", "university", "homework", "class"],
    items: ["Pens", "Pencils", "Ruler", "Notebook", "Lunch box", "Water bottle", "PE kit", "Calculator"]
  },
  {
    id: "baby",
    category: "Baby",
    keywords: ["baby", "newborn", "nursery", "hospital bag", "maternity"],
    items: ["Nappies", "Wipes", "Baby grows", "Muslins", "Bottles", "Bibs", "Snacks", "Phone charger"]
  },
  {
    id: "beach",
    category: "Beach day",
    keywords: ["beach", "swim", "pool", "seaside"],
    items: ["Towel", "Swimwear", "Sunscreen", "Hat", "Sandals", "Water", "Snacks", "Sunglasses"]
  },
  {
    id: "camping",
    category: "Camping",
    keywords: ["camp", "camping", "tent", "festival"],
    items: ["Tent", "Sleeping bag", "Torch", "Matches", "Flask", "Snacks", "Warm layers", "Wet wipes"]
  },
  {
    id: "party",
    category: "Party",
    keywords: ["party", "birthday party", "celebration", "bbq", "barbecue"],
    items: ["Balloons", "Cake", "Candles", "Plates", "Napkins", "Drinks", "Snacks", "Card"]
  },
  {
    id: "gifts",
    category: "Gift ideas",
    keywords: ["gift", "gifts", "present", "presents"],
    items: ["Card", "Wrapping paper", "Flowers", "Chocolates", "Wine", "Candle", "Book"]
  },
  {
    id: "pet",
    category: "Pet care",
    keywords: ["pet", "dog", "cat", "puppy", "kitten", "vet"],
    items: ["Pet food", "Treats", "Lead", "Poo bags", "Flea treatment", "Bowls", "Toys"]
  },
  {
    id: "work",
    category: "Work bag",
    keywords: ["work", "office", "desk", "commute"],
    items: ["Laptop charger", "Notebook", "Pen", "ID badge", "Lunch", "Water bottle", "Umbrella"]
  },
  {
    id: "meal-prep",
    category: "Meal prep",
    keywords: ["meal", "meals", "dinner", "lunch", "recipe", "cook"],
    items: ["Onions", "Garlic", "Olive oil", "Rice", "Pasta", "Tinned tomatoes", "Herbs", "Chicken"]
  }
];

const stemAliases: Record<string, string[]> = {
  pack: ["packing", "packed"],
  shop: ["shopping", "shops"],
  gift: ["gifts", "present", "presents"],
  travel: ["trip", "holiday", "away"],
  grocery: ["groceries", "supermarket"]
};

export function getListSuggestions(
  listTitle: string,
  existingItems: Array<{ title: string }> = []
): ListSuggestionResult | null {
  const scored = listPatterns
    .map((pattern) => ({
      pattern,
      score: scorePattern(listTitle, pattern)
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best || best.score < 0.35) {
    return null;
  }

  const existing = new Set(existingItems.map((item) => normalize(item.title)));
  const items = best.pattern.items.filter((item) => !existing.has(normalize(item)));

  if (!items.length) {
    return null;
  }

  return {
    category: best.pattern.category,
    confidence: Math.min(0.98, best.score),
    items: items.slice(0, 10)
  };
}

function scorePattern(title: string, pattern: ListPattern) {
  const tokens = tokenize(title);
  if (!tokens.length) {
    return 0;
  }

  let score = 0;
  for (const keyword of pattern.keywords) {
    const keywordTokens = tokenize(keyword);
    if (keywordTokens.length > 1) {
      if (includesPhrase(tokens, keywordTokens)) {
        score += 1.2;
      }
      continue;
    }

    const keywordToken = keywordTokens[0];
    if (tokens.includes(keywordToken)) {
      score += 1;
      continue;
    }

    const aliases = stemAliases[keywordToken] ?? [];
    if (aliases.some((alias) => tokens.includes(alias))) {
      score += 0.9;
    }

    if (tokens.some((token) => token.startsWith(keywordToken) || keywordToken.startsWith(token))) {
      score += 0.55;
    }
  }

  return score / Math.max(3, pattern.keywords.length * 0.45);
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function includesPhrase(tokens: string[], phraseTokens: string[]) {
  if (phraseTokens.length > tokens.length) {
    return false;
  }
  for (let index = 0; index <= tokens.length - phraseTokens.length; index += 1) {
    const slice = tokens.slice(index, index + phraseTokens.length);
    if (slice.every((token, offset) => token === phraseTokens[offset])) {
      return true;
    }
  }
  return false;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}
