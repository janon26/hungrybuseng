import type { CravingConfig, Restaurant } from '../types'
import { getSampleSpots } from '../data/demoData'

const LOCAL_STORAGE_KEY = 'hungrybuseng_gemini_api_key'
const LEGACY_LOCAL_STORAGE_KEY = 'saan_tayo_gemini_api_key'
const DEMO_MODE_STORAGE_KEY = 'hungrybuseng_demo_mode'
const LEGACY_DEMO_MODE_STORAGE_KEY = 'saan_tayo_demo_mode'

export function getStoredApiKey(): string {
  // Check localStorage first
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem(LEGACY_LOCAL_STORAGE_KEY)
  if (stored && stored.trim().length > 0) {
    return stored.trim()
  }

  // Check Vite env
  try {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY
    if (envKey && typeof envKey === 'string' && envKey.trim().length > 0) {
      return envKey.trim()
    }
  } catch {
    // ignore
  }

  return ''
}

export function setStoredApiKey(key: string): void {
  if (!key || key.trim() === '') {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
  } else {
    localStorage.setItem(LOCAL_STORAGE_KEY, key.trim())
  }
}

export function getStoredDemoMode(): boolean {
  return (
    localStorage.getItem(DEMO_MODE_STORAGE_KEY) === 'true' ||
    localStorage.getItem(LEGACY_DEMO_MODE_STORAGE_KEY) === 'true'
  )
}

export function setStoredDemoMode(enabled: boolean): void {
  localStorage.setItem(DEMO_MODE_STORAGE_KEY, enabled ? 'true' : 'false')
}

export async function fetchRestaurants(
  config: CravingConfig,
  isDemoOverride = false
): Promise<{ spots: Restaurant[]; isDemo: boolean; errorNotice?: string }> {
  const apiKey = getStoredApiKey()
  const isDemo = isDemoOverride || !apiKey

  if (isDemo) {
    // Simulate real network delay for polished UX
    await new Promise((resolve) => setTimeout(resolve, 1100))
    const sample = getSampleSpots(config.location)
    return {
      spots: sample.map((item, idx) => ({
        ...item,
        id: `spot-${Date.now()}-${idx}`,
      })),
      isDemo: true,
      errorNotice: !apiKey ? 'Running in Demo Mode (No API key detected). You can add a key anytime in the banner above!' : undefined,
    }
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
    apiKey
  )}`

  const budgetDescriptions: Record<string, string> = {
    sakto: '₱150–₱250 per person (Sakto Lang / Sulit / Everyday meal / Budget-friendly)',
    keri: '₱300–₱500 per person (Keri Pa / Casual dining / Mid-range sit-down)',
    sahod: '₱600+ per person (Bagong Sahod / Treat yourself / Premium casual)',
    petsa: '₱150–₱250 per person (Sakto Lang / Sulit / Everyday meal)',
  }

  const budgetDesc = budgetDescriptions[config.budget] || '₱250–₱500 per person'
  const filterList = config.filters.length > 0 ? config.filters.join(', ') : 'No strict restrictions'
  const custom = config.customCraving.trim() ? config.customCraving : 'None'
  const locationDesc = config.coordinates
    ? `${config.location} (Coordinates: ${config.coordinates.lat.toFixed(4)}, ${config.coordinates.lng.toFixed(4)})`
    : config.location

  const prompt = `You are a savvy, food-loving Metro Manila local who knows all the best dining spots and hidden gems for barkadas (groups of friends).

Task:
Recommend exactly 5 real, currently operating, well-known restaurants located in or immediately adjacent to: "${locationDesc}".
Do NOT recommend closed restaurants or make up fake restaurant names. Use REAL spots.

Group Preferences:
- Target Budget: ${budgetDesc}
- Required Filters & Vibes: ${filterList}
- Specific Craving / Notes: ${custom}

Rules:
1. All 5 spots must be real restaurants easily found on Google Maps in or around ${config.location}.
2. Keep the wittyPitch punchy, natural, humorous Taglish/English (1 sentence) explaining why this place slaps or fits the barkada vibe.
3. Return ONLY a strict JSON array of 5 objects matching the schema below. No markdown outside the JSON, no commentary.

Schema:
[
  {
    "name": "Restaurant Name",
    "cuisine": "Cuisine type (e.g. Japanese Ramen, Filipino Comfort, Mexican Tacos)",
    "pricePerPerson": "₱XXX–₱XXX",
    "distanceNote": "Specific area or street note (e.g. Along Katipunan Ave, ~5 min walk)",
    "mustOrderDish": "Specific signature dish name",
    "wittyPitch": "1 punchy Taglish/English sentence on why it slaps",
    "mapsSearchQuery": "Restaurant Name + Area for Google Maps search (e.g. Silantro Fil-Mex Katipunan)"
  }
]`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      let parsedErr = 'API Error'
      try {
        const jsonErr = JSON.parse(errText)
        parsedErr = jsonErr?.error?.message || errText
      } catch {
        parsedErr = errText
      }
      throw new Error(`Gemini API error (${response.status}): ${parsedErr}`)
    }

    const data = await response.json()
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!content) {
      throw new Error('Empty response received from Gemini API.')
    }

    let parsed: any
    try {
      parsed = JSON.parse(content)
    } catch {
      // In case wrapped in markdown code fence
      const clean = content.replace(/```json/gi, '').replace(/```/g, '').trim()
      parsed = JSON.parse(clean)
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('Gemini did not return an array of spots.')
    }

    const spots: Restaurant[] = parsed.slice(0, 5).map((item: any, idx: number) => ({
      id: `spot-${Date.now()}-${idx}`,
      name: String(item.name || `Spot ${idx + 1}`),
      cuisine: String(item.cuisine || 'Comfort Food'),
      pricePerPerson: String(item.pricePerPerson || '₱250–₱450'),
      distanceNote: String(item.distanceNote || `Near ${config.location}`),
      mustOrderDish: String(item.mustOrderDish || 'Chef Special'),
      wittyPitch: String(item.wittyPitch || 'Solid choice para sa gutom na barkada!'),
      mapsSearchQuery: String(item.mapsSearchQuery || `${item.name} ${config.location}`),
    }))

    return { spots, isDemo: false }
  } catch (err: any) {
    console.warn('Gemini fetch failed, falling back to realistic demo data:', err)
    const fallback = getSampleSpots(config.location)
    return {
      spots: fallback.map((item, idx) => ({
        ...item,
        id: `spot-${Date.now()}-${idx}`,
      })),
      isDemo: true,
      errorNotice: `Live Gemini call failed (${err?.message || 'Check key/quota'}). Auto-switched to realistic Demo Mode!`,
    }
  }
}
