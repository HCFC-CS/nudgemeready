import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { ComponentType } from "react";

import { SplashScreen } from "../screens/SplashScreen";
import { colors } from "../theme/theme";
import type { RootStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

function loadScreen(loader: () => ComponentType<object>) {
  return loader;
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
      <Stack.Screen
        name="FirstRun"
        getComponent={loadScreen(() => require("../screens/FirstRunScreen").FirstRunScreen)}
      />
      <Stack.Screen
        name="Tabs"
        getComponent={loadScreen(() => require("./TabNavigator").TabNavigator)}
      />
      <Stack.Screen
        name="ItemDetails"
        getComponent={loadScreen(() => require("../screens/ItemDetailsScreen").ItemDetailsScreen)}
      />
      {/* Legacy TaskItem create flow — redirects to Capture */}
      <Stack.Screen
        name="AddTask"
        getComponent={loadScreen(
          () => require("../screens/LegacyCaptureRedirectScreen").LegacyCaptureRedirectScreen
        )}
      />
      <Stack.Screen
        name="VoiceAddTask"
        getComponent={loadScreen(
          () => require("../screens/LegacyCaptureRedirectScreen").LegacyCaptureRedirectScreen
        )}
      />
      <Stack.Screen
        name="TaskBuddy"
        getComponent={loadScreen(
          () => require("../screens/LegacyCaptureRedirectScreen").LegacyCaptureRedirectScreen
        )}
      />
      <Stack.Screen
        name="Help"
        getComponent={loadScreen(() => require("../screens/AskForHelpScreen").AskForHelpScreen)}
      />
      {/* Deep-link / alias routes → Crew hub */}
      <Stack.Screen
        name="Circle"
        getComponent={loadScreen(() => require("../screens/CrewHubScreen").CrewHubScreen)}
      />
      <Stack.Screen
        name="NudgyCrew"
        getComponent={loadScreen(() => require("../screens/CrewHubScreen").CrewHubScreen)}
      />
      <Stack.Screen
        name="MyCrew"
        getComponent={loadScreen(() => require("../screens/CrewHubScreen").CrewHubScreen)}
      />
      <Stack.Screen
        name="CrewsISupport"
        getComponent={loadScreen(() => require("../screens/CrewHubScreen").CrewHubScreen)}
      />
      <Stack.Screen
        name="CrewHub"
        getComponent={loadScreen(() => require("../screens/CrewHubScreen").CrewHubScreen)}
      />
      <Stack.Screen
        name="OrganisationDashboard"
        getComponent={loadScreen(
          () => require("../screens/OrganisationDashboardScreen").OrganisationDashboardScreen
        )}
      />
      <Stack.Screen
        name="InviteCrew"
        getComponent={loadScreen(() => require("../screens/InviteCrewScreen").InviteCrewScreen)}
      />
      <Stack.Screen
        name="AcceptInvite"
        getComponent={loadScreen(() => require("../screens/AcceptInviteScreen").AcceptInviteScreen)}
      />
      <Stack.Screen
        name="MyWorld"
        getComponent={loadScreen(() => require("../screens/MyWorldScreen").MyWorldScreen)}
      />
      <Stack.Screen
        name="Done"
        getComponent={loadScreen(() => require("../screens/DoneScreen").DoneScreen)}
      />
      <Stack.Screen
        name="Profile"
        getComponent={loadScreen(() => require("../screens/ProfileScreen").ProfileScreen)}
      />
      <Stack.Screen
        name="Settings"
        getComponent={loadScreen(() => require("../screens/SettingsScreen").SettingsScreen)}
      />
      <Stack.Screen
        name="ReadyPacks"
        getComponent={loadScreen(() => require("../screens/ReadyPacksScreen").ReadyPacksScreen)}
      />
      <Stack.Screen
        name="ReadyPackPreview"
        getComponent={loadScreen(
          () => require("../screens/ReadyPackPreviewScreen").ReadyPackPreviewScreen
        )}
      />
      <Stack.Screen
        name="RewardBank"
        getComponent={loadScreen(() => require("../screens/RewardBankScreen").RewardBankScreen)}
      />
      <Stack.Screen
        name="DidSomething"
        getComponent={loadScreen(() => require("../screens/DidSomethingScreen").DidSomethingScreen)}
      />
      <Stack.Screen
        name="Budget"
        getComponent={loadScreen(() => require("../screens/BudgetScreen").BudgetScreen)}
      />
      <Stack.Screen
        name="BudgetQuickAdd"
        getComponent={loadScreen(
          () => require("../screens/BudgetQuickAddScreen").BudgetQuickAddScreen
        )}
      />
      <Stack.Screen
        name="BudgetCategory"
        getComponent={loadScreen(
          () => require("../screens/BudgetCategoryScreen").BudgetCategoryScreen
        )}
      />
      <Stack.Screen
        name="BudgetItem"
        getComponent={loadScreen(() => require("../screens/BudgetItemScreen").BudgetItemScreen)}
      />
      <Stack.Screen
        name="BudgetGoals"
        getComponent={loadScreen(() => require("../screens/BudgetGoalsScreen").BudgetGoalsScreen)}
      />
      <Stack.Screen
        name="BudgetProject"
        getComponent={loadScreen(
          () => require("../screens/BudgetProjectScreen").BudgetProjectScreen
        )}
      />
      <Stack.Screen
        name="PlannerHub"
        getComponent={loadScreen(() => require("../screens/PlannerHubScreen").PlannerHubScreen)}
      />
      <Stack.Screen
        name="PackPlanner"
        getComponent={loadScreen(() => require("../screens/PackPlannerScreen").PackPlannerScreen)}
      />
      <Stack.Screen
        name="PlannerQuickAdd"
        getComponent={loadScreen(
          () => require("../screens/PlannerQuickAddScreen").PlannerQuickAddScreen
        )}
      />
      <Stack.Screen
        name="ComingUp"
        getComponent={loadScreen(() => require("../screens/ComingUpScreen").ComingUpScreen)}
      />
      <Stack.Screen
        name="DocumentsHub"
        getComponent={loadScreen(
          () => require("../screens/DocumentsHubScreen").DocumentsHubScreen
        )}
      />
      <Stack.Screen
        name="SavedThings"
        getComponent={loadScreen(() => require("../screens/SavedThingsScreen").SavedThingsScreen)}
      />
      <Stack.Screen
        name="CalendarHub"
        getComponent={loadScreen(() => require("../screens/CalendarHubScreen").CalendarHubScreen)}
      />
      <Stack.Screen
        name="LegalInfo"
        getComponent={loadScreen(() => require("../screens/LegalInfoScreen").LegalInfoScreen)}
      />
      <Stack.Screen
        name="TermsOfUse"
        getComponent={loadScreen(() => require("../screens/TermsOfUseScreen").TermsOfUseScreen)}
      />
      <Stack.Screen
        name="CrewTerms"
        getComponent={loadScreen(() => require("../screens/CrewTermsScreen").CrewTermsScreen)}
      />
      <Stack.Screen
        name="DevAdmin"
        getComponent={loadScreen(() => require("../screens/DevAdminScreen").DevAdminScreen)}
      />
    </Stack.Navigator>
  );
}
