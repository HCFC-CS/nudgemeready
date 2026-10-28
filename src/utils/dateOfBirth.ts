/** Parse UK-style DD/MM/YYYY or ISO YYYY-MM-DD into a validated ISO date. */
export function parseDateOfBirthInput(value: string): string | null {
  const cleaned = value.trim();
  if (!cleaned) {
    return null;
  }

  let day: number;
  let month: number;
  let year: number;

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(cleaned);
  const uk = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(cleaned);
  if (iso) {
    year = Number(iso[1]);
    month = Number(iso[2]);
    day = Number(iso[3]);
  } else if (uk) {
    day = Number(uk[1]);
    month = Number(uk[2]);
    year = Number(uk[3]);
  } else {
    return null;
  }

  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return null;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  if (date.getTime() > todayUtc) {
    return null;
  }

  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
}

export function formatDateOfBirthDisplay(iso: string | undefined): string {
  if (!iso) {
    return "";
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    return iso;
  }
  return `${match[3]}/${match[2]}/${match[1]}`;
}

/** Minimum age for app account signup (organisational app, not medical). */
export const MIN_SIGNUP_AGE = 13;

export function validateDateOfBirthForSignup(value: string): string {
  const iso = parseDateOfBirthInput(value);
  if (!iso) {
    throw new Error("Enter your date of birth as DD/MM/YYYY.");
  }
  const [year, month, day] = iso.split("-").map(Number);
  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() + 1 - month;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age -= 1;
  }
  if (age < MIN_SIGNUP_AGE) {
    throw new Error(`You need to be at least ${MIN_SIGNUP_AGE} to create a profile.`);
  }
  if (age > 120) {
    throw new Error("Enter a valid date of birth.");
  }
  return iso;
}
