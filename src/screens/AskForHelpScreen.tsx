import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { BackButton } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useCircle } from "../hooks/useCircle";
import { colors, spacing } from "../theme/theme";
import type { TrustedPerson } from "../types/models";

const helpOptions = ["Encourage me", "Remind me", "Stay with me", "Help break it down"];

export function AskForHelpScreen() {
  const { people } = useCircle();
  const [selectedHelp, setSelectedHelp] = useState(helpOptions[0]);
  const [selectedPerson, setSelectedPerson] = useState(people[0]?.id ?? "");
  const [sent, setSent] = useState(false);

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
        {people.map((person) => (
          <Button
            key={person.id}
            tone={selectedPerson === person.id ? "secondary" : "quiet"}
            onPress={() => setSelectedPerson(person.id)}
          >
            {person.name} - {formatPersonRoles(person)}
          </Button>
        ))}
      </Card>

      <Button onPress={() => setSent(true)}>Send to my village</Button>
      {sent ? (
        <Card style={styles.confirmation}>
          <AppText variant="heading">Sent gently</AppText>
          <AppText variant="muted">
            Your village will know you asked for: {selectedHelp.toLowerCase()}.
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
