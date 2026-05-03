'use client'
import {
  Position,
  useNodeConnections,
  useNodesData,
} from "@xyflow/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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

const TableNode = ({ id }: { id: string }) => {
  const { registerNode, unregisterNode } = useFlowRuntime();
  const [rows, setRows] = useState<{ a: any; b: any }[]>([]);

  // connections
  const connectionA = useNodeConnections({ handleId: encodeHandle({ types: ["number"], multiplicity: "single", name: "A" }), handleType: "target" });
  const connectionB = useNodeConnections({ handleId: encodeHandle({ types: ["number"], multiplicity: "single", name: "B" }), handleType: "target" });

  // data from connected nodes
  const nodeDataA = useNodesData(connectionA?.[0]?.source);
  const nodeDataB = useNodesData(connectionB?.[0]?.source);

  const SIGNAL = encodeHandle({ types: ["signal"], multiplicity: "multi" });

  // signal handler (runtime-driven)
  const handler = useCallback(
    (handle: string) => {
      if (handle !== SIGNAL) return;

      const a = nodeDataA?.data.numberValue;
      const b = nodeDataB?.data.numberValue;

      setRows((prev) => [...prev, { a, b }]);
    },
    [SIGNAL, nodeDataA?.data.numberValue, nodeDataB?.data.numberValue]
  );

  useEffect(() => {
    registerNode(id, handler);
    return () => unregisterNode(id);
  }, [id, handler, registerNode, unregisterNode]);

  return (
    <BaseNode>
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>Table</BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent className="p-4">
        <div className="border overflow-hidden bg-white/5 nowheel">
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="sticky top-0 bg-gray-100 text-left px-3 py-2 border border-white/10">
                    A
                  </th>
                  <th className="sticky top-0 bg-gray-100 text-left px-3 py-2 border border-white/10">
                    B
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      className="text-center text-gray-400 py-6"
                    >
                      No data yet…
                    </td>
                  </tr>
                )}

                {rows.map((r, i) => (
                  <tr key={i}>
                    <td className="px-3 py-1.5 border border-black/10 truncate">
                      {r.a ?? "—"}
                    </td>
                    <td className="px-3 py-1.5 border border-black/10 truncate">
                      {r.b ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </BaseNodeContent>

      <BaseNodeHandles>
        <ValueHandle
          type="target"
          position={Position.Left}
          title="signal"
          kinds={["signal"]}
          multiplicity="multi"
        />
        <ValueHandle
          type="target"
          position={Position.Left}
          title="A"
          kinds={["number"]}
          multiplicity="single"
          name="A"
        />
        <ValueHandle
          type="target"
          position={Position.Left}
          title="B"
          kinds={["number"]}
          multiplicity="single"
          name="B"
        />
      </BaseNodeHandles>
    </BaseNode>
  );
};

export default TableNode;
