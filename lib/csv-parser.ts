export interface ActivityData {
  name: string
  type: string
  date: string
  distance: number
  elevationGain: number
  elevationLoss: number
  movingTime: number
  calories: number
  avgHeartRate: number
  maxHeartRate: number
  maxSpeed: number
  avgSpeed: number
}

export interface ActivityStats {
  totalActivities: number
  totalDistance: number
  totalElevationGain: number
  totalElevationLoss: number
  totalMovingTime: number
  totalCalories: number
  avgHeartRate: number
  maxSpeed: number
  avgSpeed: number
  maxHeartRate: number
  activityTypes: Array<{
    name: string
    count: number
    distance: number
    totalTime: number
  }>
  favoriteActivityType: string
  busiestMonth: { month: string; count: number }
  longestActivity: { name: string; type: string; distance: number; time: number }
  longestActivityByDuration: { name: string; type: string; distance: number; time: number }
  totalKudos: number
  avgKudosPerActivity: number
  avgDistance: number
  activitiesByType: Record<string, ActivityData[]>
}

export function parseActivitiesCSV(csvContent: string): ActivityStats {
  // Parse CSV properly handling multi-line quoted fields
  const parseCSVRows = (content: string): string[][] => {
    const rows: string[][] = []
    let currentRow: string[] = []
    let currentField = ""
    let inQuotes = false
    let i = 0

    while (i < content.length) {
      const char = content[i]
      const nextChar = i + 1 < content.length ? content[i + 1] : ""

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote inside quoted field
          currentField += '"'
          i += 2
          continue
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
          i++
          continue
        }
      }

      if (!inQuotes && char === ",") {
        // End of field
        currentRow.push(currentField.trim())
        currentField = ""
        i++
        continue
      }

      if (!inQuotes && (char === "\n" || (char === "\r" && nextChar === "\n"))) {
        // End of row (but only if not in quotes)
        currentRow.push(currentField.trim())
        if (currentRow.length > 0 && currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow)
        }
        currentRow = []
        currentField = ""
        if (char === "\r" && nextChar === "\n") {
          i += 2
        } else {
          i++
        }
        continue
      }

      // Regular character (including newlines inside quoted fields)
      currentField += char
      i++
    }

    // Handle last field and row
    if (currentField.length > 0 || currentRow.length > 0) {
      currentRow.push(currentField.trim())
      if (currentRow.length > 0 && currentRow.some((f) => f.length > 0)) {
        rows.push(currentRow)
      }
    }

    return rows
  }

  // Parse all rows (handling multi-line fields)
  const allRows = parseCSVRows(csvContent)
  const headerRow = allRows[0]
  if (!headerRow) {
    return {
      totalActivities: 0,
      totalDistance: 0,
      totalElevationGain: 0,
      totalElevationLoss: 0,
      totalMovingTime: 0,
      totalCalories: 0,
      avgHeartRate: 0,
      maxSpeed: 0,
      avgSpeed: 0,
      maxHeartRate: 0,
      activityTypes: [],
      favoriteActivityType: "",
      busiestMonth: { month: "", count: 0 },
      longestActivity: { name: "", type: "", distance: 0, time: 0 },
      longestActivityByDuration: { name: "", type: "", distance: 0, time: 0 },
      totalKudos: 0,
      avgKudosPerActivity: 0,
      avgDistance: 0,
      activitiesByType: {},
    }
  }

  const headers = headerRow.map((h) => h.trim().replace(/^"|"$/g, ""))

  console.log("[v0] Headers found:", headers.slice(0, 10))

  // Find column indices for all fields we need (handling duplicates)
  const findColumnIndex = (name: string, preferLast = false): number => {
    const indices: number[] = []
    headers.forEach((header, index) => {
      if (header === name) {
        indices.push(index)
      }
    })
    if (indices.length === 0) return -1
    return preferLast ? indices[indices.length - 1] : indices[0]
  }

  const columnIndices = {
    activityType: findColumnIndex("Activity Type"),
    activityDate: findColumnIndex("Activity Date"),
    activityName: findColumnIndex("Activity Name"),
    movingTime: findColumnIndex("Moving Time"),
    distance: findColumnIndex("Distance", true), // Use second/last Distance column (in metres)
    elevationGain: findColumnIndex("Elevation Gain"),
    elevationLoss: findColumnIndex("Elevation Loss"),
    calories: findColumnIndex("Calories"),
    avgHeartRate: findColumnIndex("Average Heart Rate"),
    maxHeartRate: findColumnIndex("Max Heart Rate", true), // Use second/last Max Heart Rate
    maxSpeed: findColumnIndex("Max Speed"),
    avgSpeed: findColumnIndex("Average Speed"),
  }

  const stats: ActivityStats = {
    totalActivities: 0,
    totalDistance: 0,
    totalElevationGain: 0,
    totalElevationLoss: 0,
    totalMovingTime: 0,
    totalCalories: 0,
    avgHeartRate: 0,
    maxSpeed: 0,
    avgSpeed: 0,
    maxHeartRate: 0,
    activityTypes: [],
    favoriteActivityType: "",
    busiestMonth: { month: "", count: 0 },
    longestActivity: { name: "", type: "", distance: 0, time: 0 },
    longestActivityByDuration: { name: "", type: "", distance: 0, time: 0 },
    totalKudos: 0,
    avgKudosPerActivity: 0,
    avgDistance: 0,
    activitiesByType: {},
  }

  const activityTypeMap = new Map<string, { count: number; distance: number; totalTime: number }>()
  const monthMap = new Map<string, number>()
  let longestDistanceMetres = 0
  let longestDurationSeconds = 0

  let totalHeartRate = 0
  let heartRateCount = 0
  const speedValues: number[] = []
  let processedCount = 0
  let filteredCount = 0
  let totalDistanceMetres = 0

  // Use the already parsed rows
  for (let i = 1; i < allRows.length; i++) {
    const values = allRows[i]
    if (!values || values.length === 0) continue

    // Use direct column index access to avoid issues with duplicate column names
    const getValue = (index: number): string => {
      return index >= 0 && index < values.length ? values[index] : ""
    }

    const activityType = getValue(columnIndices.activityType)
    processedCount++
    if (!activityType) continue

    const activityDate = getValue(columnIndices.activityDate)
    
    // Get distance from the second Distance column (in metres)
    const distanceMetres = Number.parseFloat(getValue(columnIndices.distance)) || 0
    console.log("[v0] Processing row:", { date: activityDate, type: activityType, distance: distanceMetres })

    if (!activityDate.includes("2025")) {
      filteredCount++
      continue
    }

    stats.totalActivities++

    // Sum distances in metres (will convert to km at the end)
    totalDistanceMetres += distanceMetres

    const elevationGain = Number.parseFloat(getValue(columnIndices.elevationGain)) || 0
    stats.totalElevationGain += elevationGain

    const elevationLoss = Number.parseFloat(getValue(columnIndices.elevationLoss)) || 0
    stats.totalElevationLoss += elevationLoss

    const movingTime = Number.parseFloat(getValue(columnIndices.movingTime)) || 0
    stats.totalMovingTime += movingTime

    const calories = Number.parseFloat(getValue(columnIndices.calories)) || 0
    stats.totalCalories += calories

    const avgHeartRate = Number.parseFloat(getValue(columnIndices.avgHeartRate)) || 0
    if (avgHeartRate > 0) {
      totalHeartRate += avgHeartRate
      heartRateCount++
    }

    const maxHeartRate = Number.parseFloat(getValue(columnIndices.maxHeartRate)) || 0
    if (maxHeartRate > stats.maxHeartRate) {
      stats.maxHeartRate = maxHeartRate
    }

    const maxSpeed = Number.parseFloat(getValue(columnIndices.maxSpeed)) || 0
    if (maxSpeed > stats.maxSpeed) {
      stats.maxSpeed = maxSpeed
    }

    const avgSpeed = Number.parseFloat(getValue(columnIndices.avgSpeed)) || 0
    if (avgSpeed > 0) {
      speedValues.push(avgSpeed)
    }

    const monthMatch = activityDate.match(/(\w+)\s+\d+/)
    if (monthMatch) {
      const month = monthMatch[1]
      monthMap.set(month, (monthMap.get(month) || 0) + 1)
    }

    if (distanceMetres > longestDistanceMetres) {
      longestDistanceMetres = distanceMetres
      stats.longestActivity = {
        name: getValue(columnIndices.activityName) || "Unnamed Activity",
        type: activityType,
        distance: distanceMetres / 1000, // Convert to km for display
        time: movingTime,
      }
    }

    if (movingTime > longestDurationSeconds) {
      longestDurationSeconds = movingTime
      stats.longestActivityByDuration = {
        name: getValue(columnIndices.activityName) || "Unnamed Activity",
        type: activityType,
        distance: distanceMetres / 1000, // Convert to km for display
        time: movingTime,
      }
    }

    // Track activity types
    const activityTypeTrimmed = activityType.trim()
    if (!activityTypeMap.has(activityTypeTrimmed)) {
      activityTypeMap.set(activityTypeTrimmed, { count: 0, distance: 0, totalTime: 0 })
    }

    const typeData = activityTypeMap.get(activityTypeTrimmed)!
    typeData.count++
    typeData.distance += distanceMetres / 1000 // Convert to km for activity type tracking
    typeData.totalTime += movingTime

    // Store individual activity data by type
    if (!stats.activitiesByType[activityTypeTrimmed]) {
      stats.activitiesByType[activityTypeTrimmed] = []
    }
    stats.activitiesByType[activityTypeTrimmed].push({
      name: getValue(columnIndices.activityName) || "Unnamed Activity",
      type: activityTypeTrimmed,
      date: activityDate,
      distance: distanceMetres / 1000, // Convert to km for storage
      elevationGain: elevationGain,
      elevationLoss: elevationLoss,
      movingTime: movingTime,
      calories: calories,
      avgHeartRate: avgHeartRate,
      maxHeartRate: maxHeartRate,
      maxSpeed: maxSpeed,
      avgSpeed: avgSpeed,
    })
  }

  console.log("[v0] Parsing complete:", { processedCount, filteredCount, activitiesIncluded: stats.totalActivities })

  // Convert total distance from metres to kilometres (more precise: sum first, then divide)
  stats.totalDistance = totalDistanceMetres / 1000

  // Calculate averages
  stats.avgHeartRate = heartRateCount > 0 ? totalHeartRate / heartRateCount : 0
  stats.avgSpeed = speedValues.length > 0 ? speedValues.reduce((a, b) => a + b, 0) / speedValues.length : 0

  stats.favoriteActivityType =
    Array.from(activityTypeMap.entries()).sort((a, b) => b[1].count - a[1].count)[0]?.[0] || ""

  let maxMonthCount = 0
  monthMap.forEach((count, month) => {
    if (count > maxMonthCount) {
      maxMonthCount = count
      stats.busiestMonth = { month, count }
    }
  })

  stats.avgKudosPerActivity = stats.totalActivities > 0 ? stats.totalKudos / stats.totalActivities : 0
  stats.avgDistance = stats.totalActivities > 0 ? stats.totalDistance / stats.totalActivities : 0

  // Convert activity map to array
  stats.activityTypes = Array.from(activityTypeMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)

  return stats
}

export function parseReactionsCSV(csvContent: string): { totalKudos: number } {
  const lines = csvContent.split("\n")
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))

  console.log("[v0] Reactions headers:", headers)
  let totalKudos = 0

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values: string[] = []
    let current = ""
    let inQuotes = false
    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ""))
        current = ""
      } else {
        current += char
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ""))

    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ""
    })

    const reactionDate = row["Reaction Date"] || ""
    const reactionType = row["Reaction Type"] || ""

    // More robust date parsing - try multiple patterns
    // Pattern 1: "Jan 9, 2021, 2:14:12 PM" -> match ", 2021,"
    // Pattern 2: "Jan 9, 2021" -> match ", 2021"
    // Pattern 3: Any 4-digit year
    let year = ""
    const yearMatch1 = reactionDate.match(/,\s*(\d{4})(?:,|$)/)
    const yearMatch2 = reactionDate.match(/(\d{4})/)
    if (yearMatch1) {
      year = yearMatch1[1]
    } else if (yearMatch2) {
      year = yearMatch2[1]
    }

    // Case-insensitive reaction type matching and trim whitespace
    const normalizedReactionType = reactionType.trim()
    const isKudos = normalizedReactionType.toLowerCase() === "kudos"

    console.log("[v0] Reaction row:", { 
      date: reactionDate, 
      type: reactionType, 
      normalizedType: normalizedReactionType,
      year, 
      isKudos,
      matches2025: year === "2025" 
    })

    // Count kudos from 2025 only (for 2025 wrapped)
    if (year === "2025" && isKudos) {
      totalKudos++
    }
  }

  console.log("[v0] Total kudos from reactions:", totalKudos)
  return { totalKudos }
}

export function calculateFilteredStats(
  fullStats: ActivityStats,
  activityType: string | null,
): ActivityStats {
  // If no filter, return full stats
  if (!activityType || activityType === "All") {
    return fullStats
  }

  const activities = fullStats.activitiesByType[activityType] || []
  
  if (activities.length === 0) {
    // Return empty stats if no activities of this type
    return {
      ...fullStats,
      totalActivities: 0,
      totalDistance: 0,
      totalElevationGain: 0,
      totalElevationLoss: 0,
      totalMovingTime: 0,
      totalCalories: 0,
      avgHeartRate: 0,
      maxSpeed: 0,
      avgSpeed: 0,
      maxHeartRate: 0,
      favoriteActivityType: activityType,
      busiestMonth: { month: "", count: 0 },
      longestActivity: { name: "", type: activityType, distance: 0, time: 0 },
      longestActivityByDuration: { name: "", type: activityType, distance: 0, time: 0 },
      avgKudosPerActivity: 0,
      avgDistance: 0,
      activityTypes: [],
    }
  }

  // Calculate stats for filtered activities
  let totalDistance = 0
  let totalElevationGain = 0
  let totalElevationLoss = 0
  let totalMovingTime = 0
  let totalCalories = 0
  let totalHeartRate = 0
  let heartRateCount = 0
  const speedValues: number[] = []
  let maxSpeed = 0
  let maxHeartRate = 0
  let longestDistance = 0
  let longestActivity = { name: "", type: activityType, distance: 0, time: 0 }
  let longestDuration = 0
  let longestActivityByDuration = { name: "", type: activityType, distance: 0, time: 0 }
  const monthMap = new Map<string, number>()

  for (const activity of activities) {
    totalDistance += activity.distance
    totalElevationGain += activity.elevationGain
    totalElevationLoss += activity.elevationLoss
    totalMovingTime += activity.movingTime
    totalCalories += activity.calories

    if (activity.avgHeartRate > 0) {
      totalHeartRate += activity.avgHeartRate
      heartRateCount++
    }

    if (activity.maxHeartRate > maxHeartRate) {
      maxHeartRate = activity.maxHeartRate
    }

    if (activity.maxSpeed > maxSpeed) {
      maxSpeed = activity.maxSpeed
    }

    if (activity.avgSpeed > 0) {
      speedValues.push(activity.avgSpeed)
    }

    if (activity.distance > longestDistance) {
      longestDistance = activity.distance
      longestActivity = {
        name: activity.name,
        type: activity.type,
        distance: activity.distance,
        time: activity.movingTime,
      }
    }

    if (activity.movingTime > longestDuration) {
      longestDuration = activity.movingTime
      longestActivityByDuration = {
        name: activity.name,
        type: activity.type,
        distance: activity.distance,
        time: activity.movingTime,
      }
    }

    const monthMatch = activity.date.match(/(\w+)\s+\d+/)
    if (monthMatch) {
      const month = monthMatch[1]
      monthMap.set(month, (monthMap.get(month) || 0) + 1)
    }
  }

  let maxMonthCount = 0
  let busiestMonth = { month: "", count: 0 }
  monthMap.forEach((count, month) => {
    if (count > maxMonthCount) {
      maxMonthCount = count
      busiestMonth = { month, count }
    }
  })

  const avgHeartRate = heartRateCount > 0 ? totalHeartRate / heartRateCount : 0
  const avgSpeed = speedValues.length > 0 ? speedValues.reduce((a, b) => a + b, 0) / speedValues.length : 0
  const avgDistance = activities.length > 0 ? totalDistance / activities.length : 0
  // Note: Kudos are not tracked per activity, so we keep the same totalKudos
  // and calculate average based on filtered activity count
  const avgKudosPerActivity = activities.length > 0 ? fullStats.totalKudos / activities.length : 0

  return {
    ...fullStats,
    totalActivities: activities.length,
    totalDistance,
    totalElevationGain,
    totalElevationLoss,
    totalMovingTime,
    totalCalories,
    avgHeartRate,
    maxSpeed,
    avgSpeed,
    maxHeartRate,
    favoriteActivityType: activityType,
    busiestMonth,
    longestActivity,
    longestActivityByDuration,
    avgKudosPerActivity,
    avgDistance,
    // Keep only the selected activity type in activityTypes
    activityTypes: [
      {
        name: activityType,
        count: activities.length,
        distance: totalDistance,
        totalTime: totalMovingTime,
      },
    ],
  }
}
