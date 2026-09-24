import Constants from "expo-constants";

import { createEmailResetLink, SUPPORT_EMAIL } from "./appSecurity";

type ExtraConfig = {
  passwordResetApiUrl?: string;
};

export type PasswordResetEmailResult = {
  mode: "automated" | "mailto_support" | "mailto_self";
  email: string;
  mailtoUrl?: string;
  message: string;
};

function getApiUrl(): string | undefined {
  const url = (Constants.expoConfig?.extra as ExtraConfig | undefined)?.passwordResetApiUrl?.trim();
  return url || undefined;
}

/**
 * Requests a password/PIN reset email.
 * Prefers the automated API (sends from support@nudgemeready.app).
 * Falls back to a support mailto that includes the reset links, then self-mailto.
 */
export async function requestPasswordResetEmail(): Promise<PasswordResetEmailResult> {
  const reset = await createEmailResetLink();
  const apiUrl = getApiUrl();

  if (apiUrl) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          to: reset.email,
          webLink: reset.webLink,
          appLink: reset.appLink,
          supportNotify: SUPPORT_EMAIL
        })
      });
      if (response.ok) {
        return {
          mode: "automated",
          email: reset.email,
          message: `We’ve sent a reset email from ${SUPPORT_EMAIL} to ${reset.email}. Open the link on this phone.`
        };
      }
    } catch {
      // Fall through to mailto options.
    }
  }

  const supportMailto = buildSupportResetRequestMailto(reset.email, reset.webLink, reset.appLink);
  return {
    mode: "mailto_support",
    email: reset.email,
    mailtoUrl: supportMailto,
    message: `Open the email draft to ${SUPPORT_EMAIL}. Once sent, you’ll get an automated reply with your reset link for ${reset.email}.`
  };
}

export function buildSupportResetRequestMailto(
  recoveryEmail: string,
  webLink: string,
  appLink: string
) {
  const subject = encodeURIComponent("Password reset request — Nudge me Ready");
  const body = encodeURIComponent(
    [
      "AUTOMATED RESET REQUEST",
      "",
      `Recovery email: ${recoveryEmail}`,
      `Please send the reset email from ${SUPPORT_EMAIL} to the recovery address above.`,
      "",
      "Reset links (include these in the reply to the user):",
      webLink,
      appLink,
      "",
      "This link works for 24 hours and only on the phone where the app is installed.",
      "",
      "— Sent from Nudge me Ready"
    ].join("\n")
  );
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
}

export { SUPPORT_EMAIL };
