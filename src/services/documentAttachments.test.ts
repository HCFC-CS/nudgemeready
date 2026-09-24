import { beforeEach, describe, expect, it, vi } from "vitest";

const getDocumentAsync = vi.fn();
const getInfoAsync = vi.fn();
const makeDirectoryAsync = vi.fn();
const readAsStringAsync = vi.fn();
const writeAsStringAsync = vi.fn();
const deleteAsync = vi.fn();

vi.mock("expo-document-picker", () => ({
  getDocumentAsync: (...args: unknown[]) => getDocumentAsync(...args)
}));

vi.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: vi.fn(),
  launchImageLibraryAsync: vi.fn(),
  requestCameraPermissionsAsync: vi.fn(),
  launchCameraAsync: vi.fn()
}));

vi.mock("expo-file-system/legacy", () => ({
  documentDirectory: null,
  cacheDirectory: null,
  EncodingType: { Base64: "base64" },
  getInfoAsync: (...args: unknown[]) => getInfoAsync(...args),
  makeDirectoryAsync: (...args: unknown[]) => makeDirectoryAsync(...args),
  readAsStringAsync: (...args: unknown[]) => readAsStringAsync(...args),
  writeAsStringAsync: (...args: unknown[]) => writeAsStringAsync(...args),
  deleteAsync: (...args: unknown[]) => deleteAsync(...args)
}));

import {
  documentCategoryLabel,
  pickDocumentFile,
  titleFromAttachmentName,
  WEB_DOC_SCHEME
} from "./documentAttachments";

describe("document uploads", () => {
  beforeEach(() => {
    getDocumentAsync.mockReset();
    vi.unstubAllGlobals();
  });

  it("labels common document kinds", () => {
    expect(documentCategoryLabel("identity")).toBe("Identity");
    expect(documentCategoryLabel("other")).toBe("Other");
  });

  it("turns a file name into a nudge title", () => {
    expect(titleFromAttachmentName("Passport scan.pdf")).toBe("Passport scan");
    expect(titleFromAttachmentName("  ")).toBe("Document");
  });

  it("returns null when the picker is cancelled", async () => {
    getDocumentAsync.mockResolvedValue({ canceled: true, assets: [] });
    await expect(pickDocumentFile("item-1", "other")).resolves.toBeNull();
  });

  it("saves a picked file and keeps the upload live without native disk", async () => {
    getDocumentAsync.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: "https://example.test/letter.pdf",
          name: "letter.pdf",
          mimeType: "application/pdf"
        }
      ]
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        arrayBuffer: async () => new Uint8Array([80, 68, 70]).buffer
      }))
    );

    const attachment = await pickDocumentFile("item-1", "identity");
    expect(attachment).toMatchObject({
      name: "letter.pdf",
      mimeType: "application/pdf",
      category: "identity"
    });
    expect(attachment?.url.startsWith(WEB_DOC_SCHEME)).toBe(true);
    expect(writeAsStringAsync).not.toHaveBeenCalled();
  });
});
