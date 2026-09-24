import { useEffect, useState, type ComponentType } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { waitForSplashNative } from "./src/services/expoNotifications";

/**
 * Hold a plain RN shell until TurboModules are safe to touch.
 * iOS 26 aborts if a native void method throws in the first JS tick.
 */
export default function App() {
  const [Root, setRoot] = useState<ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;
    const ready = Platform.OS === "web" ? Promise.resolve() : waitForSplashNative();
    void ready
      .then(() => import("./src/NudgeApp"))
      .then((mod) => {
        if (!cancelled) {
          setRoot(() => mod.default);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!Root) {
    return (
      <View style={styles.shell} accessibilityRole="header" accessibilityLabel="Nudge me Ready">
        <Text style={styles.title}>Nudge me Ready</Text>
      </View>
    );
  }

  return <Root />;
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
  }
});
