'use client'
import { Position } from "@xyflow/react";
import React, { useEffect } from "react";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHandles,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/app/components/base-node";

import { useFlowRuntime } from "@/app/context/Runtime/FlowRuntimeContext";
import ValueHandle from "@/app/handles/ValueHandle/ValueHandle";

const StartedNode = ({ id }: { id: string }) => {
  const runtime = useFlowRuntime();

  useEffect(() => {
    // subscribe to runtime start
    const unsubscribe = runtime.onStart(() => {
      runtime.emit(id, "out");
    });

    return unsubscribe;
  }, [id, runtime]);

  return (
    <BaseNode>
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>Started</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeContent>
        Fires once when runtime starts
      </BaseNodeContent>

      <BaseNodeHandles>
        <ValueHandle
          type="source"
          position={Position.Right}
          kinds={["signal"]}
          multiplicity="multi"
        />
      </BaseNodeHandles>
    </BaseNode>
  );
};

export default StartedNode;
