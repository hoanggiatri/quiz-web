import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const data = [
  { month: "T1", grade: 7.5 },
  { month: "T2", grade: 8.0 },
  { month: "T3", grade: 7.8 },
  { month: "T4", grade: 8.5 },
  { month: "T5", grade: 8.2 },
  { month: "T6", grade: 8.8 },
  { month: "T7", grade: 9.0 },
  { month: "T8", grade: 8.7 },
  { month: "T9", grade: 9.2 },
  { month: "T10", grade: 8.9 },
  { month: "T11", grade: 9.1 },
  { month: "T12", grade: 9.3 },
]

const chartConfig = {
  grade: {
    label: "Điểm trung bình",
    color: "hsl(221, 83%, 53%)", // Blue
  },
} satisfies ChartConfig

export function GradeChart() {
  return (
    <ChartContainer config={chartConfig}>
      <LineChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
          top: 12,
          bottom: 12,
        }}
      >
        {/* Enhanced Grid with horizontal lines */}
        <CartesianGrid
          vertical={false}
          horizontal={true}
          stroke="hsl(var(--muted-foreground))"
          strokeOpacity={0.2}
          strokeDasharray="3 3"
        />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          domain={[0, 10]}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          tickFormatter={(value) => `${value}.0`}
        />
        {/* Enhanced Tooltip */}
        <ChartTooltip
          cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "3 3" }}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-3 shadow-md">
                  <div className="grid gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Tháng {label}
                      </span>
                      <span className="font-bold text-foreground">
                        Điểm: {payload[0].value}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Line
          dataKey="grade"
          type="monotone"
          stroke="var(--color-grade)"
          strokeWidth={3}
          dot={{
            fill: "var(--color-grade)",
            strokeWidth: 2,
            stroke: "hsl(var(--background))",
            r: 4,
          }}
          activeDot={{
            r: 6,
            stroke: "var(--color-grade)",
            strokeWidth: 2,
            fill: "hsl(var(--background))",
          }}
        />
      </LineChart>
    </ChartContainer>
  )
}
