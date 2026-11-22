# HungryBuseng 🍽️

> **The ultimate barkada food consensus decider.** Stop the endless *"Kahit saan"* debate once and for all.

HungryBuseng is a modern, mobile-first web application designed for groups of friends trying to agree on where to eat. It leverages Google's free-tier **Gemini 2.5 Flash** REST API to handpick 5 real dining spots tailored to your exact location, budget, vibe, and cravings — then puts them into a high-stakes, turn-based **Veto Arena** until only 1 consensus winner remains.

---

## ✨ Features

- **Gemini 2.5 Flash (100% Free Tier):** Uses standard REST API calls (`models/gemini-2.5-flash:generateContent`) with `responseMimeType: "application/json"`.
- **Firebase RTDB Multiplayer Sync:** Create isolated rooms with a 4-character code (e.g. `HB-K7R9`), share a direct invite link or scannable QR code, and watch friends veto candidates from their own phones in real time!
- **Solo / Pass-the-Phone Mode:** Seamlessly works on a single device passed around the table or via local multi-tab broadcast.
- **Location & Craving Customization:**
  - Defaulted to popular Metro Manila hubs (Katipunan, BGC, Poblacion, Tomas Morato, Maginhawa, Greenhills).
  - 📍 *Near Me* GPS button with automatic geolocation and reverse geocoding.
  - Budget Tiers: `Sakto Lang (₱150–₱250)`, `Keri Pa (₱300–₱500)`, `Bagong Sahod (₱600+)`.
  - Multi-select vibe chips (*Must Have Rice*, *Aircon Needed*, *Open Late*, *Soup/Sabaw*, *No Fast Food*, *Vegetarian-Friendly*).
  - Free-text custom craving box with quick suggestions.
  - Dynamic Barkada squad management.
- **Turn-Based Veto Arena:**
  - 5 interactive restaurant cards featuring price per person, walking distance, signature must-order dish, and a punchy Taglish pitch.
  - Active turn indicator rotating through friends.
  - `❌ Veto This` button that stamps a bold, tilted red `VETOED` badge and greys out eliminated spots.
  - `🎲 AI Tie-Breaker` button that rapidly spins a 2-second roulette wheel to break deadlocks.
- **Official Thermal Receipt Verdict:**
  - Realistic thermal paper receipt with jagged serrated edges, monospace typography, timestamp, and metadata.
  - Full Veto Log recording which friend vetoed which spot.
  - Distressed rubber stamp: **"NO COMPLAINING ALLOWED"** (*Kasunduan ng Barkada: Bawal mag-inarte*).
  - 1-click **Copy for Group Chat** formatted with emojis for Messenger, Viber, or Discord.
  - Direct 1-click Google Maps search link.
- **Demo Mode:** Fallback mode with realistic Metro Manila spots for instant testing with zero setup or API keys.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- npm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/janon26/hungrybuseng.git
   cd hungrybuseng
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Configuration (Optional)

You can set your Gemini API key in two ways:
1. **Directly in the App UI:** Click the **"🔑 Set API Key"** banner at the top of the browser. It saves safely to your browser's private `localStorage`.
2. **Environment File:** Copy `.env.example` to `.env` and enter your keys:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here

   # Optional for real-time mobile multiplayer sync:
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_DATABASE_URL=
   VITE_FIREBASE_PROJECT_ID=
   ```

*Get a free Gemini API key at [Google AI Studio](https://aistudio.google.com/app/apikey).*

---

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (v4)
- **AI Model:** Google Gemini 2.5 Flash
- **Real-Time Sync:** Firebase Realtime Database + Web BroadcastChannel API
- **Icons:** Lucide React
- **Confetti:** Canvas Confetti
- **QR Code:** qrcode.react

---

## 📄 License

MIT License. Built for hungry barkadas everywhere.
