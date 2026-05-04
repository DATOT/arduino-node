'use client'
import { Position, useEdges, useNodesData } from "@xyflow/react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BaseNode,
  BaseNodeHandles,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/app/components/base-node";
import ValueHandle from "@/app/handles/ValueHandle/ValueHandle";
import { useFlowRuntime } from "@/app/context/Runtime/FlowRuntimeContext";
import { encodeHandle } from "@/app/lib/utils";

const LightNode = ({ id }: { id: string }) => {
  const { registerNode, unregisterNode } = useFlowRuntime();
  const edges = useEdges();

  const [isOn, setIsOn] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const SIGNAL = encodeHandle({ types: ["signal"], multiplicity: "multi" });

  const BOOL_HANDLE = encodeHandle({
    types: ["boolean"],
    multiplicity: "single",
    name: "value",
  });

  // Find source node for the boolean handle
  const boolSourceId = useMemo(() => {
    const edge = edges.find(
      (e) => e.target === id && e.targetHandle === BOOL_HANDLE
    );
    return edge?.source ?? null;
  }, [edges, id, BOOL_HANDLE]);

  const rawNode = useNodesData(boolSourceId ?? "");
  const boolValue: boolean = (rawNode?.data?.boolValue as boolean) ?? false;

  // Keep latest bool in ref
  const boolRef = useRef(boolValue);
  useEffect(() => {
    boolRef.current = boolValue;
  }, [boolValue]);

  const handler = useCallback(
    (handle: string) => {
      if (handle !== SIGNAL) return;

      // turn ON immediately
      setIsOn(true);

      // clear previous timer if exists
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // turn OFF after 200ms
      timeoutRef.current = setTimeout(() => {
        setIsOn(false);
        timeoutRef.current = null;
      }, 200);
    },
    [SIGNAL]
  );

  useEffect(() => {
    registerNode(id, handler);
    return () => {
      unregisterNode(id);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [id, handler, registerNode, unregisterNode]);

  return (
    <BaseNode>
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>Light</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <div className="px-4 py-4 flex justify-center">
        <div
          className="w-10 h-10 rounded-full border-2 transition-all duration-150"
          style={{
            backgroundColor: isOn ? "#ef4444" : "#1f1f1f",
            borderColor: isOn ? "#f87171" : "#374151",
            boxShadow: isOn
              ? "0 0 12px 4px rgba(239,68,68,0.6)"
              : "none",
          }}
        />
      </div>

      <BaseNodeHandles>
        <ValueHandle
          type="target"
          position={Position.Left}
          title="Signal"
          kinds={["signal"]}
          multiplicity="multi"
        />
        <ValueHandle
          type="target"
          position={Position.Left}
          title="Value"
          kinds={["boolean"]}
          multiplicity="single"
          name="value"
        />
      </BaseNodeHandles>
    </BaseNode>
  );
};

export default LightNode;
