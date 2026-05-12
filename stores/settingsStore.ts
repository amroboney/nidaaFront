'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
    { name: 'nidaa-settings' }
  )
)
