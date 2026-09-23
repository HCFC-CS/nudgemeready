import { classifyCaptureText } from "./classifyCaptureText";
import { resolveSomethingElse } from "./nudgeIntentCatalog";
import { formatNudgeWhen, whenIsoFromFields } from "./quickCapture";

export function buildCapturePreview(text: string, installedPackIds: string[] = []) {
  const classified = classifyCaptureText(text);
  const resolved = resolveSomethingElse(text, installedPackIds);
  const whenIso = whenIsoFromFields(resolved.suggestedFields);
  const inferredWhen = !classified.extractedDate && !classified.extractedTime;

  return {
    title: resolved.title,
    type: resolved.itemType,
    packId: resolved.packId,
    intent: resolved.intent,
    resolved,
    classified,
    whenIso,
    whenLabel: formatNudgeWhen(whenIso),
    inferredWhen,
    confidence: classified.confidence
  };
}

/** Keep dates from the original words even if the person edited the title. */
export function resolveCaptureSave(originalText: string, title: string, installedPackIds: string[] = []) {
  const source = originalText.trim() || title.trim();
  const resolved = resolveSomethingElse(source, installedPackIds);
  return {
    ...resolved,
    title: title.trim() || resolved.title
  };
}
