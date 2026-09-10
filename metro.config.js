const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// `expo-secure-store` has no real web implementation (Expo ships an empty web
// module), which crashes the app on web. The web target is only used for local
// previews and the screenshot pipeline, so on web we resolve it to a
// browser-storage-backed shim. Native platforms keep the real SecureStore.
const secureStoreWebShim = path.resolve(__dirname, "src/shims/secureStore.web.js");
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && moduleName === "expo-secure-store") {
    return { type: "sourceFile", filePath: secureStoreWebShim };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
