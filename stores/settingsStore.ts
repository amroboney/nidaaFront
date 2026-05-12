'use client'
import { create } from 'zustand'

interface SettingsState {
  requestTimeout: number
  followRedirects: boolean
  sslVerification: boolean
  defaultContentType: string
  tabSize: 2 | 4
  wordWrap: boolean
  fontSize: number
  monitorAlerts: boolean
  requestLayout: 'vertical' | 'horizontal'
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

type SettingsData = Pick<SettingsState,
  'requestTimeout' | 'followRedirects' | 'sslVerification' | 'defaultContentType' |
  'tabSize' | 'wordWrap' | 'fontSize' | 'monitorAlerts' | 'requestLayout' | 'logoUrl'
>

const defaults: SettingsData = {
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

function storageKey(): string {
  return `nidaa-settings-${getUserId()}`
}

function saveToStorage(state: SettingsState) {
  try {
    const data: SettingsData = {
      requestTimeout: state.requestTimeout,
      followRedirects: state.followRedirects,
      sslVerification: state.sslVerification,
      defaultContentType: state.defaultContentType,
      tabSize: state.tabSize,
      wordWrap: state.wordWrap,
      fontSize: state.fontSize,
      monitorAlerts: state.monitorAlerts,
      requestLayout: state.requestLayout,
      logoUrl: state.logoUrl,
    }
    localStorage.setItem(storageKey(), JSON.stringify(data))
  } catch {}
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  ...defaults,
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
}))

// Auto-save on every change (client-only)
if (typeof window !== 'undefined') {
  useSettingsStore.subscribe((state) => saveToStorage(state))
}

// Load settings for current user from localStorage
export function rehydrateSettings() {
  if (typeof window === 'undefined') return
  try {
    const stored = localStorage.getItem(storageKey())
    const parsed: Partial<SettingsData> = stored ? JSON.parse(stored) : {}
    useSettingsStore.setState({ ...defaults, ...parsed })
  } catch {
    useSettingsStore.setState(defaults)
  }
}
