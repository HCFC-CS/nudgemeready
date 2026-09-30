import { StyleSheet, Text, View } from "react-native";

/** Same first paint as App.tsx — never leave a white window behind the title. */
export function LaunchShell({ message }: { message?: string }) {
  return (
    <View style={styles.shell} accessibilityRole="header" accessibilityLabel="Nudge me Ready">
      <Text style={styles.title}>Nudge me Ready</Text>
      {message ? (
        <Text style={styles.message} accessibilityLiveRegion="polite">
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: "#D9D2C9",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#3A3F45",
    textAlign: "center"
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: "#3A3F45",
    textAlign: "center"
  }
});
