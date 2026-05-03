/*
import React, { useEffect, useRef } from "react";
import functionPlot, { FunctionPlotOptions } from "function-plot";

type SafeFunctionPlotOptions = Omit<FunctionPlotOptions, "target">;

export interface FunctionPlotProps {
  options?: SafeFunctionPlotOptions;
}

export interface FunctionPlotProps {
  options?: SafeFunctionPlotOptions;
  onViewportChange?: (domain: {
    x: [number, number];
    y: [number, number];
  }) => void;
}

const plot = (functionPlot as any).default ?? functionPlot;
export const FunctionPlot: React.FC<FunctionPlotProps> = React.memo(
  ({ options, onViewportChange }) => {
    const rootEl = useRef<HTMLDivElement | null>(null);
    const lastDomainRef = useRef<{
      x: [number, number];
      y: [number, number];
    } | null>(null);

    useEffect(() => {
      if (!rootEl.current || !options) return;

      try {
        rootEl.current.innerHTML = "";

        const instance = plot({
          ...options,
          target: rootEl.current,
        });

        const svg = rootEl.current.querySelector("svg");

        if (svg) {
          const zoomLayer = svg.querySelector(".zoom-and-drag");

          if (zoomLayer) {
            zoomLayer.addEventListener("wheel", handleViewport);
            zoomLayer.addEventListener("mousedown", handleViewport);
            zoomLayer.addEventListener("mousemove", handleViewport);
          }
        }

        function handleViewport() {
          if (!instance?.meta?.xScale || !instance?.meta?.yScale) return;

          const x = instance.meta.xScale.domain();
          const y = instance.meta.yScale.domain();

          const next = {
            x: [x[0], x[1]] as [number, number],
            y: [y[0], y[1]] as [number, number],
          };

          const prev = lastDomainRef.current;

          const eps = 1e-6;

          const dx0 = prev ? Math.abs(prev.x[0] - next.x[0]) : Infinity;
          const dx1 = prev ? Math.abs(prev.x[1] - next.x[1]) : Infinity;
          const dy0 = prev ? Math.abs(prev.y[0] - next.y[0]) : Infinity;
          const dy1 = prev ? Math.abs(prev.y[1] - next.y[1]) : Infinity;

          const changed = dx0 > eps || dx1 > eps || dy0 > eps || dy1 > eps;

          if (changed) {
            lastDomainRef.current = next;

            console.log(next);
            onViewportChange?.(next);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }, [options]);

    return (
      <div
        ref={rootEl}
        style={{ width: "100%", height: "100%" }}
        className="functionplot"
      />
    );
  },
  () => false,
);
*/
