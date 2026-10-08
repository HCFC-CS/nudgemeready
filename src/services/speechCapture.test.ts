import { describe, expect, it } from "vitest";

import { buildSpeechStartOptions, resultTranscript, speechErrorCopy } from "./speechCapture";

describe("speech start options", () => {
  it("keeps listening until the person taps done and uses play-and-record on iOS", () => {
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
