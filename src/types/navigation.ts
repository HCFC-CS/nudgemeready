import type { NavigatorScreenParams } from "@react-navigation/native";

import type { TaskItem, TaskType } from "./models";
import type { NudgeItem } from "./nudge";

export type RootStackParamList = {
  Splash: { recoverToken?: string } | undefined;
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  ItemDetails: { draft: NudgeItem };
  AddTask: { draft?: Partial<TaskItem>; type?: TaskType } | undefined;
  VoiceAddTask: undefined;
  TaskBuddy: { taskId?: string; task?: TaskItem } | undefined;
  Help: undefined;
  Circle: undefined;
  MyWorld: undefined;
  Projects: undefined;
  Lists: undefined;
  Chores: undefined;
  Reminders: undefined;
  Routines: undefined;
  Events: undefined;
  Appointments: undefined;
  Notes: undefined;
  Occasions: undefined;
  SpecialDays: undefined;
  NudgyCrew: undefined;
  MyCrew: undefined;
  CrewsISupport: undefined;
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
};

export type TabParamList = {
  Home: undefined;
  Capture: undefined;
  Today: undefined;
  Focus: undefined;
  More: undefined;
};
