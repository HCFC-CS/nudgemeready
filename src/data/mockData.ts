import type { TaskItem } from "../types/models";
import type { NudgeItem } from "../types/nudge";

export type MockProject = {
  id: string;
  title: string;
  complete: number;
  total: number;
  nextAction: string;
};

export type MockContact = {
  id: string;
  name: string;
  role: string;
  contact: string;
  phone?: string;
  email?: string;
  address?: string;
  keywords?: string[];
};

export const mockItems: TaskItem[] = [
  {
    id: "mock-task",
    title: "Book boiler service",
    classification: "home",
    taskType: "taskJob",
    durationMinutes: 15,
    usesTaskBuddy: false,
    workMinutes: 20,
    breakMinutes: 5,
    repeatRule: "none",
    encouragementStyle: "calm",
    isCompleted: false,
    createdAt: new Date().toISOString(),
    dueDate: "Pick this up later"
  },
  {
    id: "mock-appointment",
    title: "Dentist check-in",
    classification: "health",
    taskType: "event",
    durationMinutes: 30,
    usesTaskBuddy: false,
    workMinutes: 20,
    breakMinutes: 5,
    repeatRule: "none",
    encouragementStyle: "calm",
    isCompleted: false,
    createdAt: new Date().toISOString(),
    dueDate: "12-06-2026 at 10:30"
  },
  {
    id: "mock-routine",
    title: "Kitchen reset",
    classification: "home",
    taskType: "chore",
    durationMinutes: 20,
    usesTaskBuddy: true,
    workMinutes: 10,
    breakMinutes: 3,
    repeatRule: "daily",
    encouragementStyle: "calm",
    isCompleted: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "mock-special-day",
    title: "Mum's Birthday",
    classification: "home",
    taskType: "occasion",
    durationMinutes: 0,
    usesTaskBuddy: false,
    workMinutes: 20,
    breakMinutes: 5,
    repeatRule: "annual",
    encouragementStyle: "calm",
    isCompleted: false,
    createdAt: new Date().toISOString(),
    dueDate: "18-06-2026",
    occasionName: "Mum's Birthday",
    remindForGift: true
  }
];

export const mockProjects: MockProject[] = [
  { id: "kitchen", title: "Kitchen Refresh", complete: 4, total: 12, nextAction: "Choose paint colour" },
  { id: "finance", title: "Finance Tidy", complete: 2, total: 7, nextAction: "Sort receipts into one folder" }
];

export const mockLists = ["Shopping", "Holiday Packing", "House Jobs", "Gift Ideas", "Work Notes"];

export const mockContacts: MockContact[] = [
  {
    id: "greenwood-dental",
    name: "Greenwood Dental Practice",
    role: "Dental practice",
    contact: "01234 555101",
    phone: "01234 555101",
    email: "hello@greenwooddental.example",
    address: "12 Greenwood Road",
    keywords: ["dentist", "dental", "practice", "surgery"]
  },
  {
    id: "smile-clinic",
    name: "Smile Clinic",
    role: "Dental clinic",
    contact: "01234 555202",
    phone: "01234 555202",
    email: "care@smileclinic.example",
    address: "4 High Street",
    keywords: ["dentist", "dental", "clinic"]
  },
  {
    id: "mum",
    name: "Mum",
    role: "Family",
    contact: "07700 900111",
    phone: "07700 900111",
    email: "mum@example.com",
    keywords: ["mum", "birthday", "family"]
  },
  {
    id: "sarah",
    name: "Sarah",
    role: "Friend",
    contact: "07700 900222",
    phone: "07700 900222",
    email: "sarah@example.com",
    keywords: ["sarah", "call", "friend"]
  },
  {
    id: "vet",
    name: "Vet",
    role: "Pet care",
    contact: "01234 555303",
    phone: "01234 555303",
    address: "8 Meadow Lane",
    keywords: ["vet", "pet"]
  },
  {
    id: "school",
    name: "School",
    role: "School",
    contact: "01234 555404",
    phone: "01234 555404",
    email: "office@school.example",
    address: "School Road",
    keywords: ["school"]
  },
  {
    id: "gp-surgery",
    name: "GP Surgery",
    role: "Healthcare",
    contact: "01234 555505",
    phone: "01234 555505",
    email: "reception@gpsurgery.example",
    address: "1 Health Centre",
    keywords: ["gp", "doctor", "surgery", "health"]
  }
];

export const mockNudgeeCreator = {
  type: "nudgee" as const,
  id: "nudgee",
  name: "Helen"
};

export const mockSarahCreator = {
  type: "supporter" as const,
  id: "crew-sarah",
  name: "Sarah"
};

function withDefaultCreators(items: NudgeItem[]): NudgeItem[] {
  return items.map((item) => ({
    ...item,
    createdBy: item.createdBy ?? mockNudgeeCreator
  }));
}

const MOCK_EPOCH = Date.parse("2026-06-01T00:00:00.000Z");

function shiftIsoNearToday(value?: string) {
  if (!value) {
    return value;
  }
  const original = Date.parse(value);
  if (Number.isNaN(original)) {
    return value;
  }
  const dayOffset = Math.round((original - MOCK_EPOCH) / 86_400_000);
  const next = new Date();
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() + dayOffset);
  const source = new Date(original);
  next.setHours(source.getUTCHours(), source.getUTCMinutes(), source.getUTCSeconds(), 0);
  return next.toISOString();
}

function withDatesNearToday(items: NudgeItem[]): NudgeItem[] {
  const todayNoon = (() => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    return date.toISOString();
  })();

  return items.map((item) => {
    const shifted: NudgeItem = {
      ...item,
      createdAt: shiftIsoNearToday(item.createdAt) ?? item.createdAt,
      updatedAt: shiftIsoNearToday(item.updatedAt) ?? item.updatedAt,
      dueDate: shiftIsoNearToday(item.dueDate),
      startDate: shiftIsoNearToday(item.startDate),
      endDate: shiftIsoNearToday(item.endDate),
      reminderDate: shiftIsoNearToday(item.reminderDate),
      giftReminderAt: shiftIsoNearToday(item.giftReminderAt),
      cardReminderAt: shiftIsoNearToday(item.cardReminderAt)
    };

    const hasDate = Boolean(
      shifted.dueDate || shifted.startDate || shifted.endDate || shifted.reminderDate
    );
    if (item.status === "open" && !hasDate) {
      shifted.dueDate = todayNoon;
    }

    return shifted;
  });
}

export const mockNudgeItems: NudgeItem[] = withDatesNearToday(
  withDefaultCreators([
  {
    id: "project-kitchen",
    title: "Kitchen Refresh",
    type: "project",
    status: "open",
    children: ["subtask-paint", "appointment-builder", "note-kitchen"],
    createdAt: "2026-06-01T09:00:00.000Z",
    updatedAt: "2026-06-01T09:00:00.000Z",
    notes: "A gentle plan for making the kitchen feel calmer.",
    attachments: [],
    listItems: [],
    progress: 33
  },
  {
    id: "subtask-paint",
    title: "Choose paint colour",
    type: "subtask",
    status: "open",
    parentId: "project-kitchen",
    children: [],
    createdAt: "2026-06-01T09:05:00.000Z",
    updatedAt: "2026-06-01T09:05:00.000Z",
    dueDate: "2026-06-01T17:00:00.000Z",
    priority: "soon",
    energyLevel: "medium",
    estimatedEffort: "small",
    attachments: [],
    listItems: [],
    progress: 0
  },
  {
    id: "appointment-builder",
    title: "Builder call",
    type: "event",
    status: "open",
    parentId: "project-kitchen",
    children: [],
    createdAt: "2026-06-01T09:10:00.000Z",
    updatedAt: "2026-06-01T09:10:00.000Z",
    startDate: "2026-06-03T10:30:00.000Z",
    endDate: "2026-06-03T11:00:00.000Z",
    reminderDate: "2026-06-03T09:30:00.000Z",
    contactName: "Jamie",
    contactPhone: "07700 900123",
    attachments: [],
    listItems: [],
    progress: 0
  },
  {
    id: "note-kitchen",
    title: "Keep the warm brass handles",
    type: "note",
    status: "open",
    parentId: "project-kitchen",
    children: [],
    createdAt: "2026-06-01T09:15:00.000Z",
    updatedAt: "2026-06-01T09:15:00.000Z",
    notes: "This is a preference, not a task.",
    attachments: [],
    listItems: [],
    progress: 0
  },
  {
    id: "chore-clean-kitchen",
    title: "Clean the kitchen",
    type: "chore",
    status: "open",
    children: [],
    createdAt: "2026-06-01T09:18:00.000Z",
    updatedAt: "2026-06-01T09:18:00.000Z",
    repeatRule: { frequency: "weekly" },
    energyLevel: "medium",
    estimatedEffort: "medium",
    attachments: [],
    listItems: [],
    progress: 0
  },
  {
    id: "routine-kitchen-reset",
    title: "Kitchen reset",
    type: "routine",
    status: "open",
    children: [],
    createdAt: "2026-06-01T09:20:00.000Z",
    updatedAt: "2026-06-01T09:20:00.000Z",
    repeatRule: { frequency: "daily" },
    energyLevel: "low",
    estimatedEffort: "small",
    attachments: [],
    listItems: [],
    progress: 0
  },
  {
    id: "list-shopping",
    title: "Shopping",
    type: "list",
    status: "open",
    children: [],
    createdAt: "2026-06-01T09:25:00.000Z",
    updatedAt: "2026-06-01T09:25:00.000Z",
    attachments: [],
    listItems: [
      { id: "milk", title: "Milk", status: "open" },
      { id: "tea", title: "Tea", status: "done" }
    ],
    progress: 50
  },
  {
    id: "list-gift-ideas",
    title: "Mum's birthday gifts",
    type: "list",
    status: "open",
    children: [],
    createdAt: "2026-06-01T09:26:00.000Z",
    updatedAt: "2026-06-01T09:26:00.000Z",
    attachments: [],
    listItems: [
      { id: "flowers", title: "Flowers", status: "open" },
      { id: "book", title: "Book", status: "open" }
    ],
    sharedWith: [
      {
        membershipId: "membership-mum-captain",
        memberName: "Mum",
        sharedAt: "2026-06-02T10:00:00.000Z",
        canEdit: false
      }
    ],
    progress: 0
  },
  {
    id: "special-mum-birthday",
    title: "Mum's Birthday",
    type: "occasion",
    status: "open",
    children: [],
    createdAt: "2026-06-01T09:30:00.000Z",
    updatedAt: "2026-06-01T09:30:00.000Z",
    dueDate: "2026-06-18T09:00:00.000Z",
    reminderDate: "2026-06-11T09:00:00.000Z",
    needsPresent: true,
    needsCard: true,
    giftReminderAt: "2026-06-04T09:00:00.000Z",
    cardReminderAt: "2026-06-11T09:00:00.000Z",
    notes: "Gift idea added.",
    attachments: [],
    listItems: [],
    progress: 0
  },
  {
    id: "event-school-concert",
    title: "Concert",
    type: "event",
    status: "open",
    children: [],
    createdAt: "2026-06-01T09:28:00.000Z",
    updatedAt: "2026-06-01T09:28:00.000Z",
    startDate: "2026-06-20T18:30:00.000Z",
    dueDate: "2026-06-20T18:30:00.000Z",
    location: {
      label: "AO Arena Manchester",
      address: "AO Arena, Victoria Station, Manchester, UK",
      latitude: 53.4881,
      longitude: -2.2443
    },
    homeLocation: {
      label: "Skelmersdale",
      address: "Skelmersdale, Lancashire, UK",
      latitude: 53.5508,
      longitude: -2.7743
    },
    eventTravelMinutes: 60,
    eventReadyMinutes: 15,
    eventPrepSteps: [
      { id: "prep-start", title: "Start prep", durationMinutes: 15 },
      { id: "prep-outfit", title: "Choose outfit", durationMinutes: 15 },
      { id: "prep-shower", title: "Shower", durationMinutes: 15 },
      { id: "prep-hair", title: "Hair", durationMinutes: 30 },
      { id: "prep-makeup", title: "Makeup", durationMinutes: 30 }
    ],
    notes: "Arena show — plan travel and getting ready.",
    attachments: [],
    listItems: [],
    progress: 0
  },
  {
    id: "reminder-dad-pills",
    title: "Dad's blue pills",
    type: "reminder",
    status: "open",
    createdBy: mockSarahCreator,
    speakingReminderText:
      "Dad, take your blue pills in the orange jar on the left hand counter.",
    nudgeEveryTenMinutesUntilDone: true,
    notifyNudgerIfNotDone: true,
    children: [],
    createdAt: "2026-06-01T09:32:00.000Z",
    updatedAt: "2026-06-01T09:32:00.000Z",
    reminderDate: "2026-06-01T09:00:00.000Z",
    repeatRule: { frequency: "none" },
    attachments: [],
    listItems: [],
    progress: 0
  },
  {
    id: "reminder-call-sarah",
    title: "Call Sarah",
    type: "reminder",
    status: "open",
    createdBy: mockSarahCreator,
    isLocked: true,
    children: [],
    createdAt: "2026-06-01T09:35:00.000Z",
    updatedAt: "2026-06-01T09:35:00.000Z",
    reminderDate: "2026-06-01T16:00:00.000Z",
    contactName: "Sarah",
    contactPhone: "07700 900456",
    repeatRule: { frequency: "none" },
    attachments: [],
    listItems: [],
    progress: 0
  },
  {
    id: "done-call-school",
    title: "Call school office",
    type: "task",
    status: "done",
    children: [],
    createdAt: "2026-05-31T10:00:00.000Z",
    updatedAt: "2026-06-01T10:30:00.000Z",
    dueDate: "2026-06-01T10:00:00.000Z",
    contactName: "School",
    attachments: [],
    listItems: [],
    progress: 100
  },
  {
    id: "done-clear-counter",
    title: "Clear kitchen counter",
    type: "subtask",
    status: "done",
    parentId: "project-kitchen",
    children: [],
    createdAt: "2026-05-30T09:00:00.000Z",
    updatedAt: "2026-06-01T12:00:00.000Z",
    dueDate: "2026-06-01T12:00:00.000Z",
    attachments: [],
    listItems: [],
    progress: 100
  },
  {
    id: "done-vitamins",
    title: "Take vitamins",
    type: "routine",
    status: "done",
    children: [],
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-31T08:15:00.000Z",
    repeatRule: { frequency: "daily" },
    attachments: [],
    listItems: [],
    progress: 100
  }
])
);
