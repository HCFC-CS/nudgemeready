import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { PageHeader, PrimaryButton, SecondaryButton } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useCrew } from "../hooks/useCrew";
import { sendHelpRequest } from "../services/helpRequests";
import { colors, spacing } from "../theme/theme";
import type { CrewMember } from "../types/crew";

const helpOptions = ["Encourage me", "Remind me", "Stay with me", "Help break it down"];

export function AskForHelpScreen() {
  const navigation = useNavigation<any>();
  const { myCrewMembers } = useCrew();
  const [selectedHelp, setSelectedHelp] = useState(helpOptions[0]);
  const [selectedPerson, setSelectedPerson] = useState(myCrewMembers[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [sent, setSent] = useState(false);

  const person = useMemo(
    () => myCrewMembers.find((entry) => entry.id === selectedPerson) ?? myCrewMembers[0],
    [myCrewMembers, selectedPerson]
  );

  async function handleSend() {
    if (!person) {
      setStatusMessage("Invite someone to your Crew first.");
      return;
    }
    setBusy(true);
    setStatusMessage("");
    try {
      const result = await sendHelpRequest({
        personId: person.id,
        personName: person.name,
        personContact: person.phone ?? person.email,
        helpType: selectedHelp
      });
      setSent(result.ok || result.queued);
      setStatusMessage(result.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen showTabMenu={false}>
      <PageHeader title="Ask for help" showBack helpText="Your Crew are the people you trust. Ask gently — no pressure on them or you." />
      <AppText variant="muted">Choose the kind of support that would feel useful right now.</AppText>

      <Card>
        <AppText variant="heading">What would help?</AppText>
        <View style={styles.optionGrid}>
          {helpOptions.map((option) => (
            <Button
              key={option}
              tone={selectedHelp === option ? "primary" : "quiet"}
              style={styles.optionButton}
              onPress={() => setSelectedHelp(option)}
            >
              {option}
            </Button>
          ))}
        </View>
      </Card>

      <Card>
        <AppText variant="heading">Send to</AppText>
        {myCrewMembers.length === 0 ? (
          <View style={styles.emptyCrew}>
            <AppText variant="muted">Your Crew is empty. Invite someone when you are ready.</AppText>
            <SecondaryButton size="compact" onPress={() => navigation.navigate("CrewHub")}>
              Open Crew
            </SecondaryButton>
          </View>
        ) : (
          myCrewMembers.map((entry) => (
            <Button
              key={entry.id}
              tone={selectedPerson === entry.id ? "secondary" : "quiet"}
              onPress={() => setSelectedPerson(entry.id)}
            >
              {entry.name} — {formatCrewRoles(entry)}
            </Button>
          ))
        )}
      </Card>

      <PrimaryButton onPress={() => void handleSend()} disabled={busy || !person}>
        {busy ? "Opening…" : "Ask my Crew"}
      </PrimaryButton>
      {sent || statusMessage ? (
        <Card style={styles.confirmation}>
          <AppText variant="heading">{sent ? "Ready to send" : "Almost"}</AppText>
          <AppText variant="muted">
            {statusMessage || `Your Crew will know you asked for: ${selectedHelp.toLowerCase()}.`}
          </AppText>
        </Card>
      ) : null}
    </Screen>
  );
}

function formatCrewRoles(member: CrewMember) {
  if (!member.roles.length) {
    return member.relationship || "Crew";
  }
  return member.roles.join(", ");
}

const styles = StyleSheet.create({
  optionGrid: {
    gap: spacing.sm
  },
  optionButton: {
    alignItems: "flex-start"
  },
  emptyCrew: {
    gap: spacing.sm
  },
  confirmation: {
    borderColor: colors.primary
  }
});
