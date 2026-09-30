import { describe, expect, it } from "vitest";

import {
  formatDateOfBirthDisplay,
  parseDateOfBirthInput,
  validateDateOfBirthForSignup
} from "../utils/dateOfBirth";

describe("dateOfBirth", () => {
  it("parses UK and ISO formats", () => {
    expect(parseDateOfBirthInput("24/08/1990")).toBe("1990-08-24");
    expect(parseDateOfBirthInput("1990-08-24")).toBe("1990-08-24");
    expect(parseDateOfBirthInput("31/02/1990")).toBeNull();
  });

  it("formats for display", () => {
    expect(formatDateOfBirthDisplay("1990-08-24")).toBe("24/08/1990");
  });

  it("rejects under-13 signup", () => {
    const recent = new Date();
    recent.setFullYear(recent.getFullYear() - 10);
    const value = `${String(recent.getDate()).padStart(2, "0")}/${String(recent.getMonth() + 1).padStart(2, "0")}/${recent.getFullYear()}`;
    expect(() => validateDateOfBirthForSignup(value)).toThrow(/at least 13/);
  });

  it("accepts adult DOB", () => {
    expect(validateDateOfBirthForSignup("15/03/1995")).toBe("1995-03-15");
  });
});

describe("support reset mailto", () => {
  it("targets support@ with recovery details", () => {
    const support = "support@nudgemeready.app";
    const recoveryEmail = "user@example.com";
    const webLink = "https://nudgemeready.app/recover?t=abc";
    const subject = encodeURIComponent("Password reset request — Nudge me Ready");
    const body = encodeURIComponent(
      ["AUTOMATED RESET REQUEST", "", `Recovery email: ${recoveryEmail}`, webLink].join("\n")
    );
    const url = `mailto:${support}?subject=${subject}&body=${body}`;
    expect(url.startsWith("mailto:support@nudgemeready.app?")).toBe(true);
    expect(decodeURIComponent(url)).toContain("user@example.com");
    expect(decodeURIComponent(url)).toContain(webLink);
  });
});
