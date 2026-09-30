import { useEffect, useState, type ComponentType } from "react";
import { Platform } from "react-native";

import { LaunchErrorBoundary } from "./src/components/LaunchErrorBoundary";
import { LaunchShell } from "./src/components/LaunchShell";
import { waitForNativeModules } from "./src/services/expoNotifications";

/**
 * Hold a branded shell until native modules are safe to touch.
 * iOS 26 aborts if a native method throws during NudgeApp's first ticks.
 */
export default function App() {
  const [Root, setRoot] = useState<ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = import("./src/NudgeApp");
    const ready = Platform.OS === "web" ? Promise.resolve() : waitForNativeModules();
    void Promise.all([ready, load])
      .then(([, mod]) => {
        if (!cancelled) {
          setRoot(() => mod.default);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!Root) {
    return <LaunchShell message="Just a moment" />;
  }

  return (
    <LaunchErrorBoundary>
      <Root />
    </LaunchErrorBoundary>
  );
}
