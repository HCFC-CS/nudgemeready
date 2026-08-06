import type { PropsWithChildren } from "react";

import { CrewProvider } from "./hooks/useCrew";
import { CircleProvider } from "./hooks/useCircle";
import { HomeSettingsProvider } from "./hooks/useHomeSettings";
import { NudgeItemsProvider } from "./hooks/useNudgeItems";
import { ProfileProvider } from "./hooks/useProfile";
import { ReadyPacksProvider } from "./hooks/useReadyPacks";
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
                <ReadyPacksProvider>
                  <CircleProvider>{children}</CircleProvider>
                </ReadyPacksProvider>
              </NudgeItemsProvider>
            </CrewProvider>
          </TasksProvider>
        </HomeSettingsProvider>
      </VoiceCaptureSettingsProvider>
    </ProfileProvider>
  );
}
