'use client'
import { useEffect } from 'react'
import { useAppStore } from '@/stores/appStore'
import { cn, getMethodBg, getStatusColor } from '@/lib/utils'
import type { RequestHistory } from '@/lib/types'

function HistoryRow({ item }: { item: RequestHistory }) {
  const { openTab } = useAppStore()

  const handleClick = () => {
    openTab({
      id: Date.now(),
      collection_id: item.collection_id ?? 0,
      name: `${item.method} ${item.url}`,
      method: item.method,
      url: item.url,
      headers: [],
      params: [],
      created_at: item.created_at,
      updated_at: item.created_at,
    })
  }

  const time = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      onClick={handleClick}
      className="group flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors cursor-pointer"
    >
      <span className={cn('text-[9px] font-mono font-bold px-1 py-0.5 rounded border shrink-0', getMethodBg(item.method))}>
        {item.method.slice(0, 3)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground truncate">{item.url}</p>
        <div className="flex items-center gap-2">
          <span className={cn('text-[10px] font-mono', item.status_code ? getStatusColor(item.status_code) : 'text-muted-foreground')}>
            {item.status_code ?? '—'}
          </span>
          <span className="text-[10px] text-muted-foreground">{time}</span>
          {item.duration_ms != null && (
            <span className="text-[10px] text-muted-foreground">{item.duration_ms}ms</span>
          )}
        </div>
      </div>
    </div>
  )
}

export function HistoryList() {
  const { history, fetchHistory } = useAppStore()

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm font-medium text-foreground">No history</p>
        <p className="text-xs text-muted-foreground mt-1">Sent requests appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      {history.map((item) => (
        <HistoryRow key={item.id} item={item} />
      ))}
    </div>
  )
}
