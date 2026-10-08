import { Linking, Pressable, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Button } from "../components/Button";
import { PageHeader, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import {
  TERMS_OF_USE_FOOTER,
  TERMS_OF_USE_INTRO,
  TERMS_OF_USE_SECTIONS,
  TERMS_OF_USE_TITLE,
  TERMS_OF_USE_URL,
  TERMS_OF_USE_VERSION
} from "../content/termsOfUse";
import { colors, spacing } from "../theme/theme";

export function TermsOfUseScreen() {
  const navigation = useNavigation<any>();

  return (
    <Screen showTabMenu={false}>
      <PageHeader
        title={TERMS_OF_USE_TITLE}
        subtitle={`Version ${TERMS_OF_USE_VERSION} · Guidance tool only — no app liability.`}
        showBack
      />

      <SoftCard>
        <AppText variant="muted">{TERMS_OF_USE_INTRO}</AppText>
      </SoftCard>

      {TERMS_OF_USE_SECTIONS.map((section, index) => (
        <SoftCard key={section.title}>
          <AppText variant="heading">
            {index + 1}. {section.title}
          </AppText>
          <AppText variant="muted">{section.body}</AppText>
        </SoftCard>
      ))}

      <SoftCard>
        <AppText variant="muted">{TERMS_OF_USE_FOOTER}</AppText>
        <Button tone="quiet" onPress={() => void Linking.openURL(TERMS_OF_USE_URL)}>
          Open on the web
        </Button>
        <Button tone="quiet" onPress={() => navigation.navigate("CrewTerms")}>
          Crew Supporter Terms
        </Button>
      </SoftCard>

      <View style={styles.footer}>
        <Pressable onPress={() => navigation.goBack()}>
          <AppText style={styles.back}>Back</AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: { alignItems: "center", paddingVertical: spacing.sm },
  back: { color: colors.accent, fontWeight: "600" }
});
