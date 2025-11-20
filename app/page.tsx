"use client"

import { useState } from "react"
import UploadZone from "@/components/upload-zone"
import StatsDisplay from "@/components/stats-display"
import StatsStory from "@/components/stats-story"
import FeedbackModal from "@/components/feedback-modal"
import type { ActivityStats } from "@/lib/csv-parser"

export default function Home() {
  const [stats, setStats] = useState<ActivityStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [userName, setUserName] = useState("")

  const handleSubmit = async (files: File[], name: string) => {
    setLoading(true)
    setUserName(name)
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
    setUserName("")
  }

  return (
    <main className="min-h-screen bg-background">
      {!stats ? (
        <UploadZone onSubmit={handleSubmit} loading={loading} />
      ) : showSummary ? (
        <StatsDisplay stats={stats} onReset={handleReset} name={userName} />
      ) : (
        <StatsStory
          stats={stats}
          onReset={handleReset}
          onComplete={() => setShowSummary(true)}
          name={userName}
        />
      )}

      {/* Footer - only show on upload zone before files are uploaded */}
      {!stats && (
        <>
          {/* Footer Text */}
          <div className="fixed bottom-4 left-4 z-50 text-xs text-white/40 font-mono flex items-center h-[30px]">
            Made with ❤️ by Justin Yan
          </div>

          {/* Feedback Button */}
          <FeedbackModal />
        </>
      )}
    </main>
  )
}
