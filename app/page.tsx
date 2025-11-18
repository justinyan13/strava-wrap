"use client"

import { useState } from "react"
import UploadZone from "@/components/upload-zone"
import StatsDisplay from "@/components/stats-display"
import StatsStory from "@/components/stats-story"
import type { ActivityStats } from "@/lib/csv-parser"

export default function Home() {
  const [stats, setStats] = useState<ActivityStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  const handleSubmit = async (files: File[]) => {
    setLoading(true)
    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append("file", file)
      })

      const response = await fetch("/api/parse-csv", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || "Failed to parse the file. Please make sure it is a valid Strava export."
        alert(errorMessage)
        return
      }

      setStats(data)
      setShowSummary(false)
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStats(null)
    setShowSummary(false)
  }

  return (
    <main className="min-h-screen bg-background">
      {!stats ? (
        <UploadZone onSubmit={handleSubmit} loading={loading} />
      ) : showSummary ? (
        <StatsDisplay stats={stats} onReset={handleReset} />
      ) : (
        <StatsStory 
          stats={stats} 
          onReset={handleReset} 
          onComplete={() => setShowSummary(true)}
        />
      )}
    </main>
  )
}
