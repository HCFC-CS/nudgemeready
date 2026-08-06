/** Versioned Terms of Use — bump when material terms change. */
export const TERMS_OF_USE_VERSION = "1.0";

export const TERMS_OF_USE_TITLE = "Terms of Use";

export const TERMS_OF_USE_URL = "https://nudgemeready.app/terms/";

export const TERMS_OF_USE_INTRO =
  "Nudge me Ready is a personal guidance and supportive reminder tool only. It is not medical, legal, financial, emergency, or professional care advice. By using the app you accept these terms.";

export const TERMS_OF_USE_ACCEPT_LABEL =
  "I have read and agree to the Terms of Use, including that Nudge me Ready has no liability for missed items, deleted data, downtime, or outcomes of using this supportive tool.";

export type TermsSection = { title: string; body: string };

export const TERMS_OF_USE_SECTIONS: TermsSection[] = [
  {
    title: "Guidance and support tool only",
    body:
      "Nudge me Ready helps you organise everyday reminders, notes, appointments, and optional crew support. It is a guidance and supportive tool. It does not replace professional advice, clinical care, safeguarding services, or emergency services. If you or someone else is at immediate risk, contact emergency services."
  },
  {
    title: "You are responsible",
    body:
      "You are solely responsible for what you enter, check, act on, share, or ignore. You decide whether a reminder is correct, complete, and timely. Crew members who support you are also responsible for how they use any access you give them. The app does not supervise, verify, or guarantee that anything will be done."
  },
  {
    title: "No liability for missed, late, or incomplete items",
    body:
      "To the fullest extent permitted by law, the app provider accepts no liability if a nudge, reminder, notification, calendar entry, location prompt, voice capture, import, or alert is missed, late, wrong, incomplete, duplicated, not delivered, not heard, silenced by your device, blocked by permissions, or misunderstood. Always use other systems you trust for anything important (medicines, travel, money, health, legal deadlines, and safety)."
  },
  {
    title: "No liability for deleted, lost, or corrupted data",
    body:
      "Your information is kept on your device in this version. If data is deleted, overwritten, lost, corrupted, locked, unreadable after a forgotten PIN/password without recovery, cleared in Settings, removed by uninstalling the app, affected by device failure, OS update, backup failure, or storage issues — that risk is yours. The app provider has no duty to restore data and accepts no liability for loss of nudges, attachments, crew details, settings, or any other content."
  },
  {
    title: "No liability for downtime or technical issues",
    body:
      "The app, notifications, links, invite pages, website, TestFlight/App Store availability, updates, and related services may be unavailable, delayed, buggy, or interrupted. Features may change or be withdrawn. The app provider accepts no liability for downtime, bugs, crashes, failed sync (if later added), failed invites, failed recovery, or any technical fault."
  },
  {
    title: "No warranty",
    body:
      "The app is provided “as is” and “as available”, without warranties of any kind, whether express or implied, including fitness for a particular purpose, accuracy, reliability, uninterrupted use, or that defects will be corrected."
  },
  {
    title: "Absolute limitation of liability",
    body:
      "To the fullest extent permitted by applicable law, the app provider (including Helen Cunliffe and any contributors, partners, or distributors) has no liability whatsoever to you or any third party for any loss, damage, cost, claim, or consequence arising from or related to use of (or inability to use) Nudge me Ready — including indirect, incidental, special, consequential, or punitive losses, loss of data, missed appointments, health outcomes, financial loss, distress, or reputational harm — whether based in contract, tort (including negligence), statute, or otherwise. Where liability cannot legally be excluded, it is limited to the maximum extent allowed, and in any event to £0 for free use of the app."
  },
  {
    title: "Third-party services and your device",
    body:
      "Face ID, notifications, calendars, contacts, maps, email, SMS, WhatsApp, speech, and similar features depend on your device and third-party platforms. Those providers have their own terms. The app provider is not responsible for their failures or for settings you choose on your phone."
  },
  {
    title: "Crew and sharing",
    body:
      "If you invite crew members or share information, you do so at your own risk. Crew supporters must also accept the Crew Supporter Terms. The app provider is not responsible for how crew members behave, what they see, or what they do or fail to do."
  },
  {
    title: "Acceptance",
    body:
      "Creating a profile, continuing to use the app, or accepting a Crew invite means you have read and agree to these Terms of Use. If you do not agree, do not use the app. Uninstalling removes local data on your device."
  }
];

export const TERMS_OF_USE_FOOTER =
  "These terms are for Nudge me Ready. Contact support@nudgemeready.app with questions. Nothing here creates a duty of care beyond what the law already requires and cannot exclude.";
