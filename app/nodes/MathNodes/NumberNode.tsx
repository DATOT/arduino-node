'use client'
import { Position, useReactFlow } from "@xyflow/react";
import React, { useRef, useEffect, useState } from "react";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHandles,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/app/components/base-node";
import ValueHandle from "@/app/handles/ValueHandle/ValueHandle";

// Radix UI imports
import * as Select from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { NumberData } from "@/app/types/data";

type NumberNodeData = {
  inputType?: "number" | "slider";
  sliderRange?: { min: number; max: number };
  step?: number;
}
type NumberNodeProps = {
  id: string;
  data: NumberData & NumberNodeData;
}

const NumberNode = ({ id, data }: NumberNodeProps) => {
  const { updateNodeData } = useReactFlow();
  const nodeRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const directionRef = useRef<1 | -1>(1);

  const [playing, setPlaying] = useState(false);

  // Defaults
  const inputType = data.inputType ?? "number";
  const sliderRange = data.sliderRange ?? { min: 0, max: 20 };
  const step = data.step ?? 1;

  // Single source of truth
  const value = data.numberValue ?? 0;

  const handleValueChange = (val: number, pause = true) => {
    let numVal = val;

    if (inputType === "slider") {
      numVal = Math.min(
        Math.max(numVal, sliderRange.min),
        sliderRange.max
      );
    }

    if (pause && playing) {
      setPlaying(false);
    }

    updateNodeData(id, {
      numberValue: numVal,
    });
  };

  // Animation (no local state!)
  useEffect(() => {
    if (!playing || inputType !== "slider") {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const animate = () => {
      const current = data.numberValue ?? 0;

      let nextVal = current + step * directionRef.current;

      if (nextVal > sliderRange.max) {
        nextVal = sliderRange.max;
        directionRef.current = -1;
      } else if (nextVal < sliderRange.min) {
        nextVal = sliderRange.min;
        directionRef.current = 1;
      }

      updateNodeData(id, { value: nextVal });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [playing, inputType, sliderRange.min, sliderRange.max, step, data.numberValue, updateNodeData, id]);

  useEffect(() => {
    if (playing) {
      directionRef.current = 1;
    }
  }, [playing]);

  return (
    <BaseNode ref={nodeRef}>
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>Number Node</BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent className="flex flex-col gap-3 p-4">
        {/* Input Type */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium whitespace-nowrap">
            Input Type:
          </label>
          <Select.Root
            value={inputType}
            onValueChange={(val) =>
              updateNodeData(id, { inputType: val as typeof inputType })
            }
          >
            <Select.Trigger className="border rounded px-2 py-1.5 flex items-center justify-between w-full text-sm hover:bg-gray-50">
              {inputType}
              <Select.Icon>
                <ChevronDownIcon className="w-4 h-4" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Content className="bg-white border rounded shadow-md z-50">
              <Select.Item
                value="number"
                className="p-2 flex items-center justify-between cursor-pointer hover:bg-gray-100"
              >
                Number
                {inputType === "number" && <CheckIcon className="w-4 h-4" />}
              </Select.Item>
              <Select.Item
                value="slider"
                className="p-2 flex items-center justify-between cursor-pointer hover:bg-gray-100"
              >
                Slider
                {inputType === "slider" && <CheckIcon className="w-4 h-4" />}
              </Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        {/* Value */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium whitespace-nowrap">
            Value:
          </label>

          {inputType === "number" && (
            <input
              className="nodrag border rounded px-2 py-1.5 w-full text-sm"
              type="number"
              value={value}
              onChange={(e) =>
                handleValueChange(Number(e.target.value), true)
              }
            />
          )}

          {inputType === "slider" && (
            <>
              <input
                type="range"
                min={sliderRange.min}
                max={sliderRange.max}
                step={step}
                value={value}
                onChange={(e) =>
                  handleValueChange(Number(e.target.value), true)
                }
                className="nodrag flex-1 min-w-[120px]"
                onMouseEnter={() => updateNodeData(id, { draggable: false })}
                onMouseLeave={() => updateNodeData(id, { draggable: true })}
              />
              <span className="text-sm font-medium w-10 text-right">
                {value.toFixed(2)}
              </span>
            </>
          )}
        </div>

        {/* Slider Config */}
        {inputType === "slider" && (
          <div className="flex flex-col gap-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <label className="font-medium">Range:</label>
              <input
                type="number"
                value={sliderRange.min}
                onChange={(e) =>
                  updateNodeData(id, {
                    sliderRange: {
                      ...sliderRange,
                      min: Number(e.target.value),
                    },
                  })
                }
                className="nodrag border rounded px-2 py-1 w-16 text-xs"
              />
              <span className="text-gray-400">to</span>
              <input
                type="number"
                value={sliderRange.max}
                onChange={(e) =>
                  updateNodeData(id, {
                    sliderRange: {
                      ...sliderRange,
                      max: Number(e.target.value),
                    },
                  })
                }
                className="nodrag border rounded px-2 py-1 w-16 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 text-sm">
              <label className="font-medium">Step:</label>
              <input
                type="number"
                value={step}
                onChange={(e) =>
                  updateNodeData(id, {
                    step: Number(e.target.value),
                  })
                }
                min="0.01"
                step="0.01"
                className="nodrag border rounded px-2 py-1 w-16 text-xs"
              />
            </div>

            <button
              onClick={() => setPlaying(!playing)}
              className="nodrag border rounded px-3 py-1.5 text-sm hover:bg-gray-100"
            >
              {playing ? "⏸ Pause" : "▶ Play"}
            </button>
          </div>
        )}
      </BaseNodeContent>

      <BaseNodeHandles>
        <ValueHandle
          type="source"
          position={Position.Right}
          title="Output Value"
          kinds={["number"]}
          multiplicity="multi"
        />
      </BaseNodeHandles>
    </BaseNode>
  );
};

export default NumberNode;

