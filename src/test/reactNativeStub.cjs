module.exports = {
  View: "View",
  Text: "Text",
  Platform: { OS: "ios", select: (obj) => obj.ios },
  StyleSheet: { create: (styles) => styles, hairlineWidth: 1 },
  Alert: { alert: () => undefined },
  AppState: { addEventListener: () => ({ remove: () => undefined }) },
  Vibration: { vibrate: () => undefined },
  Pressable: "Pressable",
  ScrollView: "ScrollView",
  TextInput: "TextInput"
};
