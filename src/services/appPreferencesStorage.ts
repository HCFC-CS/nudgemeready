import { getEncryptedItem, setEncryptedItem } from "./encryptedStorage";

const APP_PREFERENCES_KEY = "nudge-me:app-preferences";

export type AppPreferences = {
  pushNotifications: boolean;
  emailNotifications: boolean;
  quietHours: boolean;
  dailySummary: boolean;
  contactsEnabled: boolean;
  cloudBackup: boolean;
  tone: string;
  appearance: string;
  focusTimer: string;
  defaultReminder: string;
  voiceCapture: boolean;
  readAloud: boolean;
  preferredCalendarId?: string;
};

export const defaultAppPreferences: AppPreferences = {
  pushNotifications: false,
  emailNotifications: false,
  quietHours: true,
  dailySummary: false,
  contactsEnabled: true,
  cloudBackup: false,
  tone: "Gentle",
  appearance: "System",
  focusTimer: "25",
  defaultReminder: "Morning",
  voiceCapture: true,
  readAloud: true,
  preferredCalendarId: undefined
};

export async function loadAppPreferences(): Promise<AppPreferences> {
  const raw = await getEncryptedItem(APP_PREFERENCES_KEY);
  if (!raw) {
    return defaultAppPreferences;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<AppPreferences>;
    return { ...defaultAppPreferences, ...parsed };
  } catch {
    return defaultAppPreferences;
  }
}

export async function saveAppPreferences(preferences: AppPreferences) {
  await setEncryptedItem(APP_PREFERENCES_KEY, JSON.stringify(preferences));
}
