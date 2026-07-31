import type { PropsWithChildren } from "react";

import { CrewProvider } from "./hooks/useCrew";
import { CircleProvider } from "./hooks/useCircle";
import { HomeSettingsProvider } from "./hooks/useHomeSettings";
import { NudgeItemsProvider } from "./hooks/useNudgeItems";
import { ProfileProvider } from "./hooks/useProfile";
import { TasksProvider } from "./hooks/useTasks";
import { VoiceCaptureSettingsProvider } from "./hooks/useVoiceCaptureSettings";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ProfileProvider>
      <VoiceCaptureSettingsProvider>
        <HomeSettingsProvider>
          <TasksProvider>
            <CrewProvider>
              <NudgeItemsProvider>
                <CircleProvider>{children}</CircleProvider>
              </NudgeItemsProvider>
            </CrewProvider>
          </TasksProvider>
        </HomeSettingsProvider>
      </VoiceCaptureSettingsProvider>
    </ProfileProvider>
  );
}
