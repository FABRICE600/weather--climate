import { useMemo } from "react";
import type { HourlyPoint } from "@/lib/types";
import { tempValue, unitLabel, type TempUnit } from "@/lib/units";

interface HourlyChartProps {
  data: HourlyPoint[];
  unit: TempUnit;
}

// A lightweight, dependency-free SVG line chart showing the hourly temperature
// trend. Renders a smooth gradient area under the line, axis labels for each
// point, and min/max temperature markers.
export default function HourlyChart({ data, unit }: HourlyChartProps) {
  const width = 520;
  const height = 180;
  const padX = 28;
  const padY = 32;
  const label = unitLabel(unit);

  const { points, areaPath, linePath, minTemp, maxTemp } = useMemo(() => {
    if (data.length === 0) {
      return { points: [], areaPath: "", linePath: "", minTemp: 0, maxTemp: 0 };
    }
    const temps = data.map((d) => tempValue(d.temp, unit));
    const minT = Math.min(...temps);
    const maxT = Math.max(...temps);
    const range = maxT - minT || 1;
    const innerW = width - padX * 2;
    const innerH = height - padY * 2;
    const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

    const pts = data.map((d, i) => {
      const v = tempValue(d.temp, unit);
      const x = padX + i * stepX;
      const y = padY + innerH - ((v - minT) / range) * innerH;
      return { x, y, temp: v, time: d.time };
    });

    const lPath = pts
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");

    const aPath =
      `M ${pts[0].x.toFixed(1)} ${(height - padY).toFixed(1)} ` +
      pts.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") +
      ` L ${pts[pts.length - 1].x.toFixed(1)} ${(height - padY).toFixed(1)} Z`;

    return { points: pts, areaPath: aPath, linePath: lPath, minTemp: minT, maxTemp: maxT };
  }, [data, unit]);

  if (data.length === 0) return null;

  return (
    <div className="mt-6 rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-white/70">
          Hourly Trend
        </h3>
        <div className="flex items-center gap-3 text-xs text-white/50">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-sky-400" /> High {maxTemp}°{label}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-300" /> Low {minTemp}°{label}
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Hourly temperature trend chart"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="hourlyArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((t) => {
          const y = padY + (height - padY * 2) * t;
          return (
            <line
              key={t}
              x1={padX}
              y1={y}
              x2={width - padX}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* Area + line */}
        <path d={areaPath} fill="url(#hourlyArea)" />
        <path
          d={linePath}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points + labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill="#38bdf8" />
            <circle cx={p.x} cy={p.y} r="5" fill="#38bdf8" opacity="0.2" />
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              className="fill-white"
              style={{ fontSize: 11, fontWeight: 600 }}
            >
              {p.temp}°
            </text>
            <text
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              className="fill-white/50"
              style={{ fontSize: 10 }}
            >
              {p.time}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
