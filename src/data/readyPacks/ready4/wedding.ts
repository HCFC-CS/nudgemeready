import { ready4Pack } from "../packFactory";

/** Aligned to Ready_4_Wedding_User_Flow — calm planning stages, no panic. */
export const ready4WeddingPack = ready4Pack({
  slug: "wedding",
  name: "Wedding",
  icon: "heart-outline",
  category: "events",
  version: "1.1.0",
  summary:
    "Budget, guests, suppliers, ceremony and day-of — progress without panic.",
  features: [
    "What needs a decision",
    "Budget & legal",
    "Venue & outfits",
    "Guests & party",
    "Ceremony & day-of",
    "After-wedding reset"
  ],
  productId: "ready.pack.ready4_wedding",
  templates: [
    {
      id: "what-helps",
      title: "What needs a decision this week?",
      type: "list",
      notes: "One or two decisions only. Open that tool next. Rest is fine.",
      listItems: [
        { title: "Budget item" },
        { title: "Legal / documents" },
        { title: "Venue shortlist" },
        { title: "Guest / RSVP" },
        { title: "Supplier" },
        { title: "Outfits" },
        { title: "Wedding party roles" },
        { title: "Ceremony / reception detail" },
        { title: "Honeymoon / after" },
        { title: "Nothing urgent — rest" }
      ]
    },
    {
      id: "create-wedding",
      title: "Create wedding basics",
      type: "list",
      listItems: [
        { title: "Date or season" },
        { title: "Location / style notes" },
        { title: "Approx guest count" },
        { title: "Planning team / Crew" }
      ]
    },
    {
      id: "budget",
      title: "Wedding budget glance",
      type: "list",
      notes: "A glance, not a lecture. Amounts optional.",
      listItems: [
        { title: "Venue / ceremony" },
        { title: "Catering / drinks" },
        { title: "Outfits" },
        { title: "Photo / video" },
        { title: "Other priorities" }
      ]
    },
    {
      id: "legal-docs",
      title: "Legal & documents",
      type: "list",
      notes: "Organisational only — follow local rules for your ceremony type.",
      listItems: [
        { title: "Notice / registration steps noted" },
        { title: "ID / documents gathered" },
        { title: "Witnesses confirmed" },
        { title: "Name-change notes if relevant" }
      ]
    },
    {
      id: "venue-shortlist",
      title: "Venue shortlist",
      type: "list",
      listItems: [
        { title: "Must-haves for the space" },
        { title: "Shortlist started" },
        { title: "Visit / call notes" },
        { title: "Deposit / hold decision when ready" }
      ]
    },
    {
      id: "guests",
      title: "Guest list & RSVP",
      type: "list",
      listItems: [
        { title: "Core guest list drafted" },
        { title: "Save-the-dates / invites plan" },
        { title: "RSVP deadline noted" },
        { title: "Dietary / access notes started" }
      ]
    },
    {
      id: "outfits",
      title: "Outfits & fittings",
      type: "list",
      listItems: [
        { title: "Main outfits shortlisted" },
        { title: "Fitting dates noted" },
        { title: "Accessories / shoes" },
        { title: "Comfort backup plan" }
      ]
    },
    {
      id: "wedding-party",
      title: "Wedding party roles",
      type: "list",
      listItems: [
        { title: "Key roles asked / confirmed" },
        { title: "Duties noted calmly" },
        { title: "Outfits / gifts if relevant" },
        { title: "Hen / stag notes if wanted" }
      ]
    },
    {
      id: "suppliers",
      title: "Suppliers tracker",
      type: "list",
      notes: "Save quotes calmly. Affiliate / partner links may appear when useful.",
      listItems: [
        { title: "Venue" },
        { title: "Photo / video" },
        { title: "Catering / cake" },
        { title: "Music / entertainment" },
        { title: "Flowers / décor" }
      ]
    },
    {
      id: "ceremony-reception",
      title: "Ceremony & reception run sheet",
      type: "list",
      listItems: [
        { title: "Order of service notes" },
        { title: "Readings / music" },
        { title: "Seating / menu" },
        { title: "Speeches / timings" }
      ]
    },
    {
      id: "final-month",
      title: "Final month checklist",
      type: "list",
      dueInDays: 30,
      listItems: [
        { title: "Confirm suppliers" },
        { title: "Final numbers" },
        { title: "Fittings / outfits" },
        { title: "Legal / admin if needed" },
        { title: "Day-of contacts sheet" }
      ]
    },
    {
      id: "wedding-day",
      title: "Wedding-day essentials",
      type: "list",
      notes: "Only the time-critical bits.",
      listItems: [
        { title: "Rings / documents" },
        { title: "Run sheet + contacts" },
        { title: "Payments / tips plan" },
        { title: "Handover to Crew if needed" }
      ]
    },
    {
      id: "honeymoon",
      title: "Honeymoon / getaway notes",
      type: "list",
      notes: "Optional. Keep it light.",
      listItems: [
        { title: "Dates / destination ideas" },
        { title: "Travel docs / bookings" },
        { title: "Out-of-office / cover if needed" },
        { title: "Rest is the point" }
      ]
    },
    {
      id: "after-wedding",
      title: "After-wedding reset",
      type: "list",
      notes: "Thank-yous and admin when energy returns.",
      listItems: [
        { title: "Thank-you notes started" },
        { title: "Returns / payments closed" },
        { title: "Photos / keepsakes plan" },
        { title: "One rest day protected" }
      ]
    }
  ]
});
