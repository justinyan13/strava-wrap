"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ActivityStats } from "@/lib/csv-parser"
import { calculateFilteredStats } from "@/lib/csv-parser"
import { toPng } from "html-to-image"
import ExportImage from "./export-image"
import { cn } from "@/lib/utils"

interface StatsDisplayProps {
  stats: ActivityStats
  onReset: () => void
  name: string
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export default function StatsDisplay({ stats, onReset, name }: StatsDisplayProps) {
  const [selectedActivityType, setSelectedActivityType] = useState<string>("All")
  const [isExporting, setIsExporting] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)
  const exportImageRef = useRef<HTMLDivElement>(null)

  // Calculate filtered stats based on selected activity type
  const displayStats = calculateFilteredStats(stats, selectedActivityType === "All" ? null : selectedActivityType)

  // Get all available activity types
  const activityTypes = ["All", ...stats.activityTypes.map((t) => t.name)]

  const handleExport = async () => {
    if (!exportImageRef.current) {
      alert("Export element not found. Please refresh the page and try again.")
      return
    }

    setIsExporting(true)

    try {
      const element = exportImageRef.current

      // Temporarily move into viewport for capture
      const originalLeft = element.style.left
      const originalTop = element.style.top
      const originalZIndex = element.style.zIndex

      element.style.left = '0px'
      element.style.top = '0px'
      element.style.zIndex = '-9999'

      await new Promise(resolve => setTimeout(resolve, 200))

      void element.offsetWidth
      void element.offsetHeight

      const dataUrl = await toPng(element, {
        backgroundColor: '#000000', // Will be covered by component background
        pixelRatio: 2,
        quality: 1.0,
        width: 1200,
        height: 1200,
        style: {
          transform: 'scale(1)',
        },
      })

      element.style.left = originalLeft
      element.style.top = originalTop
      element.style.zIndex = originalZIndex

      if (!dataUrl || dataUrl === "data:,") {
        throw new Error("Failed to generate image")
      }

      const link = document.createElement("a")
      link.download = `stravawrap.vercel.app-${selectedActivityType === "All" ? "all" : selectedActivityType}.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

    } catch (error) {
      console.error("Error exporting image:", error)
      alert(`Failed to export image: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      {/* Export image component - positioned off-screen */}
      <div
        className="fixed pointer-events-none"
        style={{
          left: '-9999px',
          top: '0',
          width: '1200px',
          height: '1200px',
          opacity: 1,
          visibility: 'visible',
        }}
        ref={exportImageRef}
      >
        <ExportImage
          stats={stats}
          activityType={selectedActivityType === "All" ? null : selectedActivityType}
          name={name}
        />
      </div>

      <div className="min-h-screen bg-transparent py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-12" ref={exportRef}>

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-8">
            <div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 mb-2">
                2025
              </h1>
              <h2 className="text-xl md:text-3xl font-bold text-primary tracking-tight neon-text uppercase">
                {name}'S YEAR IN SPORT
              </h2>
            </div>

            <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
              <Select value={selectedActivityType} onValueChange={setSelectedActivityType}>
                <SelectTrigger className="w-full md:w-[180px] bg-card/50 border-white/10 backdrop-blur-md">
                  <SelectValue placeholder="Filter by activity" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-3 w-full md:w-auto">
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex-1 md:flex-none bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(var(--primary),0.5)] transition-all hover:scale-105"
                >
                  {isExporting ? "INITIALIZING..." : "EXPORT TO IG STORY"}
                </Button>

                <Button
                  onClick={onReset}
                  variant="outline"
                  className="flex-1 md:flex-none border-white/10 hover:bg-white/5 hover:text-white"
                >
                  UPLOAD NEW
                </Button>
              </div>
            </div>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(180px,auto)]">

            {/* Total Activities - Large Square */}
            <div className="glass-panel p-8 rounded-3xl md:col-span-2 md:row-span-2 flex flex-col justify-between group hover:border-primary/50 transition-all duration-500">
              <div className="flex justify-between items-start">
                <div className="text-5xl p-3 bg-primary/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">🏃</div>
                <div className="text-right">
                  <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Activities</p>
                  <p className="text-xs text-primary mt-1">TOTAL COUNT</p>
                </div>
              </div>
              <div>
                <p className="text-6xl md:text-8xl font-black tracking-tighter text-white group-hover:neon-text transition-all duration-300">
                  {displayStats.totalActivities}
                </p>
              </div>
            </div>

            {/* Total Distance - Tall */}
            <div className="glass-panel p-6 rounded-3xl md:col-span-1 md:row-span-2 flex flex-col justify-between group hover:border-chart-2/50 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-chart-2/20 blur-[50px] rounded-full -mr-16 -mt-16 pointer-events-none"></div>

              <div className="relative z-10">
                <div className="text-4xl mb-4">👟</div>
                <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-1">Distance</p>
                <p className="text-4xl font-bold text-white">
                  {displayStats.totalDistance.toFixed(0)}
                  <span className="text-lg text-muted-foreground ml-1">km</span>
                </p>
              </div>

              <div className="w-full bg-white/5 h-32 rounded-xl mt-4 relative overflow-hidden">
                {/* Decorative bar chart visualization */}
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-2 pb-2 h-full gap-1">
                  {[40, 70, 50, 90, 60, 80, 45].map((h, i) => (
                    <div key={i} className="w-full bg-chart-2/50 rounded-t-sm" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Time - Wide */}
            <div className="glass-panel p-6 rounded-3xl md:col-span-1 flex flex-col justify-center group hover:border-chart-3/50 transition-all duration-500">
              <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-2">Moving Time</p>
              <p className="text-3xl font-bold text-white">
                {formatTime(displayStats.totalMovingTime)}
              </p>
            </div>

            {/* Calories - Wide */}
            <div className="glass-panel p-6 rounded-3xl md:col-span-1 flex flex-col justify-center group hover:border-chart-4/50 transition-all duration-500">
              <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-2">Burned</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-white">
                  {Math.round(displayStats.totalCalories / 1000)}k
                </p>
                <p className="text-sm text-muted-foreground">cal</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                aka {Math.round(displayStats.totalCalories / 190)} Krispy Kreme donuts 🍩
              </p>
            </div>

            {/* Middle Row */}

            {/* Favorite Activity */}
            {selectedActivityType === "All" && (
              <div className="glass-panel p-6 rounded-3xl md:col-span-2 flex items-center justify-between group hover:border-chart-5/50 transition-all duration-500">
                <div>
                  <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-2">Top Sport</p>
                  <p className="text-3xl md:text-4xl font-bold text-white">{displayStats.favoriteActivityType}</p>
                  <p className="text-sm text-primary mt-1">
                    {displayStats.activityTypes.find((t) => t.name === displayStats.favoriteActivityType)?.count || 0} sessions
                  </p>
                </div>
                <div className="text-6xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                  🏅
                </div>
              </div>
            )}

            {/* Busiest Month */}
            <div className="glass-panel p-6 rounded-3xl md:col-span-2 flex items-center justify-between group hover:border-primary/50 transition-all duration-500">
              <div>
                <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-2">Peak Month</p>
                <p className="text-3xl md:text-4xl font-bold text-white">{displayStats.busiestMonth.month || "N/A"}</p>
                <p className="text-sm text-primary mt-1">
                  {displayStats.busiestMonth.count} activities
                </p>
              </div>
              <div className="text-6xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                📅
              </div>
            </div>

            {/* Kudos - Only on All page */}
            {selectedActivityType === "All" && (
              <div className="glass-panel p-6 rounded-3xl md:col-span-2 flex items-center justify-between group hover:border-yellow-500/50 transition-all duration-500">
                <div>
                  <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-2">Kudos Received</p>
                  <p className="text-3xl md:text-4xl font-bold text-white">{displayStats.totalKudos}</p>
                  <p className="text-sm text-yellow-500 mt-1">
                    {displayStats.avgKudosPerActivity.toFixed(1)} per activity
                  </p>
                </div>
                <div className="text-6xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                  👍
                </div>
              </div>
            )}

            {/* Longest Activity - Full Width */}
            {displayStats.longestActivity.distance > 0 && (
              <div className="glass-panel p-8 rounded-3xl md:col-span-4 relative overflow-hidden group hover:border-white/30 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🏆</span>
                      <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Longest Effort</p>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">{displayStats.longestActivity.name}</h3>
                    <p className="text-primary font-medium">{displayStats.longestActivity.type}</p>
                  </div>

                  <div className="flex gap-8 md:gap-12 text-right">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase mb-1">Distance</p>
                      <p className="text-2xl md:text-3xl font-bold text-white">{displayStats.longestActivity.distance.toFixed(1)} km</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase mb-1">Duration</p>
                      <p className="text-2xl md:text-3xl font-bold text-white">{formatTime(displayStats.longestActivity.time)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Breakdown Grid */}
            {selectedActivityType === "All" && (
              <div className="glass-panel p-8 rounded-3xl md:col-span-4">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Activity Breakdown
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {stats.activityTypes.map((type) => (
                    <div key={type.name} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors border border-white/5">
                      <p className="text-white font-medium truncate mb-1">{type.name}</p>
                      <p className="text-2xl font-bold text-primary">{type.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
