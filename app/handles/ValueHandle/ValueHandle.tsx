import React from "react";
import { Position } from "@xyflow/react";
import BaseHandle from "../BaseHandle";
import { BaseHandleProps } from "../types";
import { HandleKind, HandleMultiplicity } from "@/app/types/handle";
import { encodeHandle } from "@/app/lib/utils";

const ValueHandle: React.FC<
  BaseHandleProps & {
    kinds: HandleKind[];
    name?: string;
  }
> = (props) => {
  const { id, type, kinds, multiplicity, name, ...rest } = props;

  // Use the explicit id when provided; fall back to a subtype-based id so that
  // two handles of the same subtype on the same node don't collide.
  const resolvedId =
    id ?? encodeHandle({ types: kinds, multiplicity, name })

  return (
    <BaseHandle
      id={resolvedId}
      {...rest}
      type={type}
      position={type === "target" ? Position.Left : Position.Right}
      multiplicity={multiplicity}
    />
  );
};

export default ValueHandle;
