'use client';

import {
  Position,
  NodeResizeControl,
  useEdges,
  useUpdateNodeInternals,
  useReactFlow,
  useNodesData,
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
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const MAX_POINTS = 50;

type SeriesType = "line" | "bar" | "area";

type Series = {
  id: string;
  name: string;
  type: SeriesType;
  color: string;
};

interface ChartNodeProps {
  id: string;
  data: {
    size?: { width: number; height: number };
  };
}

const DEFAULT_COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444",
  "#3b82f6", "#ec4899", "#14b8a6", "#f97316",
];

const ChartNode = ({ id, data: thisNodeData }: ChartNodeProps) => {
  const { registerNode, unregisterNode } = useFlowRuntime();
  const { setNodes } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const edges = useEdges();

  const [size, setSize] = useState(
    thisNodeData?.size ?? { width: 340, height: 400 }
  );
  const [series, setSeries] = useState<Series[]>([
    { id: "S1", name: "Series 1", type: "line", color: DEFAULT_COLORS[0] },
  ]);
  const [chartData, setChartData] = useState<Record<string, any>[]>([]);
  const [showProps, setShowProps] = useState(false);

  const SIGNAL = encodeHandle({ types: ["signal"], multiplicity: "multi" });
  const X_HANDLE = encodeHandle({ types: ["number"], multiplicity: "single", name: "X" });

  const getYHandle = (seriesId: string) =>
    encodeHandle({ types: ["number"], multiplicity: "single", name: `Y_${seriesId}` });

  const updateNodeData = (newData: any) => {
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...newData } } : n
      )
    );
  };

  // Build source map from edges
  const sourceMap = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    edges.forEach((e) => {
      if (e.target !== id) return;
      if (e.targetHandle === X_HANDLE) map["x"] = e.source;
      series.forEach((s) => {
        if (e.targetHandle === getYHandle(s.id)) map[`y_${s.id}`] = e.source;
      });
    });
    return map;

  }, [edges, id, X_HANDLE, series]);

  const sourceIds = useMemo(
    () => [...new Set(Object.values(sourceMap).filter((v): v is string => !!v))],
    [sourceMap]
  );

  const rawNodes = useNodesData(sourceIds);

  const nodesData = useMemo(() => {
    if (!rawNodes) return [];
    return Array.isArray(rawNodes) ? rawNodes : [rawNodes];
  }, [rawNodes]);

  const idToNode = useMemo(() => {
    const map = new Map<string, any>();
    sourceIds.forEach((sid, i) => map.set(sid, nodesData[i]));
    return map;
  }, [sourceIds, nodesData]);

  const valuesRef = useRef<Record<string, number | null>>({});

  useEffect(() => {
    const vals: Record<string, number | null> = {};
    if (sourceMap["x"])
      vals["x"] = idToNode.get(sourceMap["x"])?.data?.numberValue ?? null;
    series.forEach((s) => {
      const key = `y_${s.id}`;
      if (sourceMap[key])
        vals[key] = idToNode.get(sourceMap[key])?.data?.numberValue ?? null;
    });
    valuesRef.current = vals;
  }, [idToNode, sourceMap, series]);

  const handler = useCallback(
    (handle: string) => {
      if (handle !== SIGNAL) return;
      const vals = valuesRef.current;
      const x = vals["x"];
      if (x == null) return;

      const point: Record<string, any> = { x };
      series.forEach((s) => {
        const v = vals[`y_${s.id}`];
        if (v != null) point[s.id] = v;
      });

      setChartData((prev) => {
        const next = [...prev, point];
        return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next;
      });
    },
    [SIGNAL, series]
  );

  useEffect(() => {
    registerNode(id, handler);
    return () => unregisterNode(id);
  }, [id, handler, registerNode, unregisterNode]);

  useEffect(() => {
    updateNodeInternals(id);
  }, [edges, series, id, updateNodeInternals]);

  // ── Series management ──────────────────────────────────────────────────────

  const addSeries = () => {
    const nextNum = series.length + 1;
    const color = DEFAULT_COLORS[series.length % DEFAULT_COLORS.length];
    setSeries((prev) => [
      ...prev,
      { id: `S${Date.now()}`, name: `Series ${nextNum}`, type: "line", color },
    ]);
  };

  const updateSeries = (sid: string, patch: Partial<Series>) =>
    setSeries((prev) => prev.map((s) => (s.id === sid ? { ...s, ...patch } : s)));

  const removeSeries = (sid: string) =>
    setSeries((prev) => prev.filter((s) => s.id !== sid));

  const clearData = () => setChartData([]);

  const resetChart = () => {
    setChartData([]);
    setSeries([{ id: "S1", name: "Series 1", type: "line", color: DEFAULT_COLORS[0] }]);
  };

  const saveCSV = () => {
    const header = ["x", ...series.map((s) => s.name)].join(",");
    const body = chartData
      .map((r) => [r.x, ...series.map((s) => r[s.id] ?? "")].join(","))
      .join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chart.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Chart rendering ────────────────────────────────────────────────────────

  const renderSeries = (s: Series) => {
    const sharedProps = {
      key: s.id,
      dataKey: s.id,
      name: s.name,
      isAnimationActive: false,
    };
    if (s.type === "bar")
      return <Bar {...sharedProps} fill={s.color} />;
    if (s.type === "area")
      return (
        <Area
          {...sharedProps}
          type="monotone"
          stroke={s.color}
          fill={s.color}
          fillOpacity={0.15}
        />
      );
    return (
      <Line
        {...sharedProps}
        type="monotone"
        stroke={s.color}
        dot={false}
        strokeWidth={2}
      />
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <NodeResizeControl
        minWidth={300}
        minHeight={320}
        onResize={(_, params) => {
          const newSize = { width: params.width, height: params.height };
          setSize(newSize);
          updateNodeData({ size: newSize });
        }}
      />

      <BaseNode
        style={{ width: size.width, height: size.height }}
        className="min-w-[300px] min-h-[320px] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <BaseNodeHeader className="flex items-center justify-between px-3 py-2 shrink-0">
          <BaseNodeHeaderTitle>Chart</BaseNodeHeaderTitle>
          <button
            onClick={() => setShowProps((v) => !v)}
            className="text-[10px] px-2 py-0.5 border rounded hover:bg-white/10 transition-colors ml-auto"
          >
            {showProps ? "▲ Hide" : "▼ Props"}
          </button>
        </BaseNodeHeader>

        {/* Property Panel */}
        {showProps && (
          <div className="px-3 py-2 border-b space-y-2 text-xs shrink-0 bg-white/5">
            {/* Action buttons */}
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={addSeries}
                className="px-2 py-1 border rounded hover:bg-white/10 transition-colors font-medium"
              >
                + Series
              </button>
              <button
                onClick={clearData}
                className="px-2 py-1 border rounded hover:bg-white/10 transition-colors"
              >
                Clear Data
              </button>
              <button
                onClick={saveCSV}
                className="px-2 py-1 border rounded hover:bg-white/10 transition-colors"
              >
                Save CSV
              </button>
              <button
                onClick={resetChart}
                className="px-2 py-1 border rounded hover:bg-red-500/20 transition-colors"
              >
                Reset
              </button>
            </div>

            {/* Series list */}
            <div className="space-y-1 max-h-40 overflow-y-auto nowheel pr-1">
              {/* Column headers */}
              <div className="grid grid-cols-[1fr_70px_28px_16px] gap-1 text-[10px] text-gray-400 px-0.5">
                <span>Name</span>
                <span>Type</span>
                <span>Color</span>
                <span />
              </div>

              {series.map((s) => (
                <div
                  key={s.id}
                  className="grid grid-cols-[1fr_70px_28px_16px] gap-1 items-center"
                >
                  <input
                    className="bg-transparent border rounded px-1.5 py-0.5 outline-none w-full"
                    value={s.name}
                    onChange={(e) => updateSeries(s.id, { name: e.target.value })}
                  />
                  <select
                    className="border rounded px-1 py-0.5 bg-transparent text-[10px] cursor-pointer"
                    value={s.type}
                    onChange={(e) =>
                      updateSeries(s.id, { type: e.target.value as SeriesType })
                    }
                  >
                    <option value="line">Line</option>
                    <option value="bar">Bar</option>
                    <option value="area">Area</option>
                  </select>
                  <input
                    type="color"
                    className="w-6 h-5 border rounded cursor-pointer p-0"
                    value={s.color}
                    onChange={(e) => updateSeries(s.id, { color: e.target.value })}
                  />
                  {series.length > 1 ? (
                    <button
                      onClick={() => removeSeries(s.id)}
                      className="text-red-400 hover:text-red-300 leading-none text-sm"
                    >
                      ×
                    </button>
                  ) : (
                    <span />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart area */}
        <BaseNodeContent className="p-2 flex-1 min-h-0 flex flex-col">
          <div className="w-full h-full min-h-0">
            {chartData.length === 0 ? (
              <div className="text-center text-gray-400 h-full flex items-center justify-center text-xs">
                No data yet…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <XAxis dataKey="x" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {series.map(renderSeries)}
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </BaseNodeContent>

        {/* Handles */}
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
          {series.map((s) => (
            <ValueHandle
              key={s.id}
              type="target"
              position={Position.Left}
              title={s.name}
              kinds={["number"]}
              multiplicity="single"
              name={`Y_${s.id}`}
            />
          ))}
        </BaseNodeHandles>
      </BaseNode>
    </>
  );
};

export default ChartNode;
