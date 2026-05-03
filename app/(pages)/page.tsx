'use client'

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

export default function Home() {
  const [data, setData] = useState([]);

  const WINDOW = 10000; // 10 seconds window

  const addPoint = () => {
    const now = Date.now();

    const newPoint = {
      time: now,
      value: Math.floor(Math.random() * 100),
    };

    setData(prev => {
      const updated = [...prev, newPoint];

      // keep only last 10 seconds
      return updated.filter(d => now - d.time <= WINDOW);
    });
  };

  return (
    <div className="w-full h-screen flex flex-col items-center p-4 gap-4 bg-white">

      <button
        onClick={addPoint}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Add Data Point
      </button>

      <LineChart
        width={800}
        height={400}
        data={data}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

        <XAxis
          dataKey="time"
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(t) =>
            new Date(t).toLocaleTimeString([], {
              minute: '2-digit',
              second: '2-digit'
            })
          }
        />

        <YAxis />

        <Tooltip
          labelFormatter={(t) =>
            new Date(t).toLocaleTimeString()
          }
        />

        <Line
          dataKey="value"
          stroke="#2563eb"
          dot={false}
          isAnimationActive={false}
          animationDuration={300}
        />
      </LineChart>
    </div>
  );
}
