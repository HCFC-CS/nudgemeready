import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";

const PROFILE_KEY = "do-enough-done:profile";

export type ProfileIcon = "sun" | "star" | "leaf" | "moon";

export const profileIcons: Array<{ id: ProfileIcon; symbol: string; label: string }> = [
  { id: "sun", symbol: "○", label: "Circle" },
  { id: "star", symbol: "◇", label: "Diamond" },
  { id: "leaf", symbol: "△", label: "Triangle" },
  { id: "moon", symbol: "□", label: "Square" }
];

type Profile = {
  name: string;
  icon: ProfileIcon;
  avatarUri?: string;
  email: string;
  phone: string;
};

type ProfileContextValue = {
  profile: Profile;
  updateName: (name: string) => void;
  updateIcon: (icon: ProfileIcon) => void;
  updateAvatarUri: (avatarUri: string) => void;
  clearAvatar: () => void;
  updateEmail: (email: string) => void;
  updatePhone: (phone: string) => void;
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
    AsyncStorage.getItem(PROFILE_KEY)
      .then((raw) => {
        if (raw) {
          setProfile({ ...defaultProfile, ...JSON.parse(raw) });
        }
      })
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (isReady) {
      AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
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

  return (
    <ProfileContext.Provider
      value={{ profile, updateName, updateIcon, updateAvatarUri, clearAvatar, updateEmail, updatePhone }}
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
