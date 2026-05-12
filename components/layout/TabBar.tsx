'use client'
import { Plus, X } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { cn, getMethodColor } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab, openNewTab } = useAppStore()

  if (tabs.length === 0) return null

  return (
    <div className="flex items-center border-b border-border bg-background shrink-0 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            'group flex items-center gap-2 px-3 py-2 text-xs cursor-pointer border-r border-border shrink-0 max-w-[180px] transition-colors',
            tab.id === activeTabId
              ? 'bg-card text-foreground border-t-2 border-t-brand-600'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          )}
        >
          <span className={cn('font-mono font-bold text-[10px] shrink-0', getMethodColor(tab.method))}>
            {tab.method.slice(0, 3)}
          </span>
          <span className="truncate flex-1">
            {tab.name || tab.url || 'New Request'}
          </span>
          {tab._dirty && (
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
          )}
          <button
            onClick={(e) => { e.stopPropagation(); closeTab(tab.id) }}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity shrink-0 ml-auto"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      <Button
        variant="ghost"
        size="xs"
        onClick={openNewTab}
        className="shrink-0 ml-1 my-1"
      >
        <Plus className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}
