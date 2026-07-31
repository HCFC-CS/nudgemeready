import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { BackButton } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useCircle } from "../hooks/useCircle";
import { sendHelpRequest } from "../services/helpRequests";
import { colors, spacing } from "../theme/theme";
import type { TrustedPerson } from "../types/models";

const helpOptions = ["Encourage me", "Remind me", "Stay with me", "Help break it down"];

export function AskForHelpScreen() {
  const { people } = useCircle();
  const [selectedHelp, setSelectedHelp] = useState(helpOptions[0]);
  const [selectedPerson, setSelectedPerson] = useState(people[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [sent, setSent] = useState(false);

  const person = useMemo(
    () => people.find((entry) => entry.id === selectedPerson) ?? people[0],
    [people, selectedPerson]
  );

  async function handleSend() {
    if (!person) {
      setStatusMessage("Add someone to your circle first.");
      return;
    }
    setBusy(true);
    setStatusMessage("");
    try {
      const result = await sendHelpRequest({
        personId: person.id,
        personName: person.name,
        personContact: person.contact,
        helpType: selectedHelp
      });
      setSent(result.ok || result.queued);
      setStatusMessage(result.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <BackButton />
      <AppText variant="title">Ask for Help</AppText>
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
        {people.length === 0 ? (
          <AppText variant="muted">Your circle is empty. Add someone from My Crew first.</AppText>
        ) : (
          people.map((entry) => (
            <Button
              key={entry.id}
              tone={selectedPerson === entry.id ? "secondary" : "quiet"}
              onPress={() => setSelectedPerson(entry.id)}
            >
              {entry.name} - {formatPersonRoles(entry)}
            </Button>
          ))
        )}
      </Card>

      <Button onPress={() => void handleSend()} disabled={busy || !person}>
        {busy ? "Opening…" : "Send to my village"}
      </Button>
      {sent || statusMessage ? (
        <Card style={styles.confirmation}>
          <AppText variant="heading">{sent ? "Ready to send" : "Almost"}</AppText>
          <AppText variant="muted">
            {statusMessage ||
              `Your village will know you asked for: ${selectedHelp.toLowerCase()}.`}
          </AppText>
        </Card>
      ) : null}
    </Screen>
  );
}

function formatPersonRoles(person: TrustedPerson) {
  const roles = person.roles?.length ? person.roles : person.role ? [person.role] : ["cheerleader"];
  return roles.join(", ");
}

const styles = StyleSheet.create({
  optionGrid: {
    gap: spacing.sm
  },
  optionButton: {
    alignItems: "flex-start"
  },
  confirmation: {
    borderColor: colors.primary
  }
});
