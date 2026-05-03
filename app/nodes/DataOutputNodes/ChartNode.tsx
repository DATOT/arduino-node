'use client'
import {
  Position,
  useNodeConnections,
  useNodesData,
  NodeResizeControl,
  useEdges,
  useUpdateNodeInternals,
  useReactFlow,
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

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MAX_POINTS = 50;

const ChartNode = ({ id }: { id: string }) => {
  const { registerNode, unregisterNode } = useFlowRuntime();
  const { setNodes, getNode } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const edges = useEdges();

  const node = getNode(id);

  const [size, setSize] = useState(
    node?.data?.size ?? { width: 400, height: 300 }
  );

  const updateNodeData = (newData: any) => {
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, ...newData } }
          : n
      )
    );
  };

  const [data, setData] = useState<{ x: number; y: number }[]>([]);

  // handles
  const X_HANDLE = encodeHandle({
    types: ["number"],
    multiplicity: "single",
    name: "X",
  });

  const Y_HANDLE = encodeHandle({
    types: ["number"],
    multiplicity: "single",
    name: "Y",
  });

  const SIGNAL = encodeHandle({
    types: ["signal"],
    multiplicity: "multi",
  });

  const sourceMap = useMemo(() => {
    const map: Record<string, string | undefined> = {};

    edges.forEach((e) => {
      if (e.target !== id) return;

      if (e.targetHandle === X_HANDLE) map.x = e.source;
      if (e.targetHandle === Y_HANDLE) map.y = e.source;
    });

    return map;
  }, [edges, id, X_HANDLE, Y_HANDLE]);

  const sourceIds = useMemo(
    () => Object.values(sourceMap).filter((id): id is string => !!id),
    [sourceMap]
  );

  const rawNodes = useNodesData(sourceIds);

  const nodesData = useMemo(() => {
    if (!rawNodes) return [];
    return Array.isArray(rawNodes) ? rawNodes : [rawNodes];
  }, [rawNodes]);

  const idToNode = useMemo(() => {
    const map = new Map<string, any>();
    sourceIds.forEach((id, i) => map.set(id, nodesData[i]));
    return map;
  }, [sourceIds, nodesData]);

  // refs (no race condition)
  const xRef = useRef<number | null>(null);
  const yRef = useRef<number | null>(null);

  useEffect(() => {
    xRef.current = idToNode.get(sourceMap.x)?.data?.numberValue ?? null;
    yRef.current = idToNode.get(sourceMap.y)?.data?.numberValue ?? null;
  }, [idToNode, sourceMap]);

  // 🔥 signal handler
  const handler = useCallback(
    (handle: string) => {
      if (handle !== SIGNAL) return;

      const x = xRef.current;
      const y = yRef.current;

      if (x == null || y == null) return;

      setData((prev) => {
        const next = [...prev, { x, y }];
        return next.length > MAX_POINTS
          ? next.slice(-MAX_POINTS)
          : next;
      });
    },
    [SIGNAL]
  );

  useEffect(() => {
    registerNode(id, handler);
    return () => unregisterNode(id);
  }, [id, handler, registerNode, unregisterNode]);

  // 🔥 important: force handle updates like GraphNode
  useEffect(() => {
    updateNodeInternals(id);
  }, [edges, id, updateNodeInternals]);

  return (
    <>
      {/* Resize control (same as GraphNode) */}
      <NodeResizeControl
        minWidth={250}
        minHeight={200}
        onResize={(_, params) => {
          const newSize = { width: params.width, height: params.height };
          setSize(newSize);
          updateNodeData({ size: newSize });
        }}
      />

      <BaseNode className="w-full h-full">
        <BaseNodeHeader>
          <BaseNodeHeaderTitle>Chart</BaseNodeHeaderTitle>
        </BaseNodeHeader>

        <BaseNodeContent className="p-2 w-full h-full flex flex-col">
          <div className="flex-1 w-full h-full">
            {data.length === 0 ? (
              <div className="text-center text-gray-400 h-full flex items-center justify-center text-xs">
                No data yet…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="x" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="y"
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
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
            title="X"
            kinds={["number"]}
            multiplicity="single"
            name="X"
          />

          <ValueHandle
            type="target"
            position={Position.Left}
            title="Y"
            kinds={["number"]}
            multiplicity="single"
            name="Y"
          />
        </BaseNodeHandles>
      </BaseNode>
    </>
  );
};

export default ChartNode;
