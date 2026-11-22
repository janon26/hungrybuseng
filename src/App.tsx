import React, { useState, useEffect } from 'react'
import { ApiKeyBanner } from './components/ApiKeyBanner'
import { Step1Setup } from './components/Step1Setup'
import { Step2Arena } from './components/Step2Arena'
import { Step3Receipt } from './components/Step3Receipt'
import { LoadingSkeleton } from './components/LoadingSkeleton'
import { MultiplayerModal } from './components/MultiplayerModal'
import type { CravingConfig, Restaurant } from './types'
import { fetchRestaurants, getStoredDemoMode } from './services/gemini'
import {
  subscribeToRoom,
  updateRoom,
  type RoomState,
} from './services/firebase'
import { Utensils, AlertTriangle, X, Users, Radio } from 'lucide-react'

const INITIAL_CONFIG: CravingConfig = {
  location: 'Katipunan, Quezon City',
  budget: 'sakto',
  filters: ['Must Have Rice', 'Aircon Needed'],
  customCraving: '',
  friends: ['Jon', 'Alex', 'Sam'],
}

export const App: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [config, setConfig] = useState<CravingConfig>(INITIAL_CONFIG)
  const [isLoading, setIsLoading] = useState(false)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [winner, setWinner] = useState<Restaurant | null>(null)
  const [demoMode, setDemoMode] = useState<boolean>(false)
  const [notice, setNotice] = useState<string | null>(null)

  // Multiplayer & Room State
  const [isMultiplayerOpen, setIsMultiplayerOpen] = useState(false)
  const [activeRoom, setActiveRoom] = useState<RoomState | null>(null)
  const [currentUser, setCurrentUser] = useState<string>('Jon')

  // Auto-detect ?room=HB-XXXX on page load
  useEffect(() => {
    setDemoMode(getStoredDemoMode())

    const params = new URLSearchParams(window.location.search)
    const roomParam = params.get('room')
    if (roomParam) {
      setIsMultiplayerOpen(true)
    }
  }, [])

  // Subscribe to real-time room updates via Firebase RTDB
  useEffect(() => {
    if (!activeRoom?.roomCode) return

    const unsubscribe = subscribeToRoom(activeRoom.roomCode, (syncedState) => {
      setActiveRoom(syncedState)
      setStep(syncedState.step)
      setRestaurants(syncedState.restaurants || [])
      setWinner(syncedState.winner || null)
      if (syncedState.config) {
        setConfig(syncedState.config)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [activeRoom?.roomCode])

  const handleFetchSpots = async () => {
    setIsLoading(true)
    setNotice(null)

    try {
      const result = await fetchRestaurants(config, demoMode)
      setRestaurants(result.spots)
      if (result.errorNotice) {
        setNotice(result.errorNotice)
      }
      setStep(2)

      // Sync to room if active
      if (activeRoom) {
        await updateRoom(activeRoom.roomCode, {
          restaurants: result.spots,
          step: 2,
          currentFriendIndex: 0,
        })
      }
    } catch (err: any) {
      setNotice(err?.message || 'Failed to fetch restaurants. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinishVerdict = async (finalWinner: Restaurant, updatedList: Restaurant[]) => {
    setWinner(finalWinner)
    setRestaurants(updatedList)
    setStep(3)

    if (activeRoom) {
      await updateRoom(activeRoom.roomCode, {
        winner: finalWinner,
        restaurants: updatedList,
        step: 3,
      })
    }
  }

  const handleSpotsChange = async (updated: Restaurant[], nextIdx: number) => {
    setRestaurants(updated)
    if (activeRoom) {
      await updateRoom(activeRoom.roomCode, {
        restaurants: updated,
        currentFriendIndex: nextIdx,
      })
    }
  }

  const handleStartOver = async () => {
    setStep(1)
    setWinner(null)
    setRestaurants([])

    if (activeRoom) {
      await updateRoom(activeRoom.roomCode, {
        step: 1,
        winner: null,
        restaurants: [],
        currentFriendIndex: 0,
      })
    }
  }

  const handleRoomJoined = (room: RoomState, myName: string) => {
    setActiveRoom(room)
    setCurrentUser(myName)
    setStep(room.step)
    if (room.restaurants?.length) {
      setRestaurants(room.restaurants)
    }
    if (room.winner) {
      setWinner(room.winner)
    }
    if (room.config) {
      setConfig(room.config)
    }
  }

  const handleLeaveRoom = () => {
    setActiveRoom(null)
    // Clean up query param from URL without reload
    const url = new URL(window.location.href)
    url.searchParams.delete('room')
    window.history.replaceState({}, '', url.toString())
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Top API Key Banner */}
      <ApiKeyBanner
        onConfigChange={() => {
          setDemoMode(getStoredDemoMode())
        }}
        demoMode={demoMode}
        setDemoMode={setDemoMode}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-4 sm:py-6 flex flex-col">
        {/* Notice Banner (if any) */}
        {notice && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{notice}</span>
            </div>
            <button
              onClick={() => setNotice(null)}
              className="text-amber-400 hover:text-amber-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Room Sync Pill Bar */}
        <div className="mb-4 flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            {activeRoom ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="font-bold text-white truncate">
                  Room: <span className="font-mono text-orange-400">{activeRoom.roomCode}</span>
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  ({activeRoom.participants.length} connected)
                </span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-400 truncate">
                  Solo / Pass-the-Phone Mode
                </span>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMultiplayerOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all shrink-0 ${
              activeRoom
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 hover:bg-orange-500/30'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Users className="w-3 h-3 text-orange-400" />
            <span>{activeRoom ? 'Invite Friends' : 'Multiplayer Room'}</span>
          </button>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="flex items-center justify-between mb-5 px-2">
          {[
            { num: 1, label: 'Cravings' },
            { num: 2, label: 'Veto Arena' },
            { num: 3, label: 'Verdict' },
          ].map((item, idx) => {
            const isActive = step === item.num
            const isDone = step > item.num
            return (
              <React.Fragment key={item.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white ring-4 ring-orange-500/20'
                        : isDone
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {isDone ? '✓' : item.num}
                  </div>
                  <span
                    className={`text-xs font-semibold hidden sm:inline ${
                      isActive ? 'text-white' : isDone ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={`flex-1 h-[2px] mx-2 transition-all ${
                      step > idx + 1 ? 'bg-emerald-500/70' : 'bg-slate-800'
                    }`}
                  />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Dynamic View by Step */}
        <div className="flex-1">
          {isLoading ? (
            <LoadingSkeleton />
          ) : step === 1 ? (
            <Step1Setup
              config={config}
              onChangeConfig={(newCfg) => {
                setConfig(newCfg)
                if (activeRoom) {
                  updateRoom(activeRoom.roomCode, { config: newCfg })
                }
              }}
              onSubmit={handleFetchSpots}
              isLoading={isLoading}
            />
          ) : step === 2 ? (
            <Step2Arena
              restaurants={restaurants}
              friends={config.friends}
              onFinishVerdict={handleFinishVerdict}
              onSpotsChange={handleSpotsChange}
              currentFriendIndex={activeRoom?.currentFriendIndex ?? 0}
              isMultiplayer={Boolean(activeRoom)}
              currentUser={currentUser}
            />
          ) : step === 3 && winner ? (
            <Step3Receipt
              winner={winner}
              allRestaurants={restaurants}
              location={config.location}
              friends={config.friends}
              onStartOver={handleStartOver}
            />
          ) : null}
        </div>

        {/* Footer */}
        <footer className="mt-auto pt-8 pb-4 text-center text-xs text-slate-500 border-t border-slate-800/60">
          <div className="flex items-center justify-center gap-1.5 font-medium">
            <Utensils className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-slate-400 font-semibold">HungryBuseng</span>
            <span>— Powered by Gemini 2.5 Flash Free Tier</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Built for indecisive barkadas everywhere. No more "Kahit saan".
          </p>
        </footer>
      </main>

      {/* Multiplayer Room Modal */}
      <MultiplayerModal
        isOpen={isMultiplayerOpen}
        onClose={() => setIsMultiplayerOpen(false)}
        currentConfig={config}
        activeRoom={activeRoom}
        onRoomJoined={handleRoomJoined}
        onLeaveRoom={handleLeaveRoom}
        currentUser={currentUser}
      />
    </div>
  )
}

export default App
