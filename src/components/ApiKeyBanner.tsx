import React, { useState } from 'react'
import { Key, Eye, EyeOff, Check, AlertCircle, Sparkles, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { getStoredApiKey, setStoredApiKey, setStoredDemoMode } from '../services/gemini'
import { soundFX } from '../utils/audio'

interface ApiKeyBannerProps {
  onConfigChange: () => void
  demoMode: boolean
  setDemoMode: (val: boolean) => void
}

export const ApiKeyBanner: React.FC<ApiKeyBannerProps> = ({
  onConfigChange,
  demoMode,
  setDemoMode,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [keyInput, setKeyInput] = useState(getStoredApiKey())
  const [showKey, setShowKey] = useState(false)
  const [savedToast, setSavedToast] = useState(false)

  const activeKey = getStoredApiKey()
  const hasEnvKey = !!(import.meta.env.VITE_GEMINI_API_KEY as string | undefined)

  const handleSave = () => {
    soundFX.playPop()
    setStoredApiKey(keyInput)
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2000)
    onConfigChange()
  }

  const handleClear = () => {
    soundFX.playPop()
    setKeyInput('')
    setStoredApiKey('')
    onConfigChange()
  }

  const handleToggleDemo = () => {
    soundFX.playPop()
    const next = !demoMode
    setDemoMode(next)
    setStoredDemoMode(next)
    onConfigChange()
  }

  const maskedKey = activeKey
    ? `${activeKey.slice(0, 4)}••••••••${activeKey.slice(-4)}`
    : hasEnvKey
    ? 'Loaded via .env'
    : ''

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-xs transition-all">
      <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Status Indicator */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-left hover:text-white transition-colors group flex-1 min-w-0"
        >
          <div className="p-1 rounded bg-slate-800 group-hover:bg-slate-700 transition-colors">
            <Key className="w-3.5 h-3.5 text-amber-400" />
          </div>

          <div className="flex items-center gap-2 truncate">
            {activeKey ? (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-medium text-slate-200">Gemini 2.5 Flash:</span>
                <span className="font-mono text-emerald-400 text-[11px] truncate">{maskedKey}</span>
              </>
            ) : demoMode ? (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="font-medium text-amber-300">Demo Mode Active</span>
                <span className="text-slate-400 hidden sm:inline">(Realistic Manila Spots)</span>
              </>
            ) : (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-orange-500"></span>
                <span className="font-medium text-orange-300">No Key Set</span>
                <span className="text-slate-400 hidden sm:inline">— Click to configure or use Demo Mode</span>
              </>
            )}
          </div>

          <div className="text-slate-400 group-hover:text-slate-200 ml-auto shrink-0 pl-1">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {/* Quick Demo Toggle Pill */}
        <button
          onClick={handleToggleDemo}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all shrink-0 ${
            demoMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-700'
          }`}
          title="Toggle Demo Mode with realistic sample Manila spots"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Demo {demoMode ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Collapsible Drawer */}
      {isOpen && (
        <div className="border-t border-slate-800/80 bg-slate-950/80 px-4 py-4 max-w-2xl mx-auto space-y-3.5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Paste your Gemini API key (AIzaSy...)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 pr-9 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium px-3.5 py-2 rounded-lg text-xs transition-all shadow-sm active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Key</span>
              </button>

              {activeKey && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                  title="Remove saved key"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {savedToast && (
            <div className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Key saved locally in your browser!
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-slate-400 text-[11px] pt-1">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                Saved only in browser <code className="text-slate-300">localStorage</code>. 100% Free Tier (Gemini 2.5 Flash).
              </span>
            </div>

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 underline underline-offset-2 shrink-0"
            >
              Get Free Gemini Key ↗
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
