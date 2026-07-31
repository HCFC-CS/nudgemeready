import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { profileIcons, type ProfileIcon, useProfile } from "../hooks/useProfile";
import { pickProfilePhotoFromLibrary, takeProfilePhoto } from "../services/profilePhoto";
import { colors, radii, spacing } from "../theme/theme";
import { Button } from "./Button";
import { ProfileAvatar } from "./ProfileAvatar";
import { AppText } from "./Text";

type Props = {
  name?: string;
  icon?: ProfileIcon;
  avatarUri?: string;
  onIconChange?: (icon: ProfileIcon) => void;
  onAvatarChange?: (avatarUri: string | undefined) => void;
};

export function ProfileAvatarPicker({
  name,
  icon,
  avatarUri,
  onIconChange,
  onAvatarChange
}: Props = {}) {
  const { profile, updateIcon, updateAvatarUri, clearAvatar } = useProfile();
  const [notice, setNotice] = useState<string | null>(null);

  const controlled = Boolean(onIconChange || onAvatarChange);
  const displayName = name ?? profile.name;
  const displayIcon = icon ?? profile.icon;
  const displayAvatarUri = controlled ? avatarUri : profile.avatarUri;

  function setIcon(next: ProfileIcon) {
    setNotice(null);
    if (onIconChange) {
      onIconChange(next);
      return;
    }
    updateIcon(next);
  }

  function setAvatar(uri: string | undefined) {
    setNotice(null);
    if (onAvatarChange) {
      onAvatarChange(uri);
      return;
    }
    if (uri) {
      updateAvatarUri(uri);
      return;
    }
    clearAvatar();
  }

  async function handlePickFromLibrary() {
    setNotice(null);
    const result = await pickProfilePhotoFromLibrary();
    if (result.error) {
      setNotice(result.error);
      return;
    }
    if (result.uri) {
      setAvatar(result.uri);
    }
  }

  async function handleTakePhoto() {
    setNotice(null);
    const result = await takeProfilePhoto();
    if (result.error) {
      setNotice(result.error);
      return;
    }
    if (result.uri) {
      setAvatar(result.uri);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.previewRow}>
        <ProfileAvatar size={88} icon={displayIcon} avatarUri={displayAvatarUri} name={displayName} />
        <View style={styles.previewCopy}>
          <AppText variant="heading">{displayName.trim() || "Your profile"}</AppText>
          <AppText variant="caption">{displayAvatarUri ? "Using your photo" : "Using an emoji"}</AppText>
        </View>
      </View>

      <View style={styles.actions}>
        <Button tone="primary" style={styles.actionButton} onPress={handlePickFromLibrary}>
          Choose photo
        </Button>
        <Button tone="secondary" style={styles.actionButton} onPress={handleTakePhoto}>
          Take photo
        </Button>
        {displayAvatarUri ? (
          <Button tone="quiet" style={styles.actionButton} onPress={() => setAvatar(undefined)}>
            Remove photo
          </Button>
        ) : null}
      </View>

      <AppText variant="section">Or pick an emoji</AppText>
      <View style={styles.iconGrid}>
        {profileIcons.map((entry) => {
          const isSelected = !displayAvatarUri && displayIcon === entry.id;
          return (
            <Button
              key={entry.id}
              tone={isSelected ? "primary" : "quiet"}
              style={styles.iconButton}
              onPress={() => setIcon(entry.id)}
              accessibilityLabel={entry.label}
            >
              {entry.symbol}
            </Button>
          );
        })}
      </View>
      <AppText variant="muted">Your photo or emoji appears on the home screen and in your profile.</AppText>
      {notice ? (
        <AppText variant="small" style={styles.notice}>
          {notice}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  previewCopy: {
    flex: 1,
    gap: spacing.xs
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  actionButton: {
    flexGrow: 1,
    minWidth: "46%"
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  iconButton: {
    width: 58,
    minHeight: 58,
    borderRadius: radii.md
  },
  notice: {
    color: colors.softWarning
  }
});
