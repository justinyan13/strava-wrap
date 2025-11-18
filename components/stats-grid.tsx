"use client"

import { Card } from "@/components/ui/card"
import type { ActivityStats } from "@/lib/csv-parser"

interface StatsGridProps {
  stats: ActivityStats
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const statItems = [
    {
      label: "Total Activities",
      value: stats.totalActivities,
      emoji: "🏃",
    },
    {
      label: "Distance",
      value: `${stats.totalDistance.toFixed(1)} km`,
      emoji: "📍",
    },
    {
      label: "Time Moving",
      value: `${Math.floor(stats.totalMovingTime / 3600)}h`,
      emoji: "⏱️",
    },
    {
      label: "Elevation Gain",
      value: `${Math.round(stats.totalElevationGain)} m`,
      emoji: "⛰️",
    },
    {
      label: "Avg Heart Rate",
      value: stats.avgHeartRate > 0 ? `${Math.round(stats.avgHeartRate)} bpm` : "N/A",
      emoji: "❤️",
    },
    {
      label: "Max Speed",
      value: `${stats.maxSpeed.toFixed(1)} km/h`,
      emoji: "⚡",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statItems.map((item) => (
        <Card key={item.label} className="bg-card/50 border-border p-6 hover:bg-card/70 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{item.label}</p>
              <p className="text-3xl font-bold text-foreground">{item.value}</p>
            </div>
            <span className="text-4xl opacity-60">{item.emoji}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}
