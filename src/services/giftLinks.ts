import { withAffiliate } from "./affiliateLinks";

export type GiftShopLink = {
  id: string;
  label: string;
  url: string;
  searchQuery: string;
};

type ParsedOccasion = {
  recipientLabel: string;
  occasionLabel: string;
};

const recipientMatchers: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bmum'?s?\b|\bmom'?s?\b|\bmother'?s?\b/, label: "Mum" },
  { pattern: /\bdad'?s?\b|\bfather'?s?\b|\bdaddy'?s?\b/, label: "Dad" },
  { pattern: /\bhusband'?s?\b|\bpartner'?s?\b|\bwife'?s?\b|\bspouse'?s?\b/, label: "Partner" },
  { pattern: /\bsister'?s?\b/, label: "Sister" },
  { pattern: /\bbrother'?s?\b/, label: "Brother" },
  { pattern: /\bfriend'?s?\b/, label: "Friend" },
  { pattern: /\bgrandma'?s?\b|\bgran'?s?\b|\bgrandmother'?s?\b/, label: "Grandma" },
  { pattern: /\bgrandad'?s?\b|\bgrandpa'?s?\b|\bgrandfather'?s?\b/, label: "Grandad" },
  { pattern: /\bson'?s?\b/, label: "Son" },
  { pattern: /\bdaughter'?s?\b/, label: "Daughter" },
  { pattern: /\bniece'?s?\b/, label: "Niece" },
  { pattern: /\bnephew'?s?\b/, label: "Nephew" },
  { pattern: /\bcolleague'?s?\b|\bboss'?s?\b/, label: "Colleague" }
];

const occasionMatchers: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bbirthday\b/, label: "Birthday" },
  { pattern: /\banniversary\b/, label: "Anniversary" },
  { pattern: /\bwedding\b/, label: "Wedding" },
  { pattern: /\bchristening\b|\bbaptism\b/, label: "Christening" },
  { pattern: /\bgraduation\b/, label: "Graduation" },
  { pattern: /\bmother'?s?\s+day\b/, label: "Mother's Day" },
  { pattern: /\bfather'?s?\s+day\b/, label: "Father's Day" },
  { pattern: /\bvalentine'?s?\b/, label: "Valentine's Day" },
  { pattern: /\bchristmas\b/, label: "Christmas" },
  { pattern: /\beaster\b/, label: "Easter" },
  { pattern: /\bretirement\b/, label: "Retirement" },
  { pattern: /\bbaby\s+shower\b|\bnew\s+baby\b/, label: "New baby" }
];

export function parseOccasionTitle(title: string): ParsedOccasion {
  const text = title.trim().toLowerCase();
  const recipientLabel = recipientMatchers.find((entry) => entry.pattern.test(text))?.label ?? inferRecipientFromTitle(title);
  const occasionLabel = occasionMatchers.find((entry) => entry.pattern.test(text))?.label ?? "Occasion";
  return { recipientLabel, occasionLabel };
}

function inferRecipientFromTitle(title: string) {
  const possessive = title.match(/^([A-Za-z]+)'s\b/);
  if (possessive?.[1]) {
    return capitalise(possessive[1]);
  }
  return "them";
}

export function buildCardSearchQuery(title: string) {
  const parsed = parseOccasionTitle(title);
  if (parsed.recipientLabel !== "them") {
    return `${parsed.occasionLabel.toLowerCase()} card for ${parsed.recipientLabel.toLowerCase()}`;
  }
  return `${parsed.occasionLabel.toLowerCase()} card`;
}

export function buildGiftSearchQuery(title: string, giftIdea?: string) {
  const parsed = parseOccasionTitle(title);
  const idea = giftIdea?.trim();

  if (idea) {
    if (parsed.recipientLabel !== "them") {
      return `${idea} gift for ${parsed.recipientLabel.toLowerCase()}`;
    }
    return `${idea} gift`;
  }

  if (parsed.recipientLabel !== "them") {
    return `${parsed.occasionLabel.toLowerCase()} gifts for ${parsed.recipientLabel.toLowerCase()}`;
  }

  return `${parsed.occasionLabel.toLowerCase()} gifts`;
}

function amazonSearchUrl(query: string) {
  return withAffiliate(`https://www.amazon.co.uk/s?k=${encodeURIComponent(query.replace(/\s+/g, "+"))}`);
}

function notOnTheHighstreetSearchUrl(query: string) {
  return withAffiliate(`https://www.notonthehighstreet.com/search?q=${encodeURIComponent(query)}`);
}

export function getDefaultGiftIdeas(title: string) {
  const text = title.toLowerCase();
  if (text.includes("mum") || text.includes("birthday")) {
    return ["Flowers", "Spa voucher"];
  }
  if (text.includes("anniversary")) {
    return ["Flowers", "Experience day"];
  }
  return [];
}

function moonpigSearchUrl(query: string) {
  return withAffiliate(`https://www.moonpig.com/uk/search/?term=${encodeURIComponent(query)}`);
}

export function getCardLinksForOccasion(title: string): GiftShopLink[] {
  const parsed = parseOccasionTitle(title);
  const query = buildCardSearchQuery(title);

  return [
    {
      id: "amazon-card",
      label: `Amazon · card for ${parsed.recipientLabel}`,
      url: amazonSearchUrl(query),
      searchQuery: query
    },
    {
      id: "moonpig-card",
      label: `Moonpig · ${parsed.occasionLabel.toLowerCase()} card`,
      url: moonpigSearchUrl(query),
      searchQuery: query
    },
    {
      id: "notonthehighstreet-card",
      label: `Notonthehighstreet · cards`,
      url: notOnTheHighstreetSearchUrl(query),
      searchQuery: query
    }
  ];
}

export function getGiftLinksForOccasion(title: string, giftIdeas: string[] = []): GiftShopLink[] {
  const parsed = parseOccasionTitle(title);
  const mainQuery = buildGiftSearchQuery(title);
  const links: GiftShopLink[] = [
    {
      id: "amazon-main",
      label: `Amazon · gifts for ${parsed.recipientLabel}`,
      url: amazonSearchUrl(mainQuery),
      searchQuery: mainQuery
    },
    {
      id: "notonthehighstreet-main",
      label: `Notonthehighstreet · ${parsed.occasionLabel.toLowerCase()}`,
      url: notOnTheHighstreetSearchUrl(mainQuery),
      searchQuery: mainQuery
    }
  ];

  giftIdeas.slice(0, 3).forEach((idea, index) => {
    const query = buildGiftSearchQuery(title, idea);
    links.push({
      id: `amazon-idea-${index}`,
      label: `Amazon · ${idea}`,
      url: amazonSearchUrl(query),
      searchQuery: query
    });
  });

  return links;
}

function capitalise(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}
