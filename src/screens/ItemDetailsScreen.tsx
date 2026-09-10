import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import { DocumentAttachmentsPanel } from "../components/DocumentAttachmentsPanel";
import { Field, ToggleRow } from "../components/FormControls";
import { FrequencyDropdown } from "../components/FrequencyDropdown";
import { CalendarLinkCard } from "../components/CalendarLinkCard";
import { DatePickerField } from "../components/DatePickerField";
import { DateTimeFields } from "../components/DateTimeFields";
import { EventPrepPlanner } from "../components/EventPrepPlanner";
import { GuestsEditor } from "../components/GuestsEditor";
import { ListPlannerDateLink } from "../components/ListPlannerDateLink";
import { LocationFinderField } from "../components/LocationFinderField";
import { TimePickerField } from "../components/TimePickerField";
import { OccasionShoppingPrompts } from "../components/OccasionShoppingPrompts";
import { HolidayTravelLinks } from "../components/HolidayTravelLinks";
import { AdhdDistractionLinks } from "../components/AdhdDistractionLinks";
import { ReadyPackShopLinks } from "../components/ReadyPackShopLinks";
import { PackProvenanceBanner } from "../components/PackProvenanceBanner";
import { NudgeFlowActions } from "../components/NudgeFlowActions";
import { TaskBreakdownSuggestions } from "../components/TaskBreakdownSuggestions";
import { MakeItSmallerCard } from "../components/MakeItSmallerCard";
import { SpeakingReminderPlayer } from "../components/SpeakingReminderPlayer";
import type { IoniconName } from "../components/iconTypes";
import {
  CategoryChip,
  ContactLink,
  PageHeaderWithEdit,
  PrimaryButton,
  ReminderPicker,
  SecondaryButton,
  SoftCard,
  VoiceCaptureButton
} from "../components/NudgeComponents";
import { ListShareSheet } from "../components/ListShareSheet";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { VoiceFieldActions } from "../components/VoiceFieldActions";
import type { MockContact } from "../data/mockData";
import { ItemEditProvider, useItemEdit } from "../hooks/useItemEdit";
import { READY_4_LABEL, READY_PACKS_SHOP_LABEL } from "../content/ready4Copy";
import { useCrew } from "../hooks/useCrew";
import { useNudgeItems } from "../hooks/useNudgeItems";
import { useReady4Planner } from "../hooks/useReady4Planner";
import { useReadyPacks } from "../hooks/useReadyPacks";
import { useRewardBank } from "../hooks/useRewardBank";
import { resolveItemCreator } from "../services/itemPermissions";
import { getDefaultGiftIdeas } from "../services/giftLinks";
import { getListSuggestions } from "../services/listSuggestions";
import { getUnsharedMembers, shareListWithMember, unshareListWithMember } from "../services/listSharing";
import { defaultEventPrepSteps } from "../services/eventPrepTimeline";
import { getLocationLabel } from "../services/placeSearch";
import { formatDateInput, formatTimeInput, getReminderAt, getReminderParts } from "../services/reminderDates";
import { createItem, getChildrenForParent } from "../services/nudgeItems";
import { difficultyFromEffort } from "../types/rewards";
import {
  buildBreakdownListItems,
  buildStepReminderSchedule,
  formatBreakdownNotes,
  type TaskBreakdownPlan
} from "../services/taskBreakdowns";
import { isWhatHelpsTemplate, resolveWhatHelpsItemId } from "../services/ready4WhatHelps";
import {
  APPOINTMENT_REMINDER_OPTIONS,
  appointmentStartAt,
  detectSelectedAppointmentReminders,
  syncAppointmentReminderChildren,
  type AppointmentReminderOption
} from "../services/appointmentReminders";
import { getPlannerConfig } from "../services/ready4PlannerConfigs";
import { removeItemFromPhoneCalendar, syncItemToPhoneCalendar } from "../services/calendarSync";
import { formatNudgeTypeLabel } from "../services/typeAccent";
import { colors, radii, shadows, spacing, taskTypeAccentColors } from "../theme/theme";
import type {
  AppointmentGuest,
  ListShare,
  NudgeAttachment,
  NudgeItem,
  NudgeItemStatus,
  NudgeItemType,
  NudgeLocation,
  NudgeRepeatRule,
  EventPrepStep
} from "../types/nudge";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "ItemDetails">;

export function ItemDetailsScreen(props: Props) {
  const draft = props.route.params.draft;
  return (
    <ItemEditProvider item={draft}>
      <ItemDetailsScreenContent {...props} />
    </ItemEditProvider>
  );
}

function ItemDetailsScreenContent({ navigation, route }: Props) {
  const draft = route.params.draft;
  const { saveItem, items, deleteNudgeItem } = useNudgeItems();
  const { earn } = useRewardBank();
  const { installState, packs } = useReadyPacks();
  const { state: plannerState, updateItem: updatePlannerItem } = useReady4Planner();
  const { myCrewMembers, activeProfile } = useCrew();
  const { editable, isLocked } = useItemEdit();
  const [title, setTitle] = useState(draft.title);
  const [when, setWhen] = useState(formatDateValue(draft.startDate ?? draft.dueDate ?? draft.reminderDate));
  const [where, setWhere] = useState(draft.location?.label ?? draft.location?.address ?? "");
  const [reminder, setReminder] = useState(formatDateValue(draft.reminderDate));
  const [notes, setNotes] = useState(draft.notes ?? "");
  const [voiceNoteUrl, setVoiceNoteUrl] = useState(draft.voiceNoteUrl ?? "");
  const [anchorPlannerItemId, setAnchorPlannerItemId] = useState(draft.anchorPlannerItemId);
  const dueDaysBeforePlannerEvent = useMemo(() => {
    if (draft.dueDaysBeforePlannerEvent !== undefined) {
      return draft.dueDaysBeforePlannerEvent;
    }
    const pack = packs.find((entry) => entry.id === draft.sourcePackId);
    const template = pack?.content.templates.find((entry) => entry.id === draft.sourceTemplateId);
    return template?.dueDaysBeforePlannerEvent ?? 0;
  }, [draft.dueDaysBeforePlannerEvent, draft.sourcePackId, draft.sourceTemplateId, packs]);
  const [forWhat, setForWhat] = useState(getSuggestedForWhat(draft.title));
  const [selectedWhen, setSelectedWhen] = useState("");
  const [selectedReminder, setSelectedReminder] = useState(reminder || "No reminder");
  const [linkedContact, setLinkedContact] = useState<MockContact | undefined>();
  const [appointmentTime, setAppointmentTime] = useState(formatTimeValue(draft.startDate));
  const [travelTime, setTravelTime] = useState("");
  const [appointmentReminders, setAppointmentReminders] = useState<AppointmentReminderOption[]>(() => {
    const existing = detectSelectedAppointmentReminders(getChildrenForParent(items, draft.id));
    return existing.length ? existing : ["1 day before", "1 hour before"];
  });
  const customApptReminderParts = getReminderParts(
    getChildrenForParent(items, draft.id).find((child) => child.sourceTemplateId === "appt-pre-custom")?.reminderDate
  );
  const [customApptReminderDate, setCustomApptReminderDate] = useState(customApptReminderParts.date);
  const [customApptReminderTime, setCustomApptReminderTime] = useState(
    customApptReminderParts.time || "09:00"
  );
  const [reminderDate, setReminderDate] = useState(formatDateValue(draft.reminderDate ?? draft.dueDate));
  const [reminderTime, setReminderTime] = useState(formatTimeValue(draft.reminderDate ?? draft.dueDate));
  const [notificationOption, setNotificationOption] = useState("Push");
  const [repeatOption, setRepeatOption] = useState(formatRepeatValue(draft.repeatRule));
  const [routineFrequency, setRoutineFrequency] = useState(formatRoutineFrequency(draft.repeatRule));
  const [customFrequencyText, setCustomFrequencyText] = useState(getInitialCustomFrequencyText(draft.repeatRule));
  const [routineTime, setRoutineTime] = useState(formatTimeValue(draft.reminderDate));
  const [linkedParent, setLinkedParent] = useState(draft.parentId ? "Linked item" : "");
  const [repeatsYearly, setRepeatsYearly] = useState(
    draft.repeatRule?.frequency === "yearly" || draft.type === "occasion" || draft.type === "special_day"
  );
  const [giftIdeas, setGiftIdeas] = useState(getInitialGiftIdeas(draft));
  const [newGiftIdea, setNewGiftIdea] = useState("");
  const cardReminderParts = getReminderParts(draft.cardReminderAt);
  const giftReminderParts = getReminderParts(draft.giftReminderAt);
  const [needsCard, setNeedsCard] = useState(draft.needsCard ?? false);
  const [needsPresent, setNeedsPresent] = useState(draft.needsPresent ?? false);
  const [cardReminderDate, setCardReminderDate] = useState(cardReminderParts.date);
  const [cardReminderTime, setCardReminderTime] = useState(cardReminderParts.time || "09:00");
  const [giftReminderDate, setGiftReminderDate] = useState(giftReminderParts.date);
  const [giftReminderTime, setGiftReminderTime] = useState(giftReminderParts.time || "09:00");
  const [projectGoal, setProjectGoal] = useState(draft.type === "project" ? draft.notes ?? "" : "");
  const [noteFollowUp, setNoteFollowUp] = useState("No follow-up");
  const [plans, setPlans] = useState("");
  const [budget, setBudget] = useState("");
  const [specialDayReminders, setSpecialDayReminders] = useState([
    "1 month before",
    "2 weeks before",
    "1 week before",
    "1 day before"
  ]);
  const [listItems, setListItems] = useState(
    getInitialListItems(draft).map((item, index) => ({
      id: item.id || `list-item-${index}`,
      title: item.title,
      status: item.status
    }))
  );
  const [newListItem, setNewListItem] = useState("");
  const [voiceListInput, setVoiceListInput] = useState("");
  const [sharedWith, setSharedWith] = useState<ListShare[]>(draft.sharedWith ?? []);
  const [shareOpen, setShareOpen] = useState(false);
  const [showReminderContact, setShowReminderContact] = useState(Boolean(draft.contactId || draft.contactName));
  const [showReminderNotes, setShowReminderNotes] = useState(Boolean(draft.notes));
  const [speakingReminderText, setSpeakingReminderText] = useState(draft.speakingReminderText ?? "");
  const [nudgeEveryTenMinutesUntilDone, setNudgeEveryTenMinutesUntilDone] = useState(
    draft.nudgeEveryTenMinutesUntilDone ?? false
  );
  const [notifyNudgerIfNotDone, setNotifyNudgerIfNotDone] = useState(draft.notifyNudgerIfNotDone ?? false);
  const [homeWhere, setHomeWhere] = useState<NudgeLocation | undefined>(draft.homeLocation);
  const [venueLocation, setVenueLocation] = useState<NudgeLocation | undefined>(draft.location);
  const [eventTravelMinutes, setEventTravelMinutes] = useState(draft.eventTravelMinutes ?? 60);
  const [eventReadyMinutes, setEventReadyMinutes] = useState(draft.eventReadyMinutes ?? 15);
  const [eventPrepSteps, setEventPrepSteps] = useState<EventPrepStep[]>(
    draft.eventPrepSteps?.length ? draft.eventPrepSteps : defaultEventPrepSteps
  );
  const [attachments, setAttachments] = useState<NudgeAttachment[]>(draft.attachments ?? []);
  const [guests, setGuests] = useState<AppointmentGuest[]>(draft.guests ?? []);
  const [syncToCalendar, setSyncToCalendar] = useState(
    draft.syncToCalendar ?? (draft.type === "appointment" || draft.type === "event")
  );
  const [calendarId, setCalendarId] = useState(draft.calendarId);
  const [calendarEventId, setCalendarEventId] = useState(draft.calendarEventId);
  const [notice, setNotice] = useState("");
  const listSuggestions = useMemo(
    () => (draft.type === "list" ? getListSuggestions(title, listItems) : null),
    [draft.type, title, listItems]
  );

  function buildSavedItem(status: NudgeItemStatus = draft.status): NudgeItem {
    return {
      ...draft,
      title: title.trim() || draft.title,
      status,
      createdBy: resolveItemCreator(draft),
      isLocked,
      updatedAt: new Date().toISOString(),
      dueDate:
        draft.type === "list"
          ? when.trim()
            ? resolveDateValue(draft.dueDate, when)
            : undefined
          : resolveDateValue(draft.dueDate, when),
      startDate:
        draft.type === "appointment" || draft.type === "event"
          ? resolveDateValue(draft.startDate, when, appointmentTime)
          : draft.type === "project" || draft.type === "occasion" || draft.type === "special_day"
            ? resolveDateValue(draft.startDate ?? draft.dueDate, when)
            : draft.startDate,
      reminderDate: resolveReminderDate(draft, reminder, reminderDate, reminderTime),
      location:
        draft.type === "event"
          ? venueLocation
          : where
            ? { label: where, address: where, latitude: draft.location?.latitude, longitude: draft.location?.longitude }
            : draft.location,
      homeLocation: draft.type === "event" ? homeWhere : draft.homeLocation,
      eventTravelMinutes: draft.type === "event" ? eventTravelMinutes : draft.eventTravelMinutes,
      eventReadyMinutes: draft.type === "event" ? eventReadyMinutes : draft.eventReadyMinutes,
      eventPrepSteps: draft.type === "event" ? eventPrepSteps : draft.eventPrepSteps,
      contactId: linkedContact?.id ?? draft.contactId,
      contactName: linkedContact?.name ?? draft.contactName,
      contactPhone: linkedContact?.phone ?? draft.contactPhone,
      contactEmail: linkedContact?.email ?? draft.contactEmail,
      notes: draft.type === "project" ? [projectGoal, notes].filter(Boolean).join("\n") : notes,
      voiceNoteUrl: voiceNoteUrl || draft.voiceNoteUrl,
      speakingReminderText: draft.type === "reminder" ? speakingReminderText.trim() || undefined : draft.speakingReminderText,
      nudgeEveryTenMinutesUntilDone:
        draft.type === "reminder" ? nudgeEveryTenMinutesUntilDone : draft.nudgeEveryTenMinutesUntilDone,
      notifyNudgerIfNotDone: draft.type === "reminder" ? notifyNudgerIfNotDone : draft.notifyNudgerIfNotDone,
      repeatRule: buildRepeatRule(draft, repeatOption, routineFrequency, customFrequencyText),
      listItems:
        draft.type === "list" ||
        draft.type === "routine" ||
        draft.type === "chore" ||
        draft.type === "task" ||
        draft.type === "subtask"
          ? listItems
          : draft.listItems,
      sharedWith: draft.type === "list" ? sharedWith : draft.sharedWith,
      needsCard: isOccasionLike(draft.type) ? needsCard : draft.needsCard,
      needsPresent: isOccasionLike(draft.type) ? needsPresent : draft.needsPresent,
      cardReminderAt:
        isOccasionLike(draft.type) && needsCard ? getReminderAt(cardReminderDate, cardReminderTime) : undefined,
      giftReminderAt:
        isOccasionLike(draft.type) && needsPresent ? getReminderAt(giftReminderDate, giftReminderTime) : undefined,
      attachments,
      guests: draft.type === "appointment" || draft.type === "event" ? guests : draft.guests,
      syncToCalendar:
        draft.type === "appointment" || draft.type === "event" ? syncToCalendar : draft.syncToCalendar,
      calendarId: draft.type === "appointment" || draft.type === "event" ? calendarId : draft.calendarId,
      calendarEventId:
        draft.type === "appointment" || draft.type === "event" ? calendarEventId : draft.calendarEventId,
      anchorPlannerItemId: draft.type === "list" ? anchorPlannerItemId : draft.anchorPlannerItemId,
      dueDaysBeforePlannerEvent:
        draft.type === "list" ? dueDaysBeforePlannerEvent : draft.dueDaysBeforePlannerEvent
    };
  }

  function renderDocumentsSection() {
    return (
      <DocumentAttachmentsPanel
        itemId={draft.id}
        attachments={attachments}
        onChange={setAttachments}
        editable={editable}
      />
    );
  }


  function renderReadyPackOutboundLinks() {
    return (
      <>
        <HolidayTravelLinks
          sourcePackId={draft.sourcePackId}
          sourceTemplateId={draft.sourceTemplateId}
          title={title}
          notes={notes}
          locationLabel={where}
        />
        <AdhdDistractionLinks
          sourcePackId={draft.sourcePackId}
          sourceTemplateId={draft.sourceTemplateId}
          title={title}
          notes={notes}
        />
        <ReadyPackShopLinks
          sourcePackId={draft.sourcePackId}
          sourceTemplateId={draft.sourceTemplateId}
          title={title}
          notes={notes}
        />
      </>
    );
  }

  function renderPackProvenance() {
    return <PackProvenanceBanner sourcePackId={draft.sourcePackId} userEdited={draft.userEdited} />;
  }

  async function saveAndOpenWorld(status = draft.status) {
    if (!editable) {
      return;
    }
    let saved = buildSavedItem(status);

    if (draft.type === "note" && noteFollowUp === "Turn into task") {
      saved = { ...saved, type: "task" };
    } else if (draft.type === "note" && noteFollowUp === "Add reminder") {
      const reminder = createItem({
        type: "reminder",
        title: saved.title,
        notes: saved.notes,
        createdBy: saved.createdBy,
        parentId: saved.id,
        speakingReminderText: saved.notes || saved.title,
        nudgeEveryTenMinutesUntilDone: true
      });
      saveItem(saved);
      saveItem(reminder);
      navigation.navigate("ItemDetails", { draft: reminder });
      return;
    }

    if ((saved.type === "appointment" || saved.type === "event") && saved.syncToCalendar) {
      const result = await syncItemToPhoneCalendar(saved, calendarId);
      if (result.ok) {
        saved = {
          ...saved,
          calendarEventId: result.calendarEventId,
          calendarId: result.calendarId || calendarId,
          syncToCalendar: true
        };
        setCalendarEventId(result.calendarEventId);
        if (result.calendarId) {
          setCalendarId(result.calendarId);
        }
        setNotice(
          result.method === "calendar"
            ? `Linked to ${result.calendarLabel}.`
            : "Calendar file ready to save into your email calendar."
        );
      } else {
        setNotice(result.message);
      }
    } else if (
      (saved.type === "appointment" || saved.type === "event") &&
      !saved.syncToCalendar &&
      calendarEventId
    ) {
      await removeItemFromPhoneCalendar(calendarEventId);
      saved = { ...saved, calendarEventId: undefined };
      setCalendarEventId(undefined);
    }

    saveItem(saved);
    syncAppointmentRemindersFor(saved);
    navigation.navigate("Tabs", { screen: "Today" });
  }

  function syncAppointmentRemindersFor(saved: NudgeItem) {
    if (saved.type !== "appointment") {
      return;
    }
    const appointmentAt = appointmentStartAt(when, appointmentTime, saved.startDate);
    if (!appointmentAt) {
      return;
    }
    const { upsert, cancel } = syncAppointmentReminderChildren({
      parent: saved,
      appointmentAt,
      selected: appointmentReminders,
      existingChildren: getChildrenForParent(items, saved.id),
      customReminderIso: getReminderAt(customApptReminderDate, customApptReminderTime),
      actor: saved.createdBy
    });
    for (const child of upsert) {
      saveItem(child);
    }
    for (const child of cancel) {
      saveItem({ ...child, status: "cancelled", updatedAt: new Date().toISOString() });
    }
  }

  function finishItem(goToDoneScreen: boolean) {
    if (!editable) {
      return;
    }
    if (draft.status !== "done") {
      earn({
        difficulty: difficultyFromEffort(draft.estimatedEffort),
        title: title.trim() || draft.title,
        kind: "task",
        packId: draft.sourcePackId,
        sourceItemId: draft.id
      });
    }
    saveItem(buildSavedItem("done"));
    if (goToDoneScreen) {
      navigation.navigate("Done");
      return;
    }
    navigation.goBack();
  }

  function snoozeForLater() {
    if (!editable) {
      return;
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const iso = tomorrow.toISOString();
    saveItem({
      ...buildSavedItem("open"),
      dueDate: iso,
      reminderDate: iso
    });
    navigation.goBack();
  }

  function removeItem() {
    if (!editable) {
      return;
    }
    deleteNudgeItem(draft.id);
    navigation.goBack();
  }

  function applyTaskBreakdown(plan: TaskBreakdownPlan) {
    if (!editable) {
      return;
    }
    const start = new Date();
    const nextTitle = title.trim() || plan.label;
    const nextNotes = formatBreakdownNotes(plan);
    const nextListItems = buildBreakdownListItems(plan);
    setTitle(nextTitle);
    setNotes(nextNotes);
    setListItems(nextListItems);
    setNotice(`Gentle plan applied: ${plan.steps.length} steps with short breaks.`);

    const parentSnapshot = {
      ...buildSavedItem("open"),
      title: nextTitle,
      notes: nextNotes,
      listItems: nextListItems,
      energyLevel: "low" as const,
      estimatedEffort: "medium" as const,
      dueDate: new Date(start.getTime() + plan.totalMinutes * 60_000).toISOString()
    };

    const schedule = buildStepReminderSchedule(plan, start);
    const children = schedule.map((step) =>
      createItem({
        type: "reminder",
        title: step.title,
        parentId: draft.id,
        createdBy: parentSnapshot.createdBy,
        reminderDate: step.at.toISOString(),
        speakingReminderText: step.speakingReminderText,
        notes: "Gentle next-step cue. Snooze or skip anytime."
      })
    );

    saveItem({
      ...parentSnapshot,
      children: [...new Set([...(parentSnapshot.children ?? []), ...children.map((child) => child.id)])]
    });
    for (const child of children) {
      saveItem(child);
    }
  }

  function askForHelp() {
    navigation.navigate("Help");
  }

  function renderStepRemindersCard() {
    const stepReminders = getChildrenForParent(items, draft.id).filter(
      (child) => child.type === "reminder" && child.status !== "done" && child.status !== "cancelled"
    );
    if (!stepReminders.length) {
      return null;
    }
    return (
      <SoftCard>
        <AppText variant="heading">Step reminders</AppText>
        <AppText variant="muted">Gentle cues to start the next small step. Snooze or skip anytime.</AppText>
        {stepReminders.map((child) => (
          <Pressable
            key={child.id}
            accessibilityRole="button"
            accessibilityLabel={`Open step reminder ${child.title}`}
            onPress={() => navigation.navigate("ItemDetails", { draft: child })}
            style={styles.stepReminderRow}
          >
            <AppText style={styles.stepReminderTitle}>{child.title}</AppText>
            {child.reminderDate ? (
              <AppText variant="caption">
                {formatDateInput(new Date(child.reminderDate))} · {formatTimeInput(new Date(child.reminderDate))}
              </AppText>
            ) : null}
          </Pressable>
        ))}
      </SoftCard>
    );
  }

  function persistListItems(next: typeof listItems) {
    setListItems(next);
    if (editable) {
      saveItem({ ...buildSavedItem(), listItems: next });
    }
  }

  function toggleListItemDone(itemId: string) {
    const next = listItems.map((item) =>
      item.id === itemId ? { ...item, status: item.status === "done" ? ("open" as const) : ("done" as const) } : item
    );
    persistListItems(next);
  }

  function renderItemOptions(onSave: () => void) {
    return (
      <NudgeFlowActions
        editable={editable}
        itemTitle={title}
        onSave={onSave}
        onSorted={() => finishItem(true)}
        onLater={snoozeForLater}
        onAskHelp={askForHelp}
        onRemove={removeItem}
      />
    );
  }

  function openWhatHelpsTarget(rowTitle: string) {
    const packId = draft.sourcePackId;
    const templateItemIds = packId ? installState.installed[packId]?.templateItemIds : undefined;
    const itemsById = new Map(items.map((item) => [item.id, item]));
    const resolved = resolveWhatHelpsItemId(packId, rowTitle, templateItemIds, itemsById);
    if (resolved.restOutcome) {
      setNotice("Rest is a valid choice. Nothing else needed right now.");
      return;
    }
    if (!resolved.itemId) {
      setNotice(`That tool is not installed yet. Re-open ${READY_PACKS_SHOP_LABEL} and update this pack if needed.`);
      return;
    }
    const target = items.find((item) => item.id === resolved.itemId);
    if (!target) {
      setNotice(`Could not find that tool just now. Try Nudges → ${READY_4_LABEL}, or open ${READY_PACKS_SHOP_LABEL} from Menu.`);
      return;
    }
    navigation.navigate("ItemDetails", { draft: target });
  }

  function renderChecklistCard(heading = "Steps") {
    if (!listItems.length) {
      return null;
    }
    const doneCount = listItems.filter((item) => item.status === "done").length;
    const triageMode = isWhatHelpsTemplate(draft.sourceTemplateId);
    return (
      <SoftCard>
        <AppText variant="heading">{heading}</AppText>
        <AppText variant="muted">
          {triageMode
            ? `${doneCount}/${listItems.length} noted · pick one, then open that tool`
            : `${doneCount}/${listItems.length} done · tick as you go — saves automatically`}
        </AppText>
        {listItems.map((item) => {
          const canOpen =
            triageMode &&
            resolveWhatHelpsItemId(
              draft.sourcePackId,
              item.title,
              draft.sourcePackId ? installState.installed[draft.sourcePackId]?.templateItemIds : undefined
            ).itemId;
          const isRest =
            triageMode &&
            resolveWhatHelpsItemId(
              draft.sourcePackId,
              item.title,
              draft.sourcePackId ? installState.installed[draft.sourcePackId]?.templateItemIds : undefined
            ).restOutcome;
          return (
            <View key={item.id} style={styles.checklistRowWrap}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: item.status === "done" }}
                onPress={() => toggleListItemDone(item.id)}
                style={styles.checklistRow}
              >
                <View style={[styles.checklistBox, item.status === "done" && styles.checklistBoxDone]}>
                  {item.status === "done" ? (
                    <Ionicons name="checkmark" size={14} color={colors.onPrimary} />
                  ) : null}
                </View>
                <AppText style={item.status === "done" ? styles.checklistDone : undefined}>{item.title}</AppText>
              </Pressable>
              {triageMode && (canOpen || isRest) ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={isRest ? "Rest is enough" : `Open tool for ${item.title}`}
                  onPress={() => openWhatHelpsTarget(item.title)}
                  style={styles.openToolBtn}
                >
                  <AppText style={styles.openToolLabel}>{isRest ? "Rest ok" : "Open"}</AppText>
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </SoftCard>
    );
  }

  if (draft.type === "task" || draft.type === "subtask") {
    return (
      <Screen>
        <PageHeaderWithEdit title="Task" subtitle="One thing at a time — break it down if it feels big." />
        {renderPackProvenance()}
        <SoftCard>
          <Field label="Title" value={title} onChangeText={setTitle} placeholder="Clean the kitchen" />
          <Field label="For what?" value={forWhat} onChangeText={setForWhat} placeholder="Optional context" />
          <View style={styles.section}>
            <AppText variant="small">When?</AppText>
            <View style={styles.chips}>
              {["Today", "Tomorrow", "This week", "Pick date"].map((option) => (
                <CategoryChip
                  key={option}
                  label={option}
                  selected={selectedWhen === option}
                  onPress={() => {
                    setSelectedWhen(option);
                    setWhen(option);
                  }}
                />
              ))}
            </View>
            {selectedWhen === "Pick date" ? (
              <DatePickerField label="Date" value={when} onChangeText={setWhen} placeholder="DD-MM-YYYY" />
            ) : null}
          </View>
          <Field label="Where?" value={where} onChangeText={setWhere} placeholder="Search place or enter manually" />
          <View style={styles.section}>
            <AppText variant="small">Contact</AppText>
            <AppText variant="muted">Link to contacts</AppText>
            <ContactLink
              searchHint={getContactSearchHint(title)}
              selectedContact={linkedContact}
              onSelect={(contact) => {
                setLinkedContact(contact);
                setWhere(contact.address ?? where);
              }}
              onRemove={() => setLinkedContact(undefined)}
            />
          </View>
          <View style={styles.section}>
            <AppText variant="small">Reminder</AppText>
            <View style={styles.chips}>
              {["No reminder", "Tomorrow", "Next week", "Custom"].map((option) => (
                <CategoryChip
                  key={option}
                  label={option}
                  selected={selectedReminder === option}
                  onPress={() => {
                    setSelectedReminder(option);
                    setReminder(option);
                  }}
                />
              ))}
            </View>
            {selectedReminder === "Custom" ? (
              <DatePickerField label="Reminder date" value={reminder} onChangeText={setReminder} placeholder="DD-MM-YYYY" />
            ) : null}
          </View>
          <Field label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Optional" />
        </SoftCard>
        <TaskBreakdownSuggestions title={title} onApply={applyTaskBreakdown} />
        <MakeItSmallerCard
          title={title}
          onEarnTinyStep={(stepTitle) => {
            const points = earn({
              difficulty: "normal",
              title: stepTitle,
              kind: "tiny_step",
              packId: draft.sourcePackId,
              sourceItemId: draft.id
            });
            setNotice(`Nice. “${stepTitle}” · +${points}`);
          }}
        />
        {renderChecklistCard("Small steps")}
        {renderStepRemindersCard()}
        <SoftCard>
          <AppText variant="heading">Useful extras</AppText>
          <VoiceCaptureButton
            placeholder="Say a note..."
            onCaptured={(capturedText, capturedVoiceNoteUrl) => appendToNotes(capturedText, setNotes, setVoiceNoteUrl, capturedVoiceNoteUrl)}
          />
          {voiceNoteUrl ? <AppText variant="small">Voice note saved.</AppText> : null}
          {notice ? <AppText variant="small">{notice}</AppText> : null}
        </SoftCard>
        {renderReadyPackOutboundLinks()}
        {renderDocumentsSection()}
        {renderItemOptions(() => saveAndOpenWorld())}
      </Screen>
    );
  }

  if (draft.type === "appointment") {
    return (
      <Screen>
        <PageHeaderWithEdit title="Appointment" subtitle="A time and place, held gently." />
        {renderPackProvenance()}
        <SoftCard>
          <Field label="What?" value={title} onChangeText={setTitle} placeholder="Dentist" />
          <DateTimeFields
            dateLabel="When?"
            timeLabel="Time?"
            date={when}
            onDateChange={setWhen}
            time={appointmentTime}
            onTimeChange={setAppointmentTime}
          />
          <Field label="Where?" value={where} onChangeText={setWhere} placeholder="Search place or enter manually" />
          <View style={styles.section}>
            <AppText variant="small">Contact</AppText>
            <ContactLink
              searchHint={getContactSearchHint(title)}
              selectedContact={linkedContact}
              onSelect={(contact) => {
                setLinkedContact(contact);
                setWhere(contact.address ?? where);
              }}
              onRemove={() => setLinkedContact(undefined)}
            />
          </View>
          <GuestsEditor
            guests={guests}
            onChange={setGuests}
            editable={editable}
            appointmentTitle={title || draft.title}
          />
          <CalendarLinkCard
            enabled={syncToCalendar}
            onEnabledChange={setSyncToCalendar}
            selectedCalendarId={calendarId}
            onSelectCalendar={setCalendarId}
            editable={editable}
          />
          <Field label="Travel time" value={travelTime} onChangeText={setTravelTime} placeholder="Optional" />
          <View style={styles.section}>
            <AppText variant="small">Reminder</AppText>
            <AppText variant="muted">Gentle cues before the appointment. Snooze or skip anytime.</AppText>
            <View style={styles.chips}>
              {APPOINTMENT_REMINDER_OPTIONS.map((option) => (
                <CategoryChip
                  key={option}
                  label={option}
                  selected={appointmentReminders.includes(option)}
                  onPress={() =>
                    setAppointmentReminders((current) =>
                      current.includes(option)
                        ? current.filter((item) => item !== option)
                        : [...current, option]
                    )
                  }
                />
              ))}
            </View>
            {appointmentReminders.includes("Custom") ? (
              <DateTimeFields
                dateLabel="Custom reminder date"
                timeLabel="Custom reminder time"
                date={customApptReminderDate}
                onDateChange={setCustomApptReminderDate}
                time={customApptReminderTime}
                onTimeChange={setCustomApptReminderTime}
              />
            ) : null}
          </View>
          <Field label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Optional" />
          <VoiceCaptureButton
            placeholder="Say an appointment note..."
            onCaptured={(capturedText, capturedVoiceNoteUrl) => appendToNotes(capturedText, setNotes, setVoiceNoteUrl, capturedVoiceNoteUrl)}
          />
          {notice ? <AppText variant="small">{notice}</AppText> : null}
        </SoftCard>
        {renderReadyPackOutboundLinks()}
        {renderDocumentsSection()}
        {renderItemOptions(() => void saveAndOpenWorld())}
        <View style={styles.actions}>
          <SecondaryButton onPress={() => void saveAndOpenWorld()}>Just keep it simple</SecondaryButton>
        </View>
      </Screen>
    );
  }

  if (draft.type === "project") {
    const projectChildren = getChildrenForParent(items, draft.id);
    const projectChildTypes: NudgeItemType[] = [
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

    function buildProjectChildDraft(type: NudgeItemType): NudgeItem {
      const now = new Date().toISOString();
      return {
        id: `draft-${type}-${Date.now()}`,
        title: "",
        type,
        status: "open",
        parentId: draft.id,
        children: [],
        createdAt: now,
        updatedAt: now,
        attachments: [],
        listItems: [],
        progress: 0,
        notes: `For project: ${title || draft.title}`
      };
    }

    return (
      <Screen>
        <PageHeaderWithEdit title="Project" subtitle="Big things, broken down." />
        {renderPackProvenance()}
        <SoftCard>
          <Field label="Project title" value={title} onChangeText={setTitle} placeholder="Kitchen Refresh" />
          <Field label="Goal" value={projectGoal} onChangeText={setProjectGoal} multiline placeholder="What would feel good to move forward?" />
          <DatePickerField label="Target date" value={when} onChangeText={setWhen} placeholder="DD-MM-YYYY" />
          <View style={styles.section}>
            <AppText variant="small">Linked contact</AppText>
            <ContactLink
              searchHint={getContactSearchHint(title)}
              selectedContact={linkedContact}
              onSelect={setLinkedContact}
              onRemove={() => setLinkedContact(undefined)}
            />
          </View>
          <Field label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Anything useful" />
          <VoiceCaptureButton
            placeholder="Say a project note..."
            onCaptured={(capturedText, capturedVoiceNoteUrl) =>
              appendToNotes(capturedText, setNotes, setVoiceNoteUrl, capturedVoiceNoteUrl)
            }
          />
        </SoftCard>
        <SoftCard>
          <AppText variant="heading">Add to this project</AppText>
          <AppText variant="muted">Any nudge type can be a step under this project.</AppText>
          <View style={styles.projectAddRow}>
            {projectChildTypes.map((type) => (
              <Pressable
                key={type}
                accessibilityRole="button"
                disabled={!editable}
                onPress={() => navigation.navigate("ItemDetails", { draft: buildProjectChildDraft(type) })}
                style={({ pressed }) => [
                  styles.projectTypeChip,
                  {
                    borderColor: `${taskTypeAccentColors[type] ?? colors.accent}55`,
                    backgroundColor: `${taskTypeAccentColors[type] ?? colors.accent}14`
                  },
                  pressed && styles.pressed
                ]}
              >
                <AppText
                  style={{
                    color: taskTypeAccentColors[type] ?? colors.accent,
                    fontWeight: "700",
                    fontSize: 13
                  }}
                >
                  {formatNudgeTypeLabel(type)}
                </AppText>
              </Pressable>
            ))}
          </View>
          {projectChildren.length ? (
            <View style={styles.section}>
              <AppText variant="small">Linked nudges ({projectChildren.length})</AppText>
              {projectChildren.map((child) => (
                <Pressable
                  key={child.id}
                  onPress={() => navigation.navigate("ItemDetails", { draft: child })}
                  style={styles.projectChildRow}
                >
                  <AppText style={{ flex: 1 }}>{child.title || "Untitled"}</AppText>
                  <AppText variant="caption">{formatNudgeTypeLabel(child.type)}</AppText>
                </Pressable>
              ))}
            </View>
          ) : (
            <AppText variant="muted">Nothing linked yet — pick a type above.</AppText>
          )}
        </SoftCard>
        {renderReadyPackOutboundLinks()}
        {renderDocumentsSection()}
        {renderItemOptions(() => saveAndOpenWorld())}
        <SecondaryButton onPress={() => saveAndOpenWorld()}>Just keep it simple</SecondaryButton>
      </Screen>
    );
  }

  if (draft.type === "list") {
    const listDone = listItems.filter((li) => li.status === "done").length;
    const listTotal = listItems.length;
    const pct = listTotal ? Math.round((listDone / listTotal) * 100) : 0;
    const suggestions = listSuggestions;
    const shareableMembers = getUnsharedMembers(myCrewMembers, sharedWith);

    function addSuggestedItem(itemTitle: string) {
      addListItem(itemTitle, setListItems, () => undefined);
    }

    function addAllSuggestions() {
      if (!suggestions) return;
      setListItems((current) => {
        const existing = new Set(current.map((item) => item.title.trim().toLowerCase()));
        const next = suggestions.items
          .filter((item) => !existing.has(item.trim().toLowerCase()))
          .map((item, index) => ({
            id: `${Date.now()}-${current.length + index}`,
            title: capitalise(item.trim()),
            status: "open" as const
          }));
        return [...current, ...next];
      });
    }

    return (
      <Screen>
        {/* Compact title row */}
        <View style={ls.topRow}>
          <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={ls.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.accent} />
          </Pressable>
          <TextInput
            style={ls.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="List name"
            placeholderTextColor={colors.mutedText}
          />
          <VoiceFieldActions value={title} onChangeText={setTitle} size={28} />
          {activeProfile.isSelf ? (
            <Pressable accessibilityRole="button" onPress={() => setShareOpen(true)} style={ls.shareBtn}>
              <Ionicons name={sharedWith.length ? "people" : "people-outline"} size={20} color={colors.accent} />
              {sharedWith.length > 0 ? (
                <View style={ls.shareBadge}>
                  <AppText variant="caption" style={ls.shareBadgeText}>{sharedWith.length}</AppText>
                </View>
              ) : null}
            </Pressable>
          ) : null}
          <Pressable accessibilityRole="button" onPress={() => saveAndOpenWorld()} style={({ pressed }) => [ls.saveBtn, pressed && ls.pressed]}>
            <Ionicons name="checkmark" size={20} color={colors.onPrimary} />
          </Pressable>
        </View>

        {/* Progress */}
        {listTotal > 0 && (
          <View style={ls.progressRow}>
            <AppText variant="caption" style={ls.dim}>{listDone}/{listTotal}</AppText>
            <View style={ls.track}><View style={[ls.fill, { width: `${pct}%` }]} /></View>
          </View>
        )}

        {/* Optional date so the list appears in order on Nudges (e.g. exam day) */}
        <View style={ls.dateBlock}>
          {draft.sourcePackId && getPlannerConfig(draft.sourcePackId) ? (
            <ListPlannerDateLink
              packId={draft.sourcePackId}
              packLabel={getPlannerConfig(draft.sourcePackId)?.title ?? "planner"}
              offsetDays={dueDaysBeforePlannerEvent}
              selectedPlannerItemId={anchorPlannerItemId}
              plannerItems={plannerState.items}
              onSelect={({ plannerItemId, dueDateIso }) => {
                setAnchorPlannerItemId(plannerItemId);
                setWhen(formatDateValue(dueDateIso));
                updatePlannerItem(plannerItemId, { nudgeItemId: draft.id });
              }}
              onClear={() => {
                setAnchorPlannerItemId(undefined);
              }}
            />
          ) : null}
          <DatePickerField
            label="Date"
            value={when}
            onChangeText={(value) => {
              setWhen(value);
              if (anchorPlannerItemId) {
                setAnchorPlannerItemId(undefined);
              }
            }}
            placeholder="DD-MM-YYYY"
          />
          <AppText variant="caption" style={ls.dim}>
            Optional — pick a planner event (like an exam), or type a date so this list shows in the right place on Nudges.
          </AppText>
        </View>

        {/* Add bar: text + voice — paste multi-line to add many items */}
        <View style={ls.addBar}>
          <TextInput
            style={ls.addInput}
            value={newListItem}
            onChangeText={(text) => {
              if (/\r?\n/.test(text)) {
                addListItem(text, setListItems, setNewListItem);
                return;
              }
              setNewListItem(text);
            }}
            placeholder="Add item… or paste a list"
            placeholderTextColor={colors.mutedText}
            returnKeyType="done"
            blurOnSubmit={false}
            multiline
            onSubmitEditing={() => addListItem(newListItem, setListItems, setNewListItem)}
          />
          <VoiceFieldActions value={newListItem} onChangeText={setNewListItem} size={28} />
          {newListItem.trim() ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => addListItem(newListItem, setListItems, setNewListItem)}
              style={ls.iconBtn}
            >
              <Ionicons name="add-circle" size={26} color={colors.accent} />
            </Pressable>
          ) : null}
          <VoiceCaptureButton
            idleLabel=""
            placeholder="milk, eggs, bread"
            onCaptured={(capturedText, capturedVoiceNoteUrl) => {
              addListItem(
                capturedText
                  .split(/,|\band\b|\n/i)
                  .map((part) => parseVoiceListItem(part))
                  .join("\n"),
                setListItems,
                setVoiceListInput
              );
              setVoiceNoteUrl(capturedVoiceNoteUrl);
            }}
          />
        </View>

        {suggestions ? (
          <View style={ls.suggestBlock}>
            <View style={ls.suggestHeader}>
              <AppText variant="caption" style={ls.dim}>{suggestions.category}</AppText>
              <Pressable accessibilityRole="button" onPress={addAllSuggestions} hitSlop={8}>
                <AppText variant="caption" style={ls.addAll}>Add all</AppText>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ls.suggestScroll}>
              {suggestions.items.map((item) => (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  onPress={() => addSuggestedItem(item)}
                  style={({ pressed }) => [ls.suggestChip, pressed && ls.pressed]}
                >
                  <Ionicons name="add" size={14} color={colors.accent} />
                  <AppText variant="small" style={ls.suggestLabel}>{item}</AppText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Items */}
        {listItems.length === 0 ? (
          <View style={ls.empty}>
            <Ionicons name="list-outline" size={28} color={colors.mutedText} />
            <AppText variant="muted">Type or speak to add items</AppText>
          </View>
        ) : (
          <View style={ls.itemsCard}>
            {listItems.map((item) => {
              const triageMode = isWhatHelpsTemplate(draft.sourceTemplateId);
              const resolved = triageMode
                ? resolveWhatHelpsItemId(
                    draft.sourcePackId,
                    item.title,
                    draft.sourcePackId
                      ? installState.installed[draft.sourcePackId]?.templateItemIds
                      : undefined
                  )
                : undefined;
              return (
                <View key={item.id} style={ls.rowWrap}>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: item.status === "done" }}
                    style={ls.row}
                    onPress={() => toggleListItemDone(item.id)}
                  >
                    <View style={[ls.check, item.status === "done" && ls.checkDone]}>
                      {item.status === "done" && <Ionicons name="checkmark" size={14} color={colors.onPrimary} />}
                    </View>
                    <AppText style={[ls.itemLabel, item.status === "done" && ls.itemDone]} numberOfLines={2}>
                      {item.title}
                    </AppText>
                  </Pressable>
                  {triageMode && (resolved?.itemId || resolved?.restOutcome) ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={resolved.restOutcome ? "Rest is enough" : `Open tool for ${item.title}`}
                      onPress={() => openWhatHelpsTarget(item.title)}
                      style={ls.openToolBtn}
                    >
                      <AppText style={ls.openToolLabel}>{resolved.restOutcome ? "Rest ok" : "Open"}</AppText>
                    </Pressable>
                  ) : null}
                  <Pressable
                    hitSlop={8}
                    onPress={() => {
                      const next = listItems.filter((c) => c.id !== item.id);
                      persistListItems(next);
                    }}
                  >
                    <Ionicons name="close" size={18} color={colors.mutedText} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        {/* Bottom actions — minimal */}
        {listDone > 0 && (
          <Pressable
            accessibilityRole="button"
            onPress={() => persistListItems(listItems.filter((i) => i.status !== "done"))}
            style={({ pressed }) => [ls.clearBtn, pressed && ls.pressed]}
          >
            <Ionicons name="trash-outline" size={16} color={colors.mutedText} />
            <AppText variant="caption" style={ls.dim}>Clear completed</AppText>
          </Pressable>
        )}

        {notice ? (
          <AppText variant="small" style={{ paddingHorizontal: spacing.sm, color: colors.accent }}>
            {notice}
          </AppText>
        ) : null}

        {renderReadyPackOutboundLinks()}
        {renderDocumentsSection()}
        {renderItemOptions(() => saveAndOpenWorld())}

        {activeProfile.isSelf ? (
          <ListShareSheet
            visible={shareOpen}
            listTitle={title || "List"}
            sharedWith={sharedWith}
            availableMembers={shareableMembers}
            onClose={() => setShareOpen(false)}
            onShare={(member) => {
              const next = shareListWithMember(sharedWith, member);
              setSharedWith(next);
              if (editable) saveItem({ ...buildSavedItem(), sharedWith: next });
            }}
            onUnshare={(membershipId) => {
              const next = unshareListWithMember(sharedWith, membershipId);
              setSharedWith(next);
              if (editable) saveItem({ ...buildSavedItem(), sharedWith: next });
            }}
          />
        ) : null}
      </Screen>
    );
  }

  if (draft.type === "note") {
    return (
      <Screen>
        <PageHeaderWithEdit title="Note" subtitle="A place to put the thought down." />
        {renderPackProvenance()}
        <SoftCard>
          <Field label="Title" value={title} onChangeText={setTitle} placeholder="Useful thought" />
          <Field label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Anything useful" />
          <VoiceCaptureButton
            placeholder="Say the note..."
            onCaptured={(capturedText, capturedVoiceNoteUrl) => appendToNotes(capturedText, setNotes, setVoiceNoteUrl, capturedVoiceNoteUrl)}
          />
          <View style={styles.section}>
            <AppText variant="small">Follow-up</AppText>
            <View style={styles.chips}>
              {["No follow-up", "Turn into task", "Add reminder"].map((option) => (
                <CategoryChip
                  key={option}
                  label={option}
                  selected={noteFollowUp === option}
                  onPress={() => setNoteFollowUp(option)}
                />
              ))}
            </View>
          </View>
        </SoftCard>
        {renderReadyPackOutboundLinks()}
        {renderDocumentsSection()}
        {renderItemOptions(() => void saveAndOpenWorld())}
        <SecondaryButton onPress={() => void saveAndOpenWorld()}>Just keep it simple</SecondaryButton>
      </Screen>
    );
  }

  if (draft.type === "reminder") {
    const repeatOptions: Array<{ value: string; icon: IoniconName }> = [
      { value: "Never", icon: "close-circle-outline" },
      { value: "Daily", icon: "sunny-outline" },
      { value: "Weekly", icon: "calendar-outline" },
      { value: "Monthly", icon: "calendar-number-outline" },
      { value: "Yearly", icon: "refresh-outline" },
      { value: "Custom", icon: "options-outline" }
    ];
    const notifyOptions: Array<{ value: string; icon: IoniconName }> = [
      { value: "Push", icon: "notifications-outline" },
      { value: "Email", icon: "mail-outline" },
      { value: "Both", icon: "layers-outline" }
    ];

    return (
      <Screen>
        <View style={rs.topRow}>
          <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={rs.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.accent} />
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => saveAndOpenWorld()} style={({ pressed }) => [rs.saveBtn, pressed && rs.pressed]}>
            <Ionicons name="checkmark" size={20} color={colors.onPrimary} />
          </Pressable>
        </View>

        <View style={rs.hero}>
          <View style={rs.heroGlow} />
          <View style={rs.heroIcon}>
            <Ionicons name="notifications" size={28} color={colors.accent} />
          </View>
          <View style={rs.heroTitleRow}>
            <TextInput
              style={rs.heroTitle}
              value={title}
              onChangeText={setTitle}
              placeholder="Reminder"
              placeholderTextColor={colors.mutedText}
              multiline
            />
            <VoiceFieldActions value={title} onChangeText={setTitle} size={28} />
          </View>
        </View>

        <DateTimeFields
          layout="row"
          date={reminderDate}
          onDateChange={setReminderDate}
          time={reminderTime}
          onTimeChange={setReminderTime}
          datePlaceholder="DD-MM-YYYY"
          timePlaceholder="09:00"
        />

        <View style={rs.speakCard}>
          <View style={rs.speakQuote}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.accent} />
            <TextInput
              style={rs.speakInput}
              value={speakingReminderText}
              onChangeText={setSpeakingReminderText}
              placeholder="..."
              placeholderTextColor={colors.mutedText}
              multiline
            />
            <VoiceFieldActions
              value={speakingReminderText}
              onChangeText={setSpeakingReminderText}
              size={28}
            />
          </View>
          <View style={rs.speakActions}>
            <VoiceCaptureButton
              compact
              placeholder="..."
              onCaptured={(capturedText, capturedVoiceNoteUrl) => {
                setSpeakingReminderText(capturedText);
                setVoiceNoteUrl(capturedVoiceNoteUrl);
              }}
            />
            {speakingReminderText ? (
              <SpeakingReminderPlayer compact item={{ ...draft, speakingReminderText }} />
            ) : null}
          </View>
        </View>

        <View style={rs.tileRow}>
          <ReminderToggleTile
            icon="repeat-outline"
            label="10m"
            active={nudgeEveryTenMinutesUntilDone}
            onPress={() => setNudgeEveryTenMinutesUntilDone((value) => !value)}
          />
          <ReminderToggleTile
            icon="person-outline"
            label="Nudger"
            active={notifyNudgerIfNotDone}
            onPress={() => setNotifyNudgerIfNotDone((value) => !value)}
          />
          <ReminderToggleTile
            icon="person-circle-outline"
            label="Contact"
            active={showReminderContact || Boolean(linkedContact)}
            onPress={() => setShowReminderContact((value) => !value)}
          />
          <ReminderToggleTile
            icon="document-text-outline"
            label="Note"
            active={showReminderNotes || Boolean(notes.trim())}
            onPress={() => setShowReminderNotes((value) => !value)}
          />
        </View>

        <FrequencyDropdown
          label="Repeat"
          value={repeatOption}
          options={repeatOptions}
          onSelect={setRepeatOption}
          accessibilityLabel="Repeat"
        />
        {repeatOption === "Custom" ? (
          <Field
            label="Custom repeat"
            value={customFrequencyText}
            onChangeText={setCustomFrequencyText}
            placeholder="e.g. Every other Tuesday"
          />
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={rs.optionScroll}>
          {notifyOptions.map((option) => (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityLabel={option.value}
              onPress={() => setNotificationOption(option.value)}
              style={[rs.optionTile, notificationOption === option.value && rs.optionTileActive]}
            >
              <Ionicons
                name={option.icon}
                size={20}
                color={notificationOption === option.value ? colors.accent : colors.mutedText}
              />
            </Pressable>
          ))}
        </ScrollView>

        {showReminderContact ? (
          <ContactLink
            searchHint={getContactSearchHint(title)}
            selectedContact={linkedContact}
            onSelect={setLinkedContact}
            onRemove={() => setLinkedContact(undefined)}
          />
        ) : null}

        {showReminderNotes ? (
          <View style={rs.notesWrap}>
            <View style={rs.notesHeader}>
              <VoiceFieldActions value={notes} onChangeText={setNotes} size={28} />
            </View>
            <TextInput
              style={rs.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="..."
              placeholderTextColor={colors.mutedText}
              multiline
            />
          </View>
        ) : null}

        {renderReadyPackOutboundLinks()}
        {renderDocumentsSection()}
        {renderItemOptions(() => saveAndOpenWorld())}
      </Screen>
    );
  }

  if (draft.type === "routine") {
    return (
      <Screen>
        <PageHeaderWithEdit title="Routine" subtitle="Pick this up again when it helps." />
        {renderPackProvenance()}
        <SoftCard>
          <Field label="Routine title" value={title} onChangeText={setTitle} placeholder="Take vitamins" />
          <FrequencyDropdown
            label="Frequency"
            value={routineFrequency}
            options={ROUTINE_FREQUENCY_OPTIONS}
            onSelect={setRoutineFrequency}
          />
          {routineFrequency === "Custom" ? (
            <Field
              label="Custom frequency"
              value={customFrequencyText}
              onChangeText={setCustomFrequencyText}
              placeholder="e.g. Every other morning"
            />
          ) : null}
          <Field label="Time" value={routineTime} onChangeText={setRoutineTime} placeholder="Morning" />
          <View style={styles.section}>
            <AppText variant="small">Reminder</AppText>
            <View style={styles.chips}>
              {["No reminder", "At routine time", "10 mins before", "Custom"].map((option) => (
                <CategoryChip
                  key={option}
                  label={option}
                  selected={selectedReminder === option}
                  onPress={() => setSelectedReminder(option)}
                />
              ))}
            </View>
          </View>
          <Field label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Optional" />
          <VoiceCaptureButton
            placeholder="Say a routine note..."
            onCaptured={(capturedText, capturedVoiceNoteUrl) => appendToNotes(capturedText, setNotes, setVoiceNoteUrl, capturedVoiceNoteUrl)}
          />
          <Field
            label="Linked task/list/project"
            value={linkedParent}
            onChangeText={setLinkedParent}
            placeholder="Optional"
          />
        </SoftCard>
        {renderChecklistCard("Routine steps")}
        {renderReadyPackOutboundLinks()}
        {renderDocumentsSection()}
        {renderItemOptions(() => saveAndOpenWorld())}
        <View style={styles.actions}>
          <SecondaryButton onPress={() => saveAndOpenWorld("paused")}>Pause Routine</SecondaryButton>
        </View>
      </Screen>
    );
  }

  if (draft.type === "chore") {
    return (
      <Screen>
        <PageHeaderWithEdit
          title="Chore"
          subtitle="One house job at a time — break it into small steps if it feels big."
        />
        {renderPackProvenance()}
        <SoftCard>
          <Field label="Chore title" value={title} onChangeText={setTitle} placeholder="Clean the kitchen" />
          <FrequencyDropdown
            label="How often?"
            value={routineFrequency}
            options={ROUTINE_FREQUENCY_OPTIONS}
            onSelect={setRoutineFrequency}
          />
          {routineFrequency === "Custom" ? (
            <Field
              label="Custom frequency"
              value={customFrequencyText}
              onChangeText={setCustomFrequencyText}
              placeholder="e.g. Every Saturday morning"
            />
          ) : null}
          <Field label="When" value={routineTime} onChangeText={setRoutineTime} placeholder="Saturday morning" />
          <Field label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Optional" />
          <VoiceCaptureButton
            placeholder="Say a chore note..."
            onCaptured={(capturedText, capturedVoiceNoteUrl) => appendToNotes(capturedText, setNotes, setVoiceNoteUrl, capturedVoiceNoteUrl)}
          />
          {notice ? <AppText variant="small">{notice}</AppText> : null}
        </SoftCard>
        <TaskBreakdownSuggestions title={title} onApply={applyTaskBreakdown} />
        {renderChecklistCard("Chore steps")}
        {renderStepRemindersCard()}
        {renderReadyPackOutboundLinks()}
        {renderDocumentsSection()}
        {renderItemOptions(() => saveAndOpenWorld())}
      </Screen>
    );
  }

  if (draft.type === "event") {
    return (
      <Screen>
        <PageHeaderWithEdit title="Event" subtitle="Plan the journey and getting ready." />
        {renderPackProvenance()}
        <SoftCard>
          <Field label="Event" value={title} onChangeText={setTitle} placeholder="Concert" />
          <DateTimeFields
            date={when}
            onDateChange={setWhen}
            time={appointmentTime}
            onTimeChange={setAppointmentTime}
            timePlaceholder="19:30"
          />
          <LocationFinderField
            label="Venue"
            value={venueLocation}
            onChange={setVenueLocation}
            placeholder="Search venue, e.g. AO Arena Manchester"
            showDirectionsOptions
          />
        </SoftCard>
        <SoftCard>
          <EventPrepPlanner
            eventDate={when}
            eventTime={appointmentTime}
            venue={getLocationLabel(venueLocation)}
            venueLocation={venueLocation}
            homeLocation={homeWhere}
            travelMinutes={eventTravelMinutes}
            readyMinutes={eventReadyMinutes}
            prepSteps={eventPrepSteps}
            onHomeLocationChange={setHomeWhere}
            onTravelMinutesChange={setEventTravelMinutes}
            onReadyMinutesChange={setEventReadyMinutes}
            onPrepStepsChange={setEventPrepSteps}
            editable={editable}
          />
        </SoftCard>
        <SoftCard>
          <View style={styles.section}>
            <AppText variant="small">Linked contacts</AppText>
            <ContactLink
              searchHint={getContactSearchHint(title)}
              selectedContact={linkedContact}
              onSelect={setLinkedContact}
              onRemove={() => setLinkedContact(undefined)}
            />
          </View>
          <GuestsEditor
            guests={guests}
            onChange={setGuests}
            editable={editable}
            appointmentTitle={title || draft.title}
          />
          <CalendarLinkCard
            enabled={syncToCalendar}
            onEnabledChange={setSyncToCalendar}
            selectedCalendarId={calendarId}
            onSelectCalendar={setCalendarId}
            editable={editable}
          />
          <Field label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Optional" />
          <VoiceCaptureButton
            placeholder="Say a note..."
            onCaptured={(capturedText, capturedVoiceNoteUrl) => appendToNotes(capturedText, setNotes, setVoiceNoteUrl, capturedVoiceNoteUrl)}
          />
          {notice ? <AppText variant="small">{notice}</AppText> : null}
        </SoftCard>
        {renderReadyPackOutboundLinks()}
        {renderDocumentsSection()}
        {renderItemOptions(() => void saveAndOpenWorld())}
      </Screen>
    );
  }

  if (draft.type === "occasion" || draft.type === "special_day") {
    return (
      <Screen>
        <PageHeaderWithEdit title="Occasion" subtitle="Birthdays, anniversaries and things worth remembering." />
        {renderPackProvenance()}
        <SoftCard>
          <Field label="Who or what?" value={title} onChangeText={setTitle} placeholder="Mum's Birthday" />
          <DatePickerField label="Date" value={when} onChangeText={setWhen} placeholder="DD-MM-YYYY" />
          <ToggleRow label="Repeats yearly" value={repeatsYearly} onValueChange={setRepeatsYearly} />
          <View style={styles.section}>
            <AppText variant="small">Gift ideas</AppText>
            <OccasionShoppingPrompts
              title={title}
              giftIdeas={giftIdeas}
              occasionDate={when}
              needsCard={needsCard}
              onNeedsCardChange={setNeedsCard}
              needsPresent={needsPresent}
              onNeedsPresentChange={setNeedsPresent}
              cardReminderDate={cardReminderDate}
              cardReminderTime={cardReminderTime}
              onCardReminderDateChange={setCardReminderDate}
              onCardReminderTimeChange={setCardReminderTime}
              giftReminderDate={giftReminderDate}
              giftReminderTime={giftReminderTime}
              onGiftReminderDateChange={setGiftReminderDate}
              onGiftReminderTimeChange={setGiftReminderTime}
            />
            {giftIdeas.map((idea) => (
              <View key={idea} style={styles.listItemRow}>
                <View style={styles.smallDot} />
                <AppText>{idea}</AppText>
              </View>
            ))}
            <Field label="Add gift idea" value={newGiftIdea} onChangeText={setNewGiftIdea} placeholder="Flowers" />
            <SecondaryButton
              onPress={() => {
                const nextIdea = newGiftIdea.trim();
                if (!nextIdea) {
                  return;
                }
                setGiftIdeas((current) => [...current, capitalise(nextIdea)]);
                setNewGiftIdea("");
              }}
            >
              Add gift idea
            </SecondaryButton>
          </View>
          <Field label="Plans" value={plans} onChangeText={setPlans} multiline placeholder="A meal, a call, a card..." />
          <Field label="Budget optional" value={budget} onChangeText={setBudget} placeholder="Optional" />
          <View style={styles.section}>
            <AppText variant="small">Linked contacts</AppText>
            <ContactLink
              searchHint={getContactSearchHint(title)}
              selectedContact={linkedContact}
              onSelect={setLinkedContact}
              onRemove={() => setLinkedContact(undefined)}
            />
          </View>
          <View style={styles.section}>
            <AppText variant="small">Reminder schedule</AppText>
            <View style={styles.chips}>
              {["1 month before", "2 weeks before", "1 week before", "1 day before", "Custom"].map((option) => (
                <CategoryChip
                  key={option}
                  label={option}
                  selected={specialDayReminders.includes(option)}
                  onPress={() =>
                    setSpecialDayReminders((current) =>
                      current.includes(option) ? current.filter((item) => item !== option) : [...current, option]
                    )
                  }
                />
              ))}
            </View>
          </View>
          <Field label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Optional" />
          <VoiceCaptureButton
            placeholder="Say a note..."
            onCaptured={(capturedText, capturedVoiceNoteUrl) => appendToNotes(capturedText, setNotes, setVoiceNoteUrl, capturedVoiceNoteUrl)}
          />
        </SoftCard>
        {renderReadyPackOutboundLinks()}
        {renderDocumentsSection()}
        {renderItemOptions(() => saveAndOpenWorld())}
        <SecondaryButton onPress={() => saveAndOpenWorld()}>Just keep it simple</SecondaryButton>
      </Screen>
    );
  }

  return (
    <Screen>
      <PageHeaderWithEdit title={getHeader(draft.type)} subtitle="Add what helps. Leave the rest." />
        {renderPackProvenance()}
      <SoftCard>
        <AppText variant="small">Suggested type</AppText>
        <AppText variant="heading">{formatTypeLabel(draft.type)}</AppText>
      </SoftCard>
      <SoftCard>
        {getFieldsForType(draft.type).map((field) => {
          if (field === "title") {
            return <Field key={field} label={getTitleLabel(draft.type)} value={title} onChangeText={setTitle} />;
          }
          if (field === "when") {
            return (
              <DatePickerField key={field} label="When?" value={when} onChangeText={setWhen} placeholder="DD-MM-YYYY" />
            );
          }
          if (field === "where") {
            return <Field key={field} label="Where?" value={where} onChangeText={setWhere} placeholder="Optional" />;
          }
          if (field === "contact") {
            return (
              <ContactLink
                key={field}
                searchHint={getContactSearchHint(title)}
                selectedContact={linkedContact}
                onSelect={setLinkedContact}
                onRemove={() => setLinkedContact(undefined)}
              />
            );
          }
          if (field === "reminder") {
            return (
              <View key={field} style={styles.reminder}>
                <Field label="Reminder" value={reminder} onChangeText={setReminder} placeholder="Optional" />
                <ReminderPicker selected={reminder} onSelect={setReminder} />
              </View>
            );
          }
          return (
            <View key={field} style={styles.section}>
              <Field label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Anything useful" />
              <VoiceCaptureButton
                placeholder="Say a note..."
                onCaptured={(capturedText, capturedVoiceNoteUrl) =>
                  appendToNotes(capturedText, setNotes, setVoiceNoteUrl, capturedVoiceNoteUrl)
                }
              />
            </View>
          );
        })}
      </SoftCard>
      {renderReadyPackOutboundLinks()}
        {renderDocumentsSection()}
      {renderItemOptions(() => saveAndOpenWorld())}
      <SecondaryButton onPress={() => saveAndOpenWorld()}>Just Keep It Simple</SecondaryButton>
    </Screen>
  );
}

function getHeader(type: NudgeItemType) {
  if (type === "task") {
    return "Task Details";
  }
  if (type === "event") {
    return "Event Details";
  }
  if (type === "occasion" || type === "special_day") {
    return "Occasion Details";
  }
  return `${formatTypeLabel(type)} Details`;
}

function getFieldsForType(type: NudgeItem["type"]) {
  if (type === "task" || type === "subtask") {
    return ["title", "when", "where", "contact", "reminder", "notes"];
  }
  if (type === "appointment") {
    return ["title", "when", "where", "contact", "reminder", "notes"];
  }
  if (type === "reminder") {
    return ["title", "when", "contact", "reminder", "notes"];
  }
  if (type === "routine") {
    return ["title", "when", "reminder", "notes"];
  }
  if (type === "chore") {
    return ["title", "when", "notes"];
  }
  if (type === "project") {
    return ["title", "when", "notes"];
  }
  if (type === "list") {
    return ["title", "when", "notes"];
  }
  if (type === "event") {
    return ["title", "when", "where", "contact", "reminder", "notes"];
  }
  if (type === "occasion" || type === "special_day") {
    return ["title", "when", "contact", "reminder", "notes"];
  }
  return ["title", "notes"];
}

function getTitleLabel(type: NudgeItemType) {
  if (type === "task" || type === "subtask") {
    return "For what?";
  }
  if (type === "appointment") {
    return "Appointment";
  }
  if (type === "event") {
    return "Event";
  }
  if (type === "occasion" || type === "special_day") {
    return "Occasion";
  }
  return "Title";
}

function getSuggestedForWhat(title: string) {
  return title.toLowerCase().includes("dentist") ? "Routine check-up" : "";
}

function getContactSearchHint(title: string) {
  const text = title.toLowerCase();
  if (text.includes("dentist") || text.includes("dental")) {
    return "dentist dental practice surgery";
  }
  if (text.includes("doctor") || text.includes("gp")) {
    return "gp surgery";
  }
  return title;
}

function formatTypeLabel(type: NudgeItemType) {
  if (type === "event") {
    return "Event";
  }
  if (type === "occasion" || type === "special_day") {
    return "Occasion";
  }
  return type.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isOccasionLike(type: NudgeItemType) {
  return type === "occasion" || type === "special_day";
}

function formatDateValue(value?: string) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return formatDateInput(date);
}

function formatTimeValue(value?: string) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return formatTimeInput(date);
}

function formatRepeatValue(rule?: NudgeRepeatRule | string) {
  const value = typeof rule === "string" ? rule : rule?.frequency;
  if (value === "daily") {
    return "Daily";
  }
  if (value === "weekly") {
    return "Weekly";
  }
  if (value === "monthly") {
    return "Monthly";
  }
  if (value === "yearly") {
    return "Yearly";
  }
  if (value === "custom") {
    return "Custom";
  }
  return "Never";
}

function formatRoutineFrequency(rule?: NudgeRepeatRule | string) {
  if (typeof rule === "object" && rule?.frequency === "custom" && rule.customText === "Weekdays") {
    return "Weekdays";
  }
  const value = typeof rule === "string" ? rule : rule?.frequency;
  if (value === "daily") {
    return "Daily";
  }
  if (value === "weekly") {
    return "Weekly";
  }
  if (value === "monthly") {
    return "Monthly";
  }
  if (value === "custom") {
    return "Custom";
  }
  return "Daily";
}

function getInitialCustomFrequencyText(rule?: NudgeRepeatRule) {
  if (rule?.frequency !== "custom") {
    return "";
  }
  if (!rule.customText || rule.customText === "Weekdays") {
    return "";
  }
  return rule.customText;
}

const ROUTINE_FREQUENCY_OPTIONS: Array<{ value: string; icon: IoniconName }> = [
  { value: "Daily", icon: "sunny-outline" },
  { value: "Weekdays", icon: "briefcase-outline" },
  { value: "Weekly", icon: "calendar-outline" },
  { value: "Monthly", icon: "calendar-number-outline" },
  { value: "Custom", icon: "options-outline" }
];

function resolveDateValue(existingValue: string | undefined, dateText: string, timeText?: string) {
  const trimmedDate = dateText.trim();
  if (!trimmedDate) {
    return existingValue;
  }
  const parsedDate = parseDisplayDate(trimmedDate, timeText);
  return parsedDate?.toISOString() ?? trimmedDate;
}

function resolveReminderDate(
  draft: NudgeItem,
  reminder: string,
  reminderDate: string,
  reminderTime: string
) {
  if (draft.type === "reminder") {
    return resolveDateValue(draft.reminderDate, reminderDate, reminderTime);
  }
  if (!reminder || reminder === "No reminder") {
    return draft.reminderDate;
  }
  return resolveDateValue(draft.reminderDate, reminder);
}

function parseDisplayDate(dateText: string, timeText?: string) {
  const dateMatch = dateText.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!dateMatch) {
    return undefined;
  }
  const [, day, month, year] = dateMatch;
  const timeMatch = timeText?.match(/^(\d{1,2}):(\d{2})$/);
  const hours = timeMatch ? Number(timeMatch[1]) : 9;
  const minutes = timeMatch ? Number(timeMatch[2]) : 0;
  return new Date(Number(year), Number(month) - 1, Number(day), hours, minutes);
}

function buildRepeatRule(
  draft: NudgeItem,
  repeatOption: string,
  routineFrequency: string,
  customFrequencyText: string
): NudgeRepeatRule | undefined {
  if (draft.type === "routine" || draft.type === "chore") {
    if (routineFrequency === "Weekdays") {
      return { frequency: "custom", customText: "Weekdays" };
    }
    if (routineFrequency === "Custom") {
      return {
        frequency: "custom",
        customText: customFrequencyText.trim() || undefined
      };
    }
    return { frequency: toRepeatFrequency(routineFrequency) };
  }
  if (draft.type === "reminder") {
    if (repeatOption === "Custom") {
      return {
        frequency: "custom",
        customText: customFrequencyText.trim() || undefined
      };
    }
    return { frequency: toRepeatFrequency(repeatOption) };
  }
  return draft.repeatRule;
}

function toRepeatFrequency(value: string): NudgeRepeatRule["frequency"] {
  const normalized = value.toLowerCase();
  if (normalized === "daily") {
    return "daily";
  }
  if (normalized === "weekly") {
    return "weekly";
  }
  if (normalized === "monthly") {
    return "monthly";
  }
  if (normalized === "yearly") {
    return "yearly";
  }
  if (normalized === "custom" || normalized === "weekdays") {
    return "custom";
  }
  return "none";
}

function getInitialListItems(draft: NudgeItem) {
  return draft.listItems;
}

function getInitialGiftIdeas(draft: NudgeItem) {
  return getDefaultGiftIdeas(draft.title);
}

function parseVoiceListItem(input: string) {
  return input.replace(/^add\s+/i, "").trim();
}

function splitListLines(input: string) {
  return input
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);
}

function addListItem(
  title: string,
  setListItems: React.Dispatch<
    React.SetStateAction<
      Array<{ id: string; title: string; status: "open" | "done" | "paused" | "waiting" | "cancelled" }>
    >
  >,
  clearInput: (value: string) => void
) {
  const lines = splitListLines(title);
  if (!lines.length) {
    return;
  }
  setListItems((current) => [
    ...current,
    ...lines.map((line, index) => ({
      id: `${Date.now()}-${current.length + index}`,
      title: capitalise(line),
      status: "open" as const
    }))
  ]);
  clearInput("");
}

function appendToNotes(
  capturedText: string,
  setNotes: React.Dispatch<React.SetStateAction<string>>,
  setVoiceNoteUrl: React.Dispatch<React.SetStateAction<string>>,
  voiceNoteUrl: string
) {
  setNotes((current) => [current, capturedText].filter(Boolean).join("\n"));
  setVoiceNoteUrl(voiceNoteUrl);
}

function capitalise(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function ReminderToggleTile({
  icon,
  label,
  active,
  onPress
}: {
  icon: IoniconName;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[rs.toggleTile, active && rs.toggleTileActive]}
    >
      <Ionicons name={icon} size={20} color={active ? colors.accent : colors.mutedText} />
      <AppText variant="caption" style={[rs.toggleLabel, active && rs.toggleLabelActive]}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  reminder: {
    gap: spacing.sm
  },
  checklistRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    flex: 1
  },
  checklistRowWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  openToolBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.secondary
  },
  openToolLabel: {
    color: colors.accent,
    fontWeight: "700",
    fontSize: 12
  },
  checklistBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card
  },
  checklistBoxDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  checklistDone: {
    textDecorationLine: "line-through",
    color: colors.mutedText
  },
  stepReminderRow: {
    gap: 2,
    paddingVertical: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight
  },
  stepReminderTitle: {
    color: colors.primaryDark,
    fontWeight: "600"
  },
  section: {
    gap: spacing.xs
  },
  projectAddRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingTop: spacing.sm
  },
  projectTypeChip: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  projectChildRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  linkedContact: {
    gap: spacing.xs,
    paddingTop: spacing.sm
  },
  actions: {
    gap: spacing.sm
  },
  calendarPreview: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "stretch"
  },
  calendarTimeRail: {
    width: 64,
    alignItems: "center",
    justifyContent: "center"
  },
  calendarBlock: {
    flex: 1,
    borderRadius: 18,
    padding: spacing.md,
    backgroundColor: "rgba(156, 183, 154, 0.22)",
    gap: spacing.xs
  },
  listItemRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(49, 86, 63, 0.65)",
    alignItems: "center",
    justifyContent: "center"
  },
  checkboxDone: {
    backgroundColor: "rgba(156, 183, 154, 0.5)"
  },
  smallDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(49, 86, 63, 0.75)"
  },
  doneText: {
    opacity: 0.58,
    textDecorationLine: "line-through"
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }]
  }
});

const ls = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  backBtn: {
    padding: spacing.xs
  },
  titleInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: colors.text
  },
  saveBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center"
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  shareBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3
  },
  shareBadgeText: {
    color: colors.onPrimary,
    fontSize: 10,
    fontWeight: "700"
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }]
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden"
  },
  fill: {
    height: "100%",
    borderRadius: radii.pill,
    backgroundColor: colors.progress
  },
  addBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    minHeight: 48,
    ...shadows.sm
  },
  addInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.sm,
    maxHeight: 96,
    textAlignVertical: "center"
  },
  iconBtn: {
    padding: 4
  },
  empty: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl
  },
  itemsCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 42,
    paddingHorizontal: spacing.xs,
    flex: 1
  },
  rowWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingRight: spacing.xs
  },
  openToolBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.secondary
  },
  openToolLabel: {
    color: colors.accent,
    fontWeight: "700",
    fontSize: 12
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center"
  },
  checkDone: {
    backgroundColor: colors.accent,
    borderColor: colors.accent
  },
  itemLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.text
  },
  itemDone: {
    opacity: 0.45,
    textDecorationLine: "line-through"
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm
  },
  dim: {
    color: colors.mutedText,
    fontWeight: "600"
  },
  dateBlock: {
    gap: spacing.xs
  },
  suggestBlock: {
    gap: spacing.xs
  },
  suggestHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  addAll: {
    color: colors.accent,
    fontWeight: "700"
  },
  suggestScroll: {
    gap: spacing.sm,
    paddingRight: spacing.sm
  },
  suggestChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  suggestLabel: {
    color: colors.text,
    fontWeight: "500"
  }
});

const rs = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  backBtn: { padding: spacing.xs },
  saveBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center"
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.96 }] },
  hero: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    ...shadows.md
  },
  heroGlow: {
    position: "absolute",
    top: -40,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primarySoft,
    opacity: 0.8
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.accent}18`,
    alignItems: "center",
    justifyContent: "center"
  },
  heroTitleRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm
  },
  heroTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    lineHeight: 30
  },
  whenRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  whenTile: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    minHeight: 52,
    ...shadows.sm
  },
  whenValue: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.sm
  },
  speakCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.sm
  },
  speakQuote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm
  },
  speakInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
    minHeight: 44,
    textAlignVertical: "top"
  },
  speakActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.sm
  },
  tileRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  toggleTile: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: spacing.sm,
    minHeight: 64
  },
  toggleTileActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}12`
  },
  toggleLabel: {
    color: colors.mutedText,
    fontWeight: "600"
  },
  toggleLabelActive: {
    color: colors.accent
  },
  dropdown: {
    gap: spacing.xs
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    minHeight: 52,
    ...shadows.sm
  },
  dropdownValue: {
    flex: 1,
    fontWeight: "600"
  },
  dropdownMenu: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    ...shadows.sm
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44
  },
  dropdownItemActive: {
    backgroundColor: `${colors.accent}12`
  },
  dropdownItemTextActive: {
    color: colors.accent,
    fontWeight: "600"
  },
  optionScroll: {
    gap: spacing.sm,
    paddingRight: spacing.sm
  },
  optionTile: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    gap: 2
  },
  optionTileActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}12`
  },
  notesWrap: {
    gap: spacing.xs
  },
  notesHeader: {
    alignItems: "flex-end"
  },
  notesInput: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    minHeight: 64,
    textAlignVertical: "top"
  },
  doneBtn: {
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.fab
  }
});

const ts = StyleSheet.create({
  optionsBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  optionsLabel: {
    color: colors.mutedText,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    fontSize: 9,
    flexShrink: 0
  },
  actionRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6
  },
  optionBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm
  },
  completeBtn: {
    backgroundColor: colors.accent
  },
  saveBtn: {
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.card
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.card
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }]
  }
});
