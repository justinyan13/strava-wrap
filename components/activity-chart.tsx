"use client"

import type { ActivityStats } from "@/lib/csv-parser"

interface ActivityChartProps {
  stats: ActivityStats
}

export default function ActivityChart({ stats }: ActivityChartProps) {
  const chartData = stats.activityTypes
  const maxCount = Math.max(...chartData.map((d) => d.count), 1)

  const colors = ["bg-primary", "bg-accent", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]

  return (
    <div className="w-full space-y-6">
      {chartData.map((type, index) => {
        const percentage = (type.count / maxCount) * 100
        return (
          <div key={type.name}>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-foreground">{type.name}</span>
              <span className="text-sm text-muted-foreground">{type.count} activities</span>
            </div>
            <div className="w-full bg-card border border-border rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${colors[index % colors.length]} transition-all`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
