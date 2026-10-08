import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    setupFiles: [path.join(root, "src/test/setup.ts")]
  },
  resolve: {
    alias: {
      "react-native": path.join(root, "src/test/reactNativeStub.cjs"),
      "@react-native-async-storage/async-storage": path.join(root, "src/test/asyncStorageStub.cjs"),
      "expo-secure-store": path.join(root, "src/test/expoSecureStoreStub.cjs"),
      "expo-crypto": path.join(root, "src/test/expoCryptoStub.cjs"),
      "expo-constants": path.join(root, "src/test/expoConstantsStub.cjs")
    }
  }
});
