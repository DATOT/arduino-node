'use client';

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
import { NumberData } from "@/app/types/data";
import { sign } from "crypto";

interface SerialReadNodeData {
  baudRate?: number;
  key?: string;
}
type SerialReadNodeProps = {
  id: string;
  data: SerialReadNodeData & NumberData;
}

const SerialReadNode = ({ id, data }: SerialReadNodeProps) => {
  const { updateNodeData } = useReactFlow();
  const { latestDataParsed, latestData } = useSerial();

  const keyFilter = data.key ?? "";
  const lastSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    console.log(latestData)
    if (!latestData) return;

    interface ParsedPackage {
      key: string;
      value: number;
      time: number;
    }

    const PREFIX = "__ARDUINO_NODE_PKG__:";

    const parsePackage = (input: string): ParsedPackage | null => {
      if (!input.startsWith(PREFIX)) return null;

      const payload = input.slice(PREFIX.length);

      const match = payload.match(
        /^\{\[(\d+)\];\("key":"([^"]+)","value":(\d+)\)\}$/
      );

      if (!match) return null;

      const [, timeStr, key, valueStr] = match;

      return {
        key,
        value: Number(valueStr),
        time: Number(timeStr),
      };
    };
    const parsed = parsePackage(latestData);
    console.log(parsed)
    if (!parsed) return;

    //  filter by key
    if (keyFilter && parsed.key !== keyFilter) return;

    //  dedupe updates
    const signature = `${parsed.key}-${parsed.time}`;
    if (lastSignatureRef.current === signature) return;
    lastSignatureRef.current = signature;

    //  update node data (ONLY latest value)
    updateNodeData(id, {
      numberValue: parsed.value,
    });
  }, [latestData, keyFilter, id, updateNodeData]);

  return (
    <BaseNode>
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>Serial Read Node</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeContent className="flex flex-col gap-3 p-4">
        {/* Baud Rate (UI only) */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Baud:</label>
          <input
            type="number"
            value={data.baudRate ?? 9600}
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

        {/* Output */}
        <div className="flex flex-col gap-1 pt-2 border-t text-sm">
          <div>
            <span className="font-medium">Value: </span>
            {data.numberValue ?? "--"}
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
      </BaseNodeHandles>
    </BaseNode>
  );
};

export default SerialReadNode;
