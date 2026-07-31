import { useEffect } from "react";
import { View, StyleSheet } from "react-native";

import { useAppSecurity } from "../hooks/useAppSecurity";
import { navigationRef } from "../navigation/navigationRef";
import {
  onDeepLinkUnlock,
  setDeepLinkLockActive,
  takePendingInvite
} from "../services/pendingDeepLinks";
import { colors } from "../theme/theme";

/**
 * Boots security and keeps the user on Splash while locked.
 * Unlock UI lives on SplashScreen (Face ID, PIN, or password).
 */
export function AppLockGate({ children }: { children: React.ReactNode }) {
  const { isReady, isLocked, settings } = useAppSecurity();
  const shouldGate = isReady && isLocked && settings.lockEnabled && settings.hasCredential;

  useEffect(() => {
    setDeepLinkLockActive(shouldGate);
  }, [shouldGate]);

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
    const timer = setTimeout(goToSignIn, 50);
    const retry = setTimeout(goToSignIn, 250);
    return () => {
      clearTimeout(timer);
      clearTimeout(retry);
    };
  }, [shouldGate]);

  useEffect(() => {
    if (shouldGate) {
      return;
    }
    return onDeepLinkUnlock(() => {
      const invite = takePendingInvite();
      if (!invite || !navigationRef.isReady()) {
        return;
      }
      navigationRef.navigate("AcceptInvite", invite);
    });
  }, [shouldGate]);

  if (!isReady) {
    return <View style={styles.boot} accessibilityLabel="Starting Nudge me Ready" />;
  }

  return <View style={styles.root}>{children}</View>;
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
