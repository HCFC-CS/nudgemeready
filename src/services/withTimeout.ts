const DEFAULT_MS = 1500;

/** If a native storage call never returns (iOS 26 swallowed exception), do not block launch. */
export function withTimeout<T>(work: Promise<T>, fallback: T, ms = DEFAULT_MS): Promise<T> {
  return Promise.race([
    work.catch(() => fallback),
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(fallback), ms);
    })
  ]);
}
