import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";

import { getEncryptedItem, setEncryptedItem } from "../services/encryptedStorage";

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

type Profile = {
  name: string;
  icon: ProfileIcon;
  avatarUri?: string;
  email: string;
  phone: string;
};

export type ProfileDraft = Profile;

type ProfileContextValue = {
  profile: Profile;
  updateName: (name: string) => void;
  updateIcon: (icon: ProfileIcon) => void;
  updateAvatarUri: (avatarUri: string) => void;
  clearAvatar: () => void;
  updateEmail: (email: string) => void;
  updatePhone: (phone: string) => void;
  saveProfile: (next: ProfileDraft) => void;
};

const defaultProfile: Profile = {
  name: "Helen",
  icon: "sun",
  email: "",
  phone: ""
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    getEncryptedItem(PROFILE_KEY)
      .then((raw) => {
        if (raw) {
          setProfile({ ...defaultProfile, ...JSON.parse(raw) });
        }
      })
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (isReady) {
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

  const saveProfile = useCallback((next: ProfileDraft) => {
    setProfile({
      name: next.name.trim() || defaultProfile.name,
      icon: next.icon,
      avatarUri: next.avatarUri,
      email: next.email.trim(),
      phone: next.phone.trim()
    });
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        updateName,
        updateIcon,
        updateAvatarUri,
        clearAvatar,
        updateEmail,
        updatePhone,
        saveProfile
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
