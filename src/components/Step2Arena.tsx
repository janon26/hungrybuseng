import React, { useState, useEffect } from 'react'
import { Dices, MapPin, DollarSign, ExternalLink, XCircle, Trophy } from 'lucide-react'
import type { Restaurant } from '../types'
import { soundFX } from '../utils/audio'

interface Step2ArenaProps {
  restaurants: Restaurant[]
  friends: string[]
  onFinishVerdict: (winner: Restaurant, updatedList: Restaurant[]) => void
  onSpotsChange?: (updated: Restaurant[], nextIdx: number) => void
  currentFriendIndex?: number
  isMultiplayer?: boolean
  currentUser?: string
}

const AVATAR_COLORS = [
  'bg-orange-500 text-white',
  'bg-emerald-500 text-white',
  'bg-indigo-500 text-white',
  'bg-pink-500 text-white',
  'bg-amber-500 text-slate-900',
  'bg-cyan-500 text-white',
]

export const Step2Arena: React.FC<Step2ArenaProps> = ({
  restaurants: initialSpots,
  friends,
  onFinishVerdict,
  onSpotsChange,
  currentFriendIndex: externalIndex = 0,
  isMultiplayer = false,
  currentUser,
}) => {
  const [spots, setSpots] = useState<Restaurant[]>(initialSpots)
  const [localFriendIndex, setLocalFriendIndex] = useState(externalIndex)
  const [isRouletteSpinning, setIsRouletteSpinning] = useState(false)
  const [highlightedSpotId, setHighlightedSpotId] = useState<string | null>(null)

  // Sync when initialSpots change (e.g. from Firebase RTDB)
  useEffect(() => {
    setSpots(initialSpots)
  }, [initialSpots])

  useEffect(() => {
    setLocalFriendIndex(externalIndex)
  }, [externalIndex])

  const activeSpots = spots.filter((s) => !s.isVetoed)
  const currentFriend = friends[localFriendIndex % friends.length] || 'Barkada Member'
  const currentAvatarColor = AVATAR_COLORS[localFriendIndex % AVATAR_COLORS.length]

  const isMyTurn = !isMultiplayer || (currentUser && currentUser.toLowerCase() === currentFriend.toLowerCase())

  // Check if exactly 1 spot remains after manual vetoes
  useEffect(() => {
    if (activeSpots.length === 1 && spots.length > 1 && !isRouletteSpinning) {
      const winner = activeSpots[0]
      const timer = setTimeout(() => {
        onFinishVerdict(winner, spots)
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [activeSpots.length, spots, isRouletteSpinning, onFinishVerdict])

  const handleVeto = (spotId: string) => {
    if (isRouletteSpinning) return
    soundFX.playVeto()

    const nextIndex = (localFriendIndex + 1) % friends.length
    const updated = spots.map((s) => {
      if (s.id === spotId) {
        return {
          ...s,
          isVetoed: true,
          vetoedBy: currentFriend,
          vetoedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      }
      return s
    })

    setSpots(updated)
    setLocalFriendIndex(nextIndex)
    if (onSpotsChange) {
      onSpotsChange(updated, nextIndex)
    }
  }

  // 🎲 AI Tie-Breaker Roulette
  const handleAiTieBreaker = () => {
    if (activeSpots.length <= 1 || isRouletteSpinning) return

    setIsRouletteSpinning(true)
    let counter = 0
    const totalTicks = 22
    let intervalTime = 60

    const runRouletteStep = () => {
      counter++
      soundFX.playTick()

      const randomIdx = Math.floor(Math.random() * activeSpots.length)
      setHighlightedSpotId(activeSpots[randomIdx].id)

      if (counter < totalTicks) {
        if (counter > totalTicks - 6) {
          intervalTime += 35
        }
        setTimeout(runRouletteStep, intervalTime)
      } else {
        const chosenWinner = activeSpots[Math.floor(Math.random() * activeSpots.length)]
        setHighlightedSpotId(chosenWinner.id)

        const finalSpots = spots.map((s) => {
          if (s.id === chosenWinner.id) {
            return s
          }
          if (!s.isVetoed) {
            return {
              ...s,
              isVetoed: true,
              vetoedBy: 'AI Tie-Breaker 🎲',
              vetoedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          }
          return s
        })

        setSpots(finalSpots)
        setIsRouletteSpinning(false)

        if (onSpotsChange) {
          onSpotsChange(finalSpots, localFriendIndex)
        }

        setTimeout(() => {
          onFinishVerdict(chosenWinner, finalSpots)
        }, 800)
      }
    }

    runRouletteStep()
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Turn Banner & Controls Header */}
      <div className="sticky top-2 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Active Turn Indicator */}
          <div className="flex items-center gap-2.5">
            <span
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm shadow-md transition-all ${currentAvatarColor} ${
                !isRouletteSpinning ? 'animate-bounce' : ''
              }`}
            >
              {currentFriend.charAt(0).toUpperCase()}
            </span>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Current Turn to Veto:
              </div>
              <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <span className="text-orange-400">{currentFriend}</span>
                {isMultiplayer && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      isMyTurn
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isMyTurn ? 'Your turn!' : 'Waiting...'}
                  </span>
                )}
                <span className="text-xs text-slate-400 font-normal">
                  ({activeSpots.length} remaining)
                </span>
              </div>
            </div>
          </div>

          {/* AI Tie-Breaker Button */}
          <button
            type="button"
            onClick={handleAiTieBreaker}
            disabled={activeSpots.length <= 1 || isRouletteSpinning}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
              isRouletteSpinning
                ? 'bg-amber-500 text-slate-950 animate-pulse cursor-wait'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 hover:shadow-amber-500/30 active:scale-95'
            }`}
          >
            <Dices className={`w-4 h-4 ${isRouletteSpinning ? 'animate-spin' : ''}`} />
            <span>{isRouletteSpinning ? 'Spinning Roulette...' : '🎲 AI Tie-Breaker'}</span>
          </button>
        </div>

        {/* Instruction pill */}
        <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2 px-0.5">
          <span>Click ❌ Veto on spots you don't feel like eating today.</span>
          <span className="text-orange-400 font-semibold">{5 - activeSpots.length} / 4 vetoed</span>
        </div>
      </div>

      {/* 5 Restaurant Cards */}
      <div className="space-y-4">
        {spots.map((spot, index) => {
          const isHighlighted = highlightedSpotId === spot.id
          const isVetoed = !!spot.isVetoed
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            spot.mapsSearchQuery
          )}`

          return (
            <div
              key={spot.id}
              className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${
                isVetoed
                  ? 'bg-slate-900/60 border-slate-800 opacity-45 grayscale'
                  : isHighlighted
                  ? 'bg-slate-800 border-amber-400 shadow-xl ring-2 ring-amber-400 scale-[1.02]'
                  : 'bg-slate-800/90 border-slate-700/80 hover:border-slate-600 shadow-lg'
              }`}
            >
              {/* VETOED STAMP OVERLAY */}
              {isVetoed && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-[1px] pointer-events-none select-none">
                  <div className="transform -rotate-12 px-6 py-2 border-4 border-red-600 text-red-500 font-black text-2xl sm:text-3xl tracking-widest uppercase bg-slate-950/90 shadow-2xl rounded-lg animate-fadeIn flex flex-col items-center">
                    <span>❌ VETOED</span>
                    <span className="text-xs font-semibold text-red-400 tracking-normal normal-case pt-0.5">
                      Vetoed by {spot.vetoedBy || 'Barkada'}
                    </span>
                  </div>
                </div>
              )}

              {/* CARD CONTENT */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-orange-500/20 text-orange-400 font-mono font-bold text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                        {spot.name}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-300 pt-0.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-700/80 font-medium">
                        {spot.cuisine}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-semibold flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {spot.pricePerPerson}
                      </span>
                    </div>
                  </div>

                  {!isVetoed ? (
                    <button
                      type="button"
                      onClick={() => handleVeto(spot.id)}
                      disabled={isRouletteSpinning || (!isMyTurn && isMultiplayer)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border font-bold text-xs transition-all shrink-0 active:scale-95 ${
                        !isMyTurn && isMultiplayer
                          ? 'bg-slate-800 text-slate-500 border-slate-700 opacity-60 cursor-not-allowed'
                          : 'bg-red-500/10 hover:bg-red-500 border-red-500/30 hover:border-red-500 text-red-400 hover:text-white'
                      }`}
                      title={!isMyTurn && isMultiplayer ? `It is currently ${currentFriend}'s turn to veto` : 'Veto this spot'}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{!isMyTurn && isMultiplayer ? `Wait for ${currentFriend}` : 'Veto This'}</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-mono text-red-400">
                      Eliminated
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span className="truncate">{spot.distanceNote}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    <span>Must-Order Signature Dish</span>
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-100">
                    {spot.mustOrderDish}
                  </div>
                </div>

                <div className="relative pl-3.5 border-l-2 border-orange-500/70 py-0.5 text-xs sm:text-sm text-slate-300 italic">
                  "{spot.wittyPitch}"
                </div>

                <div className="pt-1 flex items-center justify-between text-xs">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-orange-400 transition-colors"
                  >
                    <span>View spot on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {!isVetoed && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      Active Candidate
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
