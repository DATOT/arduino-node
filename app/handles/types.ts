import { LabeledHandleProps } from "@/app/components/labeled-handle";
import { HandleProps } from "@xyflow/react";
import { MathNode } from "mathjs";
import { HandleMultiplicity } from "../types/handle";

export interface BaseHandleProps extends LabeledHandleProps {
  multiplicity: HandleMultiplicity;
}

