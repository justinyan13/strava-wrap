import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import FeedbackModal from "@/components/feedback-modal"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Strava Wrapped 2025",
  description: "Your activity stats wrapped - A year in motion",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased bg-background text-foreground`}>
        {children}
        <Analytics />

        {/* Footer Text */}
        <div className="fixed bottom-4 left-4 z-50 text-xs text-white/40 font-mono flex items-center h-[30px]">
          Made with ❤️ by Justin Yan
        </div>

        {/* Feedback Button */}
        <FeedbackModal />
      </body>
    </html>
  )
}
