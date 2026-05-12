'use client'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useAppStore } from '@/stores/appStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { TabBar } from '@/components/layout/TabBar'
import { RequestBuilder } from '@/components/request/RequestBuilder'
import { Zap, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

function WelcomeScreen() {
  const { openNewTab } = useAppStore()
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-6">
      <div className="w-20 h-20 rounded-2xl bg-violet-600/10 border border-violet-600/20 flex items-center justify-center">
        <Zap className="w-10 h-10 text-violet-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-foreground">Welcome to Nidaa</h2>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
          Open a request from the sidebar or create a new one to get started.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={openNewTab} className="gap-2">
          <Plus className="w-4 h-4" /> New Request
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-3 max-w-lg mt-2">
        {[
          { emoji: '📁', title: 'Collections', desc: 'Organize requests in collections' },
          { emoji: '🌍', title: 'Environments', desc: 'Use variables across requests' },
          { emoji: '📊', title: 'Monitors', desc: 'Schedule automated tests' },
        ].map((f) => (
          <div key={f.title} className="bg-card border border-border rounded-lg p-3 text-left">
            <div className="text-2xl mb-2">{f.emoji}</div>
            <p className="text-xs font-medium text-foreground">{f.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function WorkspacePage() {
  const { tabs, activeTabId } = useAppStore()
  const activeTab = tabs.find((t) => t.id === activeTabId)

  return (
    <div className="flex h-full overflow-hidden">
      <PanelGroup direction="horizontal" autoSaveId="workspace-panels">
        {/* Sidebar */}
        <Panel defaultSize={18} minSize={14} maxSize={30}>
          <Sidebar />
        </Panel>

        <PanelResizeHandle className="w-px bg-border hover:bg-violet-600/50 transition-colors cursor-col-resize" />

        {/* Main content */}
        <Panel defaultSize={82} minSize={50}>
          <div className="flex flex-col h-full overflow-hidden">
            <TabBar />
            <div className="flex-1 overflow-hidden">
              {activeTab ? (
                <RequestBuilder tab={activeTab} />
              ) : (
                <WelcomeScreen />
              )}
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  )
}
