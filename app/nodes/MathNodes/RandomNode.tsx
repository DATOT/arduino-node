'use client'
import { Position, useReactFlow } from "@xyflow/react";
import React, { useCallback, useEffect, useState } from "react";
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

type RandomNodeProps = {
  id: string;
  data: NumberData;
};

const RandomNode = ({ id, data }: RandomNodeProps) => {
  const { updateNodeData } = useReactFlow();

  const [current, setCurrent] = useState<number | null>(null);

  const tick = useCallback(() => {
    const value = Math.floor(Math.random() * 100);

    setCurrent(value);

    updateNodeData(id, {
      numberValue: value,
    });
  }, [id, updateNodeData]);

  useEffect(() => {
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  return (
    <BaseNode>
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>Random</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeContent>
        <div className="text-xs text-gray-400">Random generator</div>
        {current !== null && (
          <div className="text-lg font-mono font-bold mt-1">{current}</div>
        )}
      </BaseNodeContent>

      <BaseNodeHandles>
        <ValueHandle
          type="source"
          position={Position.Right}
          title="value"
          kinds={["number"]}
          multiplicity="multi"
        />
      </BaseNodeHandles>
    </BaseNode>
  );
};

export default RandomNode;

