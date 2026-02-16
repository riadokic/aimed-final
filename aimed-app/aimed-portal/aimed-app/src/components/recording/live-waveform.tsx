"use client";

import { useMemo } from "react";

interface LiveWaveformProps {
  /** Frequency data from AnalyserNode (64 bins, values 0-255). Null = fallback CSS animation. */
  frequencyData: Uint8Array | null;
  /** Number of bars to render */
  bars?: number;
}

/**
 * Renders a real-time audio waveform when frequencyData is available,
 * or falls back to CSS-animated bars when not.
 */
export function LiveWaveform({ frequencyData, bars = 48 }: LiveWaveformProps) {
  // Map frequency bins to the desired number of bars
  const heights = useMemo(() => {
    if (!frequencyData || frequencyData.length === 0) return null;

    const result: number[] = [];
    const binCount = frequencyData.length;
    const step = binCount / bars;

    for (let i = 0; i < bars; i++) {
      const binIndex = Math.min(Math.floor(i * step), binCount - 1);
      // Map 0-255 to 4-64px range
      const normalized = frequencyData[binIndex] / 255;
      result.push(4 + normalized * 60);
    }
    return result;
  }, [frequencyData, bars]);

  // Real-time waveform
  if (heights) {
    return (
      <div className="flex h-20 items-end justify-center gap-[3px] px-2">
        {heights.map((h, i) => (
          <div
            key={i}
            className="w-[2px] rounded-full bg-aimed-gray-500 transition-[height] duration-75"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
    );
  }

  // Fallback: CSS-animated bars (when AnalyserNode not available)
  return (
    <div className="flex h-20 items-end justify-center gap-[3px] px-2">
      {Array.from({ length: bars }).map((_, i) => (
        <FallbackBar key={i} index={i} />
      ))}
    </div>
  );
}

function FallbackBar({ index }: { index: number }) {
  const height = 8 + Math.random() * 48;
  const delay = index * 30;

  return (
    <div
      className="w-[2px] rounded-full bg-aimed-gray-500"
      style={{
        height: `${height}px`,
        animation: `wave 0.8s ease-in-out ${delay}ms infinite alternate`,
      }}
    />
  );
}
