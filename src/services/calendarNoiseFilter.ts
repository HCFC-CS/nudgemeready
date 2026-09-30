/**
 * Phone calendar often includes holidays, DST notices, and similar noise.
 * Keep personal appointments/events; drop the general clutter.
 */

const NOISY_CALENDAR_NAME =
  /\b(holiday|holidays|birthday|birthdays|festival|festivals|national holiday|uk holidays|us holidays|siri suggestions|subscribed|weather)\b/i;

const NOISY_EVENT_TITLE =
  /\b(halloween|christmas(\s+day|\s+eve)?|boxing\s+day|new\s+year'?s?(\s+(day|eve))?|easter(\s+monday|\s+sunday)?|good\s+friday|valentine'?s?\s+day|mother'?s?\s+day|father'?s?\s+day|thanksgiving|diwali|hanukkah|eid(\s+al[-\s]?[af]itr|\s+al[-\s]?adha)?|st\.?\s*patrick'?s?\s+day|guy\s+fawkes|bonfire\s+night|bank\s+holiday|public\s+holiday|national\s+holiday|independence\s+day|labour\s+day|labor\s+day|memorial\s+day|veterans?\s+day|daylight\s+saving|daylight\s+savings|\bdst\b|clocks?\s+(go|change|fall|spring|forward|back)|british\s+summer\s+time|\bbst\b|summer\s+time\s+begins|winter\s+time\s+begins|spring\s+forward|fall\s+back)\b/i;

export function isNoisyCalendarName(name: string) {
  return NOISY_CALENDAR_NAME.test(name.trim());
}

export function isNoisyCalendarEventTitle(title: string) {
  const cleaned = title.trim();
  if (!cleaned) {
    return true;
  }
  return NOISY_EVENT_TITLE.test(cleaned);
}

export function shouldImportPhoneCalendarEvent(input: {
  title?: string | null;
  calendarTitle?: string | null;
  calendarSourceName?: string | null;
}) {
  const title = (input.title ?? "").trim();
  if (!title) {
    return false;
  }
  if (isNoisyCalendarEventTitle(title)) {
    return false;
  }
  const calendarBlob = [input.calendarTitle, input.calendarSourceName].filter(Boolean).join(" ");
  if (calendarBlob && isNoisyCalendarName(calendarBlob)) {
    return false;
  }
  return true;
}
