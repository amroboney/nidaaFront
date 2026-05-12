'use client'
import { Plus, ChevronDown, LogOut, Moon, Sun, Boxes, Share2, Settings } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { WorkspaceModal } from '@/components/modals/WorkspaceModal'
import { ShareWorkspaceModal } from '@/components/modals/ShareWorkspaceModal'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/stores/settingsStore'

const navItems = [
  { href: '/workspace', label: 'Workspace' },
  { href: '/monitors', label: 'Monitors' },
  { href: '/mocks', label: 'Mock Servers' },
  { href: '/groups', label: 'Groups' },
]

export function AppHeader() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { workspaces, activeWorkspaceId, setActiveWorkspace, environments, activeEnvId, activateEnvironment } = useAppStore()
  const [wsModalOpen, setWsModalOpen] = useState(false)
  const [shareWorkspace, setShareWorkspace] = useState<typeof activeWorkspace | null>(null)
  const { logoUrl } = useSettingsStore()

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId)
  const activeEnv = environments.find((e) => e.id === activeEnvId)

  const handleLogout = async () => {
    await logout()
    router.push('/login')
    toast.success('Signed out')
  }

  return (
    <>
      <header className="flex items-center h-12 border-b border-border bg-background/95 backdrop-blur-sm px-3 gap-3 shrink-0">
        {/* Logo */}
        <div className="flex items-center shrink-0">
          {logoUrl ? (
            <Image src={logoUrl} alt="Logo" width={28} height={28} className="w-7 h-7 rounded-md object-contain" />
          ) : (
            <>
              <Image src="/images/nidaa-logo.png" alt="Nidaa" width={90} height={28} className="h-7 w-auto object-contain block dark:hidden" priority />
              <Image src="/images/nidaa-logo-white.png" alt="Nidaa" width={90} height={28} className="h-7 w-auto object-contain hidden dark:block" priority />
            </>
          )}
        </div>

        {/* Workspace selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs max-w-[140px]">
              <Boxes className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{activeWorkspace?.name ?? 'Select workspace'}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {workspaces.map((ws) => (
              <DropdownMenuItem
                key={ws.id}
                onSelect={() => setActiveWorkspace(ws.id)}
                className={cn(ws.id === activeWorkspaceId && 'bg-accent')}
              >
                {ws.name}
              </DropdownMenuItem>
            ))}
            {activeWorkspace && (
              <DropdownMenuItem onSelect={() => setShareWorkspace(activeWorkspace)}>
                <Share2 className="w-3.5 h-3.5 mr-1" /> Share workspace
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setWsModalOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> New workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Nav */}
        <nav className="flex items-center gap-0.5 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                pathname === item.href
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Environment selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs max-w-[140px] border-dashed">
              {activeEnv && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
              <span className="truncate">{activeEnv?.name ?? 'No environment'}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Environments</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => { useAppStore.setState({ activeEnvId: null }) }}>
              <span className="text-muted-foreground">No environment</span>
            </DropdownMenuItem>
            {environments.map((env) => (
              <DropdownMenuItem
                key={env.id}
                onSelect={() => activateEnvironment(env.id)}
                className={cn(env.id === activeEnvId && 'bg-accent')}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2" />
                {env.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <Link href="/settings">
          <Button variant="ghost" size="icon" className={cn(pathname === '/settings' && 'bg-accent')}>
            <Settings className="h-4 w-4" />
          </Button>
        </Link>

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <div className="w-7 h-7 rounded-full bg-violet-600/20 border border-violet-600/30 flex items-center justify-center text-violet-400 text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="font-medium text-foreground">{user?.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout} className="text-red-400 focus:text-red-400 focus:bg-red-500/10">
              <LogOut className="w-3.5 h-3.5 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <WorkspaceModal open={wsModalOpen} onClose={() => setWsModalOpen(false)} />
      <ShareWorkspaceModal workspace={shareWorkspace ?? null} onClose={() => setShareWorkspace(null)} />
    </>
  )
}
