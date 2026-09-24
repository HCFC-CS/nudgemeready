import Constants from "expo-constants";

import type { NudgeItem } from "../types/nudge";
import {
  defaultAlexaLinkState,
  loadAlexaLinkState,
  saveAlexaLinkState,
  type AlexaLinkState
} from "./alexaLinkStorage";
import { createItem, isReady4PackItem } from "./nudgeItems";

type ExtraConfig = {
  alexaBridgeUrl?: string;
  alexaBridgeSecret?: string;
};

export type AlexaPendingAdd = {
  id: string;
  title: string;
  createdAt: string;
  source: "alexa";
};

function extraConfig() {
  return (Constants.expoConfig?.extra ?? {}) as ExtraConfig;
}

export function getAlexaBridgeUrl() {
  return extraConfig().alexaBridgeUrl?.trim() ?? "";
}

export function isAlexaBridgeConfigured() {
  return Boolean(getAlexaBridgeUrl());
}

function bridgeHeaders(deviceToken?: string | null) {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json"
  };
  const secret = extraConfig().alexaBridgeSecret?.trim();
  if (secret) {
    headers["X-Nudge-Secret"] = secret;
  }
  if (deviceToken) {
    headers.Authorization = `Bearer ${deviceToken}`;
  }
  return headers;
}

async function bridgeFetch(path: string, init: RequestInit & { deviceToken?: string | null }) {
  const base = getAlexaBridgeUrl().replace(/\/+$/, "");
  if (!base) {
    throw new Error("Alexa bridge is not configured yet.");
  }
  const { deviceToken, ...rest } = init;
  const response = await fetch(`${base}${path}`, {
    ...rest,
    headers: {
      ...bridgeHeaders(deviceToken),
      ...(rest.headers as Record<string, string> | undefined)
    }
  });
  const text = await response.text();
  let body: Record<string, unknown> = {};
  try {
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    body = { error: text || "Invalid response" };
  }
  if (!response.ok) {
    throw new Error(typeof body.error === "string" ? body.error : `Alexa bridge error (${response.status})`);
  }
  return body;
}

export function toAlexaNudgeSnapshot(items: NudgeItem[]) {
  return items
    .filter((item) => item.status === "open" && !isReady4PackItem(item))
    .sort((a, b) => a.title.localeCompare(b.title))
    .slice(0, 40)
    .map((item) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      status: item.status
    }));
}

export async function enableAlexaLink(): Promise<AlexaLinkState> {
  if (!isAlexaBridgeConfigured()) {
    const next = {
      ...defaultAlexaLinkState,
      lastError: "Alexa bridge URL is not set in this build yet."
    };
    await saveAlexaLinkState(next);
    return next;
  }

  const body = await bridgeFetch("/v1/register", { method: "POST" });
  const expiresIn =
    typeof body.expiresInSeconds === "number" ? body.expiresInSeconds : 15 * 60;
  const next: AlexaLinkState = {
    enabled: true,
    deviceToken: String(body.deviceToken ?? ""),
    linkCode: String(body.linkCode ?? ""),
    linkCodeExpiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    linkedToAlexa: false,
    lastSyncAt: null,
    lastError: null
  };
  await saveAlexaLinkState(next);
  return next;
}

export async function refreshAlexaLinkCode(state: AlexaLinkState): Promise<AlexaLinkState> {
  if (!state.deviceToken) {
    return enableAlexaLink();
  }
  const body = await bridgeFetch("/v1/link-code", {
    method: "POST",
    deviceToken: state.deviceToken
  });
  const expiresIn =
    typeof body.expiresInSeconds === "number" ? body.expiresInSeconds : 15 * 60;
  const next: AlexaLinkState = {
    ...state,
    enabled: true,
    linkCode: String(body.linkCode ?? state.linkCode),
    linkCodeExpiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    lastError: null
  };
  await saveAlexaLinkState(next);
  return next;
}

export async function disableAlexaLink(state?: AlexaLinkState): Promise<AlexaLinkState> {
  const current = state ?? (await loadAlexaLinkState());
  if (current.deviceToken && isAlexaBridgeConfigured()) {
    try {
      await bridgeFetch("/v1/unlink", {
        method: "POST",
        deviceToken: current.deviceToken
      });
    } catch {
      // Still clear local link if the bridge is unreachable.
    }
  }
  const next = { ...defaultAlexaLinkState, lastError: null };
  await saveAlexaLinkState(next);
  return next;
}

export async function syncAlexaNudges(items: NudgeItem[], state?: AlexaLinkState) {
  const current = state ?? (await loadAlexaLinkState());
  if (!current.enabled || !current.deviceToken || !isAlexaBridgeConfigured()) {
    return current;
  }
  try {
    const body = await bridgeFetch("/v1/sync", {
      method: "POST",
      deviceToken: current.deviceToken,
      body: JSON.stringify({ nudges: toAlexaNudgeSnapshot(items) })
    });
    const next: AlexaLinkState = {
      ...current,
      linkedToAlexa: Boolean(body.linked),
      lastSyncAt: new Date().toISOString(),
      lastError: null
    };
    await saveAlexaLinkState(next);
    return next;
  } catch (error) {
    const next: AlexaLinkState = {
      ...current,
      lastError: error instanceof Error ? error.message : "Could not sync with Alexa."
    };
    await saveAlexaLinkState(next);
    return next;
  }
}

export async function pullAlexaPendingAdds(state?: AlexaLinkState) {
  const current = state ?? (await loadAlexaLinkState());
  if (!current.enabled || !current.deviceToken || !isAlexaBridgeConfigured()) {
    return { state: current, pendingAdds: [] as AlexaPendingAdd[] };
  }
  const body = await bridgeFetch("/v1/pending", {
    method: "GET",
    deviceToken: current.deviceToken
  });
  const pendingAdds = Array.isArray(body.pendingAdds)
    ? (body.pendingAdds as AlexaPendingAdd[])
    : [];
  const next: AlexaLinkState = {
    ...current,
    linkedToAlexa: Boolean(body.linked),
    lastError: null
  };
  await saveAlexaLinkState(next);
  return { state: next, pendingAdds };
}

export async function ackAlexaPendingAdds(ids: string[], state?: AlexaLinkState) {
  const current = state ?? (await loadAlexaLinkState());
  if (!current.deviceToken || !ids.length) {
    return current;
  }
  await bridgeFetch("/v1/pending/ack", {
    method: "POST",
    deviceToken: current.deviceToken,
    body: JSON.stringify({ ids })
  });
  return current;
}

export function createNudgeFromAlexaPending(
  pending: AlexaPendingAdd,
  createdBy: NudgeItem["createdBy"]
) {
  return createItem({
    title: pending.title,
    type: "reminder",
    createdBy,
    notes: "Added with Alexa.",
    speakingReminderText: pending.title
  });
}

export function formatAlexaLinkCodeForSpeech(code: string) {
  return code.replace(/\D/g, "").split("").join(" ");
}
