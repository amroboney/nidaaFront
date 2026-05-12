'use client'
import { useState } from 'react'
import { Search, Plus, FolderOpen, Globe, History, Clock } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { CollectionTree } from '@/components/collections/CollectionTree'
import { EnvironmentList } from '@/components/sidebar/EnvironmentList'
import { HistoryList } from '@/components/sidebar/HistoryList'
import { CollectionModal } from '@/components/modals/CollectionModal'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'collections', label: 'Collections', icon: FolderOpen },
  { id: 'environments', label: 'Environments', icon: Globe },
  { id: 'history', label: 'History', icon: History },
] as const

export function Sidebar() {
  const { sidebarTab, setSidebarTab, sidebarSearch, setSidebarSearch, openNewTab } = useAppStore()
  const [colModalOpen, setColModalOpen] = useState(false)

  return (
    <>
      <aside className="flex flex-col h-full bg-sidebar border-r border-sidebar-border w-full">
        {/* Tab bar */}
        <div className="flex items-center border-b border-sidebar-border">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setSidebarTab(t.id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
                sidebarTab === t.id
                  ? 'text-violet-400 border-b-2 border-violet-600'
                  : 'text-muted-foreground hover:text-foreground border-b-2 border-transparent'
              )}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Actions bar */}
        <div className="flex items-center gap-1.5 p-2 border-b border-sidebar-border">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-secondary/50 border border-border rounded-md pl-7 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          {sidebarTab === 'collections' && (
            <Button size="icon" variant="ghost" onClick={() => setColModalOpen(true)} className="shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          )}
          {sidebarTab === 'history' && (
            <Button size="icon" variant="ghost" onClick={openNewTab} className="shrink-0">
              <Clock className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-1.5">
            {sidebarTab === 'collections' && <CollectionTree />}
            {sidebarTab === 'environments' && <EnvironmentList />}
            {sidebarTab === 'history' && <HistoryList />}
          </div>
        </ScrollArea>
      </aside>

      <CollectionModal open={colModalOpen} onClose={() => setColModalOpen(false)} />
    </>
  )
}
