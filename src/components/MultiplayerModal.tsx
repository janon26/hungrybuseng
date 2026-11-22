import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Users, Copy, Check, X, QrCode } from 'lucide-react'
import {
  generateRoomCode,
  createRoom,
  joinRoom,
  type RoomState,
} from '../services/firebase'
import type { CravingConfig } from '../types'
import { soundFX } from '../utils/audio'

interface MultiplayerModalProps {
  isOpen: boolean
  onClose: () => void
  currentConfig: CravingConfig
  activeRoom: RoomState | null
  onRoomJoined: (room: RoomState, myName: string) => void
  onLeaveRoom: () => void
  currentUser: string
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  activeRoom,
  onRoomJoined,
  onLeaveRoom,
  currentUser,
}) => {
  const [roomInput, setRoomInput] = useState('')
  const [nameInput, setNameInput] = useState(currentUser || 'Jon')
  const [copiedLink, setCopiedLink] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const shareUrl = activeRoom
    ? `${window.location.origin}${window.location.pathname}?room=${activeRoom.roomCode}`
    : ''

  const handleCreateRoom = async () => {
    soundFX.playPop()
    setErrorMsg(null)
    const code = generateRoomCode()
    const hostName = nameInput.trim() || 'Host'
    try {
      const room = await createRoom(code, hostName, currentConfig)
      onRoomJoined(room, hostName)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create room')
    }
  }

  const handleJoinRoom = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    soundFX.playPop()
    setErrorMsg(null)
    const code = roomInput.trim().toUpperCase()
    const name = nameInput.trim() || 'Friend'
    if (!code) {
      setErrorMsg('Please enter a valid room code.')
      return
    }

    try {
      const room = await joinRoom(code, name)
      if (!room) {
        setErrorMsg(`Room "${code}" not found. Make sure the host has created it!`)
        return
      }
      onRoomJoined(room, name)
      onClose()
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to join room')
    }
  }

  const handleCopyLink = () => {
    soundFX.playPop()
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Barkada Multiplayer Sync</h3>
              <p className="text-[11px] text-slate-400">Vote live on separate phones together</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {activeRoom ? (
            /* ACTIVE ROOM VIEW (INVITE & SYNC) */
            <div className="space-y-4 animate-fadeIn text-center">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Your Barkada Room Code
                </span>
                <div className="font-mono text-3xl font-black text-orange-400 tracking-widest">
                  {activeRoom.roomCode}
                </div>
                <p className="text-xs text-slate-400">
                  Share this link or QR code with friends so they can veto on their phones!
                </p>
              </div>

              {/* Scannable QR Code */}
              <div className="p-3 bg-white rounded-xl inline-block shadow-lg mx-auto">
                <QRCodeSVG value={shareUrl} size={150} level="M" />
              </div>

              {/* Copy Link Input & Button */}
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono select-all truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all shrink-0 active:scale-95"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* Connected Friends List */}
              <div className="text-left space-y-2 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Connected Barkada ({activeRoom.participants.length})</span>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live Sync Active
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeRoom.participants.map((p) => (
                    <span
                      key={p}
                      className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200"
                    >
                      {p === currentUser ? `${p} (You)` : p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Switch to Solo Button */}
              <button
                onClick={() => {
                  soundFX.playPop()
                  onLeaveRoom()
                }}
                className="text-xs text-red-400 hover:text-red-300 font-medium pt-2 transition-colors"
              >
                Leave Room / Switch to Solo Mode
              </button>
            </div>
          ) : (
            /* CREATE OR JOIN ROOM */
            <div className="space-y-4 animate-fadeIn">
              {/* Nickname Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Your Nickname</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Jon"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Start New Session */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 space-y-2.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-orange-400" />
                  <span>Start a New Barkada Session</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Generates a dedicated room code with real-time sync for your group.
                </p>
                <button
                  onClick={handleCreateRoom}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  Create Room & Get Code
                </button>
              </div>

              {/* Divider */}
              <div className="relative text-center my-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-900 px-2 relative z-10">
                  Or Join an Existing Room
                </span>
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
              </div>

              {/* Join Existing Room Form */}
              <form onSubmit={handleJoinRoom} className="space-y-2.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                    placeholder="Enter Room Code (e.g. HB-K7R9)"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs transition-all active:scale-95"
                  >
                    Join
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
