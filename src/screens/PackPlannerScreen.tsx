import { useNavigation, useRoute } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { DatePickerField } from "../components/DatePickerField";
import { Field } from "../components/FormControls";
import { PlannerItemCard } from "../components/PlannerItemCard";
import { PageHeader, PrimaryButton, SecondaryButton, SectionHeading, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useReady4Planner } from "../hooks/useReady4Planner";
import { activeItems, itemsForThisWeek, itemsForToday } from "../services/ready4PlannerEngine";
import { getPlannerConfig } from "../services/ready4PlannerConfigs";
import { formatDateInput } from "../services/reminderDates";
import { spacing } from "../theme/theme";
import type { PlannerItemType } from "../types/ready4Planner";

function parseQuickDate(dateText: string): string | null {
  const match = dateText.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) {
    return null;
  }
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day), 9, 0, 0, 0);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

export function PackPlannerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const packId = route.params?.packId as string;
  const {
    isReady,
    state,
    setStatus,
    updateItem,
    linkNudge,
    addItem,
    addAssignmentBreakdown,
    installedConfigs
  } = useReady4Planner();

  const config = getPlannerConfig(packId);
  const isInstalled = installedConfigs.some((entry) => entry.packId === packId);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [quickTitle, setQuickTitle] = useState("");
  const [quickDate, setQuickDate] = useState("");

  const packItems = useMemo(() => activeItems(state.items, packId), [state.items, packId]);
  const today = useMemo(() => itemsForToday(state.items, packId), [state.items, packId]);
  const week = useMemo(() => itemsForThisWeek(state.items, packId), [state.items, packId]);
  const nextBig = useMemo(() => {
    const upcoming = packItems
      .filter((item) => item.status !== "done")
      .filter((item) => item.dueAt || item.startAt)
      .sort((a, b) => (a.dueAt || a.startAt || "").localeCompare(b.dueAt || b.startAt || ""));
    return upcoming[0] ?? null;
  }, [packItems]);

  const sectionId = activeSectionId ?? config?.plannerSections[0]?.id ?? null;
  const sectionItems = packItems.filter((item) =>
    sectionId ? item.sectionId === sectionId || (!item.sectionId && sectionId === "custom") : true
  );

  const doneCount = packItems.filter((item) => item.status === "done").length;
  const openCount = packItems.filter((item) => item.status !== "done").length;

  function moveToTomorrow(itemId: string) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(15, 0, 0, 0);
    updateItem(itemId, { startAt: tomorrow.toISOString(), status: "moved" });
  }

  function addQuickInSection(titleOverride?: string) {
    const title = (titleOverride ?? quickTitle).trim();
    if (!title || !config) {
      return;
    }
    const section = config.plannerSections.find((entry) => entry.id === sectionId) ?? config.plannerSections[0];
    const type: PlannerItemType = section?.suggestedItemTypes[0] ?? "custom";
    const dueAt = parseQuickDate(quickDate);
    addItem({
      ready4PackId: packId,
      sectionId: section?.id ?? null,
      type,
      title,
      dueAt,
      status: "planned",
      priority: type === "deadline" || /exam/i.test(title) ? "important" : "normal",
      bringList: [],
      crewMemberIds: [],
      archived: false
    });
    setQuickTitle("");
    setQuickDate("");
  }

  if (!isReady) {
    return (
      <Screen showTabMenu={false}>
        <PageHeader title="Planner" showBack />
        <AppText variant="muted">Loading…</AppText>
      </Screen>
    );
  }

  if (!config) {
    return (
      <Screen showTabMenu={false}>
        <PageHeader title="Planner" showBack />
        <AppText variant="muted">This pack does not have a planner yet.</AppText>
      </Screen>
    );
  }

  if (!isInstalled) {
    return (
      <Screen showTabMenu={false}>
        <PageHeader title={config.title} showBack />
        <SoftCard style={styles.card}>
          <SectionHeading
            title="Install to use this planner"
            info={`Planner sections for ${config.title} only appear when the pack is installed.`}
          />
          <PrimaryButton onPress={() => navigation.navigate("ReadyPackPreview", { packId })}>
            Open pack
          </PrimaryButton>
        </SoftCard>
      </Screen>
    );
  }

  return (
    <Screen showTabMenu={false}>
      <PageHeader
        title={config.title}
        subtitle="Plan it once. See it where you need it."
        showBack
        helpText="Use sections for structure, or add freeform items in your own words. Link to nudges and calendar when you want a reminder."
      />

      <SoftCard style={styles.card}>
        <AppText variant="heading">At a glance</AppText>
        <AppText>Today: {today.length ? `${today.length} item${today.length === 1 ? "" : "s"}` : "clear"}</AppText>
        <AppText>
          This week: {week.length ? `${week.length} dated` : "nothing dated yet"}
        </AppText>
        <AppText>
          Next big thing: {nextBig ? nextBig.title : "Add something when you're ready"}
        </AppText>
        <AppText variant="muted">
          Progress: {doneCount} done · {openCount} still open
        </AppText>
      </SoftCard>

      <PrimaryButton onPress={() => navigation.navigate("PlannerQuickAdd", { packId })}>
        + Add something
      </PrimaryButton>
      <SecondaryButton size="compact" onPress={() => navigation.navigate("PlannerHub")}>
        See combined Today / This week
      </SecondaryButton>

      <View style={styles.sectionTabs}>
        {config.plannerSections.map((section) => (
          <SecondaryButton
            key={section.id}
            size="compact"
            onPress={() => setActiveSectionId(section.id)}
          >
            {section.title}
          </SecondaryButton>
        ))}
      </View>

      {config.plannerSections
        .filter((section) => section.id === sectionId)
        .map((section) => (
          <SoftCard key={section.id} style={styles.card}>
            <SectionHeading title={section.title} info={section.subtitle} />

            <Field
              label="Quick add in this section"
              value={quickTitle}
              onChangeText={setQuickTitle}
              placeholder="Your wording — e.g. Biology exam"
            />
            <DatePickerField
              label="Date (optional)"
              value={quickDate}
              onChangeText={setQuickDate}
              placeholder="DD-MM-YYYY"
            />
            <AppText variant="caption" style={styles.dateHint}>
              Add a date for exams and deadlines so Night before / Exam day lists can link here.
            </AppText>
            <SecondaryButton size="compact" onPress={() => addQuickInSection()} disabled={!quickTitle.trim()}>
              Add here
            </SecondaryButton>

            {section.suggestedTitles?.length ? (
              <View style={styles.suggestRow}>
                {section.suggestedTitles.slice(0, 4).map((title) => (
                  <SecondaryButton
                    key={title}
                    size="compact"
                    onPress={() => {
                      setQuickTitle(title);
                      if (!quickDate.trim()) {
                        const inAWeek = new Date();
                        inAWeek.setDate(inAWeek.getDate() + 7);
                        setQuickDate(formatDateInput(inAWeek));
                      }
                    }}
                  >
                    {title}
                  </SecondaryButton>
                ))}
              </View>
            ) : null}

            {packId === "ready4-study" && section.id === "assignments" ? (
              <SecondaryButton
                size="compact"
                onPress={() => {
                  const parent = sectionItems.find((item) => item.type === "assignment") ?? sectionItems[0];
                  addAssignmentBreakdown(parent?.title ?? "Assignment", parent?.dueAt ?? null, packId);
                }}
              >
                Break assignment into steps
              </SecondaryButton>
            ) : null}

            {sectionItems.length === 0 ? (
              <AppText variant="muted">Nothing here yet. Add something in your own words.</AppText>
            ) : (
              sectionItems.map((item) => (
                <PlannerItemCard
                  key={item.id}
                  item={item}
                  onDone={() => {
                    setStatus(item.id, "done");
                    if (item.type === "milestone") {
                      // Soft celebration via status only — copy on card when done.
                    }
                  }}
                  onMove={() => moveToTomorrow(item.id)}
                  onNotNeeded={() => setStatus(item.id, "not_needed")}
                  onStart={() => navigation.navigate("Tabs", { screen: "Focus" })}
                  onLinkNudge={() => linkNudge(item.id)}
                />
              ))
            )}
          </SoftCard>
        ))}

      {packId === "ready4-study" ? (
        <SoftCard style={styles.card}>
          <SectionHeading
            title="Revision rewards (optional)"
            info="Connect rewards yourself — nothing is automatic. Open Reward Bank when a session or topic feels worth celebrating."
          />
          <SecondaryButton size="compact" onPress={() => navigation.navigate("RewardBank")}>
            Open Reward Bank
          </SecondaryButton>
        </SoftCard>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.sm
  },
  sectionTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm
  },
  suggestRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  dateHint: {
    marginTop: -spacing.xs
  }
});
