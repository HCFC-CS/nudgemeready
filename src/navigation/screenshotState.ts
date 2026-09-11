import type { NavigationState, PartialState } from "@react-navigation/native";

import { mockNudgeItems } from "../data/mockData";
import type { RootStackParamList } from "../types/navigation";

export type ScreenshotTarget = {
  id: string;
  filename: string;
  label: string;
};

export const screenshotTargets: ScreenshotTarget[] = [
  { id: "Splash", filename: "01-splash", label: "Splash" },
  { id: "Home", filename: "02-home", label: "Home" },
  { id: "Today", filename: "03-nudges", label: "Nudges" },
  { id: "Capture", filename: "04-add", label: "Add" },
  { id: "More", filename: "05-menu", label: "Menu" },
  { id: "Focus", filename: "06-focus", label: "Focus" },
  { id: "MyWorld", filename: "07-everything", label: "Everything" },
  { id: "ComingUp", filename: "08-coming-up", label: "What's coming up" },
  { id: "RewardBank", filename: "09-reward-bank", label: "Reward Bank" },
  { id: "ReadyPacks", filename: "10-ready-packs", label: "Ready4Packs" },
  { id: "Done", filename: "11-done", label: "Completed" },
  { id: "ItemDetails", filename: "12-item-details", label: "Item Details" },
  { id: "Help", filename: "13-ask-for-help", label: "Ask for Help" },
  { id: "CrewHub", filename: "14-crew", label: "Crew" },
  { id: "OrganisationDashboard", filename: "15-organisation-dashboard", label: "People We Support" },
  { id: "InviteCrew", filename: "16-invite-crew", label: "Invite Crew" },
  { id: "Profile", filename: "17-profile", label: "Profile" },
  { id: "Settings", filename: "18-settings", label: "Settings" }
];

const tabScreens = new Set<keyof RootStackParamList | string>([
  "Home",
  "Capture",
  "Today",
  "Focus",
  "More"
]);

const TAB_ORDER = ["Home", "Today", "Capture", "More", "Focus"] as const;

function createRoute(name: string, params?: object) {
  return params ? { name, params, key: `${name}-screenshot` } : { name, key: `${name}-screenshot` };
}

export function getScreenshotInitialState(screenId: string): PartialState<NavigationState> | undefined {
  if (tabScreens.has(screenId)) {
    const index = TAB_ORDER.indexOf(screenId as (typeof TAB_ORDER)[number]);
    return {
      index: 0,
      routes: [
        {
          ...createRoute("Tabs"),
          state: {
            index: index >= 0 ? index : 0,
            routes: TAB_ORDER.map((name) => createRoute(name))
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

  if (screenshotTargets.some((target) => target.id === screenId)) {
    return {
      index: 0,
      routes: [createRoute(screenId)]
    };
  }

  return undefined;
}

export function getScreenshotScreenId() {
  if (typeof window === "undefined") {
    return undefined;
  }
  const params = new URLSearchParams(window.location.search);
  return params.get("screenshot") ?? params.get("screen") ?? undefined;
}

export function isScreenshotMode() {
  return Boolean(getScreenshotScreenId());
}

/** Splash stays on first-open registration. Other shots use a completed demo profile. */
export function shouldUseScreenshotDemoProfile() {
  const screenId = getScreenshotScreenId();
  return Boolean(screenId && screenId !== "Splash");
}
