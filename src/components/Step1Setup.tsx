import React, { useState } from 'react'
import { MapPin, Navigation, Users, Plus, X, UtensilsCrossed, Sparkles, Loader2 } from 'lucide-react'
import type { CravingConfig, BudgetTier, BudgetOption } from '../types'
import { soundFX } from '../utils/audio'

interface Step1SetupProps {
  config: CravingConfig
  onChangeConfig: (newConfig: CravingConfig) => void
  onSubmit: () => void
  isLoading: boolean
}

const BUDGET_OPTIONS: BudgetOption[] = [
  {
    id: 'sakto',
    label: 'Sakto Lang',
    range: '₱150–₱250',
    sublabel: 'Sulit / Everyday barkada meal',
    emoji: '👌',
  },
  {
    id: 'keri',
    label: 'Keri Pa',
    range: '₱300–₱500',
    sublabel: 'Mid-range / Chill sit-down',
    emoji: '🍽️',
  },
  {
    id: 'sahod',
    label: 'Bagong Sahod',
    range: '₱600+',
    sublabel: 'Dasurv kumain ng masarap',
    emoji: '🤑',
  },
]

const FILTER_CHIPS = [
  { id: 'Must Have Rice', label: 'Must Have Rice', icon: '🍚' },
  { id: 'Aircon Needed', label: 'Aircon Needed', icon: '❄️' },
  { id: 'Open Late', label: 'Open Late', icon: '🌙' },
  { id: 'No Fast Food', label: 'No Fast Food', icon: '🚫' },
  { id: 'Soup / Sabaw', label: 'Soup / Sabaw', icon: '🍲' },
  { id: 'Vegetarian-Friendly', label: 'Vegetarian-Friendly', icon: '🥗' },
]

const QUICK_HUBS = [
  'Katipunan, Quezon City',
  'BGC, Taguig',
  'Poblacion, Makati',
  'Tomas Morato, QC',
  'Maginhawa, QC',
  'Greenhills, San Juan',
]

const SUGGESTED_CRAVINGS = [
  'Spicy pero ayoko ng unli wings',
  'May masarap na dessert & kape',
  'Sobrang gutom kami, heavy meal',
  'Authentic ramen or noodles',
]

const AVATAR_COLORS = [
  'bg-orange-500 text-white',
  'bg-emerald-500 text-white',
  'bg-indigo-500 text-white',
  'bg-pink-500 text-white',
  'bg-amber-500 text-slate-900',
  'bg-cyan-500 text-white',
]

export const Step1Setup: React.FC<Step1SetupProps> = ({
  config,
  onChangeConfig,
  onSubmit,
  isLoading,
}) => {
  const [newFriendName, setNewFriendName] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [locationNotice, setLocationNotice] = useState<string | null>(null)

  const handleLocationChange = (val: string) => {
    onChangeConfig({
      ...config,
      location: val,
      coordinates: undefined,
    })
  }

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }

    soundFX.playPop()
    setIsLocating(true)
    setLocationNotice(null)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          // Attempt reverse geocoding via OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const data = await res.json()
          const suburb =
            data.address?.suburb ||
            data.address?.neighbourhood ||
            data.address?.city ||
            data.address?.town ||
            'Near Your Coordinates'

          const city = data.address?.city || data.address?.state || 'Metro Manila'
          const formatted = `${suburb}, ${city}`

          onChangeConfig({
            ...config,
            location: formatted,
            coordinates: { lat: latitude, lng: longitude, areaName: formatted },
          })
          setLocationNotice(`📍 Detected: ${formatted}`)
        } catch {
          // Fallback to coordinates
          const fallback = `Near (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`
          onChangeConfig({
            ...config,
            location: fallback,
            coordinates: { lat: latitude, lng: longitude },
          })
          setLocationNotice(`📍 Location locked to coordinates!`)
        } finally {
          setIsLocating(false)
        }
      },
      (err) => {
        setIsLocating(false)
        setLocationNotice('Could not retrieve location. Please type manually.')
        console.warn('Geolocation error:', err)
      },
      { timeout: 9000 }
    )
  }

  const handleToggleFilter = (filterId: string) => {
    soundFX.playPop()
    const current = config.filters
    const next = current.includes(filterId)
      ? current.filter((f) => f !== filterId)
      : [...current, filterId]
    onChangeConfig({ ...config, filters: next })
  }

  const handleSelectBudget = (tier: BudgetTier) => {
    soundFX.playPop()
    onChangeConfig({ ...config, budget: tier })
  }

  const handleAddFriend = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = newFriendName.trim()
    if (!trimmed) return
    if (config.friends.map((f) => f.toLowerCase()).includes(trimmed.toLowerCase())) {
      setNewFriendName('')
      return
    }
    soundFX.playPop()
    onChangeConfig({
      ...config,
      friends: [...config.friends, trimmed],
    })
    setNewFriendName('')
  }

  const handleRemoveFriend = (nameToRemove: string) => {
    if (config.friends.length <= 2) {
      alert('You need at least 2 friends for the consensus veto round!')
      return
    }
    soundFX.playPop()
    onChangeConfig({
      ...config,
      friends: config.friends.filter((f) => f !== nameToRemove),
    })
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Hero Title */}
      <div className="text-center pt-2 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Barkada Food Consensus
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          HungryBuseng
        </h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Wala nang magsasabi ng <span className="text-orange-400 font-semibold italic">"Kahit saan"</span>. Set
          your craving, let Gemini pick 5 spots, and veto hanggang isa na lang matira!
        </p>
      </div>

      {/* Card Form */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
        {/* Section 1: Location */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-orange-400" />
              <span>Target Location or Mall</span>
            </label>
            <span className="text-[11px] text-slate-400">Neighborhood, City, or Mall</span>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={config.location}
                onChange={(e) => handleLocationChange(e.target.value)}
                placeholder="e.g. Katipunan, Quezon City or SM Megamall"
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors shadow-inner"
              />
            </div>

            <button
              type="button"
              onClick={handleNearMe}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3.5 py-3 rounded-xl bg-slate-700/80 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-slate-200 hover:text-white transition-all shrink-0 active:scale-95"
              title="Use current GPS location"
            >
              {isLocating ? (
                <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
              ) : (
                <Navigation className="w-4 h-4 text-orange-400" />
              )}
              <span className="hidden sm:inline">Near Me</span>
            </button>
          </div>

          {locationNotice && (
            <p className="text-[11px] text-emerald-400 font-medium pl-1 animate-fadeIn">
              {locationNotice}
            </p>
          )}

          {/* Quick Hub Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-[11px]">
            <span className="text-slate-400 shrink-0 font-medium mr-1">Popular:</span>
            {QUICK_HUBS.map((hub) => (
              <button
                key={hub}
                type="button"
                onClick={() => {
                  soundFX.playPop()
                  handleLocationChange(hub)
                }}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition-all border ${
                  config.location === hub
                    ? 'bg-orange-500/20 border-orange-500/50 text-orange-300 font-semibold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {hub.split(',')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Budget Tiers */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Budget per Person</span>
            <span className="text-orange-400 lowercase font-normal">Kanya-kanyang bayad</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {BUDGET_OPTIONS.map((tier) => {
              const isSelected = config.budget === tier.id
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => handleSelectBudget(tier.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/10 border-orange-500/60 shadow-md ring-1 ring-orange-500/30'
                      : 'bg-slate-900/70 border-slate-700/80 hover:border-slate-600 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-lg">{tier.emoji}</span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        isSelected ? 'text-orange-400' : 'text-slate-300'
                      }`}
                    >
                      {tier.range}
                    </span>
                  </div>
                  <div>
                    <div
                      className={`text-xs font-bold ${
                        isSelected ? 'text-white' : 'text-slate-200'
                      }`}
                    >
                      {tier.label}
                    </div>
                    <div className="text-[11px] text-slate-400">{tier.sublabel}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Section 3: Vibe & Dietary Filter Chips */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Vibes & Filters (Multi-select)</span>
            <span className="text-slate-400 font-normal text-[11px]">
              {config.filters.length} selected
            </span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FILTER_CHIPS.map((chip) => {
              const active = config.filters.includes(chip.id)
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => handleToggleFilter(chip.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all text-left ${
                    active
                      ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/60 text-orange-200 font-semibold shadow-sm'
                      : 'bg-slate-900/60 border-slate-700/70 text-slate-300 hover:border-slate-600 hover:bg-slate-900'
                  }`}
                >
                  <span className="text-base">{chip.icon}</span>
                  <span className="truncate">{chip.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Section 4: Optional Custom Craving Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Custom Craving or Group Drama (Optional)
            </label>
            <span className="text-[11px] text-slate-400">Be as specific as you want</span>
          </div>

          <textarea
            rows={2}
            value={config.customCraving}
            onChange={(e) => onChangeConfig({ ...config, customCraving: e.target.value })}
            placeholder='e.g., "Gusto ko ng spicy pero ayoko ng unli wings" or "May masarap na dessert"'
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors resize-none shadow-inner"
          />

          {/* Suggested quick chips */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {SUGGESTED_CRAVINGS.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => {
                  soundFX.playPop()
                  onChangeConfig({ ...config, customCraving: sug })
                }}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700 transition-colors"
              >
                + {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Section 5: Barkada Members for Veto Round */}
        <div className="space-y-2.5 pt-2 border-t border-slate-700/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-orange-400" />
              <span>Barkada Squad (Voters)</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {config.friends.length} members ready to veto
            </span>
          </div>

          {/* Friend pills */}
          <div className="flex flex-wrap items-center gap-2">
            {config.friends.map((name, idx) => {
              const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length]
              return (
                <div
                  key={`${name}-${idx}`}
                  className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs shadow-sm animate-fadeIn"
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${colorClass}`}
                  >
                    {name.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-semibold text-slate-200">{name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFriend(name)}
                    className="text-slate-400 hover:text-red-400 transition-colors ml-0.5"
                    title={`Remove ${name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Add friend input */}
          <form onSubmit={handleAddFriend} className="flex gap-2 pt-1">
            <input
              type="text"
              value={newFriendName}
              onChange={(e) => setNewFriendName(e.target.value)}
              placeholder="Add another friend (e.g. Maria)..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-700/80 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-slate-200 hover:text-white transition-all shrink-0 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Primary CTA */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              soundFX.playPop()
              onSubmit()
            }}
            disabled={isLoading || !config.location.trim()}
            className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 p-0.5 font-bold shadow-lg shadow-orange-500/25 transition-all duration-300 hover:shadow-orange-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="relative flex items-center justify-center gap-2.5 rounded-[14px] bg-slate-900/40 px-6 py-4 text-white font-extrabold text-base transition-all group-hover:bg-transparent">
              <UtensilsCrossed className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Find 5 Spots 🍽️</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
