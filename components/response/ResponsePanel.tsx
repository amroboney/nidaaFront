'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Copy, Check } from 'lucide-react'
import { oneDark } from '@codemirror/theme-one-dark'
import { json } from '@codemirror/lang-json'
import { Button } from '@/components/ui/button'
import { cn, getStatusBg, formatBytes, formatDuration, tryPrettyJson, isJson } from '@/lib/utils'
import type { Tab } from '@/lib/types'

const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), { ssr: false })

interface Props {
  tab: Tab
}

type ResponseTab = 'Body' | 'Headers' | 'Preview'

export function ResponsePanel({ tab }: Props) {
  const [activeTab, setActiveTab] = useState<ResponseTab>('Body')
  const [copied, setCopied] = useState(false)

  const { _response: res, _sending, _error } = tab

  const copy = async () => {
    if (!res?.body) return
    await navigator.clipboard.writeText(res.body)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (_sending) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Sending request…</p>
      </div>
    )
  }

  if (_error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-2 px-8">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-2xl">⚠️</div>
        <p className="text-sm font-medium text-red-400">Request failed</p>
        <p className="text-xs text-muted-foreground font-mono">{_error}</p>
      </div>
    )
  }

  if (!res) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-3xl">🚀</div>
        <p className="text-sm font-medium text-foreground">Send a request</p>
        <p className="text-xs text-muted-foreground">Hit Send to see the response here</p>
      </div>
    )
  }

  const prettyBody = tryPrettyJson(res.body)
  const bodyIsJson = isJson(res.body)
  const responseHeaders = Object.entries(res.headers ?? {})

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Status bar */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-border bg-background/30 shrink-0">
        <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-mono font-semibold', getStatusBg(res.status))}>
          {res.status} {res.status_text}
        </span>
        <span className="text-xs text-muted-foreground">{formatDuration(res.duration_ms)}</span>
        <span className="text-xs text-muted-foreground">{formatBytes(res.size_bytes)}</span>
        <div className="flex-1" />

        {/* Tab nav */}
        {(['Body', 'Headers', 'Preview'] as ResponseTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={cn(
              'text-xs font-medium px-2 py-1 rounded transition-colors',
              activeTab === t ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t}
            {t === 'Headers' && ` (${responseHeaders.length})`}
          </button>
        ))}

        <Button variant="ghost" size="xs" onClick={copy}>
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'Body' && (
          <CodeMirror
            value={prettyBody}
            theme={oneDark}
            extensions={bodyIsJson ? [json()] : []}
            editable={false}
            height="100%"
            basicSetup={{ lineNumbers: true, foldGutter: bodyIsJson }}
            style={{ fontSize: '12px', height: '100%' }}
          />
        )}

        {activeTab === 'Headers' && (
          <div className="overflow-auto h-full p-3 space-y-1">
            {responseHeaders.length === 0 && (
              <p className="text-xs text-muted-foreground">No headers</p>
            )}
            {responseHeaders.map(([key, value]) => (
              <div key={key} className="flex items-start gap-3 py-1 border-b border-border/50 last:border-0">
                <span className="text-xs font-mono font-medium text-violet-400 shrink-0">{key}</span>
                <span className="text-xs font-mono text-muted-foreground break-all">{value}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Preview' && (
          <iframe
            srcDoc={res.body}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts"
            title="Response preview"
          />
        )}
      </div>
    </div>
  )
}
