import * as ImagePicker from "expo-image-picker";

export async function pickProfilePhotoFromLibrary() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { uri: null, error: "Photo library access is needed to choose a profile picture." };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images",
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return { uri: null, error: null };
  }

  return { uri: result.assets[0].uri, error: null };
}

export async function takeProfilePhoto() {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return { uri: null, error: "Camera access is needed to take a profile picture." };
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return { uri: null, error: null };
  }

  return { uri: result.assets[0].uri, error: null };
}
