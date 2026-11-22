export interface Restaurant {
  id: string
  name: string
  cuisine: string
  pricePerPerson: string
  distanceNote: string
  mustOrderDish: string
  wittyPitch: string
  mapsSearchQuery: string
  isVetoed?: boolean
  vetoedBy?: string
  vetoedAt?: string
}

export type BudgetTier = 'sakto' | 'keri' | 'sahod'

export interface BudgetOption {
  id: BudgetTier
  label: string
  range: string
  sublabel: string
  emoji: string
}

export interface CravingConfig {
  location: string
  coordinates?: { lat: number; lng: number; areaName?: string }
  budget: BudgetTier
  filters: string[]
  customCraving: string
  friends: string[]
}

export interface VetoHistoryItem {
  restaurantId: string
  restaurantName: string
  friendName: string
  timestamp: string
}
