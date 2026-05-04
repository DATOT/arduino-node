'use client'
import {
  Position,
  useEdges,
  useNodesData,
  useReactFlow,
  NodeResizeControl,
  useUpdateNodeInternals,
} from "@xyflow/react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type Column = {
  id: string;
  name: string;
};

interface TableNodeProps {
  id: string;
  data: {
    size?: { width: number; height: number };
  };
}

const TableNode = ({ id, data: thisNodeData }: TableNodeProps) => {
  const { registerNode, unregisterNode } = useFlowRuntime();
  const { setNodes } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const edges = useEdges();

  const [size, setSize] = useState(
    thisNodeData?.size ?? { width: 320, height: 280 }
  );
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<Column[]>([
    { id: "C1", name: "C1" },
  ]);

  const SIGNAL = encodeHandle({ types: ["signal"], multiplicity: "multi" });

  // ── Build source map: colId → sourceNodeId ─────────────────────────────────
  const sourceMap = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    edges.forEach((e) => {
      if (e.target !== id) return;
      columns.forEach((col) => {
        const handle = encodeHandle({
          types: ["number"],
          multiplicity: "single",
          name: col.id,
        });
        if (e.targetHandle === handle) map[col.id] = e.source;
      });
    });
    return map;
  }, [edges, id, columns]);

  // Deduplicated list of source node IDs for useNodesData
  const sourceIds = useMemo(
    () => [...new Set(Object.values(sourceMap).filter((v): v is string => !!v))],
    [sourceMap]
  );

  // Single hook call — no hooks in loops or helpers
  const rawNodes = useNodesData(sourceIds);
  const nodesData = useMemo(
    () => (Array.isArray(rawNodes) ? rawNodes : rawNodes ? [rawNodes] : []),
    [rawNodes]
  );

  const idToValue = useMemo(() => {
    const map = new Map<string, any>();
    sourceIds.forEach((sid, i) => {
      map.set(sid, nodesData[i]?.data?.numberValue);
    });
    return map;
  }, [sourceIds, nodesData]);

  // Keep latest values in a ref so the handler closure never goes stale
  const valuesRef = useRef<Record<string, any>>({});
  useEffect(() => {
    const vals: Record<string, any> = {};
    columns.forEach((col) => {
      const src = sourceMap[col.id];
      vals[col.id] = src ? idToValue.get(src) : undefined;
    });
    valuesRef.current = vals;
  }, [idToValue, sourceMap, columns]);

  // ── Signal handler ─────────────────────────────────────────────────────────
  const handler = useCallback(
    (handle: string) => {
      if (handle !== SIGNAL) return;
      const newRow: Record<string, any> = {};
      columns.forEach((col) => {
        newRow[col.id] = valuesRef.current[col.id];
      });
      setRows((prev) => [...prev, newRow]);
    },
    [SIGNAL, columns]
  );

  useEffect(() => {
    registerNode(id, handler);
    return () => unregisterNode(id);
  }, [id, handler, registerNode, unregisterNode]);

  // Re-layout handles whenever columns change
  useEffect(() => {
    updateNodeInternals(id);
  }, [columns, id, updateNodeInternals]);

  // ── Node data persistence ──────────────────────────────────────────────────
  const updateNodeData = (newData: any) => {
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...newData } } : n
      )
    );
  };

  // ── Column management ──────────────────────────────────────────────────────
  const addColumn = () => {
    const nextId = `C${Date.now()}`;
    const nextName = `C${columns.length + 1}`;
    setColumns((prev) => [...prev, { id: nextId, name: nextName }]);
  };

  const renameColumn = (colId: string, name: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === colId ? { ...c, name } : c))
    );
  };

  const removeColumn = (colId: string) => {
    if (columns.length <= 1) return;
    setColumns((prev) => prev.filter((c) => c.id !== colId));
    setRows((prev) =>
      prev.map((r) => {
        const { [colId]: _, ...rest } = r;
        return rest;
      })
    );
  };

  const clearRows = () => setRows([]);

  const clearAll = () => {
    setRows([]);
    setColumns([{ id: "C1", name: "C1" }]);
  };

  const saveCSV = () => {
    const header = columns.map((c) => c.name).join(",");
    const body = rows
      .map((r) => columns.map((c) => r[c.id] ?? "").join(","))
      .join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "table.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <NodeResizeControl
        minWidth={240}
        minHeight={200}
        onResize={(_, params) => {
          const newSize = { width: params.width, height: params.height };
          setSize(newSize);
          updateNodeData({ size: newSize });
        }}
      />

      <BaseNode
        style={{ width: size.width, height: size.height }}
        className="min-w-[240px] min-h-[200px] flex flex-col overflow-hidden"
      >
        <BaseNodeHeader>
          <BaseNodeHeaderTitle>Table</BaseNodeHeaderTitle>
        </BaseNodeHeader>

        <BaseNodeContent className="p-4 space-y-2 flex-1 min-h-0 flex flex-col">
          {/* Toolbar */}
          <div className="flex gap-2 text-xs shrink-0 flex-wrap">
            <button
              onClick={addColumn}
              className="px-2 py-1 border rounded hover:bg-white/10 transition-colors"
            >
              + Column
            </button>
            <button
              onClick={clearRows}
              className="px-2 py-1 border rounded hover:bg-white/10 transition-colors"
            >
              Clear Data
            </button>
            <button
              onClick={clearAll}
              className="px-2 py-1 border rounded hover:bg-white/10 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={saveCSV}
              className="px-2 py-1 border rounded hover:bg-white/10 transition-colors"
            >
              Save CSV
            </button>
          </div>

          {/* Table */}
          <div className="border overflow-hidden bg-white/5 nowheel flex-1 min-h-0">
            <div className="h-full overflow-y-auto overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    {columns.map((c) => (
                      <th
                        key={c.id}
                        className="sticky top-0 bg-gray-100 text-left px-2 py-1.5 border"
                      >
                        <div className="flex items-center gap-1">
                          <input
                            className="w-full bg-transparent outline-none min-w-0"
                            value={c.name}
                            onChange={(e) => renameColumn(c.id, e.target.value)}
                          />
                          {columns.length > 1 && (
                            <button
                              onClick={() => removeColumn(c.id)}
                              className="text-red-400 hover:text-red-300 leading-none shrink-0"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="text-center text-gray-400 py-6"
                      >
                        No data yet…
                      </td>
                    </tr>
                  ) : (
                    rows.map((r, i) => (
                      <tr key={i}>
                        {columns.map((c) => (
                          <td key={c.id} className="px-3 py-1.5 border truncate">
                            {r[c.id] ?? "—"}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
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
          {columns.map((c) => (
            <ValueHandle
              key={c.id}
              type="target"
              position={Position.Left}
              title={c.name}
              kinds={["number"]}
              multiplicity="single"
              name={c.id}
            />
          ))}
        </BaseNodeHandles>
      </BaseNode>
    </>
  );
};

export default TableNode;
