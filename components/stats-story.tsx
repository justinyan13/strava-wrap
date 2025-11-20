"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import type { ActivityStats } from "@/lib/csv-parser"
import { calculateFilteredStats } from "@/lib/csv-parser"

interface StatsStoryProps {
  stats: ActivityStats
  onReset: () => void
  onComplete: () => void
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

interface StorySlide {
  id: string
  title: string
  emoji: string
  content: React.ReactNode
  bgClass: string
}

export default function StatsStory({ stats, onReset, onComplete, name }: StatsStoryProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const displayStats = calculateFilteredStats(stats, null)

  // Create story slides
  const slides: StorySlide[] = [
    {
      id: "intro",
      title: "2025",
      emoji: "⚡",
      bgClass: "bg-black",
      content: (
        <div className="text-center px-4">
          <p className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-white uppercase">
            {name}'S YEAR IN SPORT
          </p>
          <p className="text-lg md:text-xl text-muted-foreground">Ready to see your stats?</p>
        </div>
      ),
    },
    {
      id: "total-activities",
      title: "Total Activities",
      emoji: "🏃",
      bgClass: "bg-black",
      content: (
        <div className="text-center px-4">
          <p className="text-6xl md:text-8xl font-black mb-4 text-primary neon-text">{displayStats.totalActivities}</p>
          <p className="text-xl md:text-2xl text-white/80 font-mono uppercase tracking-widest">sessions crushed</p>
        </div>
      ),
    },
    {
      id: "total-distance",
      title: "Total Distance",
      emoji: "👟",
      bgClass: "bg-black",
      content: (
        <div className="text-center px-4">
          <p className="text-6xl md:text-8xl font-black mb-4 text-chart-2 neon-text">{displayStats.totalDistance.toFixed(0)}</p>
          <p className="text-xl md:text-2xl text-white/80 font-mono uppercase tracking-widest">kilometers</p>
        </div>
      ),
    },
    {
      id: "total-time",
      title: "Total Time",
      emoji: "🕐",
      bgClass: "bg-black",
      content: (
        <div className="text-center px-4">
          <p className="text-5xl md:text-7xl font-black mb-4 text-chart-3 neon-text">{formatTime(displayStats.totalMovingTime)}</p>
          <p className="text-xl md:text-2xl text-white/80 font-mono uppercase tracking-widest">in the zone</p>
        </div>
      ),
    },
    {
      id: "total-calories",
      title: "Calories Burned",
      emoji: "🔥",
      bgClass: "bg-black",
      content: (
        <div className="text-center px-4">
          <p className="text-5xl md:text-8xl font-black mb-4 text-orange-500 neon-text">{displayStats.totalCalories.toLocaleString()}</p>
          <p className="text-xl md:text-2xl text-white/80 font-mono uppercase tracking-widest mb-6">calories torched</p>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm inline-block max-w-full">
            <p className="text-base md:text-lg text-white/90 font-medium">
              aka <span className="text-orange-400 font-bold">{Math.round(displayStats.totalCalories / 190)}</span> Krispy Kreme donuts 🍩
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "favorite-activity",
      title: "Top Sport",
      emoji: "🏅",
      bgClass: "bg-black",
      content: (
        <div className="text-center px-4">
          <p className="text-4xl md:text-6xl font-black mb-4 text-chart-4 neon-text break-words">{displayStats.favoriteActivityType}</p>
          <p className="text-2xl md:text-3xl text-white font-bold mb-2">
            {displayStats.activityTypes.find((t) => t.name === displayStats.favoriteActivityType)?.count || 0}
          </p>
          <p className="text-lg md:text-xl text-white/60 font-mono uppercase tracking-widest">sessions</p>
        </div>
      ),
    },
    {
      id: "longest-distance",
      title: "Longest Workout",
      emoji: "🏆",
      bgClass: "bg-black",
      content: displayStats.longestActivity.distance > 0 ? (
        <div className="text-center px-4">
          <p className="text-2xl md:text-3xl font-bold mb-4 text-white break-words">{displayStats.longestActivity.name}</p>
          <div className="space-y-4">
            <p className="text-5xl md:text-7xl font-black text-chart-5 neon-text">{displayStats.longestActivity.distance.toFixed(1)} km</p>
            <p className="text-xl md:text-2xl text-white/60 font-mono">{formatTime(displayStats.longestActivity.time)}</p>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-2xl opacity-90">No data available</p>
        </div>
      ),
    },
  ]

  const handleNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      // After the last slide, show the full summary
      onComplete()
    }
  }, [currentSlide, slides.length, onComplete])

  const handlePrevious = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }, [currentSlide])


  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault()
        handleNext()
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        handlePrevious()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [handleNext, handlePrevious])


  const slide = slides[currentSlide]

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-black to-black opacity-50"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

      {/* Progress bar at top */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="max-w-md mx-auto flex gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${index <= currentSlide ? "bg-primary shadow-[0_0_10px_var(--color-primary)]" : "bg-white/10"
                }`}
            />
          ))}
        </div>
      </div>

      {/* Story slide */}
      <div
        className={`w-full h-screen flex items-center justify-center ${slide.bgClass} text-white relative z-10`}
      >
        {/* Clickable areas for navigation */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer hover:bg-gradient-to-r hover:from-white/5 hover:to-transparent transition-all"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handlePrevious();
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-2/3 z-10 cursor-pointer hover:bg-gradient-to-l hover:from-white/5 hover:to-transparent transition-all"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleNext();
          }}
        />

        <div className="text-center px-4 md:px-8 max-w-4xl z-0 animate-in fade-in zoom-in duration-500 slide-in-from-bottom-10">
          <div className="text-6xl md:text-8xl mb-6 md:mb-8 animate-bounce drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">{slide.emoji}</div>
          <h2 className="text-xl md:text-3xl font-bold mb-6 md:mb-8 text-white/60 font-mono uppercase tracking-[0.2em]">{slide.title}</h2>
          <div className="text-3xl md:text-5xl w-full">{slide.content}</div>
        </div>

        {/* Navigation hints */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-white/40 text-sm z-20 font-mono">
          {currentSlide === 0 ? (
            <span className="animate-pulse">Tap or Press Space to Start</span>
          ) : (
            <div className="flex gap-8">
              <button onClick={handlePrevious} className="hover:text-white transition-colors">← PREV</button>
              <button onClick={handleNext} className="hover:text-white transition-colors">NEXT →</button>
            </div>
          )}
        </div>
      </div>

      {/* Reset button */}
      <Button
        onClick={onReset}
        variant="ghost"
        className="absolute top-6 right-6 z-30 text-white/50 hover:text-white hover:bg-white/10"
      >
        ✕
      </Button>
    </div>
  )
}

