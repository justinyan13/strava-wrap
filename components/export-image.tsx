"use client"

import type { ActivityStats } from "@/lib/csv-parser"
import { calculateFilteredStats } from "@/lib/csv-parser"

interface ExportImageProps {
  stats: ActivityStats
  activityType?: string | null
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

export default function ExportImage({ stats, activityType = null, name }: ExportImageProps) {
  const displayStats = calculateFilteredStats(stats, activityType)

  return (
    <div
      className="relative overflow-hidden bg-black font-sans"
      style={{
        width: '1200px',
        height: '1200px',
        minWidth: '1200px',
        minHeight: '1200px',
        maxWidth: '1200px',
        maxHeight: '1200px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1a1a1a_0%,_#000000_100%)]"></div>
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>

      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 blur-[100px] rounded-full"></div>

      {/* Main Content Container */}
      <div className="relative z-10 h-full flex flex-col p-16 border-[20px] border-white/5">

        {/* Header */}
        <div className="flex justify-between items-start mb-16">
          <div>
            <h1 className="text-9xl font-black text-white tracking-tighter leading-none mb-2" style={{ textShadow: '0 0 30px rgba(255,255,255,0.3)' }}>
              2025
            </h1>
            <div className="flex items-center gap-4">
              <div className="h-1 w-24 bg-blue-500"></div>
              <h2 className="text-4xl font-bold text-blue-500 tracking-widest uppercase">{name}'s Year in Sport</h2>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-mono text-white/60 mb-2">PLAYER STATS</div>
            <div className="text-5xl font-bold text-white">{activityType || "ALL ACTIVITIES"}</div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-8 flex-1">

          {/* Primary Stat Block */}
          <div className="col-span-2 bg-white/5 border border-white/10 rounded-3xl p-10 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-blue-600/20 to-transparent"></div>

            <div className="relative z-10">
              <div className="text-3xl font-mono text-blue-400 mb-2">TOTAL DISTANCE</div>
              <div className="text-[140px] font-black text-white leading-none tracking-tighter" style={{ textShadow: '0 0 40px rgba(59, 130, 246, 0.5)' }}>
                {displayStats.totalDistance.toFixed(0)}
              </div>
            </div>
            <div className="text-right relative z-10">
              <div className="text-4xl font-bold text-white/40 mb-4">KILOMETERS</div>
              <div className="text-8xl">👟</div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-10 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="text-2xl font-mono text-purple-400">ACTIVITIES</div>
              <div className="text-5xl">🏃</div>
            </div>
            <div>
              <div className="text-8xl font-black text-white mb-2">{displayStats.totalActivities}</div>
              <div className="text-xl text-white/40 uppercase tracking-wider">Sessions Completed</div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-10 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="text-2xl font-mono text-pink-400">MOVING TIME</div>
              <div className="text-5xl">🕐</div>
            </div>
            <div>
              <div className="text-7xl font-black text-white mb-2">{formatTime(displayStats.totalMovingTime)}</div>
              <div className="text-xl text-white/40 uppercase tracking-wider">Time in Zone</div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="col-span-2 grid grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <div className="text-xl font-mono text-yellow-400 mb-2">CALORIES</div>
              <div className="text-5xl font-bold text-white">{Math.round(displayStats.totalCalories / 1000)}k</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <div className="text-xl font-mono text-green-400 mb-2">LONGEST</div>
              <div className="text-5xl font-bold text-white">{displayStats.longestActivity.distance.toFixed(1)}<span className="text-2xl text-white/50 ml-1">km</span></div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">STRAVA</div>
                <div className="text-sm text-white/80">WRAPPED 2025</div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Decor */}
        <div className="mt-12 flex justify-between items-end opacity-50">
          <div className="flex flex-col">
            <div className="font-mono text-xl text-white tracking-widest">
              stravawrap.vercel.app
            </div>
            <div className="font-mono text-xs text-white/40 mt-1">
              ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
            </div>
          </div>
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-12 h-2 bg-white/20 rounded-full"></div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

