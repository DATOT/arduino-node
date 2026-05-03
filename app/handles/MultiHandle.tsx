import React from "react";
import { BaseHandleProps } from "./types";
import { LabeledHandle } from "@/app/components/labeled-handle";

const MultiHandle: React.FC<BaseHandleProps> = (props) => {
  const { type, ...rest } = props;
  return (
    <LabeledHandle
      style={
        type === "target"
          ? {
            height: 15,
            borderRadius: 4,
          }
          : undefined
      }
      type={type}
      {...rest}
    />
  );
};

export default MultiHandle;
