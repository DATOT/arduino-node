'use client'
import { Position, useNodeConnections, useReactFlow, useNodesData } from "@xyflow/react";
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
import { BooleanData, NumberData } from "@/app/types/data";

// Comparison operations
const OPERATIONS = {
  ">": { func: (a: number, b: number) => a > b },
  "<": { func: (a: number, b: number) => a < b },
  ">=": { func: (a: number, b: number) => a >= b },
  "<=": { func: (a: number, b: number) => a <= b },

  "==": { func: (a: number, b: number) => a == b },
  "!=": { func: (a: number, b: number) => a != b },

  "===": { func: (a: number, b: number) => a === b },
  "!==": { func: (a: number, b: number) => a !== b },
} as const;

type OpKey = keyof typeof OPERATIONS;

type CmpNodeData = {
  op?: OpKey;
};

type CmpNodeProps = {
  id: string;
  data: BooleanData & CmpNodeData;
};

const CmpOperationNode = ({ id, data }: CmpNodeProps) => {
  const { updateNodeData } = useReactFlow();

  const opKey: OpKey = data.op ?? ">";
  const op = OPERATIONS[opKey];

  const connections = useNodeConnections({ handleType: "target" }) ?? [];

  const sourceIds = useMemo(
    () => connections.map(c => c.source).filter(Boolean),
    [connections]
  );

  const nodesData = useNodesData(sourceIds);

  const inputs = useMemo(() => {
    return [0, 1].map((i) => {
      const handleId = encodeHandle({
        types: ["number"],
        multiplicity: "single",
        name: String(i),
      });

      const conn = connections.find(c => c.targetHandle === handleId);

      return nodesData?.find(n => n.id === conn?.source)?.data as NumberData;
    });
  }, [connections, nodesData]);
  // Compute result
  const a = inputs[0]?.numberValue;
  const b = inputs[1]?.numberValue;
  const result = useMemo(() => {
    if (a === undefined || b === undefined) return false;

    try {
      return op.func(a, b);
    } catch {
      return false;
    }
  }, [op, a, b]);

  // Push result
  React.useEffect(() => {
    console.log("node update (input changed)");

    const result =
      a === undefined || b === undefined
        ? false
        : op.func(a, b);

    updateNodeData(id, { boolValue: result });
  }, [a, b, opKey, id, updateNodeData, op]);

  return (
    <BaseNode>
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>Compare</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeContent className="flex flex-col gap-3 p-4">
        {/* Selector */}
        <Select.Root
          value={opKey}
          onValueChange={(val) =>
            updateNodeData(id, { op: val as OpKey })
          }
        >
          {/* Trigger */}
          <Select.Trigger className="border rounded px-2 py-1.5 flex items-center justify-between text-sm">
            {opKey}
            <Select.Icon>
              <ChevronDownIcon className="w-4 h-4" />
            </Select.Icon>
          </Select.Trigger>

          {/* Dropdown */}
          <Select.Portal>
            <Select.Content
              className="bg-white border rounded shadow-md z-50 min-w-[100px]"
              position="popper"
            >
              {/* Scroll container */}
              <Select.Viewport className="max-h-40 overflow-y-auto p-1">
                {Object.keys(OPERATIONS).map((key) => (
                  <Select.Item
                    key={key}
                    value={key}
                    className="p-2 text-sm flex items-center justify-between cursor-pointer hover:bg-gray-100 rounded"
                  >
                    <Select.ItemText>{key}</Select.ItemText>
                    {key === opKey && <CheckIcon className="w-4 h-4" />}
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        {/* Display */}
        <div className="text-sm font-mono border rounded px-2 py-1 bg-gray-50">
          = {String(result)}
        </div>
      </BaseNodeContent>

      <BaseNodeHandles>
        {/* Inputs */}
        {[0, 1].map((i) => (
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
          kinds={["boolean"]}
          multiplicity="multi"
        />
      </BaseNodeHandles>
    </BaseNode>
  );
};

export default CmpOperationNode;
