import {
  ImpactFeedbackStyle,
  NotificationFeedbackType,
  impactAsync,
  notificationAsync
} from "expo-haptics";

/**
 * Short, calm tap when a save or sorted action commits.
 * Success feedback on the Taptic Engine, or a light impact if that
 * feedback is unavailable. Never an error pattern and never a long buzz.
 * If haptics are off, or ExpoHaptics is not in this binary, this does
 * nothing and the action still completes.
 */
export function playConfirmHaptic(): void {
  try {
    const pending = notificationAsync(NotificationFeedbackType.Success);
    void Promise.resolve(pending).catch(() => playLightImpact());
  } catch {
    playLightImpact();
  }
}

function playLightImpact(): void {
  try {
    void Promise.resolve(impactAsync(ImpactFeedbackStyle.Light)).catch(() => undefined);
  } catch {
    // Missing API or haptics switched off. The save or sorted action still completes.
  }
}
