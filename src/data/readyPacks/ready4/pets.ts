import { organisationalHealthNote, ready4Pack } from "../packFactory";

export const ready4PetsPack = ready4Pack({
  slug: "pets",
  name: "Pets",
  icon: "paw-outline",
  category: "lifestyle",
  summary:
    "Feeding, walks, vet plans, treatments and records — so pet care is not only in your head.",
  features: [
    "Daily care",
    "Medication / treatments",
    "Vet planner",
    "Vaccinations",
    "Grooming",
    "Pet records"
  ],
  productId: "ready.pack.ready4_pets",
  templates: [
    {
      id: "daily-care",
      title: "Daily pet care",
      type: "list",
      repeatRule: { frequency: "daily" },
      notes: "Edit for your pet. Medication notes are organisational only.",
      listItems: [
        { title: "Morning feed / water" },
        { title: "Walk / play / enrichment" },
        { title: "Evening feed / water" },
        { title: "Litter / outdoor toilet check" }
      ]
    },
    {
      id: "pet-medication",
      title: "Pet medication / treatments",
      type: "reminder",
      notes:
        organisationalHealthNote +
        " For pets: follow your vet's advice. Do not change doses yourself.",
      speakingReminderText: "Pet medication or treatment reminder when relevant.",
      priority: "soon"
    },
    {
      id: "vet-planner",
      title: "Vet appointment prep",
      type: "list",
      dueInDays: 7,
      listItems: [
        { title: "Confirm time and clinic" },
        { title: "Travel / carrier ready" },
        { title: "Questions for the vet" },
        { title: "Records / insurance card if needed" }
      ]
    },
    {
      id: "vaccinations",
      title: "Vaccinations & boosters",
      type: "list",
      notes: "Organisational tracker — follow your vet's schedule.",
      dueInDays: 30,
      listItems: [
        { title: "Next vaccination / booster noted" },
        { title: "Flea / worming due noted" },
        { title: "Clinic booked if needed" }
      ]
    },
    {
      id: "grooming",
      title: "Grooming checklist",
      type: "list",
      repeatRule: { frequency: "weekly" },
      listItems: [
        { title: "Brush / coat check" },
        { title: "Nails if needed" },
        { title: "Bath / groomer if booked" }
      ]
    },
    {
      id: "pet-records",
      title: "Pet records note",
      type: "note",
      notes: "Chip number, insurance, emergency contacts, diet notes — for your own use."
    }
  ],
  aiCoachPrompts: [
    "Help me set a simple daily pet-care checklist.",
    "Suggest a calm vet-appointment prep list."
  ]
});
