type PendingInvite = {
  inviteId: string;
  payload?: string;
};

let lockActive = false;
let pendingInvite: PendingInvite | null = null;
let pendingRecoverToken: string | null = null;
const unlockListeners = new Set<() => void>();

export function setDeepLinkLockActive(active: boolean) {
  const wasLocked = lockActive;
  lockActive = active;
  if (wasLocked && !active) {
    unlockListeners.forEach((listener) => listener());
  }
}

export function isDeepLinkLockActive() {
  return lockActive;
}

export function stashPendingInvite(invite: PendingInvite) {
  pendingInvite = invite;
}

export function takePendingInvite() {
  const next = pendingInvite;
  pendingInvite = null;
  return next;
}

export function peekPendingInvite() {
  return pendingInvite;
}

export function stashPendingRecoverToken(token: string) {
  pendingRecoverToken = token;
}

export function takePendingRecoverToken() {
  const next = pendingRecoverToken;
  pendingRecoverToken = null;
  return next;
}

export function onDeepLinkUnlock(listener: () => void) {
  unlockListeners.add(listener);
  return () => {
    unlockListeners.delete(listener);
  };
}
