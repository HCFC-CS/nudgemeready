import "react-native-gesture-handler";
import "./src/services/leavingHomeGeofence";

import * as ExpoLinking from "expo-linking";
import { NavigationContainer, getStateFromPath as defaultGetStateFromPath, type LinkingOptions } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppProviders } from "./src/AppProviders";
import { AppLockGate } from "./src/components/AppLockGate";
import { AppSecurityProvider } from "./src/hooks/useAppSecurity";
import { useLeavingHomeMonitor } from "./src/hooks/useLeavingHomeMonitor";
import { usePhoneCalendarImport } from "./src/hooks/usePhoneCalendarImport";
import { useSpeakingReminderNotifications } from "./src/hooks/useSpeakingReminderNotifications";
import { navigationRef } from "./src/navigation/navigationRef";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { getScreenshotInitialState, getScreenshotScreenId } from "./src/navigation/screenshotState";
import { parseInviteFromUrl } from "./src/services/crewInvites";
import {
  isDeepLinkLockActive,
  stashPendingInvite,
  stashPendingRecoverToken
} from "./src/services/pendingDeepLinks";
import { colors } from "./src/theme/theme";
import type { RootStackParamList } from "./src/types/navigation";

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
    "https://nudgemeready.app",
    "https://www.nudgemeready.app"
  ],
  config: {
    screens: {
      AcceptInvite: "invite/:inviteId",
      Splash: "splash",
      Settings: "settings",
      LegalInfo: "legal",
      MyCrew: "my-crew",
      CrewsISupport: "crews-i-support",
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
  useSpeakingReminderNotifications();
  useLeavingHomeMonitor();
  usePhoneCalendarImport();

  return (
    <>
      <StatusBar style="dark" backgroundColor={colors.background} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  const screenshotScreenId = Platform.OS === "web" ? getScreenshotScreenId() : undefined;
  const initialState = screenshotScreenId ? getScreenshotInitialState(screenshotScreenId) : undefined;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppSecurityProvider bypassLock={Boolean(screenshotScreenId)}>
          <AppProviders>
            <AppLockGate>
              <NavigationContainer
                ref={navigationRef}
                initialState={initialState}
                linking={screenshotScreenId ? undefined : appLinking}
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
