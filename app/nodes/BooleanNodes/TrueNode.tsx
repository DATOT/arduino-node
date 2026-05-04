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

const TrueNode = ({ id }: { id: string }) => {
  const { updateNodeData } = useReactFlow();

  useEffect(() => {
    updateNodeData(id, { boolValue: true });
  }, [id, updateNodeData]);

  return (
    <BaseNode>
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>True</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <div className="px-4 py-2 flex justify-center">
        <span className="text-xs font-mono px-2 py-1 rounded border border-green-500/40 text-green-400 bg-green-500/10">
          true
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

export default TrueNode;
