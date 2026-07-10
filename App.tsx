import "react-native-gesture-handler";
import "./src/services/leavingHomeGeofence";

import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppProviders } from "./src/AppProviders";
import { useLeavingHomeMonitor } from "./src/hooks/useLeavingHomeMonitor";
import { useSpeakingReminderNotifications } from "./src/hooks/useSpeakingReminderNotifications";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { getScreenshotInitialState, getScreenshotScreenId } from "./src/navigation/screenshotState";
import { colors } from "./src/theme/theme";

function AppContent() {
  useSpeakingReminderNotifications();
  useLeavingHomeMonitor();

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
    <SafeAreaProvider>
      <AppProviders>
        <NavigationContainer initialState={initialState}>
          <AppContent />
        </NavigationContainer>
      </AppProviders>
    </SafeAreaProvider>
  );
}
