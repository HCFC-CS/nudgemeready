import { ready4Pack } from "../packFactory";

export const ready4DigitalLifePack = ready4Pack({
  slug: "digital-life",
  name: "Digital Life",
  icon: "laptop-outline",
  category: "lifestyle",
  summary:
    "Passwords, updates, subscriptions, backups and device health — digital admin in small steps.",
  features: [
    "Password review",
    "Software updates",
    "Subscription manager",
    "Cloud backup",
    "Device maintenance",
    "Digital inventory"
  ],
  productId: "ready.pack.ready4_digital_life",
  templates: [
    {
      id: "password-review",
      title: "Password review",
      type: "list",
      repeatRule: { frequency: "monthly" },
      notes: "Update critical passwords when you can. Use a password manager if you have one.",
      listItems: [
        { title: "Email / Apple ID / Google" },
        { title: "Banking / payments" },
        { title: "Work / school accounts" },
        { title: "One other high-value account" }
      ]
    },
    {
      id: "software-updates",
      title: "Software & security updates",
      type: "reminder",
      repeatRule: { frequency: "weekly" },
      notes: "Phone, laptop, tablet — update when convenient.",
      speakingReminderText: "A soft reminder to check for software updates."
    },
    {
      id: "subscriptions",
      title: "Digital subscriptions review",
      type: "list",
      repeatRule: { frequency: "monthly" },
      notes: "Keep, pause or cancel — your choice.",
      listItems: [
        { title: "Streaming" },
        { title: "Cloud / storage" },
        { title: "Apps / games" },
        { title: "Anything unused noted" }
      ]
    },
    {
      id: "cloud-backup",
      title: "Backup check",
      type: "reminder",
      repeatRule: { frequency: "monthly" },
      notes: "Confirm photos and important files are backing up.",
      speakingReminderText: "Reminder to check your backups when you can."
    },
    {
      id: "device-maintenance",
      title: "Device health checklist",
      type: "list",
      repeatRule: { frequency: "monthly" },
      listItems: [
        { title: "Storage space glance" },
        { title: "Battery / charging health noted" },
        { title: "Security / screen lock ok" },
        { title: "Clear one clutter folder (optional)" }
      ]
    },
    {
      id: "digital-inventory",
      title: "Digital inventory note",
      type: "note",
      notes: "Devices, licences, important account emails — for your own records."
    }
  ],
  aiCoachPrompts: [
    "Help me prioritise one digital admin task this week.",
    "Suggest a calm monthly device-health checklist."
  ]
});
