import { useEffect } from "react";
import { View, StyleSheet } from "react-native";

import { useAppSecurity } from "../hooks/useAppSecurity";
import { useProfile } from "../hooks/useProfile";
import { navigationRef } from "../navigation/navigationRef";
import {
  onDeepLinkUnlock,
  setDeepLinkLockActive,
  takePendingInvite
} from "../services/pendingDeepLinks";
import { colors } from "../theme/theme";

/**
 * Boots security and keeps the user on Splash while locked or unregistered.
 * Unlock / registration UI lives on SplashScreen.
 */
export function AppLockGate({ children }: { children: React.ReactNode }) {
  const { isReady, isLocked, settings } = useAppSecurity();
  const { isProfileReady, needsRegistration } = useProfile();
  const shouldLock = isReady && isLocked && settings.lockEnabled && settings.hasCredential;
  const shouldRegister = isProfileReady && needsRegistration;
  const shouldGate = shouldLock || shouldRegister;

  useEffect(() => {
    // Only stash deep links while locked — registration can still accept invites after profile is set.
    setDeepLinkLockActive(shouldLock);
  }, [shouldLock]);

  useEffect(() => {
    if (!shouldGate) {
      return;
    }

    const goToSplash = () => {
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

    goToSplash();
    const timer = setTimeout(goToSplash, 50);
    const retry = setTimeout(goToSplash, 250);
    return () => {
      clearTimeout(timer);
      clearTimeout(retry);
    };
  }, [shouldGate]);

  useEffect(() => {
    if (shouldLock) {
      return;
    }
    return onDeepLinkUnlock(() => {
      const invite = takePendingInvite();
      if (!invite || !navigationRef.isReady()) {
        return;
      }
      navigationRef.navigate("AcceptInvite", invite);
    });
  }, [shouldLock]);

  if (!isReady || !isProfileReady) {
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
