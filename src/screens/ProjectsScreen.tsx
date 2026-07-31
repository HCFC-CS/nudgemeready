import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { EmptyState, PageHeader, SoftCard } from "../components/NudgeComponents";
import { TypePill } from "../components/NudgeListRow";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { VoiceFieldActions } from "../components/VoiceFieldActions";
import { mockContacts } from "../data/mockData";
import { useNudgeActor } from "../hooks/useNudgeActor";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { calculateProjectProgress, createItem, getChildrenForParent } from "../services/nudgeItems";
import { formatDisplayDate } from "../services/reminderDates";
import { formatNudgeTypeLabel } from "../services/typeAccent";
import { colors, radii, shadows, spacing, taskTypeAccentColors } from "../theme/theme";
import type { NudgeItem, NudgeItemType } from "../types/nudge";

/** Every nudge type that can be added under a project (not another project). */
const PROJECT_CHILD_TYPES: NudgeItemType[] = [
  "subtask",
  "task",
  "reminder",
  "routine",
  "chore",
  "list",
  "event",
  "occasion",
  "note"
];

const childSections: Array<{ title: string; types: NudgeItemType[] }> = [
  { title: "Small steps", types: ["subtask", "task"] },
  { title: "Reminders", types: ["reminder"] },
  { title: "Routines", types: ["routine"] },
  { title: "Chores", types: ["chore"] },
  { title: "Lists", types: ["list"] },
  { title: "Events", types: ["event"] },
  { title: "Occasions", types: ["occasion", "special_day"] },
  { title: "Notes", types: ["note"] },
  { title: "Documents", types: [] }
];

export function ProjectsScreen() {
  const navigation = useNavigation<any>();
  const { items, saveItem } = useNudgeItems();
  const actor = useNudgeActor();
  const [newName, setNewName] = useState("");
  const projects = items.filter((item) => item.type === "project" && item.status !== "done");

  function openProject(project: NudgeItem) {
    navigation.navigate("ItemDetails", { draft: project });
  }

  function quickCreate() {
    const name = newName.trim();
    if (!name) {
      return;
    }
    const draft = createItem({
      type: "project",
      title: name,
      createdBy: actor,
      notes: ""
    });
    saveItem(draft);
    setNewName("");
    openProject(draft);
  }

  return (
    <Screen>
      <PageHeader title="Big things, broken down." subtitle="Add as many projects as you need." />

      <View style={styles.createBar}>
        <TextInput
          style={styles.createInput}
          value={newName}
          onChangeText={setNewName}
          placeholder="New project..."
          placeholderTextColor={colors.mutedText}
          returnKeyType="done"
          blurOnSubmit={false}
          onSubmitEditing={quickCreate}
        />
        <VoiceFieldActions value={newName} onChangeText={setNewName} size={28} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create project"
          onPress={quickCreate}
          style={({ pressed }) => [styles.createBtn, pressed && styles.pressed]}
        >
          <Ionicons name="add-circle" size={32} color={colors.accent} />
        </Pressable>
      </View>

      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} items={items} />
      ))}
      {!projects.length ? (
        <EmptyState title="No projects yet" message="Name a project above to get started." />
      ) : null}
    </Screen>
  );
}

function ProjectCard({ project, items }: { project: NudgeItem; items: NudgeItem[] }) {
  const navigation = useNavigation<any>();
  const children = getChildrenForParent(items, project.id);
  const actionable = children.filter((child) => child.type === "subtask" || child.type === "task");
  const doneCount = actionable.filter((child) => child.status === "done").length;
  const progress = calculateProjectProgress(items, project.id);
  const hasChildren = Boolean(children.length || project.attachments.length);

  return (
    <SoftCard>
      <Pressable onPress={() => navigation.navigate("ItemDetails", { draft: project })}>
        <AppText variant="heading">{project.title}</AppText>
      </Pressable>
      <FieldRow label="Goal" value={project.notes ?? "A project with room to breathe."} />
      <FieldRow label="Target date" value={formatDisplayDate(project.dueDate) || "Pick this up later"} />
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <AppText variant="muted">
        {doneCount} of {actionable.length || children.length} steps complete · {children.length} linked nudges
      </AppText>
      <FieldRow
        label="Linked contacts"
        value={mockContacts.slice(0, 2).map((contact) => contact.name).join(", ")}
      />

      {hasChildren ? (
        childSections.map((section) => {
          const sectionItems = section.types.length
            ? children.filter((child) => section.types.includes(child.type))
            : project.attachments.map((attachment) => ({
                id: attachment.id,
                title: attachment.name,
                type: "note" as const,
                status: "open" as const,
                children: [],
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
                attachments: [],
                listItems: [],
                progress: 0
              }));
          return sectionItems.length ? (
            <ChildSection
              key={section.title}
              title={section.title}
              items={sectionItems}
              parentName={project.title}
            />
          ) : null;
        })
      ) : (
        <EmptyState title="Nothing added yet." message="Add any nudge type below." />
      )}

      <AppText variant="caption" style={styles.addLabel}>
        Add to this project
      </AppText>
      <View style={styles.childButtons}>
        {PROJECT_CHILD_TYPES.map((type) => (
          <Pressable
            key={type}
            accessibilityRole="button"
            onPress={() =>
              navigation.navigate("ItemDetails", { draft: buildChildDraft(project, type) })
            }
            style={({ pressed }) => [
              styles.typeChip,
              { borderColor: `${getAccent(type)}55`, backgroundColor: `${getAccent(type)}14` },
              pressed && styles.typeChipPressed
            ]}
          >
            <AppText style={[styles.typeChipLabel, { color: getAccent(type) }]}>
              {formatNudgeTypeLabel(type)}
            </AppText>
          </Pressable>
        ))}
      </View>
    </SoftCard>
  );
}

function buildChildDraft(project: NudgeItem, type: NudgeItemType): NudgeItem {
  const now = new Date().toISOString();
  return {
    id: `draft-${type}-${Date.now()}`,
    title: "",
    type,
    status: "open",
    parentId: project.id,
    children: [],
    createdAt: now,
    updatedAt: now,
    attachments: [],
    listItems: [],
    progress: 0,
    notes: `For project: ${project.title}`
  };
}

function getAccent(type: NudgeItemType) {
  return taskTypeAccentColors[type] ?? colors.accent;
}

function ChildSection({
  title,
  items,
  parentName
}: {
  title: string;
  items: NudgeItem[];
  parentName: string;
}) {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.childSection}>
      <AppText variant="heading">{title}</AppText>
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => navigation.navigate("ItemDetails", { draft: item })}
          style={({ pressed }) => [styles.childRow, pressed && styles.childRowPressed]}
        >
          <View style={{ flex: 1, gap: 4 }}>
            <AppText>{item.title || "Untitled"}</AppText>
            <View style={styles.childMeta}>
              <TypePill type={item.type} />
              <AppText variant="caption" style={{ color: colors.mutedText }}>
                {parentName}
              </AppText>
            </View>
          </View>
          <AppText variant="small">{formatStatus(item.status)}</AppText>
        </Pressable>
      ))}
    </View>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldRow}>
      <AppText variant="small" style={styles.fieldLabel}>
        {label}
      </AppText>
      <AppText>{value}</AppText>
    </View>
  );
}

function formatStatus(status: NudgeItem["status"]) {
  if (status === "open") {
    return "Open";
  }
  if (status === "done") {
    return "Complete";
  }
  if (status === "waiting") {
    return "Waiting";
  }
  if (status === "paused") {
    return "Paused";
  }
  return "Set aside";
}

const styles = StyleSheet.create({
  createBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    ...shadows.sm
  },
  createInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.sm
  },
  createBtn: {
    alignItems: "center",
    justifyContent: "center"
  },
  pressed: {
    opacity: 0.85
  },
  fieldRow: {
    gap: spacing.xs
  },
  fieldLabel: {
    color: colors.mutedText,
    fontWeight: "800"
  },
  progressTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.secondary,
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
    backgroundColor: colors.primaryDark
  },
  childSection: {
    gap: spacing.sm,
    paddingTop: spacing.sm
  },
  childRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.md
  },
  childRowPressed: {
    opacity: 0.92
  },
  childMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm
  },
  addLabel: {
    color: colors.mutedText,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: spacing.sm
  },
  childButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  typeChip: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  typeChipPressed: {
    opacity: 0.88
  },
  typeChipLabel: {
    fontWeight: "700",
    fontSize: 13
  }
});
