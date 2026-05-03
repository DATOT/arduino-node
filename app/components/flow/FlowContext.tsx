import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  ReactFlowInstance,
  getOutgoers,
  addEdge,
  applyEdgeChanges,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";

import { useFlowRuntime } from "@/app/context/Runtime/FlowRuntimeContext";

type FlowContextType = {
  nodes: Node[];
  edges: Edge[];

  onNodesChange: ReturnType<typeof useNodesState>[2];
  onEdgesChange: (changes: EdgeChange<Edge>[]) => void;

  onConnect: (connection: Connection) => void;
  isValidConnection: (conn: Connection | Edge) => boolean;

  rfInstance: ReactFlowInstance | null;
  setRfInstance: (instance: ReactFlowInstance) => void;

  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;

  saveToFile: () => void;
  loadFromFile: (file: File) => void;
  resetFlow: () => void;
};

const FlowContext = createContext<FlowContextType | null>(null);

export const useFlow = () => {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error("useFlow must be used inside FlowProvider");
  return ctx;
};

export const FlowProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, _onEdgesChange] = useEdgesState<Edge>([]);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const { setEdges: syncRuntime } = useFlowRuntime();
  const { getNodes, getEdges } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const next = addEdge(params, eds);
        syncRuntime(next);
        return next;
      });
    },
    [setEdges, syncRuntime]
  );

  const isValidConnection = useCallback(
    (conn: Connection | Edge) => {
      const sourceHandle = conn.sourceHandle ?? null;
      const targetHandle = conn.targetHandle ?? null;

      if (!sourceHandle || !targetHandle) return false;

      const parseHandle = (handle: string) => {
        const firstDash = handle.indexOf("-");
        if (firstDash === -1) return null;

        const typesRaw = handle.slice(0, firstDash);

        const rest = handle.slice(firstDash + 1);

        const secondDash = rest.indexOf("-");

        if (secondDash === -1) {
          return {
            typesRaw,
            multiplicity: rest,
            name: null,
          };
        }

        const multiplicity = rest.slice(0, secondDash);
        const name = rest.slice(secondDash + 1);

        return {
          typesRaw,
          multiplicity,
          name: name.length > 0 ? name : null,
        };
      };

      const source = parseHandle(sourceHandle);
      const target = parseHandle(targetHandle);

      //console.log(source);
      //console.log(target);
      if (!source || !target) return false;

      const cleanTypes = (raw: string) =>
        raw
          .replace(/^\[/, "")   // remove leading [
          .replace(/\]$/, "")   // remove trailing ]
          .split("|");
      const sourceTypes = cleanTypes(source.typesRaw);
      const targetTypes = cleanTypes(target.typesRaw);

      const sourceMultiplicity = source.multiplicity;
      const targetMultiplicity = target.multiplicity;

      // Prevent self-loop
      if (conn.source === conn.target) return false;

      const edgesNow = getEdges();
      const nodesNow = getNodes();

      // Cycle detection
      const targetNode = nodesNow.find((n: Node) => n.id === conn.target);
      if (!targetNode) return false;

      const hasCycle = (node: Node, visited = new Set<string>()): boolean => {
        if (visited.has(node.id)) return false;
        visited.add(node.id);

        const outgoers = getOutgoers(node, nodesNow, edgesNow);

        for (const out of outgoers) {
          if (out.id === conn.source) return true;
          if (hasCycle(out, visited)) return true;
        }

        return false;
      };

      if (hasCycle(targetNode)) return false;

      // multiplicity check (target side)
      if (targetMultiplicity === "single") {
        const alreadyConnected = edgesNow.some(
          (edge: Edge) =>
            edge.target === conn.target &&
            edge.targetHandle === targetHandle
        );

        if (alreadyConnected) return false;
      }

      // "any" overrides everything
      if (sourceTypes.includes("any") || targetTypes.includes("any")) {
        return true;
      }

      // Type compatibility check
      const hasCommonType = sourceTypes.some((t) =>
        targetTypes.includes(t)
      );

      return hasCommonType;
    },
    [getNodes, getEdges]
  );

  const resetFlow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    syncRuntime([]);
  }, [setNodes, setEdges, syncRuntime]);

  const saveToFile = useCallback(() => {
    const flow = { nodes, edges };

    const blob = new Blob([JSON.stringify(flow, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "flow.json";
    a.click();

    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const loadFromFile = useCallback(
    (file: File) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);

          if (!data.nodes || !data.edges) {
            throw new Error("Invalid file format");
          }

          setNodes(data.nodes);
          setEdges(data.edges);
          syncRuntime(data.edges);
        } catch (err) {
          console.error(err);
          alert("Invalid file");
        }
      };

      reader.readAsText(file);
    },
    [setNodes, setEdges, syncRuntime]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      const next = applyEdgeChanges(changes, edges);
      setEdges(next);
      syncRuntime(next);
    },
    [edges, setEdges, syncRuntime]
  );

  return (
    <FlowContext.Provider
      value={{
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        isValidConnection,
        rfInstance,
        setRfInstance,
        setEdges,
        saveToFile,
        loadFromFile,
        resetFlow,
      }}
    >
      {children}
    </FlowContext.Provider>
  );
};




































































































































































































