import { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable } from "react-native";

import { LaunchShell } from "./LaunchShell";

type Props = { children: ReactNode };
type State = { failed: boolean };

/** Production iOS shows a white screen on an uncaught render error. Keep the title instead. */
export class LaunchErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Stay on the branded shell. Do not rethrow.
  }

  render() {
    if (this.state.failed) {
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Try opening Nudge me Ready again"
          onPress={() => this.setState({ failed: false })}
          style={{ flex: 1 }}
        >
          <LaunchShell message="Tap to try again" />
        </Pressable>
      );
    }
    return this.props.children;
  }
}
