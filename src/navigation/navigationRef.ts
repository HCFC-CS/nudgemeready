import { createNavigationContainerRef } from "@react-navigation/native";

import type { RootStackParamList } from "../types/navigation";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateToItemDetails(draft: RootStackParamList["ItemDetails"]["draft"]) {
  if (!navigationRef.isReady()) {
    return false;
  }
  navigationRef.navigate("ItemDetails", { draft });
  return true;
}
