export type HandleKind =
  | "number"
  | "string"
  | "boolean"
  | "signal"
  | "expr"
  | "any";

export type HandleMultiplicity = "single" | "multi";

export type ParsedHandle = {
  types: HandleKind[];
  multiplicity: HandleMultiplicity;
  name?: string;
};
