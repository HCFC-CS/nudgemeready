import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { CaptureScreen } from "../screens/CaptureScreen";
import { FocusScreen } from "../screens/FocusScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { MoreScreen } from "../screens/MoreScreen";
import { TodayScreen } from "../screens/TodayScreen";
import type { TabParamList } from "../types/navigation";

const Tabs = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  return (
    <Tabs.Navigator
      initialRouteName="Home"
      tabBar={() => null}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
      <Tabs.Screen name="Today" component={TodayScreen} options={{ title: "Nudges" }} />
      <Tabs.Screen name="Capture" component={CaptureScreen} options={{ title: "Add" }} />
      <Tabs.Screen name="More" component={MoreScreen} options={{ title: "Menu" }} />
      <Tabs.Screen name="Focus" component={FocusScreen} options={{ title: "Focus" }} />
    </Tabs.Navigator>
  );
}
