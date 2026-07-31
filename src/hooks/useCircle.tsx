import { createContext, type PropsWithChildren, useContext, useEffect, useState } from "react";

import { getEncryptedItem, setEncryptedItem } from "../services/encryptedStorage";
import type { ReminderRequest, TrustedPerson, TrustedRole, VillageMemberType } from "../types/models";

const CIRCLE_KEY = "do-enough-done:circle";

type CircleContextValue = ReturnType<typeof useProvideCircle>;

const CircleContext = createContext<CircleContextValue | undefined>(undefined);

function useProvideCircle() {
  const [isReady, setIsReady] = useState(false);
  const [people, setPeople] = useState<TrustedPerson[]>([]);
  const [requests, setRequests] = useState<ReminderRequest[]>([]);

  useEffect(() => {
    getEncryptedItem(CIRCLE_KEY)
      .then((raw) => {
        if (raw) {
          setPeople(JSON.parse(raw).map(normalizePerson));
        }
      })
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (isReady) {
      void setEncryptedItem(CIRCLE_KEY, JSON.stringify(people));
    }
  }, [isReady, people]);

  return {
    people,
    requests,
    addPerson: (person: TrustedPerson) => setPeople((current) => [...current, person]),
    updatePerson: (person: TrustedPerson) =>
      setPeople((current) => current.map((item) => (item.id === person.id ? person : item))),
    removePerson: (personId: string) =>
      setPeople((current) => current.filter((person) => person.id !== personId)),
    updateRequest: (request: ReminderRequest) =>
      setRequests((current) => current.map((item) => (item.id === request.id ? request : item)))
  };
}

function normalizePerson(person: TrustedPerson & { role?: string; roles?: string[]; memberType?: string }): TrustedPerson {
  return {
    ...person,
    memberType: normalizeMemberType(person.memberType),
    roles: normalizeRoles(person.roles, person.role),
    role: undefined
  };
}

function normalizeMemberType(memberType?: string): VillageMemberType {
  if (
    memberType === "family" ||
    memberType === "friends" ||
    memberType === "healthcare" ||
    memberType === "carer" ||
    memberType === "socialServices" ||
    memberType === "school" ||
    memberType === "church"
  ) {
    return memberType;
  }
  return "family";
}

function normalizeRoles(roles?: string[], role?: string): TrustedRole[] {
  const source = roles?.length ? roles : role ? [role] : ["cheerleader"];
  const normalized = source.map((item) => {
    if (item === "viewer") {
      return "viewer";
    }
    if (item === "nudger" || item === "buddy" || item === "contributor") {
      return "contributor";
    }
    if (item === "cheerleader") {
      return "cheerleader";
    }
    if (item === "coach") {
      return "coach";
    }
    return undefined;
  }).filter(Boolean) as TrustedRole[];

  return Array.from(new Set(normalized.length ? normalized : ["cheerleader"]));
}

export function CircleProvider({ children }: PropsWithChildren) {
  return <CircleContext.Provider value={useProvideCircle()}>{children}</CircleContext.Provider>;
}

export function useCircle() {
  const context = useContext(CircleContext);
  if (!context) {
    throw new Error("useCircle must be used inside CircleProvider");
  }
  return context;
}
