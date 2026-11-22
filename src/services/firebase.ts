import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  type Database,
  type Unsubscribe,
} from 'firebase/database'
import type { Restaurant, CravingConfig } from '../types'

export interface RoomState {
  roomCode: string
  hostName: string
  step: 1 | 2 | 3
  config: CravingConfig
  restaurants: Restaurant[]
  winner?: Restaurant | null
  currentFriendIndex: number
  participants: string[]
  isTieBreakerSpinning?: boolean
  highlightedSpotId?: string | null
  lastUpdated: number
}

const FIREBASE_CONFIG_STORAGE_KEY = 'hungrybuseng_firebase_config'

export interface CustomFirebaseConfig {
  apiKey?: string
  authDomain?: string
  databaseURL?: string
  projectId?: string
  storageBucket?: string
  messagingSenderId?: string
  appId?: string
}

export function getStoredFirebaseConfig(): CustomFirebaseConfig | null {
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }

  // Fallback to Vite env
  const envDbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID

  if (envDbUrl && envApiKey && envProjectId) {
    return {
      apiKey: envApiKey,
      databaseURL: envDbUrl,
      projectId: envProjectId,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    }
  }

  return null
}

export function setStoredFirebaseConfig(config: CustomFirebaseConfig | null): void {
  if (!config) {
    localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY)
  } else {
    localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config))
  }
}

let firebaseApp: FirebaseApp | null = null
let rtdb: Database | null = null

function getRtdb(): Database | null {
  const config = getStoredFirebaseConfig()
  if (!config?.databaseURL || !config?.apiKey) {
    return null
  }

  try {
    if (!firebaseApp) {
      const apps = getApps()
      if (apps.length > 0) {
        firebaseApp = apps[0]
      } else {
        firebaseApp = initializeApp(config)
      }
    }
    if (!rtdb && firebaseApp) {
      rtdb = getDatabase(firebaseApp)
    }
    return rtdb
  } catch (err) {
    console.warn('Firebase RTDB init error:', err)
    return null
  }
}

// In-memory / BroadcastChannel fallback for local multi-tab testing if no remote DB is connected
const localChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('hungrybuseng_rooms')
  : null

const localRoomsStore = new Map<string, RoomState>()

export function isFirebaseConfigured(): boolean {
  return Boolean(getRtdb() !== null)
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = 'HB-'
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function createRoom(
  roomCode: string,
  hostName: string,
  config: CravingConfig
): Promise<RoomState> {
  const initialState: RoomState = {
    roomCode,
    hostName,
    step: 1,
    config,
    restaurants: [],
    winner: null,
    currentFriendIndex: 0,
    participants: [hostName],
    isTieBreakerSpinning: false,
    highlightedSpotId: null,
    lastUpdated: Date.now(),
  }

  const db = getRtdb()
  if (db) {
    const roomRef = ref(db, `rooms/${roomCode}`)
    await set(roomRef, initialState)
  } else {
    localRoomsStore.set(roomCode, initialState)
    localChannel?.postMessage({ type: 'UPDATE_ROOM', state: initialState })
  }

  return initialState
}

export async function joinRoom(roomCode: string, participantName: string): Promise<RoomState | null> {
  const db = getRtdb()
  let current: RoomState | null = null

  if (db) {
    const roomRef = ref(db, `rooms/${roomCode}`)
    const snapshot = await get(roomRef)
    if (snapshot.exists()) {
      current = snapshot.val() as RoomState
    }
  } else {
    current = localRoomsStore.get(roomCode) || null
  }

  if (!current) return null

  if (!current.participants.includes(participantName)) {
    const updatedParticipants = [...current.participants, participantName]
    const updatedState: RoomState = {
      ...current,
      participants: updatedParticipants,
      config: {
        ...current.config,
        friends: Array.from(new Set([...current.config.friends, participantName])),
      },
      lastUpdated: Date.now(),
    }

    if (db) {
      const roomRef = ref(db, `rooms/${roomCode}`)
      await set(roomRef, updatedState)
    } else {
      localRoomsStore.set(roomCode, updatedState)
      localChannel?.postMessage({ type: 'UPDATE_ROOM', state: updatedState })
    }

    return updatedState
  }

  return current
}

export function subscribeToRoom(
  roomCode: string,
  onUpdate: (state: RoomState) => void
): Unsubscribe {
  const db = getRtdb()

  if (db) {
    const roomRef = ref(db, `rooms/${roomCode}`)
    return onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.val() as RoomState)
      }
    })
  }

  // Fallback listener via BroadcastChannel
  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'UPDATE_ROOM' && event.data.state?.roomCode === roomCode) {
      onUpdate(event.data.state)
    }
  }

  localChannel?.addEventListener('message', handleMessage)

  // Send current state if available
  const existing = localRoomsStore.get(roomCode)
  if (existing) {
    setTimeout(() => onUpdate(existing), 0)
  }

  return () => {
    localChannel?.removeEventListener('message', handleMessage)
  }
}

export async function updateRoom(roomCode: string, partial: Partial<RoomState>): Promise<void> {
  const db = getRtdb()
  const now = Date.now()

  if (db) {
    const roomRef = ref(db, `rooms/${roomCode}`)
    const snapshot = await get(roomRef)
    if (snapshot.exists()) {
      const current = snapshot.val() as RoomState
      const updated = { ...current, ...partial, lastUpdated: now }
      await set(roomRef, updated)
    }
  } else {
    const current = localRoomsStore.get(roomCode)
    if (current) {
      const updated = { ...current, ...partial, lastUpdated: now }
      localRoomsStore.set(roomCode, updated)
      localChannel?.postMessage({ type: 'UPDATE_ROOM', state: updated })
    }
  }
}
