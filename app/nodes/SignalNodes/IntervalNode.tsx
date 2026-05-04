'use client'
import { Position, useNodesData, useReactFlow } from "@xyflow/react";
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

const IntervalNode = ({ id }: { id: string }) => {
  const { emit } = useFlowRuntime();
  const { updateNodeData } = useReactFlow();

  const node = useNodesData(id);
  const intervalSec: number = (node?.data?.intervalSec ?? 1) as number;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const tick = useCallback(() => {
    emit(
      id,
      encodeHandle({ types: ["signal"], multiplicity: "multi" }),
      true
    );
  }, [id, emit]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(tick, intervalSec * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tick, intervalSec]);

  return (
    <BaseNode>
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>Interval</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeContent>
        <div className="flex items-center gap-2">
          <span>Every</span>

          <input
            type="number"
            min={0.1}
            step={0.1}
            value={intervalSec}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (!isNaN(val) && val > 0) {
                updateNodeData(id, { intervalSec: val });
              }
            }}
            className="w-16 px-1 py-0.5 border rounded text-sm"
          />

          <span>s</span>
        </div>
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

export default IntervalNode;
