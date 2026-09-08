import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AskForHelpScreen } from "../screens/AskForHelpScreen";
import { CaptureScreen } from "../screens/CaptureScreen";
import { DoneScreen } from "../screens/DoneScreen";
import { DevAdminScreen } from "../screens/DevAdminScreen";
import { CrewTermsScreen } from "../screens/CrewTermsScreen";
import { FocusScreen } from "../screens/FocusScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { ItemDetailsScreen } from "../screens/ItemDetailsScreen";
import { LegalInfoScreen } from "../screens/LegalInfoScreen";
import { TermsOfUseScreen } from "../screens/TermsOfUseScreen";
import { MoreScreen } from "../screens/MoreScreen";
import { MyWorldScreen } from "../screens/MyWorldScreen";
import { AcceptInviteScreen } from "../screens/AcceptInviteScreen";
import { CrewHubScreen } from "../screens/CrewHubScreen";
import { InviteCrewScreen } from "../screens/InviteCrewScreen";
import { OrganisationDashboardScreen } from "../screens/OrganisationDashboardScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { ReadyPackPreviewScreen } from "../screens/ReadyPackPreviewScreen";
import { ReadyPacksScreen } from "../screens/ReadyPacksScreen";
import { RewardBankScreen } from "../screens/RewardBankScreen";
import { DidSomethingScreen } from "../screens/DidSomethingScreen";
import { BudgetScreen } from "../screens/BudgetScreen";
import { BudgetQuickAddScreen } from "../screens/BudgetQuickAddScreen";
import { BudgetCategoryScreen } from "../screens/BudgetCategoryScreen";
import { BudgetItemScreen } from "../screens/BudgetItemScreen";
import { BudgetGoalsScreen } from "../screens/BudgetGoalsScreen";
import { BudgetProjectScreen } from "../screens/BudgetProjectScreen";
import { PlannerHubScreen } from "../screens/PlannerHubScreen";
import { PackPlannerScreen } from "../screens/PackPlannerScreen";
import { PlannerQuickAddScreen } from "../screens/PlannerQuickAddScreen";
import { ComingUpScreen } from "../screens/ComingUpScreen";
import { DocumentsHubScreen } from "../screens/DocumentsHubScreen";
import { CalendarHubScreen } from "../screens/CalendarHubScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { SplashScreen } from "../screens/SplashScreen";
import { TodayScreen } from "../screens/TodayScreen";
import { LegacyCaptureRedirectScreen } from "../screens/LegacyCaptureRedirectScreen";
import { colors } from "../theme/theme";
import type { RootStackParamList, TabParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
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
      {/* Legacy TaskItem create flow — redirects to Capture */}
      <Stack.Screen name="AddTask" component={LegacyCaptureRedirectScreen} />
      <Stack.Screen name="VoiceAddTask" component={LegacyCaptureRedirectScreen} />
      <Stack.Screen name="TaskBuddy" component={LegacyCaptureRedirectScreen} />
      <Stack.Screen name="Help" component={AskForHelpScreen} />
      {/* Deep-link / alias routes → Crew hub */}
      <Stack.Screen name="Circle" component={CrewHubScreen} />
      <Stack.Screen name="NudgyCrew" component={CrewHubScreen} />
      <Stack.Screen name="MyCrew" component={CrewHubScreen} />
      <Stack.Screen name="CrewsISupport" component={CrewHubScreen} />
      <Stack.Screen name="CrewHub" component={CrewHubScreen} />
      <Stack.Screen name="OrganisationDashboard" component={OrganisationDashboardScreen} />
      <Stack.Screen name="InviteCrew" component={InviteCrewScreen} />
      <Stack.Screen name="AcceptInvite" component={AcceptInviteScreen} />
      <Stack.Screen name="MyWorld" component={MyWorldScreen} />
      <Stack.Screen name="Done" component={DoneScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ReadyPacks" component={ReadyPacksScreen} />
      <Stack.Screen name="ReadyPackPreview" component={ReadyPackPreviewScreen} />
      <Stack.Screen name="RewardBank" component={RewardBankScreen} />
      <Stack.Screen name="DidSomething" component={DidSomethingScreen} />
      <Stack.Screen name="Budget" component={BudgetScreen} />
      <Stack.Screen name="BudgetQuickAdd" component={BudgetQuickAddScreen} />
      <Stack.Screen name="BudgetCategory" component={BudgetCategoryScreen} />
      <Stack.Screen name="BudgetItem" component={BudgetItemScreen} />
      <Stack.Screen name="BudgetGoals" component={BudgetGoalsScreen} />
      <Stack.Screen name="BudgetProject" component={BudgetProjectScreen} />
      <Stack.Screen name="PlannerHub" component={PlannerHubScreen} />
      <Stack.Screen name="PackPlanner" component={PackPlannerScreen} />
      <Stack.Screen name="PlannerQuickAdd" component={PlannerQuickAddScreen} />
      <Stack.Screen name="ComingUp" component={ComingUpScreen} />
      <Stack.Screen name="DocumentsHub" component={DocumentsHubScreen} />
      <Stack.Screen name="CalendarHub" component={CalendarHubScreen} />
      <Stack.Screen name="LegalInfo" component={LegalInfoScreen} />
      <Stack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
      <Stack.Screen name="CrewTerms" component={CrewTermsScreen} />
      <Stack.Screen name="DevAdmin" component={DevAdminScreen} />
    </Stack.Navigator>
  );
}
