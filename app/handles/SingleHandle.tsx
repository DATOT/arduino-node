import React from "react";
import { Handle } from "@xyflow/react";
import { BaseHandleProps } from "./types";
import { LabeledHandle } from "@/app/components/labeled-handle";

const SingleHandle: React.FC<BaseHandleProps> = (props) => {
  return <LabeledHandle {...props} />;
};

export default SingleHandle;
