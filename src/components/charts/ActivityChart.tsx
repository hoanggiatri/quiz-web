import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const data = [
  { day: "T2", quizzes: 2, assignments: 1 },
  { day: "T3", quizzes: 3, assignments: 2 },
  { day: "T4", quizzes: 1, assignments: 1 },
  { day: "T5", quizzes: 4, assignments: 3 },
  { day: "T6", quizzes: 2, assignments: 2 },
  { day: "T7", quizzes: 1, assignments: 0 },
  { day: "CN", quizzes: 0, assignments: 1 },
]

const chartConfig = {
  quizzes: {
    label: "Quiz",
    color: "hsl(262, 83%, 58%)", // Purple
  },
  assignments: {
    label: "Bài tập",
    color: "hsl(142, 76%, 36%)", // Green
  },
} satisfies ChartConfig

export function ActivityChart() {
  return (
    <ChartContainer config={chartConfig}>
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent />}
        />
        <defs>
          <linearGradient id="fillQuizzes" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-quizzes)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-quizzes)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient id="fillAssignments" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-assignments)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-assignments)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <Area
          dataKey="assignments"
          type="monotone"
          fill="url(#fillAssignments)"
          fillOpacity={0.4}
          stroke="var(--color-assignments)"
          stackId="a"
        />
        <Area
          dataKey="quizzes"
          type="monotone"
          fill="url(#fillQuizzes)"
          fillOpacity={0.4}
          stroke="var(--color-quizzes)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  )
}
