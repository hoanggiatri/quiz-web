import { Pie, PieChart, Cell } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"

const data = [
  { name: "Đã hoàn thành", value: 12, fill: "hsl(142, 76%, 36%)" },
  { name: "Chưa hoàn thành", value: 8, fill: "hsl(221, 83%, 53%)" },
  { name: "Quá hạn", value: 3, fill: "hsl(0, 84%, 60%)" },
]

const chartConfig = {
  completed: {
    label: "Đã hoàn thành",
    color: "hsl(142, 76%, 36%)", // Green
  },
  pending: {
    label: "Chưa hoàn thành",
    color: "hsl(221, 83%, 53%)", // Blue
  },
  overdue: {
    label: "Quá hạn",
    color: "hsl(0, 84%, 60%)", // Red
  },
} satisfies ChartConfig

export function AssignmentProgressChart() {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const completedPercentage = Math.round((data[0].value / total) * 100)

  return (
    <div className="relative">
      <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[280px]">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                const percentage = Math.round((data.value / total) * 100)
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <div className="grid gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          {data.name}
                        </span>
                        <span className="font-bold text-foreground">
                          {data.value} bài tập ({percentage}%)
                        </span>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={120}
            strokeWidth={2}
            stroke="hsl(var(--background))"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          {/* Center Text */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground text-2xl font-bold"
          >
            {completedPercentage}%
          </text>
          <text
            x="50%"
            y="50%"
            dy="20"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground text-sm"
          >
            Hoàn thành
          </text>
        </PieChart>
      </ChartContainer>

      {/* Enhanced Legend */}
      <div className="mt-4 grid grid-cols-1 gap-2">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.fill }}
              />
              <span className="text-sm font-medium">{entry.name}</span>
            </div>
            <div className="text-sm font-bold">
              {entry.value} ({Math.round((entry.value / total) * 100)}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
