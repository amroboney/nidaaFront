'use client'
import { useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { SplitSquareVertical, SplitSquareHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { useAppStore } from '@/stores/appStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { UrlBar } from './UrlBar'
import { KVEditor } from './KVEditor'
import { BodyEditor } from './BodyEditor'
import { AuthEditor } from './AuthEditor'
import { ScriptEditor } from './ScriptEditor'
import { ResponsePanel } from '@/components/response/ResponsePanel'
import { cn } from '@/lib/utils'
import type { Tab } from '@/lib/types'

const requestTabs = ['Params', 'Headers', 'Body', 'Auth', 'Pre-request', 'Tests'] as const
type RequestTab = typeof requestTabs[number]

interface Props {
  tab: Tab
}

export function RequestBuilder({ tab }: Props) {
  const [activeReqTab, setActiveReqTab] = useState<RequestTab>('Params')
  const { updateTab, sendRequest, saveTab } = useAppStore()
  const { requestLayout, setRequestLayout } = useSettingsStore()

  const update = (patch: Partial<Tab>) => updateTab(tab.id, patch)

  const paramsCount = tab.params.filter((p) => p.key && p.enabled !== false).length
  const headersCount = tab.headers.filter((h) => h.key && h.enabled !== false).length

  const tabLabel = (t: RequestTab) => {
    if (t === 'Params' && paramsCount > 0) return `Params (${paramsCount})`
    if (t === 'Headers' && headersCount > 0) return `Headers (${headersCount})`
    return t
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Name bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-background/50">
        <input
          value={tab.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Request name"
          className="text-sm font-medium bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none flex-1"
        />
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => setRequestLayout('vertical')}
            title="Stack vertically"
            className={cn(
              'p-1 rounded transition-colors',
              requestLayout === 'vertical'
                ? 'text-violet-400 bg-violet-600/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <SplitSquareVertical className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRequestLayout('horizontal')}
            title="Split horizontally"
            className={cn(
              'p-1 rounded transition-colors',
              requestLayout === 'horizontal'
                ? 'text-violet-400 bg-violet-600/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <SplitSquareHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* URL bar */}
      <UrlBar
        tab={tab}
        onMethodChange={(m) => update({ method: m as Tab['method'] })}
        onUrlChange={(u) => update({ url: u })}
        onSend={() => sendRequest(tab.id)}
        onSave={async () => { try { await saveTab(tab.id) } catch { toast.error('Failed to save request') } }}
      />

      {/* Split panel */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction={requestLayout} autoSaveId={`request-panel-${tab.id}-${requestLayout}`}>
          {/* Request config */}
          <Panel defaultSize={45} minSize={25}>
            <div className="flex flex-col h-full overflow-hidden">
              {/* Tab nav */}
              <div className="flex items-center border-b border-border bg-background/30 px-2 overflow-x-auto no-scrollbar shrink-0">
                {requestTabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveReqTab(t)}
                    className={cn(
                      'px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2',
                      activeReqTab === t
                        ? 'text-foreground border-violet-600'
                        : 'text-muted-foreground border-transparent hover:text-foreground'
                    )}
                  >
                    {tabLabel(t)}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-auto">
                {activeReqTab === 'Params' && (
                  <div className="p-2">
                    <KVEditor pairs={tab.params} onChange={(p) => update({ params: p })} keyPlaceholder="Parameter" />
                  </div>
                )}
                {activeReqTab === 'Headers' && (
                  <div className="p-2">
                    <KVEditor pairs={tab.headers} onChange={(h) => update({ headers: h })} keyPlaceholder="Header name" />
                  </div>
                )}
                {activeReqTab === 'Body' && (
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border shrink-0">
                      {(['none', 'json', 'form', 'raw'] as const).map((bt) => (
                        <button
                          key={bt}
                          onClick={() => update({ body_type: bt })}
                          className={cn(
                            'px-2.5 py-0.5 rounded text-xs font-medium transition-colors',
                            tab.body_type === bt
                              ? 'bg-violet-600 text-white'
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                          )}
                        >
                          {bt === 'none' ? 'None' : bt === 'json' ? 'JSON' : bt === 'form' ? 'Form' : 'Raw'}
                        </button>
                      ))}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <BodyEditor
                        bodyType={tab.body_type}
                        body={tab.body}
                        formData={tab.params}
                        onBodyChange={(v) => update({ body: v })}
                        onFormDataChange={(p) => update({ params: p })}
                      />
                    </div>
                  </div>
                )}
                {activeReqTab === 'Auth' && (
                  <AuthEditor auth={tab.auth} onChange={(a) => update({ auth: a })} />
                )}
                {activeReqTab === 'Pre-request' && (
                  <ScriptEditor
                    value={tab.pre_script}
                    onChange={(v) => update({ pre_script: v })}
                    placeholder="// Code to run before the request&#10;// pm.environment.set('key', 'value')"
                  />
                )}
                {activeReqTab === 'Tests' && (
                  <ScriptEditor
                    value={tab.test_script}
                    onChange={(v) => update({ test_script: v })}
                    placeholder="// Test the response&#10;// pm.test('Status is 200', () => pm.response.to.have.status(200))"
                  />
                )}
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className={cn(
            'bg-border hover:bg-violet-600/50 transition-colors',
            requestLayout === 'vertical' ? 'h-px cursor-row-resize' : 'w-px cursor-col-resize'
          )} />

          {/* Response */}
          <Panel defaultSize={55} minSize={25}>
            <ResponsePanel tab={tab} />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}
