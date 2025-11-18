"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface UploadZoneProps {
  onSubmit: (files: File[]) => void
  loading: boolean
}

export default function UploadZone({ onSubmit, loading }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [activitiesFile, setActivitiesFile] = useState<File | null>(null)
  const [reactionsFile, setReactionsFile] = useState<File | null>(null)
  const [runningEmojis, setRunningEmojis] = useState(1)
  const [showAnimation, setShowAnimation] = useState(false)
  const [showUploadZone, setShowUploadZone] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Animate running emojis during processing
  useEffect(() => {
    if (loading || showAnimation) {
      const interval = setInterval(() => {
        setRunningEmojis((prev) => (prev >= 5 ? 1 : prev + 1))
      }, 500)
      return () => clearInterval(interval)
    } else {
      setRunningEmojis(1)
    }
  }, [loading, showAnimation])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(e.type === "dragenter" || e.type === "dragover")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    if (files && files.length > 0) {
      processFiles(files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length > 0) {
      processFiles(files)
    }
  }

  const processFiles = (files: File[]) => {
    files.forEach((file) => {
      const fileName = file.name.toLowerCase()
      if (fileName.includes("activities")) {
        setActivitiesFile(file)
      } else if (fileName.includes("reactions")) {
        setReactionsFile(file)
      }
    })
  }

  const handleSubmit = () => {
    if (activitiesFile && reactionsFile) {
      // Show animation immediately
      setShowAnimation(true)
      
      // Wait 5 seconds before actually processing
      setTimeout(() => {
        setShowAnimation(false)
        onSubmit([activitiesFile, reactionsFile])
      }, 5000)
    }
  }

  const removeFile = (type: "activities" | "reactions") => {
    if (type === "activities") {
      setActivitiesFile(null)
    } else {
      setReactionsFile(null)
    }
    // Reset file input so users can re-upload
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const bothFilesUploaded = activitiesFile && reactionsFile

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-32">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="w-full text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent whitespace-nowrap">Strava Wrapped 2025</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Upload your Strava data to see your personalized 2025 wrapped.
          </p>

          {/* How to Export Instructions - Only show initially */}
          {!showUploadZone && (
            <div className="max-w-xl mx-auto mb-8 p-6 rounded-2xl bg-card border border-border text-left">
              <h2 className="text-lg font-semibold text-foreground mb-4">📥 How to Get Your Strava Data</h2>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>Log into <span className="text-foreground font-medium">Strava.com</span></li>
                <li>Go to <span className="text-foreground font-medium">Settings → My Account</span></li>
                <li>Click <span className="text-foreground font-medium">"Get Started"</span> under "Download or Delete Your Account"</li>
                <li>Click <span className="text-foreground font-medium">"Request your archive"</span></li>
                <li>Check your email for the download link (may take a few hours)</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                Once downloaded, extract the ZIP and upload <span className="text-foreground font-medium">activities.csv</span> and <span className="text-foreground font-medium">reactions.csv</span>
              </p>
              <button
                onClick={() => setShowUploadZone(true)}
                className="w-full mt-6 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                I have my files
              </button>
            </div>
          )}
        </div>

        {/* Upload Zone - Only show after clicking "I have my files" */}
        {showUploadZone && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer ${
            isDragActive ? "border-primary/50 bg-primary/5" : "border-muted-foreground/30 hover:border-primary/30"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleChange}
            className="hidden"
            disabled={loading || showAnimation}
            multiple
          />

          <div className="flex flex-col items-center gap-4">
            {(loading || showAnimation) ? (
              <div className="flex flex-col items-center gap-4">
                <div className="text-4xl">{'🏃‍♀️'.repeat(runningEmojis)}</div>
                <p className="text-foreground font-semibold text-base">Processing your data...</p>
              </div>
            ) : (
              <>
                <svg className="w-12 h-12 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>

                <div>
                  <p className="text-foreground font-semibold text-base mb-1">
                    Upload activities.csv and reactions.csv
                  </p>
                  <p className="text-muted-foreground text-sm">From your Strava activity zip file</p>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  Select Files
                </button>
              </>
            )}
          </div>

          {/* File Status */}
          {(activitiesFile || reactionsFile) && !loading && !showAnimation && (
            <div className="mt-6 space-y-3 w-full">
              <div className="text-sm font-medium text-foreground mb-2">Uploaded Files:</div>
              
              {activitiesFile && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-sm text-foreground">{activitiesFile.name}</span>
                  </div>
                  <button
                    onClick={() => removeFile("activities")}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Remove
                  </button>
                </div>
              )}

              {reactionsFile && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-sm text-foreground">{reactionsFile.name}</span>
                  </div>
                  <button
                    onClick={() => removeFile("reactions")}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Remove
                  </button>
                </div>
              )}

              {!activitiesFile && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-dashed border-border">
                  <span className="text-muted-foreground">○</span>
                  <span className="text-sm text-muted-foreground">activities.csv</span>
                </div>
              )}

              {!reactionsFile && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-dashed border-border">
                  <span className="text-muted-foreground">○</span>
                  <span className="text-sm text-muted-foreground">reactions.csv</span>
                </div>
              )}

              {bothFilesUploaded && (
                <button
                  onClick={handleSubmit}
                  disabled={showAnimation}
                  className="w-full mt-4 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit & Process
                </button>
              )}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  )
}
