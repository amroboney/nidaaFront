'use client'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KVPair } from '@/lib/types'

interface Props {
  pairs: KVPair[]
  onChange: (pairs: KVPair[]) => void
  keyPlaceholder?: string
  valuePlaceholder?: string
}

export function KVEditor({ pairs, onChange, keyPlaceholder = 'Key', valuePlaceholder = 'Value' }: Props) {
  const add = () => onChange([...pairs, { key: '', value: '', enabled: true }])

  const update = (i: number, patch: Partial<KVPair>) => {
    const next = pairs.map((p, idx) => (idx === i ? { ...p, ...patch } : p))
    onChange(next)
  }

  const remove = (i: number) => onChange(pairs.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-1">
      {pairs.length > 0 && (
        <div className="grid grid-cols-[1rem_1fr_1fr_1.5rem] gap-1.5 px-2 py-1">
          <div />
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Key</span>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Value</span>
          <div />
        </div>
      )}

      {pairs.map((pair, i) => (
        <div key={i} className="grid grid-cols-[1rem_1fr_1fr_1.5rem] gap-1.5 items-center px-2">
          <input
            type="checkbox"
            checked={pair.enabled !== false}
            onChange={(e) => update(i, { enabled: e.target.checked })}
            className="w-3.5 h-3.5 rounded border-border accent-brand-600 cursor-pointer"
          />
          <input
            value={pair.key}
            onChange={(e) => update(i, { key: e.target.value })}
            placeholder={keyPlaceholder}
            className={cn(
              'bg-secondary border border-border rounded px-2 py-1 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring',
              pair.enabled === false && 'opacity-50'
            )}
          />
          <input
            value={pair.value}
            onChange={(e) => update(i, { value: e.target.value })}
            placeholder={valuePlaceholder}
            className={cn(
              'bg-secondary border border-border rounded px-2 py-1 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring',
              pair.enabled === false && 'opacity-50'
            )}
          />
          <button
            onClick={() => remove(i)}
            className="text-muted-foreground hover:text-red-400 transition-colors flex items-center justify-center"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      <button
        onClick={add}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Add row
      </button>
    </div>
  )
}
