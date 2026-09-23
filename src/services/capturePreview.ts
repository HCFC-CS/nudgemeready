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
