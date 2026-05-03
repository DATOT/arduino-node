'use client'
import { Position, useNodeConnections, useNodesData, useReactFlow } from "@xyflow/react";
import React, { useEffect, useRef } from "react";
import {
  BaseNode,
  BaseNodeHandles,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/app/components/base-node";
import ValueHandle from "@/app/handles/ValueHandle/ValueHandle";
import { useFlowRuntime } from "@/app/context/Runtime/FlowRuntimeContext";
import { encodeHandle } from "@/app/lib/utils";

const GateNode = ({ id }: { id: string }) => {
  const { emit, registerNode, unregisterNode } = useFlowRuntime();
  const { updateNodeData } = useReactFlow();

  const dataHandle = encodeHandle({
    types: ["number"],
    multiplicity: "single",
    name: "data",
  });

  const signalHandle = encodeHandle({
    types: ["signal"],
    multiplicity: "single",
    name: "signal",
  });

  const outHandle = encodeHandle({
    types: ["signal"],
    multiplicity: "multi",
    name: "out",
  });

  const dataConnections = useNodeConnections({
    handleId: dataHandle,
    handleType: "target",
  });

  const dataNode = useNodesData(dataConnections?.[0]?.source) as any;

  // STORE LATEST INPUT
  const latestValueRef = useRef<number | null>(null);

  useEffect(() => {
    const raw = dataNode?.data?.numberValue;
    const num = typeof raw === "number" ? raw : Number(raw);

    latestValueRef.current = Number.isFinite(num) ? num : null;
  }, [dataNode]);

  useEffect(() => {
    registerNode(id, (handle) => {
      if (handle !== signalHandle) return;

      const value = latestValueRef.current;

      if (value !== null) {
        updateNodeData(id, {
          numberValue: value,
        });
      }
    });

    return () => unregisterNode(id);
  }, [id, registerNode, unregisterNode, updateNodeData, emit, signalHandle, outHandle]);

  return (
    <BaseNode className="px-10 pb-2">
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>Gate</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeHandles>
        <ValueHandle
          type="target"
          position={Position.Left}
          title="Signal"
          kinds={["signal"]}
          multiplicity="single"
          name="signal"
        />

        <ValueHandle
          type="target"
          position={Position.Left}
          title="Data"
          kinds={["number"]}
          multiplicity="single"
          name="data"
        />
      </BaseNodeHandles>

      <BaseNodeHandles>
        <ValueHandle
          type="source"
          position={Position.Right}
          title="Out"
          kinds={["number"]}
          multiplicity="multi"
          name="out"
        />
      </BaseNodeHandles>
    </BaseNode>
  );
};

export default GateNode;
