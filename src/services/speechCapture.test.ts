import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
  abortSpeechSession,
  applySpeechResult,
  buildSpeechStartOptions,
  canStartSpeechTarget,
  completeSpeechFinish,
  confirmSpeechStart,
  createSpeechSession,
  failSpeechSession,
  isSpeechTargetActive,
  noteSpeechEngineEnd,
  requestSpeechFinish,
  requestSpeechStart,
  resultTranscript,
  speakListeningHint,
  speakToggleAccessibilityLabel,
  speechErrorCopy
} from "./speechCapture";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");

describe("speech start options", () => {
  it("keeps listening until the person taps the same speak button again and uses play-and-record on iOS", () => {
    const options = buildSpeechStartOptions({ persistRecording: true, onDevice: true });
    expect(options.continuous).toBe(true);
    expect(options.interimResults).toBe(true);
    expect(options.lang).toBe("en-GB");
    expect(options.iosTaskHint).toBe("dictation");
    expect(options.iosCategory.category).toBe("playAndRecord");
    expect(options.iosVoiceProcessingEnabled).toBe(true);
    expect(options.requiresOnDeviceRecognition).toBe(true);
    expect(options.recordingOptions).toEqual({ persist: true });
  });
});

describe("speech result and errors", () => {
  it("joins recognition transcripts", () => {
    expect(resultTranscript({ results: [{ transcript: "take the bins out" }] })).toBe("take the bins out");
    expect(resultTranscript({ results: [] })).toBe("");
  });

  it("uses warm copy when nothing was heard", () => {
    expect(speechErrorCopy("no-speech")).toMatch(/didn.t catch that/i);
    expect(speechErrorCopy("not-allowed")).toMatch(/permission/i);
  });
});

describe("microphone is not blocked by Ready", () => {
  it("capture buttons stop playback instead of speaking Ready first", () => {
    const capture = readFileSync(join(root, "src/components/NudgeComponents.tsx"), "utf8");
    const speakBtn = readFileSync(join(root, "src/components/SpeakButton.tsx"), "utf8");
    expect(capture).toContain("releasePlaybackForMicrophone");
    expect(capture).not.toContain("announceVoiceReady");
    expect(speakBtn).toContain("releasePlaybackForMicrophone");
    expect(speakBtn).not.toContain("announceVoiceReady");
  });
});

describe("only the tapped field receives speech", () => {
  it("treats another field, notes capture, and no target as inactive", () => {
    expect(isSpeechTargetActive("field:Title", "field:Title")).toBe(true);
    expect(isSpeechTargetActive("field:Title", "field:Notes")).toBe(false);
    expect(isSpeechTargetActive("field:Title", "voice-capture:notes")).toBe(false);
    expect(isSpeechTargetActive(null, "field:Title")).toBe(false);
    expect(isSpeechTargetActive("", "field:Title")).toBe(false);
  });

  it("does not let a second speak button start while another is listening", () => {
    expect(canStartSpeechTarget(null, "field:Title")).toBe(true);
    expect(canStartSpeechTarget("field:Title", "field:Title")).toBe(true);
    expect(canStartSpeechTarget("field:Title", "field:Notes")).toBe(false);
  });

  it("uses the same speak button to start and capture, with no Done speaking control", () => {
    expect(speakToggleAccessibilityLabel(false)).toBe("Tap to speak");
    expect(speakToggleAccessibilityLabel(true)).toBe("Tap again to capture");
    expect(speakListeningHint()).toMatch(/same button again/i);

    const speakBtn = readFileSync(join(root, "src/components/SpeakButton.tsx"), "utf8");
    const voiceCapture = readFileSync(join(root, "src/components/NudgeComponents.tsx"), "utf8");
    const field = readFileSync(join(root, "src/components/FormControls.tsx"), "utf8");
    const providers = readFileSync(join(root, "src/AppProviders.tsx"), "utf8");
    const captureHook = readFileSync(join(root, "src/hooks/useSpeechCapture.tsx"), "utf8");

    expect(providers).toContain("SpeechCaptureProvider");
    expect(speakBtn).toContain("useSpeechCapture");
    expect(speakBtn).not.toContain("useSpeechToText");
    expect(speakBtn).not.toContain("Done speaking");
    expect(speakBtn).not.toContain("checkmark");
    expect(voiceCapture).toContain("useSpeechCapture");
    expect(voiceCapture).not.toContain("useSpeechToText");
    expect(voiceCapture).not.toContain("Done speaking");
    expect(field).toContain("captureId={fieldCaptureId}");
    expect(captureHook).toContain("finishFor");
    expect(captureHook).toContain("canStartSpeechTarget");
    expect(captureHook).toContain("AppState");
    expect(captureHook).toContain("background");
    expect(speakBtn).toContain("speech.error");
    expect(speakBtn).toContain("mountedRef");
    expect(voiceCapture).toContain("mountedRef");
  });
});

function listeningSession(targetId: string, transcript = "") {
  const started = requestSpeechStart(createSpeechSession(), targetId);
  const listening = confirmSpeechStart(started.session, started.session.generation);
  if (!transcript) {
    return listening;
  }
  return applySpeechResult(listening, listening.generation, transcript);
}

describe("speech session stays with the field that started it", () => {
  it("lets the first tap start and keeps a second microphone from taking over", () => {
    const started = requestSpeechStart(createSpeechSession(), "field:Title");
    expect(started.accepted).toBe(true);
    expect(started.session.phase).toBe("starting");
    expect(started.session.targetId).toBe("field:Title");

    const listening = confirmSpeechStart(started.session, started.session.generation);
    expect(requestSpeechStart(listening, "field:Notes").accepted).toBe(false);
    expect(requestSpeechStart(listening, "field:Title").accepted).toBe(false);
    expect(requestSpeechFinish(listening, "field:Notes").accepted).toBe(false);
  });

  it("ignores a late result after capture and does not let an older finish clear the next field", () => {
    const title = listeningSession("field:Title", "take the bins out");
    const finishing = requestSpeechFinish(title, "field:Title");
    const done = completeSpeechFinish(finishing.session, finishing.generation);
    expect(done.applied).toBe(true);
    expect(done.capturedText).toBe("take the bins out");
    expect(applySpeechResult(done.session, finishing.generation, "and the recycling").transcript).toBe("");

    const notesStart = requestSpeechStart(done.session, "field:Notes");
    const notes = confirmSpeechStart(notesStart.session, notesStart.session.generation);
    const withNotes = applySpeechResult(notes, notes.generation, "buy milk");
    const lateFinish = completeSpeechFinish(withNotes, finishing.generation);
    expect(lateFinish.applied).toBe(false);
    expect(lateFinish.capturedText).toBe("");
    expect(lateFinish.session.targetId).toBe("field:Notes");
    expect(lateFinish.session.transcript).toBe("buy milk");
    expect(applySpeechResult(withNotes, title.generation, "take the bins out").transcript).toBe("buy milk");
  });

  it("returns captured words once, even if finish is tapped again", () => {
    const title = listeningSession("field:Title", "pack the kettle");
    const first = requestSpeechFinish(title, "field:Title");
    const second = requestSpeechFinish(first.session, "field:Title");
    expect(first.accepted).toBe(true);
    expect(second.accepted).toBe(false);
    expect(completeSpeechFinish(first.session, first.generation).capturedText).toBe("pack the kettle");
  });

  it("keeps words when recognition ends, so the same button can capture them", () => {
    const title = listeningSession("field:Title", "call the school");
    const heard = noteSpeechEngineEnd(title, title.generation);
    expect(heard.phase).toBe("heard");
    expect(heard.transcript).toBe("call the school");
    expect(requestSpeechStart(heard, "field:Notes").accepted).toBe(false);
    const finishing = requestSpeechFinish(heard, "field:Title");
    expect(finishing.accepted).toBe(true);
    expect(completeSpeechFinish(finishing.session, finishing.generation).capturedText).toBe("call the school");
  });

  it("releases the microphone when recognition ends with nothing to capture", () => {
    const title = listeningSession("field:Title");
    const ended = noteSpeechEngineEnd(title, title.generation);
    expect(ended.phase).toBe("idle");
    expect(ended.errorTargetId).toBe("field:Title");
    expect(ended.error).toMatch(/didn.t catch that/i);
    expect(ended.transcript).toBe("");
    expect(requestSpeechStart(ended, "field:Notes").accepted).toBe(true);
  });

  it("keeps a permission or recognition message on the field that asked, then lets another field start", () => {
    const starting = requestSpeechStart(createSpeechSession(), "field:Title");
    const denied = failSpeechSession(
      starting.session,
      starting.session.generation,
      speechErrorCopy("not-allowed")
    );
    expect(denied.phase).toBe("idle");
    expect(denied.targetId).toBeNull();
    expect(denied.errorTargetId).toBe("field:Title");
    expect(denied.error).toMatch(/permission/i);
    expect(denied.transcript).toBe("");
    expect(requestSpeechStart(denied, "field:Notes").accepted).toBe(true);

    const listening = listeningSession("field:Notes", "partial");
    const failed = failSpeechSession(listening, listening.generation, speechErrorCopy("network"));
    expect(failed.errorTargetId).toBe("field:Notes");
    expect(failed.transcript).toBe("");
    expect(applySpeechResult(failed, listening.generation, "partial").phase).toBe("idle");
  });

  it("leaves typed text alone when the field goes away or the app is backgrounded", () => {
    const title = listeningSession("field:Title", "half a sentence");
    expect(abortSpeechSession(title, "field:Notes")).toBe(title);

    const leftScreen = abortSpeechSession(title, "field:Title");
    expect(leftScreen.phase).toBe("idle");
    expect(leftScreen.transcript).toBe("");
    expect(leftScreen.error).toMatch(/you can type it instead/i);
    expect(completeSpeechFinish(leftScreen, title.generation).capturedText).toBe("");
    expect(applySpeechResult(leftScreen, title.generation, "half a sentence").transcript).toBe("");

    const backgrounded = abortSpeechSession(listeningSession("field:Notes", "still listening"));
    expect(backgrounded.phase).toBe("idle");
    expect(backgrounded.transcript).toBe("");
    expect(completeSpeechFinish(backgrounded, title.generation).applied).toBe(false);
  });

  it("keeps words that arrive before listening is confirmed", () => {
    const started = requestSpeechStart(createSpeechSession(), "field:Title");
    const withWords = applySpeechResult(started.session, started.session.generation, "lock the door");
    expect(withWords.phase).toBe("starting");
    const heard = noteSpeechEngineEnd(withWords, withWords.generation);
    expect(heard.phase).toBe("heard");
    expect(heard.targetId).toBe("field:Title");
    expect(requestSpeechStart(heard, "field:Notes").accepted).toBe(false);
    const finishing = requestSpeechFinish(heard, "field:Title");
    expect(completeSpeechFinish(finishing.session, finishing.generation).capturedText).toBe("lock the door");
  });

  it("does not replace a capture that is still finishing when the engine ends", () => {
    const title = listeningSession("field:Title", "water the plants");
    const finishing = requestSpeechFinish(title, "field:Title");
    const ended = noteSpeechEngineEnd(finishing.session, finishing.generation);
    expect(ended.phase).toBe("finishing");
    expect(ended.transcript).toBe("water the plants");
    const later = applySpeechResult(ended, ended.generation, "water the plants today");
    expect(completeSpeechFinish(later, finishing.generation).capturedText).toBe("water the plants today");
  });

  it("tells the person, in plain language, when a capture is stopped", () => {
    expect(speechErrorCopy("aborted")).toMatch(/you can type it instead/i);
    expect(speechErrorCopy("no-speech")).not.toMatch(/blame|fault|should have/i);
  });
});
