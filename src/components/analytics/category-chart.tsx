"use client";

import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { CategoryDist } from "@/hooks/use-analytics";

interface CategoryChartProps {
  data: CategoryDist[];
}

const COLORS = [
  "#00D09C", "#5367FF", "#F59E0B", "#F56565", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
  "#14B8A6", "#EF4444", "#A855F7", "#3B82F6",
];

export function CategoryChart({ data }: CategoryChartProps) {
  const router = useRouter();

  const handleBarClick = (entry: CategoryDist) => {
    router.push(`/?category=${entry.slug}`);
  };

  if (data.length === 0) return null;

  return (
    <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
        Category Distribution
      </h3>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: unknown) => [`${value} reviews`, "Count"]}
              cursor={{ fill: "var(--color-bg-hover)" }}
            />
            <Bar
              dataKey="count"
              radius={[0, 4, 4, 0]}
              cursor="pointer"
              onClick={(_data: unknown, index: number) => handleBarClick(data[index])}
            >
              {data.map((_entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
