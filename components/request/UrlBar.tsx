'use client'
import { Send, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn, getMethodColor, HTTP_METHODS } from '@/lib/utils'
import type { Tab } from '@/lib/types'

interface Props {
  tab: Tab
  onMethodChange: (m: string) => void
  onUrlChange: (u: string) => void
  onSend: () => void
  onSave: () => void
}

export function UrlBar({ tab, onMethodChange, onUrlChange, onSend, onSave }: Props) {
  return (
    <div className="flex items-center gap-2 p-3 border-b border-border bg-card">
      {/* Method */}
      <Select value={tab.method} onValueChange={onMethodChange}>
        <SelectTrigger className={cn('w-[100px] font-mono font-bold text-xs', getMethodColor(tab.method))}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {HTTP_METHODS.map((m) => (
            <SelectItem key={m} value={m} className={cn('font-mono font-bold text-xs', getMethodColor(m))}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* URL */}
      <input
        value={tab.url}
        onChange={(e) => onUrlChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSend()}
        placeholder="https://api.example.com/endpoint"
        className="flex-1 bg-secondary border border-border rounded-md px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      {/* Save */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onSave}
        disabled={!tab._dirty}
        className={cn(!tab._dirty && 'opacity-40')}
      >
        <Save className="w-4 h-4 mr-1.5" />
        Save
      </Button>

      {/* Send */}
      <Button
        size="sm"
        onClick={onSend}
        disabled={tab._sending || !tab.url}
        className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 gap-2"
      >
        {tab._sending
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending</>
          : <><Send className="w-4 h-4" /> Send</>
        }
      </Button>
    </div>
  )
}
