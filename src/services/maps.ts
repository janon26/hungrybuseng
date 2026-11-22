/**
 * Google Maps Integration Placeholder
 *
 * NOTE: The app currently uses 100% free direct Google Maps URL search queries:
 * https://www.google.com/maps/search/?api=1&query=...
 * No paid Google Maps API key is required from the user.
 *
 * This placeholder is reserved for optional future Google Maps JavaScript SDK / Embed integration.
 */

export const GOOGLE_MAPS_API_KEY_PLACEHOLDER =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) || ''

export function buildGoogleMapsSearchUrl(searchQuery: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`
}

export function isGoogleMapsApiConfigured(): boolean {
  return Boolean(GOOGLE_MAPS_API_KEY_PLACEHOLDER && GOOGLE_MAPS_API_KEY_PLACEHOLDER.trim().length > 0)
}
