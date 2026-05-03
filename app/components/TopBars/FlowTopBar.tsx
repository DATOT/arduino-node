import React, { useRef } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useFlow } from "../flow/FlowContext";

const FlowTopBar: React.FC = () => {
  const { saveToFile, loadFromFile, resetFlow } = useFlow();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      style={{
        width: "100%",
        height: "50px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 12px",
        borderBottom: "1px solid #ccc",
        background: "#fff",
      }}
    >
      <div style={{ display: "flex", gap: "8px" }}>
        <a href={"/"} className="bg-yellow-100 p-1 rounded-sm">
          Home
        </a>

        <AlertDialog.Root>
          <AlertDialog.Trigger asChild>
            <button>Reset</button>
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
                borderRadius: "8px",
              }}
            >
              <AlertDialog.Title>Confirm Reset</AlertDialog.Title>
              <AlertDialog.Description>
                This will clear everything.
              </AlertDialog.Description>

              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <AlertDialog.Cancel asChild>
                  <button>Cancel</button>
                </AlertDialog.Cancel>

                <AlertDialog.Action asChild>
                  <button onClick={resetFlow}>Confirm</button>
                </AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={saveToFile}>Save</button>
        <button onClick={() => fileInputRef.current?.click()}>Load</button>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              loadFromFile(file);
            }

            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
};

export default FlowTopBar;
