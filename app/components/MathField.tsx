import "mathlive";
import { MathfieldElement } from "mathlive";
import { useRef, useState, useEffect } from "react";

type MathFieldProps = {
  children?: React.ReactNode;
  onInput?: (value: string, mf: MathfieldElement) => void;
};

export default function MathField({ children, onInput }: MathFieldProps) {/*
  const mfRef = useRef<MathfieldElement | null>(null);
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    const mf = mfRef.current;
    if (!mf) return;

    const handler = () => {
      const val = mf.value;
      setValue(val);
      onInput?.(val, mf);
    };

    mf.addEventListener("input", handler);

    return () => {
      mf.removeEventListener("input", handler);
    };
  }, [onInput]);

  return (
    <div>
      <math-field
        ref={mfRef}
        style={{ width: "90%", border: "1px solid #ccc", borderRadius: "8px" }}
      >
        {children}
      </math-field>
    </div>
  );
    */
  return <div>:)</div>
}
