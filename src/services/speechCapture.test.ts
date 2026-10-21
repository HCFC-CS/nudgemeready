import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
  buildSpeechStartOptions,
  canStartSpeechTarget,
  isSpeechTargetActive,
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
  });
});
