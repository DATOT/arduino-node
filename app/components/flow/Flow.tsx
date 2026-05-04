import { useCallback, useState } from "react";
import {
  Background,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlow,
  ReactFlowInstance,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import "./styles.css";

import { Sidebar } from "./sidebar/Sidebar";
import { nodeTypes } from "../../nodes/Nodes";
import { DevTools } from "../devtools";
import { useFlow } from "./FlowContext";

function Flow() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    isValidConnection,
    setRfInstance,
    rfInstance,
  } = useFlow();

  return (
    <div className="dndflow">
      <Sidebar />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setRfInstance}
        isValidConnection={isValidConnection}
        fitView
        noPanClassName="nopan"
        noDragClassName="nodrag"
        noWheelClassName="nowheel"
        maxZoom={2}
        minZoom={0.25}
      >
        <Controls />
        <Background />
        {/*<DevTools position="top-left" />*/}
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export default Flow;
