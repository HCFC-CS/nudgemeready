import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, Share, StyleSheet, View } from "react-native";

import { MultiRoleSelector, PermissionEditor } from "../components/CrewComponents";
import { PageHeader, PrimaryButton, SecondaryButton, SoftCard, CategoryChip } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useCrew } from "../hooks/useCrew";
import { useProfile } from "../hooks/useProfile";
import {
  getEmailInviteCopy,
  getSmsInviteCopy,
  getWhatsAppInviteCopy,
  getInviteMethodLabel
} from "../services/crewInvites";
import {
  CONSENT_LABELS,
  SAFEGUARDING_MESSAGE,
  type ConsentType,
  type CrewPermissionKey,
  type CrewPermissionSet,
  type CrewRole,
  type InviteMethod
} from "../types/crew";
import { mergeRolePermissions, SENSITIVE_PERMISSIONS } from "../types/crew";
import { colors, radii, spacing } from "../theme/theme";
import { Field } from "../components/FormControls";

type Step = "method" | "contact" | "profile" | "roles" | "permissions" | "review";

const inviteMethods: InviteMethod[] = ["email", "sms", "whatsapp", "link"];

export function InviteCrewScreen() {
  const navigation = useNavigation();
  const { profile } = useProfile();
  const { profiles, activeProfile, sendInvitation } = useCrew();
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<InviteMethod>("email");
  const [contact, setContact] = useState("");
  const [memberName, setMemberName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [targetProfileId, setTargetProfileId] = useState(activeProfile.id);
  const [roles, setRoles] = useState<CrewRole[]>(["anchor"]);
  const [permissions, setPermissions] = useState<CrewPermissionSet>(mergeRolePermissions(["anchor"]));
  const [consents, setConsents] = useState<ConsentType[]>([]);
  const [notice, setNotice] = useState("");
  const [sentInviteLink, setSentInviteLink] = useState("");

  const selfProfiles = profiles.filter((entry) => entry.isSelf || entry.id === activeProfile.id);
  const supportableProfiles = useMemo(() => {
    const unique = new Map<string, (typeof profiles)[number]>();
    for (const entry of profiles) {
      unique.set(entry.id, entry);
    }
    return Array.from(unique.values());
  }, [profiles]);

  function toggleRole(role: CrewRole) {
    setRoles((current) => {
      const next = current.includes(role) ? current.filter((entry) => entry !== role) : [...current, role];
      const safeRoles: CrewRole[] = next.length ? next : ["observer"];
      setPermissions(mergeRolePermissions(safeRoles));
      return safeRoles;
    });
  }

  function togglePermission(key: CrewPermissionKey) {
    setPermissions((current) => ({ ...current, [key]: !current[key] }));
  }

  function toggleConsent(type: ConsentType) {
    setConsents((current) => (current.includes(type) ? current.filter((entry) => entry !== type) : [...current, type]));
  }

  async function sendInvite() {
    const invitation = sendInvitation(
      {
        method,
        contact: method === "link" ? "manual-link" : contact.trim(),
        targetProfileId,
        roles,
        permissions,
        consents,
        relationship: relationship.trim() || "Crew member",
        memberName: memberName.trim() || contact.trim(),
        personalMessage: undefined
      },
      profile.name.trim() || "You"
    );

    setSentInviteLink(invitation.inviteLink);
    setNotice(`Invite sent to ${memberName || contact}.`);
    setStep("review");
  }

  async function shareInvite(channel: "email" | "sms" | "whatsapp" | "copy") {
    if (!sentInviteLink) {
      return;
    }
    const fakeInvite = {
      inviteLink: sentInviteLink,
      inviteMethod: method,
      id: "preview",
      invitedByUserId: "",
      invitedByName: profile.name,
      targetCrewId: "",
      targetProfileId: "",
      targetProfileName: "",
      proposedRoles: roles,
      proposedPermissions: permissions,
      proposedConsents: consents,
      status: "sent" as const,
      expiresAt: "",
      createdAt: "",
      updatedAt: ""
    };

    if (channel === "copy") {
      await Share.share({ message: sentInviteLink });
      setNotice("Invite link ready to share.");
      return;
    }
    if (channel === "email") {
      const copy = getEmailInviteCopy(fakeInvite);
      await Linking.openURL(`mailto:${contact}?subject=${encodeURIComponent(copy.subject)}&body=${encodeURIComponent(copy.body)}`);
      return;
    }
    if (channel === "sms") {
      await Linking.openURL(`sms:${contact}?body=${encodeURIComponent(getSmsInviteCopy(fakeInvite))}`);
      return;
    }
    await Linking.openURL(`https://wa.me/?text=${encodeURIComponent(getWhatsAppInviteCopy(fakeInvite))}`);
  }

  return (
    <Screen showTabMenu={false}>
      <PageHeader title="Invite someone to your Crew" subtitle="Your Crew are the people you trust to help you stay on track, feel supported and worry less." />
      <SoftCard>
        <AppText variant="muted">{SAFEGUARDING_MESSAGE}</AppText>
      </SoftCard>

      {step === "method" ? (
        <View style={styles.section}>
          <AppText variant="heading">How should we send the invite?</AppText>
          <View style={styles.methodGrid}>
            {inviteMethods.map((entry) => (
              <Pressable
                key={entry}
                onPress={() => setMethod(entry)}
                style={[styles.methodCard, method === entry && styles.methodCardActive]}
              >
                <Ionicons
                  name={entry === "email" ? "mail-outline" : entry === "sms" ? "chatbox-outline" : entry === "whatsapp" ? "logo-whatsapp" : "link-outline"}
                  size={24}
                  color={method === entry ? colors.primaryDark : colors.mutedText}
                />
                <AppText variant="body" style={styles.methodLabel}>
                  {getInviteMethodLabel(entry)}
                </AppText>
              </Pressable>
            ))}
          </View>
          <PrimaryButton onPress={() => setStep(method === "link" ? "profile" : "contact")}>Continue</PrimaryButton>
        </View>
      ) : null}

      {step === "contact" ? (
        <View style={styles.section}>
          <Field label="Their name" value={memberName} onChangeText={setMemberName} placeholder="Name" />
          <Field
            label={method === "email" ? "Email address" : "Mobile number"}
            value={contact}
            onChangeText={setContact}
            placeholder={method === "email" ? "name@example.com" : "07..."}
          />
          <Field label="Relationship" value={relationship} onChangeText={setRelationship} placeholder="Parent, friend, therapist..." />
          <PrimaryButton onPress={() => setStep("profile")} disabled={!contact.trim()}>
            Continue
          </PrimaryButton>
        </View>
      ) : null}

      {step === "profile" ? (
        <View style={styles.section}>
          <AppText variant="heading">Who are they supporting?</AppText>
          <View style={styles.chips}>
            {supportableProfiles.map((entry) => (
              <CategoryChip
                key={entry.id}
                label={entry.isSelf ? "Me" : entry.name}
                selected={targetProfileId === entry.id}
                onPress={() => setTargetProfileId(entry.id)}
              />
            ))}
          </View>
          <PrimaryButton onPress={() => setStep("roles")}>Continue</PrimaryButton>
        </View>
      ) : null}

      {step === "roles" ? (
        <View style={styles.section}>
          <AppText variant="heading">What kind of support can they give?</AppText>
          <AppText variant="muted">You can choose more than one role and change this later.</AppText>
          <MultiRoleSelector selectedRoles={roles} onToggle={toggleRole} />
          <PrimaryButton onPress={() => setStep("permissions")} disabled={!roles.length}>
            Continue
          </PrimaryButton>
        </View>
      ) : null}

      {step === "permissions" ? (
        <ScrollView contentContainerStyle={styles.section}>
          <AppText variant="heading">What can they see or help with?</AppText>
          <AppText variant="muted">You stay in control of what each Crew member can access.</AppText>
          <PermissionEditor permissions={permissions} onToggle={togglePermission} />
          {SENSITIVE_PERMISSIONS.some((key) => permissions[key]) ? (
            <View style={styles.section}>
              <AppText variant="heading">Sensitive access needs consent</AppText>
              <AppText variant="muted">Choose what they may see once consent is approved.</AppText>
              <View style={styles.chips}>
                {(Object.keys(CONSENT_LABELS) as ConsentType[]).map((type) => (
                  <CategoryChip
                    key={type}
                    label={CONSENT_LABELS[type]}
                    selected={consents.includes(type)}
                    onPress={() => toggleConsent(type)}
                  />
                ))}
              </View>
            </View>
          ) : null}
          <PrimaryButton onPress={sendInvite}>Send invite</PrimaryButton>
        </ScrollView>
      ) : null}

      {step === "review" ? (
        <View style={styles.section}>
          <SoftCard>
            <AppText variant="heading">Invite ready</AppText>
            {notice ? <AppText>{notice}</AppText> : null}
            <AppText variant="muted">{sentInviteLink}</AppText>
          </SoftCard>
          <View style={styles.shareRow}>
            <SecondaryButton onPress={() => shareInvite("copy")}>Copy link</SecondaryButton>
            {method === "email" ? <SecondaryButton onPress={() => shareInvite("email")}>Open email</SecondaryButton> : null}
            {method === "sms" ? <SecondaryButton onPress={() => shareInvite("sms")}>Open SMS</SecondaryButton> : null}
            {method === "whatsapp" ? <SecondaryButton onPress={() => shareInvite("whatsapp")}>Open WhatsApp</SecondaryButton> : null}
          </View>
          <PrimaryButton onPress={() => navigation.goBack()}>Save</PrimaryButton>
        </View>
      ) : null}

      {step !== "method" && step !== "review" ? (
        <SecondaryButton onPress={() => navigation.goBack()}>Cancel</SecondaryButton>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md
  },
  methodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  methodCard: {
    flexGrow: 1,
    flexBasis: "45%",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.card
  },
  methodCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  methodLabel: {
    textAlign: "center"
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  shareRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  }
});
