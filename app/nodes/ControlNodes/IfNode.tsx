'use client'
import { Position, useNodeConnections, useNodesData } from "@xyflow/react";
import React, { useEffect } from "react";
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
import { BooleanData } from "@/app/types/data";

const IfNode = ({ id }: { id: string }) => {
  const { emit, registerNode, unregisterNode } = useFlowRuntime();

  const connections = useNodeConnections({
    handleId: encodeHandle({
      types: ["boolean"],
      multiplicity: "single",
      name: "condition",
    }),
    handleType: "target",
  });

  const nodesData = useNodesData(connections?.[0]?.source) as {
    data: BooleanData;
  };

  const condition = nodesData?.data?.boolValue ?? false;

  useEffect(() => {
    const signalHandle = encodeHandle({
      types: ["signal"],
      multiplicity: "single",
      name: "signal",
    });

    registerNode(id, (handle) => {
      // Only react to signal input
      if (handle !== signalHandle) return;

      if (condition) {
        emit(
          id,
          encodeHandle({
            types: ["signal"],
            multiplicity: "multi",
            name: "then",
          }),
          true
        );
      } else {
        emit(
          id,
          encodeHandle({
            types: ["signal"],
            multiplicity: "multi",
            name: "else",
          }),
          true
        );
      }
    });

    return () => unregisterNode(id);
  }, [id, registerNode, unregisterNode, emit, condition]);

  return (
    <BaseNode className="px-10 pb-2">
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>If</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeHandles>
        {/* SIGNAL INPUT */}
        <ValueHandle
          type="target"
          position={Position.Left}
          title="Signal"
          kinds={["signal"]}
          multiplicity="single"
          name="signal"
        />

        {/* BOOLEAN INPUT */}
        <ValueHandle
          type="target"
          position={Position.Left}
          title="Condition"
          kinds={["boolean"]}
          multiplicity="single"
          name="condition"
        />

        {/* THEN OUTPUT */}
      </BaseNodeHandles>
      <BaseNodeHandles>
        <ValueHandle
          type="source"
          position={Position.Right}
          title="Then"
          kinds={["signal"]}
          multiplicity="multi"
          name="then"
        />

        {/* ELSE OUTPUT */}
        <ValueHandle
          type="source"
          position={Position.Right}
          title="Else"
          kinds={["signal"]}
          multiplicity="multi"
          name="else"
        />
      </BaseNodeHandles>
    </BaseNode>
  );
};

export default IfNode;
