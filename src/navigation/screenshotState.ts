import type { NavigationState, PartialState } from "@react-navigation/native";

import { mockItems, mockNudgeItems } from "../data/mockData";
import type { RootStackParamList } from "../types/navigation";

export type ScreenshotTarget = {
  id: string;
  filename: string;
  label: string;
};

export const screenshotTargets: ScreenshotTarget[] = [
  { id: "Splash", filename: "01-splash", label: "Splash" },
  { id: "Home", filename: "02-home", label: "Home" },
  { id: "Capture", filename: "03-capture", label: "+nudge" },
  { id: "Today", filename: "04-today", label: "My Nudges" },
  { id: "Focus", filename: "05-focus", label: "Focus" },
  { id: "More", filename: "06-more", label: "More" },
  { id: "MyWorld", filename: "07-my-world", label: "My World" },
  { id: "Projects", filename: "08-projects", label: "Projects" },
  { id: "Lists", filename: "09-lists", label: "Lists" },
  { id: "Reminders", filename: "10-reminders", label: "Reminders" },
  { id: "Routines", filename: "11-routines", label: "Routines" },
  { id: "Events", filename: "12-events", label: "Events" },
  { id: "Occasions", filename: "13-occasions", label: "Occasions" },
  { id: "Done", filename: "14-done", label: "Done" },
  { id: "ItemDetails", filename: "15-item-details", label: "Item Details" },
  { id: "AddTask", filename: "16-add-task", label: "Add Task" },
  { id: "VoiceAddTask", filename: "17-voice-add-task", label: "Voice Add Task" },
  { id: "TaskBuddy", filename: "18-task-buddy", label: "Task Buddy" },
  { id: "Help", filename: "19-ask-for-help", label: "Ask for Help" },
  { id: "Circle", filename: "20-my-crew", label: "My Crew" },
  { id: "NudgyCrew", filename: "21-my-crew", label: "My Crew" },
  { id: "MyCrew", filename: "21-my-crew", label: "My Crew" },
  { id: "CrewsISupport", filename: "24-crews-i-support", label: "Crews I Support" },
  { id: "OrganisationDashboard", filename: "25-organisation-dashboard", label: "People We Support" },
  { id: "InviteCrew", filename: "26-invite-crew", label: "Invite Crew" },
  { id: "Profile", filename: "22-profile", label: "Profile" },
  { id: "Settings", filename: "23-settings", label: "Settings" }
];

const tabScreens = new Set<keyof RootStackParamList | string>([
  "Home",
  "Capture",
  "Today",
  "Focus",
  "More"
]);

function createRoute(name: string, params?: object) {
  return params ? { name, params, key: `${name}-screenshot` } : { name, key: `${name}-screenshot` };
}

export function getScreenshotInitialState(screenId: string): PartialState<NavigationState> | undefined {
  if (tabScreens.has(screenId)) {
    return {
      index: 0,
      routes: [
        {
          ...createRoute("Tabs"),
          state: {
            index: ["Home", "Capture", "Today", "Focus", "More"].indexOf(screenId),
            routes: [
              createRoute("Home"),
              createRoute("Capture"),
              createRoute("Today"),
              createRoute("Focus"),
              createRoute("More")
            ]
          }
        }
      ]
    };
  }

  if (screenId === "ItemDetails") {
    const draft = mockNudgeItems.find((item) => item.id === "subtask-paint") ?? mockNudgeItems[0];
    return {
      index: 0,
      routes: [createRoute("ItemDetails", { draft })]
    };
  }

  if (screenId === "AddTask") {
    return {
      index: 0,
      routes: [createRoute("AddTask", { draft: mockItems[0] })]
    };
  }

  if (screenId === "TaskBuddy") {
    return {
      index: 0,
      routes: [createRoute("TaskBuddy", { task: mockItems[2] })]
    };
  }

  if (screenshotTargets.some((target) => target.id === screenId)) {
    return {
      index: 0,
      routes: [createRoute(screenId)]
    };
  }

  return undefined;
}

export function getScreenshotScreenId(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return new URLSearchParams(window.location.search).get("screen") ?? undefined;
}
