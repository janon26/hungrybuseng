import React, { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { MapPin, Copy, RotateCcw, Check, ExternalLink, Trophy, Flame } from 'lucide-react'
import type { Restaurant } from '../types'
import { soundFX } from '../utils/audio'

interface Step3ReceiptProps {
  winner: Restaurant
  allRestaurants: Restaurant[]
  location: string
  friends: string[]
  onStartOver: () => void
}

export const Step3Receipt: React.FC<Step3ReceiptProps> = ({
  winner,
  allRestaurants,
  location,
  friends,
  onStartOver,
}) => {
  const [copied, setCopied] = useState(false)
  const [currentTimestamp] = useState(() => {
    return new Date().toLocaleString('en-PH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  })

  // Confetti blast on mount
  useEffect(() => {
    soundFX.playWinner()

    // Dual burst of vibrant food-toned confetti
    const end = Date.now() + 1500
    const colors = ['#F97316', '#EF4444', '#F59E0B', '#10B981', '#6366F1']

    ;(function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      })
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    })()
  }, [])

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    winner.mapsSearchQuery
  )}`

  const vetoedSpots = allRestaurants.filter((s) => s.id !== winner.id && s.isVetoed)

  // Copy clean text for Messenger/Viber/Discord
  const handleCopyChat = () => {
    soundFX.playPop()

    const vetoListText =
      vetoedSpots.length > 0
        ? vetoedSpots.map((s) => `• ${s.name} (Vetoed by ${s.vetoedBy || 'Barkada'})`).join('\n')
        : '• Unanimous consensus!'

    const textToCopy = `🍽️ *HUNGRYBUSENG — OFFICIAL BARKADA RESOLUTION* 🍽️
📅 ${currentTimestamp}
📍 Target Area: ${location}
👥 Barkada: ${friends.join(', ')}

🏆 *OFFICIAL WINNER:*
👉 *${winner.name}*
🏷️ Cuisine: ${winner.cuisine}
💰 Est. Price: ${winner.pricePerPerson}
📍 Distance: ${winner.distanceNote}
🌟 *Must-Order Dish:* ${winner.mustOrderDish}
💬 "${winner.wittyPitch}"

🚫 *Veto Log (Eliminated):*
${vetoListText}

📌 *Google Maps:* ${mapsUrl}

⚠️ *BINDING RULE:* NO COMPLAINING ALLOWED! Bawal mag-inarte! 🙅‍♂️🚀`

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2400)
    })
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-14 max-w-lg mx-auto">
      {/* Celebratory Banner */}
      <div className="text-center space-y-1.5 pt-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" /> Consensus Reached!
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          May Nanalo Na, Gutom Na! 🎉
        </h2>
        <p className="text-xs text-slate-400">
          The official, legally-binding thermal receipt for your group chat:
        </p>
      </div>

      {/* THERMAL PAPER RECEIPT CARD */}
      <div className="relative shadow-2xl rounded-sm filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
        {/* Top Serrated Sawtooth SVG Border */}
        <div className="w-full overflow-hidden leading-none h-3 bg-transparent">
          <svg
            className="w-full h-3 fill-[#FAF7EE]"
            viewBox="0 0 400 12"
            preserveAspectRatio="none"
          >
            <path d="M0,12 L10,0 L20,12 L30,0 L40,12 L50,0 L60,12 L70,0 L80,12 L90,0 L100,12 L110,0 L120,12 L130,0 L140,12 L150,0 L160,12 L170,0 L180,12 L190,0 L200,12 L210,0 L220,12 L230,0 L240,12 L250,0 L260,12 L270,0 L280,12 L290,0 L300,12 L310,0 L320,12 L330,0 L340,12 L350,0 L360,12 L370,0 L380,12 L390,0 L400,12 Z" />
          </svg>
        </div>

        {/* RECEIPT BODY */}
        <div className="bg-[#FAF7EE] text-slate-900 font-mono p-5 sm:p-7 space-y-4">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="text-sm font-extrabold uppercase tracking-widest text-slate-950">
              *** OFFICIAL BARKADA RESOLUTION ***
            </div>
            <div className="text-[11px] font-semibold text-slate-700 uppercase">
              HungryBuseng Decider Act 2026
            </div>
            <div className="text-[10px] text-slate-600">
              {currentTimestamp}
            </div>
            <div className="text-[10px] text-slate-600 truncate">
              LOCATION: {location.toUpperCase()}
            </div>
            <div className="text-[10px] text-slate-600">
              BARKADA: {friends.join(' • ')}
            </div>
          </div>

          {/* Dotted Cut Line */}
          <div className="border-t-2 border-dashed border-slate-400 my-2" />

          {/* WINNER SPOTLIGHT */}
          <div className="text-center py-2 space-y-2">
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 uppercase tracking-widest">
              <Flame className="w-3.5 h-3.5 fill-orange-600 text-orange-600" />
              <span>THE CONSENSUS WINNER</span>
              <Flame className="w-3.5 h-3.5 fill-orange-600 text-orange-600" />
            </div>

            <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 uppercase leading-tight">
              {winner.name}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-700">
              <span className="font-bold underline">{winner.cuisine}</span>
              <span>•</span>
              <span className="font-bold bg-amber-200/80 px-1.5 py-0.5 rounded text-amber-950">
                {winner.pricePerPerson}
              </span>
            </div>

            <div className="text-[11px] text-slate-600">
              📍 {winner.distanceNote}
            </div>
          </div>

          {/* MUST-ORDER DISH HIGHLIGHT */}
          <div className="p-3 bg-amber-100/60 border border-amber-300/80 rounded space-y-1">
            <div className="text-[10px] uppercase font-bold text-amber-900 tracking-wider">
              ★ MUST-ORDER SIGNATURE DISH:
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-950">
              {winner.mustOrderDish}
            </div>
          </div>

          {/* Witty Taglish Pitch */}
          <div className="text-xs text-slate-700 italic border-l-2 border-orange-500 pl-2.5 py-0.5">
            "{winner.wittyPitch}"
          </div>

          {/* Dotted Divider */}
          <div className="border-t-2 border-dashed border-slate-400 my-2" />

          {/* VETO LOG */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex justify-between">
              <span>ELIMINATED CANDIDATES (VETO LOG):</span>
              <span>BY:</span>
            </div>

            {vetoedSpots.length > 0 ? (
              <div className="text-[11px] space-y-1">
                {vetoedSpots.map((spot) => (
                  <div key={spot.id} className="flex items-center justify-between gap-2">
                    <span className="text-slate-600 line-through truncate flex-1">
                      {spot.name}
                    </span>
                    <span className="text-red-700 font-bold shrink-0 text-[10px]">
                      {spot.vetoedBy || 'Barkada'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-slate-600 italic">
                Unanimous pick — no spots were vetoed!
              </div>
            )}
          </div>

          {/* Dotted Divider */}
          <div className="border-t-2 border-dashed border-slate-400 my-2" />

          {/* Barcode & Rubber Stamp Section */}
          <div className="pt-2 flex flex-col items-center space-y-4">
            {/* TILTED DISTRESSED RUBBER STAMP */}
            <div className="transform -rotate-6 transition-transform hover:rotate-0">
              <div className="border-[3px] border-red-600 text-red-600 px-4 py-1.5 rounded text-center shadow-sm select-none">
                <div className="text-sm sm:text-base font-black tracking-widest uppercase">
                  NO COMPLAINING ALLOWED
                </div>
                <div className="text-[9px] font-bold text-red-700 normal-case tracking-normal">
                  Kasunduan ng Barkada: Bawal mag-inarte.
                </div>
              </div>
            </div>

            {/* Fake Thermal Barcode */}
            <div className="space-y-1 text-center select-none opacity-85">
              <div className="h-9 flex items-center justify-center gap-[2px]">
                {[2, 1, 4, 1, 3, 2, 1, 5, 2, 1, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 2, 4, 1].map(
                  (width, i) => (
                    <div
                      key={i}
                      className="h-full bg-slate-900"
                      style={{ width: `${width}px` }}
                    />
                  )
                )}
              </div>
              <div className="text-[9px] tracking-widest text-slate-600">
                #HB-2026-CONSENSUS-VERIFIED
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Serrated Sawtooth SVG Border */}
        <div className="w-full overflow-hidden leading-none h-3 bg-transparent">
          <svg
            className="w-full h-3 fill-[#FAF7EE] rotate-180"
            viewBox="0 0 400 12"
            preserveAspectRatio="none"
          >
            <path d="M0,12 L10,0 L20,12 L30,0 L40,12 L50,0 L60,12 L70,0 L80,12 L90,0 L100,12 L110,0 L120,12 L130,0 L140,12 L150,0 L160,12 L170,0 L180,12 L190,0 L200,12 L210,0 L220,12 L230,0 L240,12 L250,0 L260,12 L270,0 L280,12 L290,0 L300,12 L310,0 L320,12 L330,0 L340,12 L350,0 L360,12 L370,0 L380,12 L390,0 L400,12 Z" />
          </svg>
        </div>
      </div>

      {/* Action Buttons Below Receipt */}
      <div className="space-y-2.5 pt-2">
        {/* Open in Google Maps */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all active:scale-95"
        >
          <MapPin className="w-4 h-4" />
          <span>Open in Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
        </a>

        {/* Copy for Group Chat */}
        <button
          type="button"
          onClick={handleCopyChat}
          className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-sm transition-all active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Copied for Messenger / Viber!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-orange-400" />
              <span>Copy for Group Chat (Viber/Messenger)</span>
            </>
          )}
        </button>

        {/* Start Over */}
        <button
          type="button"
          onClick={() => {
            soundFX.playPop()
            onStartOver()
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Decide another spot (Start Over)</span>
        </button>
      </div>

      {/* Copy Toast popup */}
      {copied && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs animate-bounce">
          <Check className="w-4 h-4" />
          <span>Receipt copied! Paste directly in Messenger/Discord.</span>
        </div>
      )}
    </div>
  )
}
