/** Versioned Crew Supporter Terms — bump version when commitments change. */
export const CREW_SUPPORTER_TERMS_VERSION = "1.0";

export const CREW_SUPPORTER_TERMS_TITLE = "Crew Supporter Terms";

export const CREW_SUPPORTER_TERMS_INTRO =
  "By joining someone’s Crew on Nudge me Ready, you agree to show up as a supportive crew member. These terms set out what that means.";

export const CREW_SUPPORTER_COMMITMENTS: { title: string; body: string }[] = [
  {
    title: "Be supportive",
    body: "I will encourage and help the person I support with patience and respect. I will not use my role to control, shame, or pressure them."
  },
  {
    title: "Respect privacy",
    body: "I will only view or share information I am given permission to see. I will not pass on personal details, health notes, location, or other private information without their clear consent (or the consent of their Crew Captain where appropriate)."
  },
  {
    title: "Stay within my role",
    body: "I will use only the access and permissions they (or their Crew Captain) have granted. I will not try to override their choices or take actions outside what I have been invited to do."
  },
  {
    title: "Keep trust",
    body: "I understand that being in a Crew is based on trust. If I can no longer support them helpfully, I will step back or ask to leave rather than stay in a role I cannot honour."
  },
  {
    title: "Not an emergency service",
    body: "I understand Nudge me Ready is for everyday support and reassurance, not emergencies. If someone is at immediate risk, I will contact emergency services."
  },
  {
    title: "Honest acceptance",
    body: "I confirm I am joining willingly to support this person, and that the name I use is how they should know me in their Crew."
  }
];

export const CREW_SUPPORTER_TERMS_FOOTER =
  "Accepting an invite records that you agreed to these terms on this device. You also remain bound by the app Terms of Use (no liability for missed items, deleted data, downtime, or outcomes). You can leave a Crew later. Uninstalling the app removes local data on your phone.";

export const CREW_SUPPORTER_ACCEPT_LABEL =
  "I have read the Crew Supporter Terms and agree to be a supportive crew member.";

export const CREW_SUPPORTER_TERMS_URL = "https://nudgemeready.app/crew-terms/";

export function formatCrewSupporterTermsPlainText() {
  const lines = [
    CREW_SUPPORTER_TERMS_TITLE,
    `Version ${CREW_SUPPORTER_TERMS_VERSION}`,
    "",
    CREW_SUPPORTER_TERMS_INTRO,
    "",
    ...CREW_SUPPORTER_COMMITMENTS.flatMap((item, index) => [
      `${index + 1}. ${item.title}`,
      item.body,
      ""
    ]),
    CREW_SUPPORTER_TERMS_FOOTER
  ];
  return lines.join("\n");
}
