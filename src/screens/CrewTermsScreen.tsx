import { Linking, Pressable, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Button } from "../components/Button";
import { PageHeader, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import {
  CREW_SUPPORTER_COMMITMENTS,
  CREW_SUPPORTER_TERMS_FOOTER,
  CREW_SUPPORTER_TERMS_INTRO,
  CREW_SUPPORTER_TERMS_TITLE,
  CREW_SUPPORTER_TERMS_URL,
  CREW_SUPPORTER_TERMS_VERSION
} from "../content/crewSupporterTerms";
import { colors, spacing } from "../theme/theme";

export function CrewTermsScreen() {
  const navigation = useNavigation<any>();

  return (
    <Screen showTabMenu={false}>
      <PageHeader
        title={CREW_SUPPORTER_TERMS_TITLE}
        subtitle={`Version ${CREW_SUPPORTER_TERMS_VERSION} · What you agree to when you join a Crew.`}
        showBack
      />

      <SoftCard>
        <AppText variant="muted">{CREW_SUPPORTER_TERMS_INTRO}</AppText>
      </SoftCard>

      {CREW_SUPPORTER_COMMITMENTS.map((item, index) => (
        <SoftCard key={item.title}>
          <AppText variant="heading">
            {index + 1}. {item.title}
          </AppText>
          <AppText variant="muted">{item.body}</AppText>
        </SoftCard>
      ))}

      <SoftCard>
        <AppText variant="muted">{CREW_SUPPORTER_TERMS_FOOTER}</AppText>
        <Button tone="quiet" onPress={() => void Linking.openURL(CREW_SUPPORTER_TERMS_URL)}>
          Open on the web
        </Button>
        <Button tone="quiet" onPress={() => navigation.navigate("TermsOfUse")}>
          App Terms of Use
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
