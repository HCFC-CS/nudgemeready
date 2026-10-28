import { Alert, Linking } from "react-native";

/** Open an external URL with a calm fallback if the device cannot open it. */
export async function openExternalUrl(url: string, label = "that link"): Promise<boolean> {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert("Couldn’t open link", `This phone couldn’t open ${label}. Try again in a moment.`);
      return false;
    }
    await Linking.openURL(url);
    return true;
  } catch {
    Alert.alert("Couldn’t open link", `Something went wrong opening ${label}. You can try again later.`);
    return false;
  }
}
