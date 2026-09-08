import type { PropsWithChildren } from "react";

import { CrewProvider } from "./hooks/useCrew";
import { AlexaLinkProvider } from "./hooks/useAlexaLink";
import { HomeSettingsProvider } from "./hooks/useHomeSettings";
import { NudgeItemsProvider } from "./hooks/useNudgeItems";
import { ProfileProvider } from "./hooks/useProfile";
import { ReadyPacksProvider } from "./hooks/useReadyPacks";
import { RewardBankProvider } from "./hooks/useRewardBank";
import { BudgetProvider } from "./hooks/useBudget";
import { Ready4PlannerProvider } from "./hooks/useReady4Planner";
import { VoiceCaptureSettingsProvider } from "./hooks/useVoiceCaptureSettings";

/** CircleProvider removed — Crew is the only support graph. */
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ProfileProvider>
      <VoiceCaptureSettingsProvider>
        <HomeSettingsProvider>
          <CrewProvider>
            <NudgeItemsProvider>
              <RewardBankProvider>
                <BudgetProvider>
                  <AlexaLinkProvider>
                    <ReadyPacksProvider>
                      <Ready4PlannerProvider>{children}</Ready4PlannerProvider>
                    </ReadyPacksProvider>
                  </AlexaLinkProvider>
                </BudgetProvider>
              </RewardBankProvider>
            </NudgeItemsProvider>
          </CrewProvider>
        </HomeSettingsProvider>
      </VoiceCaptureSettingsProvider>
    </ProfileProvider>
  );
}
