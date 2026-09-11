import { ready4Pack } from "../packFactory";

/** Aligned to Ready_4_Moving_User_Flow — move dashboard stages as editable nudges. */
export const ready4MovingPack = ready4Pack({
  slug: "moving",
  name: "Moving",
  icon: "cube-outline",
  category: "lifestyle",
  version: "1.1.0",
  summary:
    "Budget, search, packing, documents, move day and settling in — one stage at a time.",
  features: [
    "What would help",
    "Budget & mortgage",
    "House search & viewings",
    "Packing rooms",
    "Move-day plan",
    "Settle-in reset"
  ],
  productId: "ready.pack.ready4_moving",
  templates: [
    {
      id: "what-helps",
      title: "What would help with the move?",
      type: "list",
      notes: "Pick one focus, then open that tool. You do not have to do everything today.",
      listItems: [
        { title: "Budget / affordability" },
        { title: "Mortgage readiness" },
        { title: "House search / shortlist" },
        { title: "Viewing prep" },
        { title: "Offer progress" },
        { title: "Pack one room" },
        { title: "Documents / admin" },
        { title: "Move-day plan" },
        { title: "Address changes" },
        { title: "Suppliers / movers" },
        { title: "Rest — also valid" }
      ]
    },
    {
      id: "set-move",
      title: "Set the move",
      type: "list",
      notes: "Buying, renting, selling, or a mix — note what you know so far.",
      listItems: [
        { title: "Target area" },
        { title: "Ideal move date" },
        { title: "Household / must-haves" },
        { title: "Budget comfort range" }
      ]
    },
    {
      id: "move-budget",
      title: "Move budget glance",
      type: "list",
      notes: "A glance, not a lecture. Amounts optional.",
      listItems: [
        { title: "Deposit / fees comfort" },
        { title: "Moving costs estimate" },
        { title: "Furnishing / first-month buffer" },
        { title: "What can wait noted" }
      ]
    },
    {
      id: "mortgage-readiness",
      title: "Mortgage / deposit readiness",
      type: "list",
      notes: "Organisational checklist only — not financial advice.",
      listItems: [
        { title: "Documents gathered" },
        { title: "Agreement in principle / adviser noted" },
        { title: "Deposit source clear" },
        { title: "Questions written down" }
      ]
    },
    {
      id: "house-search",
      title: "Property shortlist",
      type: "list",
      listItems: [
        { title: "Must-haves listed" },
        { title: "Nice-to-haves listed" },
        { title: "Shortlist started" },
        { title: "Areas to avoid noted" }
      ]
    },
    {
      id: "viewing-prep",
      title: "Viewing prep",
      type: "list",
      listItems: [
        { title: "Questions to ask" },
        { title: "Travel plan" },
        { title: "Photos / notes plan" },
        { title: "Compare against must-haves" }
      ]
    },
    {
      id: "offer-progress",
      title: "Offer & progression",
      type: "list",
      notes: "Track milestones calmly. Edit freely.",
      listItems: [
        { title: "Offer made / response noted" },
        { title: "Survey / checks booked" },
        { title: "Solicitor / conveyancer noted" },
        { title: "Exchange / completion dates when known" }
      ]
    },
    {
      id: "packing",
      title: "Packing rooms",
      type: "list",
      dueInDays: 14,
      listItems: [
        { title: "Kitchen" },
        { title: "Bedroom" },
        { title: "Bathroom" },
        { title: "Living room" },
        { title: "Important documents box" },
        { title: "Essentials / first-night box" }
      ]
    },
    {
      id: "documents",
      title: "Moving documents hub",
      type: "list",
      notes: "Track where each item lives. Organisational only.",
      listItems: [
        { title: "ID / proof of address" },
        { title: "Mortgage / tenancy papers" },
        { title: "Insurance" },
        { title: "Survey / contract notes" }
      ]
    },
    {
      id: "move-suppliers",
      title: "Movers & supplies",
      type: "list",
      notes: "Optional partner shop links may appear when useful.",
      listItems: [
        { title: "Boxes / packing materials" },
        { title: "Mover / van booked or noted" },
        { title: "Storage if needed" },
        { title: "Cleaning help if needed" }
      ]
    },
    {
      id: "move-day",
      title: "Move-day plan",
      type: "list",
      dueInDays: 3,
      listItems: [
        { title: "Mover arrival / van time" },
        { title: "Keys / access" },
        { title: "Meter readings" },
        { title: "Parking / loading" },
        { title: "Children / pets plan" },
        { title: "Chargers / snacks" }
      ]
    },
    {
      id: "address-change",
      title: "Address & services",
      type: "list",
      listItems: [
        { title: "Utilities / broadband" },
        { title: "Council tax" },
        { title: "Bank / insurance" },
        { title: "GP / dentist / school" },
        { title: "Deliveries / subscriptions" }
      ]
    },
    {
      id: "settle-in",
      title: "Settle-in reset",
      type: "list",
      notes: "First night, first week — gentle follow-up.",
      listItems: [
        { title: "Unpack essentials" },
        { title: "Security / keys check" },
        { title: "Snagging notes" },
        { title: "Anything still open?" }
      ]
    }
  ]
});
