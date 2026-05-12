'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { AppHeader } from '@/components/layout/AppHeader'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, fetchUser, token } = useAuthStore()
  const { init, isInitializing } = useAppStore()

  useEffect(() => {
    const run = async () => {
      if (!token && !localStorage.getItem('auth_token')) {
        router.push('/login')
        return
      }
      if (!user) await fetchUser()
      await init()
    }
    run()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (isInitializing && !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-sm text-muted-foreground">Loading workspace…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <AppHeader />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
