'use client'
import { Position, useConnection, useNodeConnections, useReactFlow, useNodesData } from "@xyflow/react";
import React, { useMemo } from "react";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHandles,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/app/components/base-node";
import ValueHandle from "@/app/handles/ValueHandle/ValueHandle";

import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon, CheckIcon } from "@radix-ui/react-icons";
import { encodeHandle } from "@/app/lib/utils";
import { NumberData } from "@/app/types/data";

// Operation registry
const OPERATIONS = {
  "+": { argc: 2, func: (...args: number[]) => args[0] + args[1] },
  "-": { argc: 2, func: (...args: number[]) => args[0] - args[1] },
  "*": { argc: 2, func: (...args: number[]) => args[0] * args[1] },
  "/": { argc: 2, func: (...args: number[]) => args[0] / args[1] },
  "//": { argc: 2, func: (...args: number[]) => Math.floor(args[0] / args[1]) },
  "%": { argc: 2, func: (...args: number[]) => args[0] % args[1] },
  "^": { argc: 2, func: (...args: number[]) => Math.pow(args[0], args[1]) },

  sin: { argc: 1, func: (...args: number[]) => Math.sin(args[0]) },
  cos: { argc: 1, func: (...args: number[]) => Math.cos(args[0]) },
  tan: { argc: 1, func: (...args: number[]) => Math.tan(args[0]) },

  asin: { argc: 1, func: (...args: number[]) => Math.asin(args[0]) },
  acos: { argc: 1, func: (...args: number[]) => Math.acos(args[0]) },
  atan: { argc: 1, func: (...args: number[]) => Math.atan(args[0]) },

  sqrt: { argc: 1, func: (...args: number[]) => Math.sqrt(args[0]) },
  floor: { argc: 1, func: (...args: number[]) => Math.floor(args[0]) },
  ceil: { argc: 1, func: (...args: number[]) => Math.ceil(args[0]) },

  ln: { argc: 1, func: (...args: number[]) => Math.log(args[0]) },
  log: { argc: 1, func: (...args: number[]) => Math.log10(args[0]) },

  "10^": { argc: 1, func: (...args: number[]) => Math.pow(10, args[0]) },
  "e^": { argc: 1, func: (...args: number[]) => Math.exp(args[0]) },
} as const;

type OpKey = keyof typeof OPERATIONS;

type OperationNodeData = {
  op?: OpKey;
}
type OperationNodeProps = {
  id: string;
  data: NumberData & OperationNodeData;
};

const MathOperationNode = ({ id, data }: OperationNodeProps) => {
  const { updateNodeData } = useReactFlow();

  const opKey: OpKey = data.op ?? "+";
  const op = OPERATIONS[opKey];

  const connections = useNodeConnections();

  const sourceIds = connections
    .map(c => c.source)
    .filter(Boolean); // remove undefined

  const nodesData = useNodesData(sourceIds);

  const inputs = Array.from({ length: op.argc }, (_, i) => {
    const handleId = encodeHandle({
      types: ["number"],
      multiplicity: "single",
      name: String(i),
    });

    const conn = connections.find(c => c.targetHandle === handleId);

    return nodesData?.find(n => n.id === conn?.source)?.data as NumberData;
  });

  // Compute result
  const result = useMemo(() => {
    if (inputs.length < op.argc) return 0;
    try {
      return op.func(...inputs.map(v => v.numberValue ?? 0));
    } catch {
      return NaN;
    }
  }, [inputs, op]);

  // Push result to node data
  React.useEffect(() => {
    updateNodeData(id, { numberValue: result });
  }, [result, id, updateNodeData]);

  return (
    <BaseNode>
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>Operation</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeContent className="flex flex-col gap-3 p-4">
        {/* Operation selector */}
        <Select.Root
          value={opKey}
          onValueChange={(val) =>
            updateNodeData(id, {
              op: val as OpKey,
              inputs: new Array(OPERATIONS[val as OpKey].argc).fill(0),
            })
          }
        >
          {/* Trigger */}
          <Select.Trigger className="border rounded px-1.5 py-1 flex items-center justify-between text-xs h-7">
            {opKey}
            <Select.Icon>
              <ChevronDownIcon className="w-3 h-3" />
            </Select.Icon>
          </Select.Trigger>

          {/* Dropdown */}
          <Select.Portal>
            <Select.Content
              className="bg-white border rounded shadow-md z-50 min-w-[80px]"
              position="popper"
            >
              {/* This is REQUIRED for proper scrolling in Radix */}
              <Select.Viewport className="max-h-40 overflow-y-auto p-1">
                {Object.keys(OPERATIONS).map((key) => (
                  <Select.Item
                    key={key}
                    value={key}
                    className="px-2 py-1 text-xs flex items-center justify-between cursor-pointer hover:bg-gray-100 rounded"
                  >
                    <Select.ItemText>{key}</Select.ItemText>
                    {key === opKey && <CheckIcon className="w-3 h-3" />}
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        {/* Display result */}
        <div className="text-sm font-mono border rounded px-2 py-1 bg-gray-50">
          = {Number.isFinite(result) ? result : "NaN"}
        </div>
      </BaseNodeContent>

      {/* Dynamic handles */}
      <BaseNodeHandles>
        {/* Inputs */}
        {Array.from({ length: op.argc }).map((_, i) => (
          <ValueHandle
            key={i}
            type="target"
            position={Position.Left}
            title={`Input ${i + 1}`}
            kinds={["number"]}
            multiplicity="single"
            name={String(i)}
          />
        ))}

        {/* Output */}
        <ValueHandle
          type="source"
          position={Position.Right}
          title="Output"
          kinds={["number"]}
          multiplicity="multi"
        />
      </BaseNodeHandles>
    </BaseNode >
  );
};

export default MathOperationNode;
