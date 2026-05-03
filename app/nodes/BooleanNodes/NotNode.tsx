'use client'
import { Position, useNodeConnections, useNodesData, useReactFlow } from "@xyflow/react";
import React, { useMemo } from "react";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHandles,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/app/components/base-node";
import ValueHandle from "@/app/handles/ValueHandle/ValueHandle";
import { encodeHandle } from "@/app/lib/utils";
import { BooleanData } from "@/app/types/data";

type NotNodeProps = {
  id: string;
  data: BooleanData;
};

const NotNode = ({ id }: NotNodeProps) => {
  const { updateNodeData } = useReactFlow();

  const connections = useNodeConnections({ handleType: "target" }) ?? [];

  const sourceIds = useMemo(
    () => connections.map(c => c.source).filter(Boolean),
    [connections]
  );

  const nodesData = useNodesData(sourceIds);

  const input = useMemo(() => {
    const handleId = encodeHandle({
      types: ["boolean"],
      multiplicity: "single",
      name: "0",
    });

    const conn = connections.find(c => c.targetHandle === handleId);

    return nodesData?.find(n => n.id === conn?.source)?.data as BooleanData;
  }, [connections, nodesData]);

  const a = input?.boolValue;

  const result = useMemo(() => {
    if (a === undefined) return false;
    return !a;
  }, [a]);

  React.useEffect(() => {
    updateNodeData(id, { boolValue: result });
  }, [result, id, updateNodeData]);

  return (
    <BaseNode>
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>NOT</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeContent className="flex flex-col gap-3 p-4">
        <div className="text-sm font-mono border rounded px-2 py-1 bg-gray-50">
          = {String(result)}
        </div>
      </BaseNodeContent>

      <BaseNodeHandles>
        {/* Single input */}
        <ValueHandle
          type="target"
          position={Position.Left}
          title="Input"
          kinds={["boolean"]}
          multiplicity="single"
          name="0"
        />

        {/* Output */}
        <ValueHandle
          type="source"
          position={Position.Right}
          title="Output"
          kinds={["boolean"]}
          multiplicity="multi"
        />
      </BaseNodeHandles>
    </BaseNode>
  );
};

export default NotNode;
