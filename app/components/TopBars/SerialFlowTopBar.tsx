'use client'
import React, { useCallback, useRef } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useFlow } from "../flow/FlowContext";
import { useSerial } from "@/app/context/Serial/SerialContext";
import { useFlowRuntime } from "@/app/context/Runtime/FlowRuntimeContext"

const SerialFlowTopBar: React.FC = () => {
  const { saveToFile, loadFromFile, resetFlow } = useFlow();
  const { connect, disconnect, isConnected } = useSerial();
  const runtime = useFlowRuntime();
  const [running, setRunning] = React.useState(runtime.isRunning());

  React.useEffect(() => {
    return runtime.onRunningChange(setRunning);
  }, [runtime]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const toggleRun = () => {
    console.log(running);
    if (running) runtime.stop();
    else runtime.start();
  };

  const btn = {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    background: "#f9f9f9",
    cursor: "pointer",
  } as React.CSSProperties;

  return (
    <div
      style={{
        width: "100%",
        height: "50px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 12px",
        borderBottom: "1px solid #eee",
        background: "#fafafa",
      }}
    >
      {/* LEFT */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <a
          href={"/"}
          style={{
            ...btn,
            background: "#fff3cd",
            border: "1px solid #ffe69c",
          }}
        >
          Home
        </a>

        {/* RESET */}
        <AlertDialog.Root>
          <AlertDialog.Trigger asChild>
            <button style={btn}>Reset</button>
          </AlertDialog.Trigger>

          <AlertDialog.Portal>
            <AlertDialog.Overlay
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
              }}
            />

            <AlertDialog.Content
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "white",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                minWidth: "260px",
              }}
            >
              <AlertDialog.Title style={{ fontWeight: 600 }}>
                Confirm Reset
              </AlertDialog.Title>

              <AlertDialog.Description style={{ marginTop: "6px", color: "#555" }}>
                This will clear everything.
              </AlertDialog.Description>

              <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                <AlertDialog.Cancel asChild>
                  <button style={btn}>Cancel</button>
                </AlertDialog.Cancel>

                <AlertDialog.Action asChild>
                  <button
                    onClick={resetFlow}
                    style={{
                      ...btn,
                      background: "#ffe5e5",
                      border: "1px solid #ffb3b3",
                    }}
                  >
                    Confirm
                  </button>
                </AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        {/* START / STOP */}
        <button
          onClick={toggleRun}
          style={{
            ...btn,
            background: running ? "#d1e7dd" : "#e2e3e5",
            border: running ? "1px solid #a3cfbb" : "1px solid #ccc",
            fontWeight: 600,
          }}
        >
          {running ? "Stop" : "Start"}
        </button>

        {/* SERIAL */}
        <button
          onClick={isConnected ? disconnect : connect}
          style={{
            ...btn,
            background: isConnected ? "#d1e7dd" : "#f8d7da",
            border: isConnected ? "1px solid #a3cfbb" : "1px solid #f1aeb5",
          }}
        >
          {isConnected ? "Disconnect" : "Connect"}
        </button>

        <button style={btn} onClick={saveToFile}>
          Save
        </button>

        <button style={btn} onClick={() => fileInputRef.current?.click()}>
          Load
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) loadFromFile(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
};

export default SerialFlowTopBar;
