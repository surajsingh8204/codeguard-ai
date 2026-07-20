import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { severityBarColors } from "../../lib/reviewHelpers";

export function RiskTrendChart({ points, level }) {
  return (
    <div className="mt-4 h-64 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={points}
          margin={{ top: 12, right: 16, left: 0, bottom: 4 }}
        >
          <defs>
            <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FB7185" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#FB7185" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={0}
            padding={{ left: 8, right: 8 }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(15,23,42,0.95)",
              border: "1px solid rgba(148,163,184,0.2)",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: "#E2E8F0" }}
            formatter={(value) => [`${value} · ${level}`, "Risk score"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#FB7185"
            strokeWidth={2}
            fill="url(#riskFill)"
            dot={{ r: 3, fill: "#FDE68A", stroke: "#0F172A", strokeWidth: 1.5 }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SeverityChart({ counts }) {
  const max = Math.max(...counts.map((c) => c.count), 1);

  return (
    <div className="mt-5 space-y-3">
      {counts.map((item) => {
        const width = Math.max((item.count / max) * 100, item.count ? 8 : 2);
        return (
          <div key={item.level} className="min-w-0">
            <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
              <span className="truncate font-semibold text-slate-200">
                {item.level}
              </span>
              <span className="shrink-0 text-slate-400">{item.count}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-950/80">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${width}%`,
                  background: severityBarColors[item.level],
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
