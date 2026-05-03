'use client'
import React, { createContext, useCallback, useContext, useRef } from "react";
import { Edge } from "@xyflow/react";

type Handler = (handle: string, value?: any) => void;

type Runtime = {
  registerNode: (id: string, handler: Handler) => void;
  unregisterNode: (id: string) => void;

  emit: (sourceId: string, handle: string, value?: any) => void;

  setEdges: (edges: Edge[]) => void;

  // Global variables
  getVar: (name: string) => any;
  setVar: (name: string, value: any) => void;

  // Lifecycle
  onStart: (cb: () => void) => () => void;
  onRunningChange: (cb: (v: boolean) => void) => () => void;
  start: () => void;
  stop: () => void;
  isRunning: () => boolean;
};

const FlowRuntimeContext = createContext<Runtime | null>(null);

export const FlowRuntimeProvider = ({ children }: { children: React.ReactNode }) => {
  const edgesRef = useRef<Edge[]>([]);
  const handlersRef = useRef<Record<string, Handler>>({});
  const varsRef = useRef<Record<string, any>>({});
  const startListenersRef = useRef<Set<() => void>>(new Set());

  const runningRef = useRef(false);
  const runningListenersRef = useRef<Set<(v: boolean) => void>>(new Set());

  const onRunningChange = useCallback((cb: (v: boolean) => void) => {
    runningListenersRef.current.add(cb);
    return () => runningListenersRef.current.delete(cb);
  }, []);
  // --------------------------
  // Lifecycle
  // --------------------------
  const onStart = useCallback((cb: () => void) => {
    startListenersRef.current.add(cb);

    return () => startListenersRef.current.delete(cb);
  }, []);

  const start = useCallback(() => {
    runningRef.current = true;
    for (const cb of startListenersRef.current) {
      cb();
    }

    for (const cb of runningListenersRef.current) {
      cb(true);
    }
  }, []);

  const stop = useCallback(() => {
    runningRef.current = false;

    for (const cb of runningListenersRef.current) {
      cb(false);
    }
  }, []);

  const isRunning = useCallback(() => {
    return runningRef.current;
  }, []);

  // --------------------------
  // Graph
  // --------------------------
  const setEdges = useCallback((edges: Edge[]) => {
    edgesRef.current = edges;
  }, []);

  const registerNode = useCallback((id: string, handler: Handler) => {
    handlersRef.current[id] = handler;
  }, []);

  const unregisterNode = useCallback((id: string) => {
    delete handlersRef.current[id];
  }, []);

  // --------------------------
  // Global Variables
  // --------------------------
  const setVar = useCallback((name: string, value: any) => {
    varsRef.current[name] = value;
  }, []);

  const getVar = useCallback((name: string) => {
    return varsRef.current[name];
  }, []);

  // --------------------------
  // Signal System
  // --------------------------
  const emit = useCallback((sourceId: string, handle: string, value?: any) => {
    if (!runningRef.current) return;

    const matchingEdges = edgesRef.current.filter(
      (e) => e.source === sourceId && e.sourceHandle === handle
    );

    if (matchingEdges.length === 0) return;

    for (const edge of matchingEdges) {
      const { target, targetHandle } = edge;
      if (!targetHandle) continue;

      handlersRef.current[target]?.(targetHandle, value);
    }
  }, []);

  return (
    <FlowRuntimeContext.Provider
      value={{
        registerNode,
        unregisterNode,
        emit,
        setEdges,
        getVar,
        setVar,
        onStart,
        onRunningChange,
        start,
        stop,
        isRunning,
      }}
    >
      {children}
    </FlowRuntimeContext.Provider>
  );
};

export const useFlowRuntime = () => {
  const ctx = useContext(FlowRuntimeContext);
  if (!ctx) throw new Error("useFlowRuntime must be used inside <FlowRuntimeProvider>");
  return ctx;
};
