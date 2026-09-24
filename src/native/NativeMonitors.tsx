import "../services/leavingHomeGeofence";
import "../services/payLaterGeofence";

import { useLeavingHomeMonitor } from "../hooks/useLeavingHomeMonitor";
import { usePayLaterMonitor } from "../hooks/usePayLaterMonitor";
import { usePhoneCalendarImport } from "../hooks/usePhoneCalendarImport";
import { useSpeakingReminderNotifications } from "../hooks/useSpeakingReminderNotifications";

/** Location, calendar and notification listeners — mount only after splash has painted. */
export function NativeMonitors() {
  useSpeakingReminderNotifications();
  useLeavingHomeMonitor();
  usePayLaterMonitor();
  usePhoneCalendarImport();
  return null;
}
