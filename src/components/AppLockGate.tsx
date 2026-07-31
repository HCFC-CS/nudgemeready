import { useEffect } from "react";
import { View, StyleSheet } from "react-native";

import { useAppSecurity } from "../hooks/useAppSecurity";
import { navigationRef } from "../navigation/navigationRef";
import { colors } from "../theme/theme";

/**
 * Boots security and keeps the user on Splash while locked.
 * Unlock UI lives on SplashScreen (Face ID, PIN, or password).
 */
export function AppLockGate({ children }: { children: React.ReactNode }) {
  const { isReady, isLocked, settings } = useAppSecurity();
  const shouldGate = isReady && isLocked && settings.lockEnabled && settings.hasCredential;

  useEffect(() => {
    if (!shouldGate) {
      return;
    }

    const goToSignIn = () => {
      if (!navigationRef.isReady()) {
        return;
      }
      const route = navigationRef.getCurrentRoute();
      if (route?.name === "Splash") {
        return;
      }
      navigationRef.reset({
        index: 0,
        routes: [{ name: "Splash" }]
      });
    };

    goToSignIn();
    // Navigation may not be ready on the first lock tick after cold start.
    const timer = setTimeout(goToSignIn, 50);
    const retry = setTimeout(goToSignIn, 250);
    return () => {
      clearTimeout(timer);
      clearTimeout(retry);
    };
  }, [shouldGate]);

  if (!isReady) {
    return <View style={styles.boot} accessibilityLabel="Starting Nudge me Ready" />;
  }

  return (
    <View style={styles.root} accessibilityElementsHidden={false}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  boot: {
    flex: 1,
    backgroundColor: colors.background
  }
});
