'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SettingsState {
  // Requests
  requestTimeout: number
  followRedirects: boolean
  sslVerification: boolean
  defaultContentType: string
  // Editor
  tabSize: 2 | 4
  wordWrap: boolean
  fontSize: number
  // Notifications
  monitorAlerts: boolean
  // Layout
  requestLayout: 'vertical' | 'horizontal'
  // Branding
  logoUrl: string | null

  setRequestTimeout: (v: number) => void
  setFollowRedirects: (v: boolean) => void
  setSslVerification: (v: boolean) => void
  setDefaultContentType: (v: string) => void
  setTabSize: (v: 2 | 4) => void
  setWordWrap: (v: boolean) => void
  setFontSize: (v: number) => void
  setMonitorAlerts: (v: boolean) => void
  setRequestLayout: (v: 'vertical' | 'horizontal') => void
  setLogoUrl: (v: string | null) => void
}

function getUserId(): string {
  try {
    const raw = localStorage.getItem('auth-store')
    if (!raw) return 'guest'
    const parsed = JSON.parse(raw) as { state?: { user?: { id?: number } } }
    return String(parsed?.state?.user?.id ?? 'guest')
  } catch {
    return 'guest'
  }
}

// Per-user namespaced storage — only runs client-side (skipHydration: true)
const userScopedStorage = createJSONStorage(() => ({
  getItem: (name: string) => localStorage.getItem(`${name}-${getUserId()}`),
  setItem: (name: string, value: string) => localStorage.setItem(`${name}-${getUserId()}`, value),
  removeItem: (name: string) => localStorage.removeItem(`${name}-${getUserId()}`),
}))

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      requestTimeout: 30000,
      followRedirects: true,
      sslVerification: true,
      defaultContentType: 'application/json',
      tabSize: 2,
      wordWrap: false,
      fontSize: 13,
      monitorAlerts: true,
      requestLayout: 'vertical',
      logoUrl: null,

      setRequestTimeout: (v) => set({ requestTimeout: v }),
      setFollowRedirects: (v) => set({ followRedirects: v }),
      setSslVerification: (v) => set({ sslVerification: v }),
      setDefaultContentType: (v) => set({ defaultContentType: v }),
      setTabSize: (v) => set({ tabSize: v }),
      setWordWrap: (v) => set({ wordWrap: v }),
      setFontSize: (v) => set({ fontSize: v }),
      setMonitorAlerts: (v) => set({ monitorAlerts: v }),
      setRequestLayout: (v) => set({ requestLayout: v }),
      setLogoUrl: (v) => set({ logoUrl: v }),
    }),
    {
      name: 'nidaa-settings',
      storage: userScopedStorage,
      skipHydration: true, // prevents SSR/hydration mismatch — rehydrated manually on client
    }
  )
)

export function rehydrateSettings() {
  useSettingsStore.persist.rehydrate()
}
