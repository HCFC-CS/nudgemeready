import type { ReadyPack, ReadyPackKind } from "../../types/readyPacks";
import { characterPacks, themePacks, voicePacks } from "./cosmetics";
import { ready4ContentPacks } from "./ready4";

/** Edition 1 Ready 4 content packs. */
const contentPacks: ReadyPack[] = ready4ContentPacks;

export const readyPackCatalogue: ReadyPack[] = [
  ...contentPacks,
  ...themePacks,
  ...voicePacks,
  ...characterPacks
];

const byId = new Map(readyPackCatalogue.map((pack) => [pack.id, pack]));

export function listPacks(kind?: ReadyPackKind): ReadyPack[] {
  if (!kind) {
    return readyPackCatalogue;
  }
  return readyPackCatalogue.filter((pack) => pack.kind === kind);
}

export function getPack(id: string): ReadyPack | undefined {
  return byId.get(id);
}

export function listContentPacks(): ReadyPack[] {
  return listPacks("content");
}
