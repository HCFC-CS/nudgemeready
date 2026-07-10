import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { profileIcons, type ProfileIcon, useProfile } from "../hooks/useProfile";
import { pickProfilePhotoFromLibrary, takeProfilePhoto } from "../services/profilePhoto";
import { colors, radii, spacing } from "../theme/theme";
import { Button } from "./Button";
import { ProfileAvatar } from "./ProfileAvatar";
import { AppText } from "./Text";

export function ProfileAvatarPicker() {
  const { profile, updateIcon, updateAvatarUri, clearAvatar } = useProfile();
  const [notice, setNotice] = useState<string | null>(null);

  async function handlePickFromLibrary() {
    setNotice(null);
    const result = await pickProfilePhotoFromLibrary();
    if (result.error) {
      setNotice(result.error);
      return;
    }
    if (result.uri) {
      updateAvatarUri(result.uri);
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
      updateAvatarUri(result.uri);
    }
  }

  function handleSelectIcon(icon: ProfileIcon) {
    setNotice(null);
    updateIcon(icon);
  }

  return (
    <View style={styles.container}>
      <View style={styles.previewRow}>
        <ProfileAvatar size={88} />
        <View style={styles.previewCopy}>
          <AppText variant="heading">{profile.name.trim() || "Your profile"}</AppText>
          <AppText variant="caption">
            {profile.avatarUri ? "Using your photo" : "Using a symbol icon"}
          </AppText>
        </View>
      </View>

      <View style={styles.actions}>
        <Button tone="primary" style={styles.actionButton} onPress={handlePickFromLibrary}>
          Choose photo
        </Button>
        <Button tone="secondary" style={styles.actionButton} onPress={handleTakePhoto}>
          Take photo
        </Button>
        {profile.avatarUri ? (
          <Button tone="quiet" style={styles.actionButton} onPress={clearAvatar}>
            Remove photo
          </Button>
        ) : null}
      </View>

      <AppText variant="section">Or pick a symbol</AppText>
      <View style={styles.iconGrid}>
        {profileIcons.map((icon) => {
          const isSelected = !profile.avatarUri && profile.icon === icon.id;
          return (
            <Button
              key={icon.id}
              tone={isSelected ? "primary" : "quiet"}
              style={styles.iconButton}
              onPress={() => handleSelectIcon(icon.id)}
              accessibilityLabel={icon.label}
            >
              {icon.symbol}
            </Button>
          );
        })}
      </View>
      <AppText variant="muted">Your photo or symbol appears on the home screen and in your profile.</AppText>
      {notice ? <AppText variant="small" style={styles.notice}>{notice}</AppText> : null}
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
