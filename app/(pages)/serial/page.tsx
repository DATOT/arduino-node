'use client'
import React from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { DnDProvider } from "@/app/components/flow/UseDnD";
import Flow from "@/app/components/flow/Flow";
import { FlowProvider } from "@/app/components/flow/FlowContext";
import SerialFlowTopBar from "@/app/components/TopBars/SerialFlowTopBar";
import { SerialProvider } from "@/app/context/Serial/SerialContext";
import { FlowRuntimeProvider } from "@/app/context/Runtime/FlowRuntimeContext";

const FlowPage = () => {
  return (
    <FlowRuntimeProvider>
      <SerialProvider>
        <ReactFlowProvider>
          <DnDProvider>
            <FlowProvider>
              <div className="w-screen h-screen flex flex-col overflow-hidden">
                {/* Top bar takes fixed height */}
                <SerialFlowTopBar />

                {/* Flow takes remaining space */}
                <div className="flex-1">
                  <Flow />
                </div>
              </div>
            </FlowProvider>
          </DnDProvider>
        </ReactFlowProvider>
      </SerialProvider>
    </FlowRuntimeProvider>
  );
};

export default FlowPage;

