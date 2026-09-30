/**
 * Crew-assisted remote unlock.
 *
 * Flow:
 *   1. Locked phone calls requestCrewUnlock() — generates reset links locally,
 *      posts them + captain details to the worker, which emails the captain.
 *   2. Captain opens the approval link in their browser, taps "Approve".
 *   3. Locked phone calls pollCrewUnlockApproval() every few seconds.
 *      When the worker returns { status: "approved" } the app opens the reset UI.
 */

import Constants from "expo-constants";

import { createEmailResetLink } from "./appSecurity";

type ExtraConfig = {
  passwordResetApiUrl?: string;
};

export type CrewUnlockStatus = "pending" | "approved" | "expired" | "unavailable";

export type RequestCrewUnlockResult = {
  ok: boolean;
  token?: string;
  expiresIn?: number;
  /** Human-readable next step for the user. */
  message: string;
};

function getApiUrl(): string | undefined {
  const url = (Constants.expoConfig?.extra as ExtraConfig | undefined)?.passwordResetApiUrl?.trim();
  return url || undefined;
}

/**
 * Asks the worker to email the captain an approval link.
 * Returns the polling token so the app can check for approval.
 */
export async function requestCrewUnlock(input: {
  captainName: string;
  captainEmail: string;
  userName: string;
}): Promise<RequestCrewUnlockResult> {
  const apiUrl = getApiUrl();
  if (!apiUrl) {
    return {
      ok: false,
      message:
        "The remote unlock service isn't set up yet. Ask your captain to email support@nudgemeready.app directly."
    };
  }

  // Generate the reset links on this device so the token is tied to this phone.
  const reset = await createEmailResetLink();

  const response = await fetch(`${apiUrl}/request-unlock`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      captainName: input.captainName,
      captainEmail: input.captainEmail,
      userName: input.userName,
      webLink: reset.webLink,
      appLink: reset.appLink
    })
  });

  if (!response.ok) {
    return { ok: false, message: "Could not reach the unlock service. Check your internet connection." };
  }

  const data = (await response.json()) as { ok?: boolean; expiresIn?: number; emailSent?: boolean };
  const minutes = Math.round((data.expiresIn ?? 900) / 60);

  return {
    ok: true,
    expiresIn: data.expiresIn,
    message: data.emailSent
      ? `An approval email has been sent to ${input.captainName}. Once they approve, this screen will update automatically. The link expires in ${minutes} minutes.`
      : `The request was sent to ${input.captainName}. Once they approve, this screen will update. The link expires in ${minutes} minutes.`
  };
}

/**
 * Polls the worker for the approval status of a crew-unlock request.
 * Call this every 4–5 seconds after requestCrewUnlock() succeeds.
 */
export async function pollCrewUnlockApproval(token: string): Promise<CrewUnlockStatus> {
  const apiUrl = getApiUrl();
  if (!apiUrl || !token) return "unavailable";

  try {
    const response = await fetch(`${apiUrl}/check-unlock?t=${encodeURIComponent(token)}`, {
      headers: { Accept: "application/json" }
    });
    if (!response.ok) return "pending";
    const data = (await response.json()) as { status?: string };
    if (data.status === "approved") return "approved";
    if (data.status === "expired") return "expired";
    return "pending";
  } catch {
    return "pending";
  }
}
