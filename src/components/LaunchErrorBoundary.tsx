import { Component, type ErrorInfo, type ReactNode } from "react";

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
      return <LaunchShell />;
    }
    return this.props.children;
  }
}
