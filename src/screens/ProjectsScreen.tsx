import { useNavigation } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";

import { CategoryChip, EmptyState, PageHeader, SoftCard } from "../components/NudgeComponents";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { mockContacts } from "../data/mockData";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { calculateProjectProgress, getChildrenForParent } from "../services/nudgeItems";
import { colors, spacing } from "../theme/theme";
import type { NudgeItem, NudgeItemType } from "../types/nudge";

const childSections: Array<{ title: string; types: NudgeItemType[] }> = [
  { title: "Subtasks", types: ["subtask"] },
  { title: "Appointments", types: ["appointment"] },
  { title: "Reminders", types: ["reminder"] },
  { title: "Notes", types: ["note"] },
  { title: "Lists", types: ["list"] },
  { title: "Documents", types: [] }
];

const childButtons = ["Add a small step", "Add reminder", "Add appointment", "Add note", "Add list"];

export function ProjectsScreen() {
  const { items } = useNudgeItems();
  const projects = items.filter((item) => item.type === "project" && item.status !== "done");

  return (
    <Screen>
      <PageHeader title="Big things, broken down." subtitle="You don't have to do it all at once." />
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} items={items} />
      ))}
      {!projects.length ? (
        <EmptyState title="Nothing added yet." message="Start with one small step." />
      ) : null}
    </Screen>
  );
}

function ProjectCard({ project, items }: { project: NudgeItem; items: NudgeItem[] }) {
  const navigation = useNavigation<any>();
  const children = getChildrenForParent(items, project.id);
  const subtasks = children.filter((child) => child.type === "subtask");
  const doneSubtasks = subtasks.filter((child) => child.status === "done").length;
  const progress = calculateProjectProgress(items, project.id);
  const hasChildren = Boolean(children.length || project.attachments.length);

  return (
    <SoftCard>
      <AppText variant="heading">{project.title}</AppText>
      <FieldRow label="Goal" value={project.notes ?? "A project with room to breathe."} />
      <FieldRow label="Target date" value={formatDate(project.dueDate) || "Pick this up later"} />
      <FieldRow label="Notes" value={project.notes ?? "Nothing extra yet."} />
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <AppText variant="muted">{doneSubtasks} of {subtasks.length || project.children.length} complete</AppText>
      <FieldRow label="Linked contacts" value={mockContacts.slice(0, 2).map((contact) => contact.name).join(", ")} />
      <FieldRow label="Attachments" value={project.attachments.length ? `${project.attachments.length} files` : "No attachments yet"} />

      {hasChildren ? childSections.map((section) => {
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
          <ChildSection key={section.title} title={section.title} items={sectionItems} parentName={project.title} />
        ) : null;
      }) : (
        <EmptyState title="Nothing added yet." message="Start with one small step." />
      )}

      <View style={styles.childButtons}>
        {childButtons.map((label) => (
          <CategoryChip
            key={label}
            label={label}
            onPress={() => navigation.navigate("ItemDetails", { draft: buildChildDraft(project, label) })}
          />
        ))}
      </View>
    </SoftCard>
  );
}

function buildChildDraft(project: NudgeItem, label: string): NudgeItem {
  const type = getChildType(label);
  const now = new Date().toISOString();
  return {
    id: `draft-${type}-${Date.now()}`,
    title: getChildTitle(label, project.title),
    type,
    status: "open",
    parentId: project.id,
    children: [],
    createdAt: now,
    updatedAt: now,
    attachments: [],
    listItems: [],
    progress: 0
  };
}

function getChildType(label: string): NudgeItemType {
  if (label.includes("reminder")) {
    return "reminder";
  }
  if (label.includes("appointment")) {
    return "appointment";
  }
  if (label.includes("note")) {
    return "note";
  }
  if (label.includes("list")) {
    return "list";
  }
  return "subtask";
}

function getChildTitle(label: string, projectTitle: string) {
  if (label === "Add a small step") {
    return `Small step for ${projectTitle}`;
  }
  return `${label.replace("Add ", "")} for ${projectTitle}`;
}

function ChildSection({ title, items, parentName }: { title: string; items: NudgeItem[]; parentName: string }) {
  return (
    <View style={styles.childSection}>
      <AppText variant="heading">{title}</AppText>
      {items.map((item) => (
        <View key={item.id} style={styles.childRow}>
          <View style={{ flex: 1 }}>
            <AppText>{item.title}</AppText>
            <AppText variant="small" style={{ color: colors.mutedText }}>Parent project: {parentName}</AppText>
          </View>
          <AppText variant="small">{formatStatus(item.status)}</AppText>
        </View>
      ))}
    </View>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldRow}>
      <AppText variant="small" style={styles.fieldLabel}>{label}</AppText>
      <AppText>{value}</AppText>
    </View>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
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
  childButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  }
});
