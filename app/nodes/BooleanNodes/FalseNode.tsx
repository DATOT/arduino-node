'use client'
import { Position, useReactFlow } from "@xyflow/react";
import React, { useEffect } from "react";
import {
  BaseNode,
  BaseNodeHandles,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/app/components/base-node";
import ValueHandle from "@/app/handles/ValueHandle/ValueHandle";

const FalseNode = ({ id }: { id: string }) => {
  const { updateNodeData } = useReactFlow();

  useEffect(() => {
    updateNodeData(id, { boolValue: false });
  }, [id, updateNodeData]);

  return (
    <BaseNode>
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>False</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <div className="px-4 py-2 flex justify-center">
        <span className="text-xs font-mono px-2 py-1 rounded border border-red-500/40 text-red-400 bg-red-500/10">
          false
        </span>
      </div>

      <BaseNodeHandles>
        <ValueHandle
          type="source"
          position={Position.Right}
          title="Value"
          kinds={["boolean"]}
          multiplicity="multi"
        />
      </BaseNodeHandles>
    </BaseNode>
  );
};

export default FalseNode;
