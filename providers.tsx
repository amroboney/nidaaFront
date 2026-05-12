'use client'
import { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { useSettingsStore, rehydrateSettings } from '@/stores/settingsStore'

function FontSizeSync() {
  const fontSize = useSettingsStore((s) => s.fontSize)

  useEffect(() => {
    rehydrateSettings()
  }, [])

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`
  }, [fontSize])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <FontSizeSync />
      {children}
    </ThemeProvider>
  )
}
