import React, { type ComponentProps } from "react";
import { type HandleProps } from "@xyflow/react";

import { cn } from "@/app/lib/utils";
import { BaseHandle } from "@/app/components/base-handle";

const flexDirections = {
  top: "flex-col items-center",
  right: "flex-row-reverse items-center",
  bottom: "flex-col items-center",
  left: "flex-row items-center",
};
const paddingDirections = {
  top: "pt-1",
  right: "pr-1",
  bottom: "pb-1",
  left: "pl-1",
};

export type LabeledHandleProps = HandleProps & {
  title?: string;
  handleClassName?: string;
  labelClassName?: string;
} & Omit<ComponentProps<"div">, "id">;

export function LabeledHandle({
  className,
  labelClassName,
  handleClassName,
  title,
  position,
  ...props
}: LabeledHandleProps) {
  const { ref, ...handleProps } = props;

  if (title === undefined) {
    title = "";
  }
  const isRight = position === "right";
  const isBottom = position === "bottom";
  return (
    <div
      title={title}
      className={cn("relative flex", flexDirections[position], className)}
      ref={ref}
    >
      {(isRight || isBottom) && (
        <BaseHandle
          position={position}
          className={handleClassName}
          {...handleProps}
        />
      )}

      <label
        className={cn(
          "text-gray-400",
          paddingDirections[position],
          labelClassName,
        )}
        style={{
          fontSize: "0.5rem",
        }}
      >
        {title}
      </label>

      {!(isRight || isBottom) && (
        <BaseHandle
          position={position}
          className={handleClassName}
          {...handleProps}
        />
      )}
    </div>
  );
}
