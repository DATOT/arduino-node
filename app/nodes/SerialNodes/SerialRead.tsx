'use client'
import { Position, useReactFlow } from "@xyflow/react";
import React, { useEffect, useRef } from "react";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHandles,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/app/components/base-node";
import ValueHandle from "@/app/handles/ValueHandle/ValueHandle";
import { useSerial } from "@/app/context/Serial/SerialContext";

type SerialReadNodeProps = {
  id: string;
  data: {
    baudRate?: number;
    key?: string;
    value?: number | null;
    time?: number | null;
  };
};

const PREFIX = "__ARDUINO_NODE_PKG__:";

const parsePackage = (input: string) => {
  if (!input.startsWith(PREFIX)) return null;

  const payload = input.slice(PREFIX.length);
  const match = payload.match(/^\{\[(\d+)\];\("([^"]+)":"([^"]+)"\)\}$/);
  if (!match) return null;

  const [, timeStr, key, valueStr] = match;

  const valueNum = Number(valueStr);
  if (Number.isNaN(valueNum)) return null;

  return {
    key,
    value: valueNum,
    time: Number(timeStr),
  };
};

const SerialReadNode = ({ id, data }: SerialReadNodeProps) => {
  const { updateNodeData } = useReactFlow();
  const { latestData } = useSerial();

  const bufferRef = useRef("");
  const lastPackageRef = useRef<string | null>(null);

  const baudRate = data.baudRate ?? 9600;
  const keyFilter = data.key ?? "";

  useEffect(() => {
    if (!latestData) return;

    bufferRef.current += latestData;

    const parts = bufferRef.current.split("\n");
    bufferRef.current = parts.pop() || "";

    for (const part of parts) {
      const parsed = parsePackage(part.trim());
      if (!parsed) continue;

      if (keyFilter && parsed.key !== keyFilter) continue;

      const signature = `${parsed.key}-${parsed.time}-${parsed.value}`;
      if (lastPackageRef.current === signature) continue;

      lastPackageRef.current = signature;

      updateNodeData(id, {
        value: parsed.value,
        time: parsed.time,
      });
    }
  }, [latestData, keyFilter, id, updateNodeData]);

  return (
    <BaseNode>
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>Serial Read Node</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeContent className="flex flex-col gap-3 p-4">
        {/* Baud Rate */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Baud:</label>
          <input
            type="number"
            value={baudRate}
            onChange={(e) =>
              updateNodeData(id, { baudRate: Number(e.target.value) })
            }
            className="nodrag border rounded px-2 py-1 text-sm w-full"
          />
        </div>

        {/* Key Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Key:</label>
          <input
            type="text"
            value={keyFilter}
            onChange={(e) =>
              updateNodeData(id, { key: e.target.value })
            }
            placeholder="key"
            className="nodrag border rounded px-2 py-1 text-sm w-full"
          />
        </div>

        {/* Output Display */}
        <div className="flex flex-col gap-1 pt-2 border-t text-sm">
          <div>
            <span className="font-medium">Value: </span>
            {data.value ?? "--"}
          </div>
          <div>
            <span className="font-medium">Time: </span>
            {data.time ?? "--"}
          </div>
        </div>
      </BaseNodeContent>

      <BaseNodeHandles>
        <ValueHandle
          type="source"
          position={Position.Right}
          title="value"
          kinds={["number"]}
          multiplicity="multi"
        />

        <ValueHandle
          type="source"
          position={Position.Right}
          title="time"
          kinds={["number"]}
          multiplicity="multi"
        />
      </BaseNodeHandles>
    </BaseNode>
  );
};

export default SerialReadNode;
