import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AddTaskScreen } from "../screens/AddTaskScreen";
import { AppointmentsScreen } from "../screens/AppointmentsScreen";
import { AskForHelpScreen } from "../screens/AskForHelpScreen";
import { CaptureScreen } from "../screens/CaptureScreen";
import { ChoresScreen } from "../screens/ChoresScreen";
import { CircleScreen } from "../screens/CircleScreen";
import { DoneScreen } from "../screens/DoneScreen";
import { EventsScreen } from "../screens/EventsScreen";
import { FocusScreen } from "../screens/FocusScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { ItemDetailsScreen } from "../screens/ItemDetailsScreen";
import { LegalInfoScreen } from "../screens/LegalInfoScreen";
import { ListsScreen } from "../screens/ListsScreen";
import { MoreScreen } from "../screens/MoreScreen";
import { MyWorldScreen } from "../screens/MyWorldScreen";
import { AcceptInviteScreen } from "../screens/AcceptInviteScreen";
import { CrewsISupportScreen } from "../screens/CrewsISupportScreen";
import { InviteCrewScreen } from "../screens/InviteCrewScreen";
import { MyCrewScreen } from "../screens/MyCrewScreen";
import { NotesScreen } from "../screens/NotesScreen";
import { NudgyCrewScreen } from "../screens/NudgyCrewScreen";
import { OrganisationDashboardScreen } from "../screens/OrganisationDashboardScreen";
import { OccasionsScreen } from "../screens/OccasionsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { ProjectsScreen } from "../screens/ProjectsScreen";
import { RemindersScreen } from "../screens/RemindersScreen";
import { RoutinesScreen } from "../screens/RoutinesScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { SplashScreen } from "../screens/SplashScreen";
import { TaskBuddyScreen } from "../screens/TaskBuddyScreen";
import { TodayScreen } from "../screens/TodayScreen";
import { VoiceAddTaskScreen } from "../screens/VoiceAddTaskScreen";
import { colors } from "../theme/theme";
import type { RootStackParamList, TabParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tabs.Navigator tabBar={() => null} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Capture" component={CaptureScreen} options={{ title: "+nudge" }} />
      <Tabs.Screen name="Today" component={TodayScreen} />
      <Tabs.Screen name="Focus" component={FocusScreen} />
      <Tabs.Screen name="More" component={MoreScreen} />
    </Tabs.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text }
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="ItemDetails" component={ItemDetailsScreen} />
      <Stack.Screen name="AddTask" component={AddTaskScreen} />
      <Stack.Screen name="VoiceAddTask" component={VoiceAddTaskScreen} />
      <Stack.Screen name="TaskBuddy" component={TaskBuddyScreen} />
      <Stack.Screen name="Help" component={AskForHelpScreen} />
      <Stack.Screen name="Circle" component={CircleScreen} />
      <Stack.Screen name="MyWorld" component={MyWorldScreen} />
      <Stack.Screen name="Projects" component={ProjectsScreen} />
      <Stack.Screen name="Lists" component={ListsScreen} />
      <Stack.Screen name="Chores" component={ChoresScreen} />
      <Stack.Screen name="Reminders" component={RemindersScreen} />
      <Stack.Screen name="Routines" component={RoutinesScreen} />
      <Stack.Screen name="Events" component={EventsScreen} />
      <Stack.Screen name="Appointments" component={AppointmentsScreen} />
      <Stack.Screen name="Notes" component={NotesScreen} />
      <Stack.Screen name="Occasions" component={OccasionsScreen} />
      <Stack.Screen name="SpecialDays" component={OccasionsScreen} />
      <Stack.Screen name="NudgyCrew" component={NudgyCrewScreen} />
      <Stack.Screen name="MyCrew" component={MyCrewScreen} />
      <Stack.Screen name="CrewsISupport" component={CrewsISupportScreen} />
      <Stack.Screen name="OrganisationDashboard" component={OrganisationDashboardScreen} />
      <Stack.Screen name="InviteCrew" component={InviteCrewScreen} />
      <Stack.Screen name="AcceptInvite" component={AcceptInviteScreen} />
      <Stack.Screen name="Done" component={DoneScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="LegalInfo" component={LegalInfoScreen} />
    </Stack.Navigator>
  );
}
