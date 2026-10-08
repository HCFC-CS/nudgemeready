import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "./Text";
import { SecondaryButton } from "./NudgeComponents";
import { formatDateInput } from "../services/reminderDates";
import {
  datedPlannerItemsForPack,
  formatPlannerEventChoice,
  listDueDateFromPlannerAnchor,
  listPlannerOffsetLabel,
  plannerItemAnchorIso
} from "../services/listPlannerAnchor";
import { colors, radii, spacing } from "../theme/theme";
import type { PlannerItem } from "../types/ready4Planner";

type Props = {
  packId?: string | null;
  packLabel?: string;
  offsetDays: number;
  selectedPlannerItemId?: string | null;
  plannerItems: PlannerItem[];
  onSelect: (payload: { plannerItemId: string; dueDateIso: string }) => void;
  onClear: () => void;
};

export function ListPlannerDateLink({
  packId,
  packLabel = "planner",
  offsetDays,
  selectedPlannerItemId,
  plannerItems,
  onSelect,
  onClear
}: Props) {
  const navigation = useNavigation<any>();
  const dated = datedPlannerItemsForPack(plannerItems, packId);
  const selected = dated.find((item) => item.id === selectedPlannerItemId) ?? null;
  const offsetLabel = listPlannerOffsetLabel(offsetDays);

  function choose(item: PlannerItem) {
    const anchor = plannerItemAnchorIso(item);
    if (!anchor) {
      return;
    }
    const dueDateIso = listDueDateFromPlannerAnchor(anchor, offsetDays);
    if (!dueDateIso) {
      return;
    }
    onSelect({ plannerItemId: item.id, dueDateIso });
  }

  return (
    <View style={styles.wrap}>
      <AppText style={styles.heading}>Date from {packLabel}</AppText>
      <AppText variant="caption" style={styles.hint}>
        Pick the event this list belongs to. We’ll set the date as {offsetLabel.toLowerCase()}.
      </AppText>

      {selected ? (
        <View style={styles.selectedRow}>
          <AppText style={styles.selectedText}>
            Linked: {formatPlannerEventChoice(selected, (iso) => formatDateInput(new Date(iso)))}
          </AppText>
          <Pressable accessibilityRole="button" onPress={onClear} hitSlop={8}>
            <AppText style={styles.clear}>Clear</AppText>
          </Pressable>
        </View>
      ) : null}

      {dated.length === 0 ? (
        <View style={styles.empty}>
          <AppText variant="muted">
            Add an exam or deadline with a date in the {packLabel} first, then choose it here.
          </AppText>
          {packId ? (
            <SecondaryButton
              size="compact"
              onPress={() => navigation.navigate("PackPlanner", { packId })}
            >
              Open {packLabel}
            </SecondaryButton>
          ) : null}
        </View>
      ) : (
        <View style={styles.choices}>
          {dated.map((item) => {
            const isSelected = item.id === selectedPlannerItemId;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => choose(item)}
                style={({ pressed }) => [
                  styles.choice,
                  isSelected && styles.choiceSelected,
                  pressed && styles.pressed
                ]}
              >
                <AppText style={isSelected ? styles.choiceLabelSelected : styles.choiceLabel}>
                  {formatPlannerEventChoice(item, (iso) => formatDateInput(new Date(iso)))}
                </AppText>
                <AppText variant="caption" style={styles.choiceMeta}>
                  {offsetLabel}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
    marginBottom: spacing.sm
  },
  heading: {
    fontWeight: "700",
    color: colors.text
  },
  hint: {
    color: colors.mutedText
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  selectedText: {
    flex: 1,
    color: colors.primaryDark,
    fontWeight: "600"
  },
  clear: {
    color: colors.link,
    fontWeight: "700"
  },
  empty: {
    gap: spacing.sm,
    paddingVertical: spacing.xs
  },
  choices: {
    gap: spacing.xs
  },
  choice: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.ivoryElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: 2
  },
  choiceSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  choiceLabel: {
    color: colors.text,
    fontWeight: "600"
  },
  choiceLabelSelected: {
    color: colors.primaryDark,
    fontWeight: "700"
  },
  choiceMeta: {
    color: colors.mutedText
  },
  pressed: {
    opacity: 0.88
  }
});
