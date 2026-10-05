export type SplashBootStep =
  | "welcome"
  | "register"
  | "setup"
  | "unlock"
  | "forgot"
  | "recoveryCode"
  | "crewUnlock"
  | "reset"
  | "recoveryShown";

/**
 * Decide which splash panel to show. Registration must not wait for security
 * boot — otherwise an empty profile paints the title with no buttons.
 */
export function nextSplashBootStep(input: {
  bootReady: boolean;
  needsUnlock: boolean;
  needsRegistration: boolean;
  needsSecuritySetup: boolean;
  hasCredential: boolean;
  current: SplashBootStep;
  hasRecoverToken: boolean;
}): SplashBootStep {
  if (input.hasRecoverToken) {
    return input.current;
  }
  if (input.needsUnlock) {
    return "unlock";
  }
  if (input.needsRegistration) {
    return "register";
  }
  if (input.current === "register") {
    return input.hasCredential ? "welcome" : "setup";
  }
  if (!input.bootReady) {
    return input.current;
  }
  if (input.needsSecuritySetup) {
    return "setup";
  }
  if (
    input.current === "unlock" ||
    input.current === "forgot" ||
    input.current === "recoveryCode" ||
    input.current === "crewUnlock" ||
    input.current === "reset" ||
    input.current === "setup"
  ) {
    return "welcome";
  }
  return input.current;
}

export function shouldShowSplashRegister(
  step: SplashBootStep,
  needsRegistration: boolean,
  needsUnlock: boolean
) {
  return !needsUnlock && (step === "register" || needsRegistration);
}

export function shouldShowSplashWelcome(
  step: SplashBootStep,
  needsRegistration: boolean,
  needsUnlock: boolean
) {
  return step === "welcome" && !needsUnlock && !needsRegistration;
}
