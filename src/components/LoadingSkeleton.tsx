import React, { useEffect, useState } from 'react'
import { Sparkles, Utensils } from 'lucide-react'

const LOADING_QUOTES = [
  'Bumabasa ng reviews sa area mo...',
  'Pinag-aawayan pa kung may unli-rice at masarap na sabaw...',
  'Tinatanong si Gemini kung bukas pa yung paboritong spot...',
  'Naghahanap ng aircon para sa maiinitin mong kaibigan...',
  'Sinusukat kung pasok sa budget bago magbayaran...',
  'Filtering out the indecisive "Kahit saan" answers...',
]

export const LoadingSkeleton: React.FC = () => {
  const [quoteIndex, setQuoteIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % LOADING_QUOTES.length)
    }, 1800)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-6 py-6 animate-fadeIn">
      {/* Humorous Status Banner */}
      <div className="text-center space-y-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-red-500/10 animate-pulse" />

        <div className="relative inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/20 text-orange-400 mb-1">
          <Utensils className="w-6 h-6 animate-bounce" />
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Cooking up Recommendations
          </div>
          <h2 className="text-lg font-bold text-white transition-all duration-300 min-h-[1.75rem] flex items-center justify-center">
            "{LOADING_QUOTES[quoteIndex]}"
          </h2>
          <p className="text-xs text-slate-400 pt-1">
            Gemini 2.5 Flash is handpicking 5 real restaurants matching your exact barkada criteria...
          </p>
        </div>

        {/* Progress bar shimmer */}
        <div className="relative w-48 h-1.5 bg-slate-700 rounded-full mx-auto overflow-hidden mt-3">
          <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full w-1/2 animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>

      {/* 5 Shimmer Skeleton Cards */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((idx) => (
          <div
            key={idx}
            className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 space-y-3.5 animate-pulse relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-slate-700 rounded-lg w-2/3" />
                <div className="flex gap-2">
                  <div className="h-4 bg-slate-700/80 rounded-md w-24" />
                  <div className="h-4 bg-slate-700/80 rounded-md w-20" />
                </div>
              </div>
              <div className="h-8 bg-slate-700/50 rounded-xl w-24" />
            </div>

            <div className="h-3 bg-slate-700/60 rounded w-1/2" />

            <div className="p-3 rounded-xl bg-slate-900/50 space-y-2 border border-slate-800">
              <div className="h-3.5 bg-slate-700/70 rounded w-4/5" />
              <div className="h-3 bg-slate-700/50 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
