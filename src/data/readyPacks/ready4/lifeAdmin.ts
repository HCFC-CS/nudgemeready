import { ready4Pack } from "../packFactory";

export const ready4LifeAdminPack = ready4Pack({
  slug: "life-admin",
  name: "Life Admin",
  icon: "folder-outline",
  category: "lifestyle",
  summary:
    "Documents, renewals, vehicle and household admin — small important jobs that are easy to forget.",
  features: [
    "Document vault",
    "Renewal calendar",
    "Household admin",
    "Vehicle reminders",
    "Paperwork glance"
  ],
  productId: "ready.pack.ready4_life_admin",
  templates: [
    {
      id: "document-vault",
      title: "Important documents checklist",
      type: "list",
      notes: "Note where things live — not a secure vault inside the app.",
      listItems: [
        { title: "Passport / ID location noted" },
        { title: "Certificates / warranties noted" },
        { title: "Insurance docs noted" },
        { title: "Emergency paper copies if useful" }
      ]
    },
    {
      id: "renewal-calendar",
      title: "Renewals this season",
      type: "list",
      dueInDays: 45,
      listItems: [
        { title: "Home / contents insurance" },
        { title: "Memberships / clubs" },
        { title: "Licences / permits" },
        { title: "Other renewals" }
      ]
    },
    {
      id: "household-admin",
      title: "Household admin tasks",
      type: "list",
      repeatRule: { frequency: "monthly" },
      listItems: [
        { title: "Boiler / appliance service if due" },
        { title: "Meters / readings if needed" },
        { title: "Post / paperwork sorted" },
        { title: "One admin call or form" }
      ]
    },
    {
      id: "vehicle",
      title: "Vehicle reminders",
      type: "list",
      notes: "Skip if you do not drive.",
      dueInDays: 30,
      listItems: [
        { title: "MOT due noted" },
        { title: "Service due noted" },
        { title: "Tax / insurance noted" },
        { title: "Tyres / lights glance" }
      ]
    },
    {
      id: "paperwork",
      title: "Paperwork / statements glance",
      type: "reminder",
      repeatRule: { frequency: "monthly" },
      notes: "Open post, file or recycle. Organisational only.",
      speakingReminderText: "A soft reminder to glance at paperwork when you can."
    },
    {
      id: "admin-timeout",
      title: "Admin pause",
      type: "reminder",
      notes: "Permission to stop. Come back to one tiny next step later.",
      speakingReminderText: "It is okay to pause life admin for a bit."
    }
  ],
  aiCoachPrompts: [
    "Help me break life admin into one small next step.",
    "Suggest a calm renewals checklist for the next month."
  ]
});
