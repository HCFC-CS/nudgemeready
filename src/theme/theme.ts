import { Platform } from "react-native";

/** Nudge Me Ready brand palette */
export const brand = {
  warmIvory: "#F8F6F3",
  softTaupe: "#D8D0C8",
  babyBlue: "#AFCDEB",
  babyBlueDark: "#8BB0D4",
  babyBlueSoft: "#DCE9F5",
  softGrey: "#B9BDC2",
  charcoal: "#4A4F55",
  softGold: "#C9A86A",
  midnightBlue: "#1A2744",
  midnightBlueMuted: "#5A6B82",
  taupeLight: "#EDE8E3",
  ivoryElevated: "#FFFDFB"
} as const;

export const colors = {
  background: brand.warmIvory,
  warmIvory: brand.warmIvory,
  softTaupe: brand.softTaupe,
  babyBlue: brand.babyBlue,
  softGrey: brand.softGrey,
  charcoal: brand.charcoal,
  midnightBlue: brand.midnightBlue,
  softGold: brand.softGold,
  surface: brand.warmIvory,
  surfaceMuted: brand.taupeLight,
  text: brand.midnightBlue,
  mutedText: brand.midnightBlueMuted,
  accent: brand.softGold,
  primary: brand.babyBlue,
  primaryDark: brand.midnightBlue,
  primaryPressed: brand.babyBlueDark,
  primarySoft: brand.babyBlueSoft,
  secondary: brand.softTaupe,
  softWarning: brand.softTaupe,
  card: brand.softTaupe,
  border: brand.softGrey,
  borderLight: brand.taupeLight,
  success: brand.softGold,
  progress: brand.softGold,
  fab: brand.babyBlue,
  link: brand.softGold,
  onPrimary: brand.midnightBlue,
  onFab: brand.midnightBlue
};

export const classificationColors = {
  home: {
    background: brand.babyBlueSoft,
    border: brand.babyBlue,
    accent: brand.babyBlueDark
  },
  work: {
    background: brand.taupeLight,
    border: brand.softTaupe,
    accent: brand.charcoal
  },
  school: {
    background: brand.babyBlueSoft,
    border: brand.babyBlue,
    accent: brand.charcoal
  },
  health: {
    background: brand.taupeLight,
    border: brand.softTaupe,
    accent: brand.charcoal
  },
  clubs: {
    background: brand.ivoryElevated,
    border: brand.softGold,
    accent: brand.softGold
  }
};

export const taskTypeAccentColors: Record<string, string> = {
  task: brand.babyBlueDark,
  taskJob: brand.babyBlueDark,
  subtask: brand.babyBlue,
  project: brand.midnightBlue,
  reminder: brand.softGold,
  appointment: brand.babyBlueDark,
  event: brand.softGold,
  list: brand.softTaupe,
  alert: brand.midnightBlue,
  occasion: brand.softGold,
  special_day: brand.softGold,
  chore: brand.babyBlue,
  routine: brand.babyBlue,
  note: brand.softGrey
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999
};

export const typography = {
  title: 28,
  heading: 17,
  section: 14,
  body: 16,
  small: 13,
  caption: 11,
  timer: 56,
  fontFamily: {
    regular: "System",
    medium: "System",
    semibold: "System",
    bold: "System",
    light: "System"
  }
};

export const shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: brand.midnightBlue,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4
    },
    android: { elevation: 2 },
    default: {}
  }),
  md: Platform.select({
    ios: {
      shadowColor: brand.midnightBlue,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12
    },
    android: { elevation: 4 },
    default: {}
  }),
  fab: Platform.select({
    ios: {
      shadowColor: brand.midnightBlue,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 10
    },
    android: { elevation: 8 },
    default: {}
  })
};
