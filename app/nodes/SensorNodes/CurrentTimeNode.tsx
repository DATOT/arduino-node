'use client';

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
import { NumberData } from "@/app/types/data";

type DateNowNodeProps = {
  id: string;
  data: NumberData;
};

const CurrentTimeNode = ({ id }: DateNowNodeProps) => {
  const { updateNodeData } = useReactFlow();

  const [current, setCurrent] = useState<number | null>(null);

  const tick = useCallback(() => {
    const value = Date.now();

    setCurrent(value);

    updateNodeData(id, {
      numberValue: value,
    });
  }, [id, updateNodeData]);
  useEffect(() => {
    let frameId: number;

    const loop = () => {
      const value = Date.now();

      setCurrent(value);

      updateNodeData(id, {
        numberValue: value,
      });

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frameId);
  }, [id, updateNodeData]);
  useEffect(() => {
    // start loop
    requestAnimationFrame(tick);
  }, [tick]);

  return (
    <BaseNode>
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>Current time in ms</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeContent>
        <div className="text-xs text-gray-400">
          Time since Jan 1st 1970 UTC (ms)
        </div>

        {current !== null && (
          <div className="text-sm font-mono font-bold mt-1">
            {current}
          </div>
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

export default CurrentTimeNode;
