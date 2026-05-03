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

const ValueUpdatedNode = ({ id }: { id: string }) => {
  const { registerNode, unregisterNode, emit } = useFlowRuntime();

  const VALUE_HANDLE = encodeHandle({
    types: ["any"],
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

  const nodeDataValue = useNodesData(connectionValue?.[0]?.source);

  React.useEffect(() => {
    emit(id, SIGNAL_OUT, true);
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
        <BaseNodeHeaderTitle>Value Updated</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeContent>
        Emits signal when data update
      </BaseNodeContent>

      <BaseNodeHandles>
        {/* Value input */}
        <ValueHandle
          type="target"
          position={Position.Left}
          title="value"
          kinds={["any"]}
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

export default ValueUpdatedNode;
