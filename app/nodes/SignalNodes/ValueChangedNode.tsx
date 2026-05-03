'use client'
import {
  Position,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";
import React, { useCallback, useEffect, useRef } from "react";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHandles,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/app/components/base-node";
import ValueHandle from "@/app/handles/ValueHandle/ValueHandle";
import { useFlowRuntime } from "@/app/context/Runtime/FlowRuntimeContext";
import { encodeHandle } from "@/app/lib/utils";
import { NumberData } from "@/app/types/data";

const ValueChangedNode = ({ id }: { id: string }) => {
  const { registerNode, unregisterNode, emit } = useFlowRuntime();

  const VALUE_HANDLE = encodeHandle({
    types: ["number"],
    multiplicity: "single",
    name: "value",
  });

  const SIGNAL_OUT = encodeHandle({
    types: ["signal"],
    multiplicity: "multi",
  });

  // connections
  const connectionValue = useNodeConnections({
    handleId: VALUE_HANDLE,
    handleType: "target",
  });

  const nodeDataValue = useNodesData(connectionValue?.[0]?.source) as { data: NumberData };

  const prevValueRef = useRef<number | undefined>(undefined);

  React.useEffect(() => {
    const current = nodeDataValue?.data.numberValue;
    console.log("current", current);
    console.log("prev", prevValueRef.current);

    // Only emit if value actually changed (including from undefined → number)
    if (current !== undefined && current !== prevValueRef.current) {
      emit(id, SIGNAL_OUT, true);
    }

    // Update previous value after comparison
    prevValueRef.current = current;
  }, [nodeDataValue, emit, SIGNAL_OUT, id]);

  useEffect(() => {
    registerNode(id, () => {
      // IntervalNode is source-only; nothing to handle from incoming edges
    });
    return () => unregisterNode(id);
  }, [id, registerNode, unregisterNode]);

  return (
    <BaseNode>
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>Value Changed</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeContent>
        Emits signal when data changed
      </BaseNodeContent>

      <BaseNodeHandles>
        {/* Value input */}
        <ValueHandle
          type="target"
          position={Position.Left}
          title="value"
          kinds={["number"]}
          multiplicity="single"
          name="value"
        />

        {/* Output signal */}
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

export default ValueChangedNode;
