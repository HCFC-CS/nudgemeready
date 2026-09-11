import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";

import {
  defaultEventPrepSteps,
  formatTimelineTime,
  getMilestoneTimeline,
  getPrepStartTime,
  getPrepStepTimeMap,
  parseEventDateTime
} from "../services/eventPrepTimeline";
import { estimateDrivingTravel } from "../services/travelEstimate";
import { brand, colors, radii, spacing } from "../theme/theme";
import type { EventPrepStep, NudgeLocation } from "../types/nudge";
import { LocationFinderField } from "./LocationFinderField";
import { AppText } from "./Text";
import { VoiceFieldActions } from "./VoiceFieldActions";

const durationOptions = [15, 30, 45, 60];
const baseTravelOptions = [30, 45, 60, 90];
const readyOptions = [10, 15, 20, 30];

type EventPrepPlannerProps = {
  eventDate: string;
  eventTime: string;
  venue: string;
  venueLocation?: NudgeLocation;
  homeLocation?: NudgeLocation;
  travelMinutes: number;
  readyMinutes: number;
  prepSteps: EventPrepStep[];
  onHomeLocationChange: (location: NudgeLocation | undefined) => void;
  onTravelMinutesChange: (value: number) => void;
  onReadyMinutesChange: (value: number) => void;
  onPrepStepsChange: (steps: EventPrepStep[]) => void;
  editable?: boolean;
};

export function EventPrepPlanner({
  eventDate,
  eventTime,
  venue,
  venueLocation,
  homeLocation,
  travelMinutes,
  readyMinutes,
  prepSteps,
  onHomeLocationChange,
  onTravelMinutesChange,
  onReadyMinutesChange,
  onPrepStepsChange,
  editable = true
}: EventPrepPlannerProps) {
  const [newStepTitle, setNewStepTitle] = useState("");
  const [estimatedTravelMinutes, setEstimatedTravelMinutes] = useState<number | undefined>();
  const [isEstimatingTravel, setIsEstimatingTravel] = useState(false);
  const [travelEstimateError, setTravelEstimateError] = useState("");
  const manualTravelOverrideRef = useRef(false);
  const eventAt = useMemo(() => parseEventDateTime(eventDate, eventTime), [eventDate, eventTime]);
  const travelOptions = useMemo(() => {
    if (estimatedTravelMinutes == null || baseTravelOptions.includes(estimatedTravelMinutes)) {
      return baseTravelOptions;
    }
    return [...baseTravelOptions, estimatedTravelMinutes].sort((a, b) => a - b);
  }, [estimatedTravelMinutes]);
  const milestones = useMemo(
    () => getMilestoneTimeline(eventAt, travelMinutes, readyMinutes, prepSteps, venue.trim() || undefined),
    [eventAt, travelMinutes, readyMinutes, prepSteps, venue]
  );
  const prepTimes = useMemo(
    () => getPrepStepTimeMap(eventAt, travelMinutes, readyMinutes, prepSteps),
    [eventAt, travelMinutes, readyMinutes, prepSteps]
  );
  const prepStart = getPrepStartTime(eventAt, travelMinutes, readyMinutes, prepSteps);
  const hasPlan = prepStart && !Number.isNaN(prepStart.getTime());
  const leaveMilestone = milestones.find((entry) => entry.kind === "leave");

  useEffect(() => {
    let cancelled = false;
    const fromLat = homeLocation?.latitude;
    const fromLon = homeLocation?.longitude;
    const toLat = venueLocation?.latitude;
    const toLon = venueLocation?.longitude;

    if (fromLat == null || fromLon == null || toLat == null || toLon == null) {
      setEstimatedTravelMinutes(undefined);
      setTravelEstimateError("");
      setIsEstimatingTravel(false);
      return;
    }

    setIsEstimatingTravel(true);
    setTravelEstimateError("");

    void estimateDrivingTravel(homeLocation, venueLocation)
      .then((estimate) => {
        if (cancelled) {
          return;
        }
        if (!estimate) {
          setEstimatedTravelMinutes(undefined);
          setTravelEstimateError("Couldn’t estimate travel just now — pick a time below.");
          return;
        }
        setEstimatedTravelMinutes(estimate.minutes);
        if (!manualTravelOverrideRef.current) {
          onTravelMinutesChange(estimate.minutes);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEstimatedTravelMinutes(undefined);
          setTravelEstimateError("Couldn’t estimate travel just now — pick a time below.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsEstimatingTravel(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    homeLocation?.latitude,
    homeLocation?.longitude,
    venueLocation?.latitude,
    venueLocation?.longitude,
    onTravelMinutesChange
  ]);

  function setTravelMinutes(value: number) {
    manualTravelOverrideRef.current = true;
    onTravelMinutesChange(value);
  }

  function applyEstimatedTravel() {
    if (estimatedTravelMinutes == null) {
      return;
    }
    manualTravelOverrideRef.current = false;
    onTravelMinutesChange(estimatedTravelMinutes);
  }

  function updateStep(stepId: string, updates: Partial<EventPrepStep>) {
    onPrepStepsChange(prepSteps.map((step) => (step.id === stepId ? { ...step, ...updates } : step)));
  }

  function removeStep(stepId: string) {
    onPrepStepsChange(prepSteps.filter((step) => step.id !== stepId));
  }

  function addStep() {
    const title = newStepTitle.trim();
    if (!title) {
      return;
    }
    onPrepStepsChange([...prepSteps, { id: `prep-${Date.now()}`, title, durationMinutes: 15 }]);
    setNewStepTitle("");
  }

  function loadDefaultSteps() {
    onPrepStepsChange(defaultEventPrepSteps.map((step) => ({ ...step, id: `${step.id}-${Date.now()}` })));
    if (estimatedTravelMinutes != null) {
      manualTravelOverrideRef.current = false;
      onTravelMinutesChange(estimatedTravelMinutes);
    } else {
      onTravelMinutesChange(60);
    }
    onReadyMinutesChange(15);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <AppText variant="heading">Prep plan</AppText>
          {hasPlan ? (
            <AppText variant="caption" style={styles.subtitle}>
              Start at {formatTimelineTime(prepStart)} · leave{" "}
              {leaveMilestone ? formatTimelineTime(leaveMilestone.startAt) : "—"} ({travelMinutes} min travel)
            </AppText>
          ) : (
            <AppText variant="caption" style={styles.dim}>
              Set the event date and time above.
            </AppText>
          )}
        </View>
        {editable ? (
          <Pressable accessibilityRole="button" onPress={loadDefaultSteps} style={styles.exampleBtn}>
            <AppText variant="caption" style={styles.exampleLabel}>
              Example
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.panel}>
        <AppText variant="caption" style={styles.panelTitle}>
          Journey
        </AppText>
        <LocationFinderField
          label="Leaving from"
          value={homeLocation}
          onChange={(location) => {
            manualTravelOverrideRef.current = false;
            onHomeLocationChange(location);
          }}
          placeholder="Skelmersdale"
          editable={editable}
        />
        {isEstimatingTravel ? (
          <View style={styles.estimateRow}>
            <ActivityIndicator size="small" color={colors.accent} />
            <AppText variant="caption" style={styles.dim}>
              Estimating drive time…
            </AppText>
          </View>
        ) : null}
        {estimatedTravelMinutes != null && !isEstimatingTravel ? (
          <View style={styles.estimateRow}>
            <AppText variant="caption" style={styles.estimateText}>
              Estimated drive ~{estimatedTravelMinutes} min
            </AppText>
            {editable && travelMinutes !== estimatedTravelMinutes ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Use estimated travel time of ${estimatedTravelMinutes} minutes`}
                onPress={applyEstimatedTravel}
                style={styles.estimateBtn}
              >
                <AppText variant="caption" style={styles.estimateBtnLabel}>
                  Use for leave time
                </AppText>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        {travelEstimateError ? (
          <AppText variant="caption" style={styles.estimateError}>
            {travelEstimateError}
          </AppText>
        ) : null}
        <SettingRow
          label="Travel time (sets leave time)"
          options={travelOptions}
          value={travelMinutes}
          onChange={setTravelMinutes}
          editable={editable}
          highlightValue={estimatedTravelMinutes}
        />
        <SettingRow
          label="Ready before leaving"
          options={readyOptions}
          value={readyMinutes}
          onChange={onReadyMinutesChange}
          editable={editable}
        />
        <AppText variant="caption" style={styles.dim}>
          Leave time and every prep step work backwards from the event, using this travel time first.
        </AppText>
      </View>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <AppText variant="caption" style={styles.panelTitle}>
            Getting ready
          </AppText>
          <View style={styles.columnHeadings}>
            <AppText variant="caption" style={[styles.colHead, styles.colTime]}>
              Time
            </AppText>
            <AppText variant="caption" style={[styles.colHead, styles.colStep]}>
              Step
            </AppText>
            <AppText variant="caption" style={[styles.colHead, styles.colMin]}>
              Min
            </AppText>
          </View>
        </View>

        <View style={styles.stepsBody}>
          {prepSteps.map((step, index) => (
            <View key={step.id} style={[styles.stepBlock, index < prepSteps.length - 1 && styles.stepDivider]}>
              <View style={styles.stepMain}>
                <AppText variant="caption" style={styles.stepTime}>
                  {prepTimes.get(step.id) ?? "—"}
                </AppText>
                <TextInput
                  style={styles.stepInput}
                  value={step.title}
                  onChangeText={(value) => updateStep(step.id, { title: value })}
                  placeholder="Step name"
                  placeholderTextColor={colors.mutedText}
                  editable={editable}
                />
                <VoiceFieldActions
                  value={step.title}
                  onChangeText={(value) => updateStep(step.id, { title: value })}
                  editable={editable}
                  size={26}
                />
                {editable ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${step.title}`}
                    onPress={() => removeStep(step.id)}
                    hitSlop={8}
                    style={styles.removeBtn}
                  >
                    <Ionicons name="close" size={16} color={colors.mutedText} />
                  </Pressable>
                ) : (
                  <View style={styles.removeSpacer} />
                )}
              </View>
              <DurationPicker
                value={step.durationMinutes}
                onChange={(minutes) => updateStep(step.id, { durationMinutes: minutes })}
                editable={editable}
              />
            </View>
          ))}

          {editable ? (
            <View style={styles.addRow}>
              <Ionicons name="add" size={18} color={colors.accent} />
              <TextInput
                style={styles.addInput}
                value={newStepTitle}
                onChangeText={setNewStepTitle}
                placeholder="Add a step"
                placeholderTextColor={colors.mutedText}
                returnKeyType="done"
                onSubmitEditing={addStep}
              />
              <VoiceFieldActions value={newStepTitle} onChangeText={setNewStepTitle} size={26} />
              {newStepTitle.trim() ? (
                <Pressable accessibilityRole="button" onPress={addStep} style={styles.addConfirm}>
                  <AppText variant="caption" style={styles.addConfirmLabel}>
                    Add
                  </AppText>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>

      {hasPlan ? (
        <View style={styles.panel}>
          <AppText variant="caption" style={styles.panelTitle}>
            Then
          </AppText>
          {milestones.map((entry, index) => (
            <View key={entry.id} style={[styles.milestoneRow, index < milestones.length - 1 && styles.stepDivider]}>
              <View style={styles.milestoneRail}>
                <View
                  style={[
                    styles.milestoneDot,
                    entry.kind === "ready" && styles.dotReady,
                    entry.kind === "leave" && styles.dotLeave,
                    entry.kind === "event" && styles.dotEvent
                  ]}
                />
              </View>
              <View style={styles.milestoneContent}>
                <AppText variant="caption" style={styles.milestoneTime}>
                  {formatTimelineTime(entry.startAt)}
                </AppText>
                <View style={styles.milestoneText}>
                  <AppText
                    variant="small"
                    style={entry.kind === "event" ? styles.milestoneTitleEvent : styles.milestoneTitle}
                  >
                    {entry.title}
                  </AppText>
                  {entry.subtitle && entry.kind !== "event" ? (
                    <AppText variant="caption" style={styles.dim}>
                      {entry.subtitle}
                    </AppText>
                  ) : null}
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function SettingRow({
  label,
  options,
  value,
  onChange,
  editable,
  highlightValue
}: {
  label: string;
  options: number[];
  value: number;
  onChange: (value: number) => void;
  editable: boolean;
  highlightValue?: number;
}) {
  return (
    <View style={styles.settingRow}>
      <AppText variant="caption" style={styles.settingLabel}>
        {label}
      </AppText>
      <View style={styles.segmentTrack}>
        {options.map((option) => (
          <Pressable
            key={option}
            accessibilityRole="button"
            disabled={!editable}
            onPress={() => onChange(option)}
            style={({ pressed }) => [
              styles.segment,
              value === option && styles.segmentOn,
              highlightValue === option && value !== option && styles.segmentEstimate,
              pressed && editable && styles.pressed
            ]}
          >
            <AppText
              variant="caption"
              style={[
                styles.segmentLabel,
                value === option && styles.segmentLabelOn,
                highlightValue === option && value !== option && styles.segmentLabelEstimate
              ]}
            >
              {option}m
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function DurationPicker({
  value,
  onChange,
  editable
}: {
  value: number;
  onChange: (minutes: number) => void;
  editable: boolean;
}) {
  return (
    <View style={styles.durationTrack}>
      {durationOptions.map((option) => (
        <Pressable
          key={option}
          accessibilityRole="button"
          disabled={!editable}
          onPress={() => onChange(option)}
          style={({ pressed }) => [
            styles.durationSegment,
            value === option && styles.durationSegmentOn,
            pressed && editable && styles.pressed
          ]}
        >
          <AppText
            variant="caption"
            style={[styles.durationLabel, value === option && styles.durationLabelOn]}
          >
            {option}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md
  },
  headerText: {
    flex: 1
  },
  subtitle: {
    color: colors.accent,
    fontWeight: "700",
    marginTop: 2
  },
  dim: {
    color: colors.mutedText,
    marginTop: 2
  },
  exampleBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: brand.ivoryElevated,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  exampleLabel: {
    color: colors.accent,
    fontWeight: "700"
  },
  panel: {
    backgroundColor: brand.ivoryElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    gap: spacing.sm
  },
  panelHeader: {
    gap: spacing.xs
  },
  panelTitle: {
    color: colors.mutedText,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  estimateRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  estimateText: {
    color: colors.accent,
    fontWeight: "700"
  },
  estimateBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.secondary
  },
  estimateBtnLabel: {
    color: colors.accent,
    fontWeight: "700"
  },
  estimateError: {
    color: colors.softWarning
  },
  columnHeadings: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 2
  },
  colHead: {
    color: colors.mutedText,
    fontWeight: "600"
  },
  colTime: {
    width: 58
  },
  colStep: {
    flex: 1
  },
  colMin: {
    width: 120,
    textAlign: "right",
    paddingRight: 28
  },
  settingRow: {
    gap: spacing.xs
  },
  settingLabel: {
    color: colors.mutedText,
    fontWeight: "600"
  },
  segmentTrack: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: 3,
    gap: 3
  },
  segment: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: radii.sm
  },
  segmentOn: {
    backgroundColor: colors.accent
  },
  segmentEstimate: {
    borderWidth: 1,
    borderColor: colors.accent
  },
  segmentLabel: {
    color: colors.text,
    fontWeight: "600"
  },
  segmentLabelOn: {
    color: colors.onPrimary
  },
  segmentLabelEstimate: {
    color: colors.accent
  },
  stepsBody: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    overflow: "hidden"
  },
  stepBlock: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.sm
  },
  stepDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight
  },
  stepMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  stepTime: {
    width: 58,
    color: colors.accent,
    fontWeight: "700"
  },
  stepInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 0
  },
  removeBtn: {
    width: 28,
    alignItems: "center"
  },
  removeSpacer: {
    width: 28
  },
  durationTrack: {
    flexDirection: "row",
    marginLeft: 58 + spacing.sm,
    backgroundColor: brand.ivoryElevated,
    borderRadius: radii.sm,
    padding: 2,
    gap: 2
  },
  durationSegment: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: 6
  },
  durationSegmentOn: {
    backgroundColor: colors.accent
  },
  durationLabel: {
    color: colors.mutedText,
    fontWeight: "700"
  },
  durationLabelOn: {
    color: colors.onPrimary
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight
  },
  addInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 0
  },
  addConfirm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.accent
  },
  addConfirmLabel: {
    color: colors.onPrimary,
    fontWeight: "700"
  },
  milestoneRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.sm
  },
  milestoneRail: {
    width: 16,
    alignItems: "center",
    paddingTop: 4
  },
  milestoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent
  },
  dotReady: {
    backgroundColor: "#7B9FD4"
  },
  dotLeave: {
    backgroundColor: "#5C7FB8"
  },
  dotEvent: {
    backgroundColor: colors.text,
    width: 10,
    height: 10,
    borderRadius: 5
  },
  milestoneContent: {
    flex: 1,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start"
  },
  milestoneTime: {
    width: 58,
    color: colors.accent,
    fontWeight: "700"
  },
  milestoneText: {
    flex: 1,
    gap: 1
  },
  milestoneTitle: {
    color: colors.text,
    fontWeight: "600"
  },
  milestoneTitleEvent: {
    color: colors.text,
    fontWeight: "700"
  },
  pressed: {
    opacity: 0.88
  }
});
