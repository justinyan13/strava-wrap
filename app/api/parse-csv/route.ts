import { type NextRequest, NextResponse } from "next/server"
import { parseActivitiesCSV, parseReactionsCSV } from "@/lib/csv-parser"
import JSZip from "jszip"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("file") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    let activitiesCSVContent: string | null = null
    let reactionsCSVContent: string | null = null

    for (const file of files) {
      const fileName = file.name.toLowerCase()
      const isZip = fileName.endsWith(".zip")
      const isCsv = fileName.endsWith(".csv")

      if (!isZip && !isCsv) {
        return NextResponse.json({ error: "Invalid file type. Please upload CSV or ZIP files." }, { status: 400 })
      }

      const buffer = await file.arrayBuffer()

      if (buffer.byteLength === 0) {
        return NextResponse.json({ error: "File is empty" }, { status: 400 })
      }

      if (isZip) {
        try {
          const zip = new JSZip()
          await zip.loadAsync(buffer)

          for (const [relativePath, zipFile] of Object.entries(zip.files)) {
            if (relativePath.includes("activities.csv") && !zipFile.dir) {
              const fileData = zip.file(relativePath)
              if (fileData) {
                activitiesCSVContent = await fileData.async("text")
              }
            }
            if (relativePath.includes("reactions.csv") && !zipFile.dir) {
              const fileData = zip.file(relativePath)
              if (fileData) {
                reactionsCSVContent = await fileData.async("text")
              }
            }
          }
        } catch (zipError) {
          console.error("ZIP extraction error:", zipError)
          return NextResponse.json(
            { error: "Failed to extract ZIP file. Make sure it's a valid ZIP archive." },
            { status: 400 },
          )
        }
      } else {
        const csvContent = await file.text()
        if (fileName.includes("activities")) {
          activitiesCSVContent = csvContent
        } else if (fileName.includes("reactions")) {
          reactionsCSVContent = csvContent
        }
      }
    }

    if (!activitiesCSVContent || activitiesCSVContent.trim().length === 0) {
      return NextResponse.json({ error: "activities.csv file is required" }, { status: 400 })
    }

    console.log("[API] Files processed:", {
      hasActivities: !!activitiesCSVContent,
      hasReactions: !!reactionsCSVContent,
      reactionsLength: reactionsCSVContent?.length || 0,
    })

    try {
      const stats = parseActivitiesCSV(activitiesCSVContent)

      if (reactionsCSVContent && reactionsCSVContent.trim().length > 0) {
        console.log("[API] Parsing reactions CSV, length:", reactionsCSVContent.length)
        const kudosData = parseReactionsCSV(reactionsCSVContent)
        console.log("[API] Kudos data parsed:", kudosData)
        stats.totalKudos = kudosData.totalKudos
        stats.avgKudosPerActivity = stats.totalActivities > 0 ? kudosData.totalKudos / stats.totalActivities : 0
      } else {
        console.log("[API] No reactions CSV found or empty")
      }

      if (!stats || stats.totalActivities === 0) {
        return NextResponse.json({ error: "No valid activities found in CSV. Check the file format." }, { status: 400 })
      }

      return NextResponse.json(stats)
    } catch (parseError) {
      console.error("CSV parsing error:", parseError)
      return NextResponse.json(
        { error: "Failed to parse CSV file. Make sure it's a valid Strava export." },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error processing file:", error)
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 })
  }
}
