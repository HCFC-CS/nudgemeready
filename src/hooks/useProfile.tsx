import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";

import { getEncryptedItem, setEncryptedItem } from "../services/encryptedStorage";
import { shouldUseScreenshotDemoProfile } from "../navigation/screenshotState";
import type { SocialAuthProvider } from "../services/socialSignIn";

const PROFILE_KEY = "do-enough-done:profile";

export type ProfileIcon =
  | "sun"
  | "star"
  | "leaf"
  | "moon"
  | "heart"
  | "sparkle"
  | "flower"
  | "wave";

export const profileIcons: Array<{ id: ProfileIcon; symbol: string; label: string }> = [
  { id: "sun", symbol: "☀️", label: "Sun" },
  { id: "star", symbol: "⭐", label: "Star" },
  { id: "leaf", symbol: "🌿", label: "Leaf" },
  { id: "moon", symbol: "🌙", label: "Moon" },
  { id: "heart", symbol: "💙", label: "Heart" },
  { id: "sparkle", symbol: "✨", label: "Sparkle" },
  { id: "flower", symbol: "🌸", label: "Flower" },
  { id: "wave", symbol: "🌊", label: "Wave" }
];

export type AuthProvider = SocialAuthProvider | "email";

type Profile = {
  name: string;
  icon: ProfileIcon;
  avatarUri?: string;
  email: string;
  phone: string;
  /** ISO date YYYY-MM-DD */
  dateOfBirth?: string;
  /** How the user started signup (details still stored locally). */
  authProvider?: AuthProvider;
  /** ISO timestamp set when first-install registration is completed. */
  registeredAt?: string;
  /** When the user accepted Terms of Use */
  termsOfUseAcceptedAt?: string;
  termsOfUseVersion?: string;
};

export type ProfileDraft = Profile;

type ProfileContextValue = {
  profile: Profile;
  isProfileReady: boolean;
  needsRegistration: boolean;
  updateName: (name: string) => void;
  updateIcon: (icon: ProfileIcon) => void;
  updateAvatarUri: (avatarUri: string) => void;
  clearAvatar: () => void;
  updateEmail: (email: string) => void;
  updatePhone: (phone: string) => void;
  updateDateOfBirth: (dateOfBirth: string) => void;
  saveProfile: (next: ProfileDraft) => void;
  completeRegistration: (next: ProfileDraft) => void;
};

const defaultProfile: Profile = {
  name: "",
  icon: "sun",
  email: "",
  phone: ""
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (shouldUseScreenshotDemoProfile()) {
      setProfile({
        name: "Helen",
        icon: "sun",
        email: "hello@nudgemeready.app",
        phone: "",
        dateOfBirth: "1980-01-15",
        authProvider: "email",
        registeredAt: "2026-01-01T09:00:00.000Z",
        termsOfUseAcceptedAt: "2026-01-01T09:00:00.000Z",
        termsOfUseVersion: "1.1"
      });
      setIsReady(true);
      return;
    }
    getEncryptedItem(PROFILE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = { ...defaultProfile, ...JSON.parse(raw) } as Profile;
          // Existing installs that already chose a name shouldn't be forced through registration again.
          if (parsed.name.trim() && !parsed.registeredAt) {
            parsed.registeredAt = "migrated";
          }
          setProfile(parsed);
        }
      })
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (isReady && !shouldUseScreenshotDemoProfile()) {
      void setEncryptedItem(PROFILE_KEY, JSON.stringify(profile));
    }
  }, [isReady, profile]);

  const updateName = useCallback((name: string) => {
    setProfile((current) => ({ ...current, name }));
  }, []);

  const updateIcon = useCallback((icon: ProfileIcon) => {
    setProfile((current) => ({ ...current, icon, avatarUri: undefined }));
  }, []);

  const updateAvatarUri = useCallback((avatarUri: string) => {
    setProfile((current) => ({ ...current, avatarUri }));
  }, []);

  const clearAvatar = useCallback(() => {
    setProfile((current) => ({ ...current, avatarUri: undefined }));
  }, []);

  const updateEmail = useCallback((email: string) => {
    setProfile((current) => ({ ...current, email }));
  }, []);

  const updatePhone = useCallback((phone: string) => {
    setProfile((current) => ({ ...current, phone }));
  }, []);

  const updateDateOfBirth = useCallback((dateOfBirth: string) => {
    setProfile((current) => ({ ...current, dateOfBirth }));
  }, []);

  const saveProfile = useCallback(
    (next: ProfileDraft) => {
      setProfile({
        name: next.name.trim(),
        icon: next.icon,
        avatarUri: next.avatarUri,
        email: next.email.trim(),
        phone: next.phone.trim(),
        dateOfBirth: next.dateOfBirth?.trim() || profile.dateOfBirth,
        authProvider: next.authProvider ?? profile.authProvider,
        registeredAt: next.registeredAt ?? profile.registeredAt,
        termsOfUseAcceptedAt: next.termsOfUseAcceptedAt ?? profile.termsOfUseAcceptedAt,
        termsOfUseVersion: next.termsOfUseVersion ?? profile.termsOfUseVersion
      });
    },
    [
      profile.authProvider,
      profile.dateOfBirth,
      profile.registeredAt,
      profile.termsOfUseAcceptedAt,
      profile.termsOfUseVersion
    ]
  );

  const completeRegistration = useCallback((next: ProfileDraft) => {
    setProfile({
      name: next.name.trim(),
      icon: next.icon,
      avatarUri: next.avatarUri,
      email: next.email.trim().toLowerCase(),
      phone: next.phone.trim(),
      dateOfBirth: next.dateOfBirth?.trim(),
      authProvider: next.authProvider ?? "email",
      registeredAt: new Date().toISOString(),
      termsOfUseAcceptedAt: next.termsOfUseAcceptedAt ?? new Date().toISOString(),
      termsOfUseVersion: next.termsOfUseVersion
    });
  }, []);

  // First install, or complete missing mandatory fields (email / date of birth).
  const needsRegistration =
    isReady &&
    (!profile.registeredAt ||
      !profile.name.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim()) ||
      !profile.dateOfBirth);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isProfileReady: isReady,
        needsRegistration,
        updateName,
        updateIcon,
        updateAvatarUri,
        clearAvatar,
        updateEmail,
        updatePhone,
        updateDateOfBirth,
        saveProfile,
        completeRegistration
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used inside ProfileProvider");
  }
  return context;
}
