import type { AppPreferences } from "../services/appPreferencesStorage";
import type { CharacterPackPayload, ThemePackPayload, VoicePackPayload } from "../types/readyPacks";

export function applyThemeToPreferences(
  preferences: AppPreferences,
  theme: ThemePackPayload
): AppPreferences {
  return {
    ...preferences,
    appearance: theme.appearanceKey
  };
}

export function applyVoiceToPreferences(
  preferences: AppPreferences,
  voice: VoicePackPayload
): AppPreferences {
  return {
    ...preferences,
    tone: voice.label,
    readAloud: true
  };
}

export type AppliedCharacterPrefs = AppPreferences & {
  characterKey?: string;
  characterName?: string;
  characterAvatar?: string;
  characterVoiceKey?: string;
};

export function applyCharacterToPreferences(
  preferences: AppPreferences,
  character: CharacterPackPayload
): AppliedCharacterPrefs {
  return {
    ...applyVoiceToPreferences(preferences, {
      voiceKey: character.voiceKey,
      label: character.displayName,
      language: "en-GB",
      pitch: 1,
      rate: 0.95
    }),
    characterKey: character.characterKey,
    characterName: character.displayName,
    characterAvatar: character.avatarSymbol,
    characterVoiceKey: character.voiceKey
  };
}

/** Resolve overlay colours for a theme pack (UI can merge later). */
export function themeOverlayColors(theme: ThemePackPayload) {
  return {
    background: theme.background,
    surface: theme.surface,
    primary: theme.primary,
    accent: theme.accent,
    text: theme.text
  };
}
