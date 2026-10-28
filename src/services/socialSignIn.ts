import { Platform } from "react-native";
import Constants from "expo-constants";
import * as AppleAuthentication from "expo-apple-authentication";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export type SocialAuthProvider = "apple" | "google";

export type SocialSignInResult = {
  provider: SocialAuthProvider;
  name: string;
  email: string;
};

type ExtraConfig = {
  googleIosClientId?: string;
  googleAndroidClientId?: string;
  googleWebClientId?: string;
};

function getExtra(): ExtraConfig {
  return (Constants.expoConfig?.extra ?? {}) as ExtraConfig;
}

export function isAppleSignInAvailable(): boolean {
  return Platform.OS === "ios";
}

export function isGoogleSignInConfigured(): boolean {
  const extra = getExtra();
  return Boolean(extra.googleIosClientId || extra.googleAndroidClientId || extra.googleWebClientId);
}

/**
 * Sign in with Apple — prefills name/email for local profile.
 * Does not create a cloud account; credentials stay on-device.
 */
export async function signInWithApple(): Promise<SocialSignInResult> {
  if (Platform.OS !== "ios") {
    throw new Error("Sign in with Apple is available on iPhone and iPad.");
  }

  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    throw new Error("Sign in with Apple isn’t available on this device.");
  }

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL
    ]
  });

  const nameParts = [credential.fullName?.givenName, credential.fullName?.familyName].filter(
    Boolean
  ) as string[];
  const name = nameParts.join(" ").trim();
  const email = (credential.email ?? "").trim().toLowerCase();

  if (!email && !name) {
    throw new Error(
      "Apple didn’t share a name or email. Enter your details below, or try again and allow sharing."
    );
  }

  return {
    provider: "apple",
    name,
    email
  };
}

/**
 * Sign in with Google — prefills name/email for local profile.
 * Requires Google OAuth client IDs in app.json extra.
 */
export async function signInWithGoogle(): Promise<SocialSignInResult> {
  if (!isGoogleSignInConfigured()) {
    throw new Error(
      "Google Sign-In isn’t configured yet. Use email signup, or add Google client IDs in the app build."
    );
  }

  const extra = getExtra();
  const redirectUri = AuthSession.makeRedirectUri({ scheme: "nudge-me" });
  const clientId =
    Platform.select({
      ios: extra.googleIosClientId || extra.googleWebClientId,
      android: extra.googleAndroidClientId || extra.googleWebClientId,
      default: extra.googleWebClientId
    }) || "";

  if (!clientId) {
    throw new Error("Google Sign-In isn’t configured for this platform yet.");
  }

  const discovery = {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    revocationEndpoint: "https://oauth2.googleapis.com/revoke",
    userInfoEndpoint: "https://openidconnect.googleapis.com/v1/userinfo"
  };

  const request = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    scopes: ["openid", "profile", "email"],
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
    extraParams: {
      access_type: "offline",
      prompt: "select_account"
    }
  });

  await request.makeAuthUrlAsync(discovery);
  const result = await request.promptAsync(discovery);
  if (result.type !== "success" || !result.params.code) {
    if (result.type === "dismiss" || result.type === "cancel") {
      throw new Error("Google Sign-In was cancelled.");
    }
    throw new Error("Google Sign-In didn’t finish. Try again or use email.");
  }

  const tokenResult = await AuthSession.exchangeCodeAsync(
    {
      clientId,
      code: result.params.code,
      redirectUri,
      extraParams: {
        code_verifier: request.codeVerifier || ""
      }
    },
    discovery
  );

  if (!tokenResult.accessToken) {
    throw new Error("Google Sign-In didn’t return an access token.");
  }

  const profileResponse = await fetch(discovery.userInfoEndpoint, {
    headers: { Authorization: `Bearer ${tokenResult.accessToken}` }
  });
  if (!profileResponse.ok) {
    throw new Error("Couldn’t read your Google profile. Try email signup instead.");
  }

  const profile = (await profileResponse.json()) as {
    email?: string;
    name?: string;
    given_name?: string;
  };
  const email = (profile.email ?? "").trim().toLowerCase();
  const name = (profile.name || profile.given_name || "").trim();
  if (!email) {
    throw new Error("Google didn’t share an email. Enter your details below.");
  }

  return {
    provider: "google",
    name,
    email
  };
}
