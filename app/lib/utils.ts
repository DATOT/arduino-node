import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ParsedHandle, HandleKind, HandleMultiplicity } from "../types/handle";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function encodeHandle({
  types,
  multiplicity,
  name,
}: ParsedHandle): string {
  const typeStr = `[${types.join("|")}]`;
  return name
    ? `${typeStr}-${multiplicity}-${name}`
    : `${typeStr}-${multiplicity}`;
}

export function decodeHandle(id?: string | null): ParsedHandle | null {
  if (!id) return null;

  const match = id.match(/^\[(.+)\]-(single|multi)(?:-(.+))?$/);
  if (!match) return null;

  const [, typesStr, multiplicity, name] = match;

  return {
    types: typesStr.split("|") as HandleKind[],
    multiplicity: multiplicity as HandleMultiplicity,
    name,
  };
}
