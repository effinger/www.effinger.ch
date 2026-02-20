/*
 * Netlify function to fetch and parse webcal/iCal feed
 * Returns events as JSON for Hugo static site generation
 * Execution logs: https://app.netlify.com/sites/effinger/logs/functions/webcal-events
 */

import fetch from 'node-fetch'
import ical from 'node-ical'

// Configuration
// The webcal URL can be set via environment variable WEBCAL_URL
// or defaults to the hardcoded iCloud calendar URL
const WEBCAL_URL = process.env.WEBCAL_URL || 'webcal://p106-caldav.icloud.com/published/2/MTM2MzE1OTE2MDEzNjMxNZlb1m7MIheZ1_-v-b0-22HbPsxJuo7P0pZQCMkCXHX_YuKqiEtPUWXN3WKk3yhOR52rWVTWO2-MJ32BRvVatL0'
const TIMEZONE = process.env.WEBCAL_TIMEZONE || 'Europe/Zurich'

/**
 * Convert webcal:// URL to https://
 */
function webcalToHttps(url) {
  return url.replace(/^webcal:\/\//i, 'https://')
}

/**
 * Format date to ISO 8601 string with timezone
 */
function formatDate(date) {
  if (!date) return null

  // Ensure we have a Date object
  const d = date instanceof Date ? date : new Date(date)

  // Format as ISO 8601 (YYYY-MM-DDTHH:mm:ss)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

/**
 * Parse iCal event to our event format
 */
function parseEvent(event) {
  // Skip if not a VEVENT
  if (event.type !== 'VEVENT') return null

  return {
    title: event.summary || 'Untitled Event',
    startdate: formatDate(event.start),
    enddate: formatDate(event.end),
    description: event.description || '',
    location: event.location || '',
    uid: event.uid,
    source: 'webcal',
    timezone: TIMEZONE
  }
}

export default async (request, context) => {
  try {
    // Convert webcal to https
    const httpsUrl = webcalToHttps(WEBCAL_URL)

    console.log('Fetching iCal feed from:', httpsUrl)

    // Fetch the iCal feed
    const response = await fetch(httpsUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch calendar: ${response.status} ${response.statusText}`)
    }

    const icalData = await response.text()

    console.log('Parsing iCal data...')

    // Parse iCal data
    const events = await ical.async.parseICS(icalData)

    // Convert to our event format
    const parsedEvents = Object.values(events)
      .map(parseEvent)
      .filter(event => event !== null)
      .sort((a, b) => {
        // Sort by start date
        const dateA = new Date(a.startdate)
        const dateB = new Date(b.startdate)
        return dateA - dateB
      })

    console.log(`Parsed ${parsedEvents.length} events`)

    // Return JSON response
    return new Response(JSON.stringify({
      success: true,
      count: parsedEvents.length,
      events: parsedEvents,
      timezone: TIMEZONE
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    })

  } catch (error) {
    console.error('Error fetching/parsing calendar:', error)

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      events: []
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
