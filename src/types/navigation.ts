import type { NavigatorScreenParams } from "@react-navigation/native";

import type { TaskItem, TaskType } from "./models";
import type { NudgeItem } from "./nudge";

export type RootStackParamList = {
  Splash: { recoverToken?: string } | undefined;
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  ItemDetails: { draft: NudgeItem };
  /** @deprecated Redirects to Capture — TaskItem create path retired. */
  AddTask: { draft?: Partial<TaskItem>; type?: TaskType } | undefined;
  /** @deprecated Redirects to Capture. */
  VoiceAddTask: undefined;
  /** @deprecated Redirects to Capture. */
  TaskBuddy: { taskId?: string; task?: TaskItem } | undefined;
  Help: undefined;
  /** Alias → CrewHub */
  Circle: undefined;
  MyWorld: undefined;
  /** Alias → CrewHub */
  NudgyCrew: undefined;
  /** Alias → CrewHub */
  MyCrew: undefined;
  /** Alias → CrewHub */
  CrewsISupport: undefined;
  CrewHub: undefined;
  OrganisationDashboard: undefined;
  InviteCrew: undefined;
  AcceptInvite: { inviteId?: string; payload?: string } | undefined;
  Done: undefined;
  Profile: undefined;
  Settings: undefined;
  LegalInfo: undefined;
  TermsOfUse: undefined;
  CrewTerms: undefined;
  DevAdmin: undefined;
  ReadyPacks: undefined;
  ReadyPackPreview: { packId: string };
  RewardBank: undefined;
  DidSomething: undefined;
  Budget: undefined;
  BudgetQuickAdd: { seed?: string } | undefined;
  BudgetCategory: { categoryId: string };
  BudgetItem: { itemId: string };
  BudgetGoals: undefined;
  BudgetProject: { budgetId: string };
  PlannerHub: undefined;
  PackPlanner: { packId: string };
  PlannerQuickAdd: { packId?: string; seed?: string } | undefined;
  ComingUp: { horizon?: import("./nudgeHorizon").NudgeHorizonId } | undefined;
  DocumentsHub: undefined;
  CalendarHub: undefined;
};

export type TabParamList = {
  Home: undefined;
  Capture: undefined;
  Today: { typeFilter?: "ready4" | "allTypes" } | undefined;
  Focus: undefined;
  More: undefined;
};
