import "react-native-gesture-handler";

import * as ExpoLinking from "expo-linking";
import { NavigationContainer, getStateFromPath as defaultGetStateFromPath, type LinkingOptions } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { lazy, Suspense, useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppProviders } from "./AppProviders";
import { AppLockGate } from "./components/AppLockGate";
import { AppSecurityProvider } from "./hooks/useAppSecurity";
import { navigationRef } from "./navigation/navigationRef";
import { RootNavigator } from "./navigation/RootNavigator";
import { getScreenshotInitialState, getScreenshotScreenId } from "./navigation/screenshotState";
import { parseInviteFromUrl } from "./services/crewInvites";
import { waitForSplashNative } from "./services/expoNotifications";
import { installNotificationHandler } from "./services/notifications";
import {
  isDeepLinkLockActive,
  stashPendingInvite,
  stashPendingRecoverToken
} from "./services/pendingDeepLinks";
import { completeAuthSessionAfterSplash } from "./services/socialSignIn";
import { colors } from "./theme/theme";
import type { RootStackParamList } from "./types/navigation";

const NativeMonitors = lazy(() =>
  import("./native/NativeMonitors").then((mod) => ({ default: mod.NativeMonitors }))
);

function extractInviteParams(url: string) {
  const parsed = parseInviteFromUrl(url);
  if (!parsed.inviteId) {
    return null;
  }
  let payload: string | undefined;
  try {
    const normalized = url.replace(/^nudge-me:\/\//i, "https://nudge-me.app/");
    payload = new URL(normalized).searchParams.get("d") ?? undefined;
  } catch {
    payload = undefined;
  }
  return { inviteId: parsed.inviteId, payload };
}

function extractRecoverToken(url: string) {
  try {
    const normalized = url.replace(/^nudge-me:\/\//i, "https://nudgemeready.app/");
    const parsed = new URL(normalized);
    const path = parsed.pathname.replace(/\/+$/, "").toLowerCase();
    if (path.endsWith("/recover") || path === "/recover") {
      return parsed.searchParams.get("t");
    }
    // nudge-me://recover?t=…
    if (parsed.hostname === "recover" || path === "recover") {
      return parsed.searchParams.get("t");
    }
  } catch {
    return null;
  }
  return null;
}

const appLinking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    ExpoLinking.createURL("/"),
    "nudge-me://",
    "nudge-me-v3://",
    "https://nudgemeready.app",
    "https://www.nudgemeready.app"
  ],
  config: {
    screens: {
      AcceptInvite: "invite/:inviteId",
      Splash: "splash",
      Settings: "settings",
      LegalInfo: "legal",
      CrewHub: "crew",
      InviteCrew: "invite-crew",
      Tabs: {
        path: "",
        screens: {
          Home: "home",
          Capture: "capture",
          Today: "today",
          Focus: "focus",
          More: "more"
        }
      }
    }
  },
  getStateFromPath(path, options) {
    const url = path.includes("://") ? path : `https://nudgemeready.app/${path.replace(/^\//, "")}`;
    const recoverToken = extractRecoverToken(url);
    if (recoverToken) {
      if (isDeepLinkLockActive()) {
        stashPendingRecoverToken(recoverToken);
      }
      return {
        routes: [{ name: "Splash", params: { recoverToken } }]
      };
    }
    const invite = extractInviteParams(url);
    if (invite) {
      if (isDeepLinkLockActive()) {
        stashPendingInvite(invite);
        return {
          routes: [{ name: "Splash" }]
        };
      }
      return {
        routes: [{ name: "AcceptInvite", params: invite }]
      };
    }
    if (isDeepLinkLockActive()) {
      // Keep locked users on Splash for other deep links (settings, etc.).
      return {
        routes: [{ name: "Splash" }]
      };
    }
    return defaultGetStateFromPath(path, options);
  }
};

function AppContent() {
  const [nativeReady, setNativeReady] = useState(false);

  useEffect(() => {
    completeAuthSessionAfterSplash();
    installNotificationHandler();
    let cancelled = false;
    void waitForSplashNative().then(() => {
      if (!cancelled) {
        setNativeReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <StatusBar style="dark" backgroundColor={colors.background} />
      <RootNavigator />
      {nativeReady ? (
        <Suspense fallback={null}>
          <NativeMonitors />
        </Suspense>
      ) : null}
    </>
  );
}

export default function NudgeApp() {
  const screenshotScreenId = Platform.OS === "web" ? getScreenshotScreenId() : undefined;
  const initialState = screenshotScreenId ? getScreenshotInitialState(screenshotScreenId) : undefined;
  const [linkingReady, setLinkingReady] = useState(Boolean(screenshotScreenId));

  useEffect(() => {
    if (screenshotScreenId) {
      return;
    }
    let cancelled = false;
    void waitForSplashNative().then(() => {
      if (!cancelled) {
        setLinkingReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [screenshotScreenId]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppSecurityProvider bypassLock={Boolean(screenshotScreenId)}>
          <AppProviders>
            <AppLockGate>
              <NavigationContainer
                ref={navigationRef}
                initialState={initialState}
                linking={screenshotScreenId || !linkingReady ? undefined : appLinking}
              >
                <AppContent />
              </NavigationContainer>
            </AppLockGate>
          </AppProviders>
        </AppSecurityProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
