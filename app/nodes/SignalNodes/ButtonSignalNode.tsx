'use client'
import { Position } from "@xyflow/react";
import React from "react";
import {
  BaseNode,
  BaseNodeHandles,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/app/components/base-node";
import ValueHandle from "@/app/handles/ValueHandle/ValueHandle";
import { useFlowRuntime } from "@/app/context/Runtime/FlowRuntimeContext";
import { encodeHandle } from "@/app/lib/utils";

const ButtonSignalNode = ({ id }: { id: string }) => {
  const { emit } = useFlowRuntime();

  const SIGNAL_OUT = encodeHandle({
    types: ["signal"],
    multiplicity: "multi",
    name: "out",
  });

  const handleClick = () => {
    emit(id, SIGNAL_OUT, true);
  };

  return (
    <BaseNode>
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>Button</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <div className="px-4 py-3">
        <button
          onClick={handleClick}
          className="w-full px-4 py-2 text-xs font-medium border rounded
                     hover:bg-white/10 active:scale-95 transition-all select-none"
        >
          Send Signal
        </button>
      </div>

      <BaseNodeHandles>
        <ValueHandle
          type="source"
          position={Position.Right}
          title="Signal"
          kinds={["signal"]}
          multiplicity="multi"
          name="out"
        />
      </BaseNodeHandles>
    </BaseNode>
  );
};

export default ButtonSignalNode;
