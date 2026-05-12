'use client'
import { useState, useEffect } from 'react'
import { Plus, Play, Trash2, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { monitorsApi } from '@/lib/api'
import { useAppStore } from '@/stores/appStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import type { Monitor } from '@/lib/types'

const SCHEDULES = [
  { label: 'Every 5 minutes', value: '*/5 * * * *' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every day', value: '0 9 * * *' },
  { label: 'Every week', value: '0 9 * * 1' },
]

export default function MonitorsPage() {
  const { collections } = useAppStore()
  const [monitors, setMonitors] = useState<Monitor[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [running, setRunning] = useState<number | null>(null)

  const [form, setForm] = useState({ name: '', collection_id: '', schedule: SCHEDULES[2].value })

  useEffect(() => {
    monitorsApi.list().then(({ data }) => setMonitors(data.data ?? [])).catch(() => toast.error('Failed to load monitors')).finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data } = await monitorsApi.create({
        name: form.name,
        collection_id: Number(form.collection_id),
        schedule: form.schedule,
        is_active: true,
      })
      setMonitors((m) => [...m, data.data])
      toast.success('Monitor created')
      setModalOpen(false)
      setForm({ name: '', collection_id: '', schedule: SCHEDULES[2].value })
    } catch {
      toast.error('Failed to create monitor')
    }
  }

  const handleRun = async (id: number) => {
    setRunning(id)
    try {
      await monitorsApi.run(id)
      toast.success('Monitor triggered')
      const { data } = await monitorsApi.list()
      setMonitors(data.data)
    } catch {
      toast.error('Failed to run monitor')
    } finally {
      setRunning(null)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await monitorsApi.delete(id)
      setMonitors((m) => m.filter((x) => x.id !== id))
      toast.success('Monitor deleted')
    } catch {
      toast.error('Failed to delete')
    }
    setDeleteId(null)
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Monitors</h1>
            <p className="text-sm text-muted-foreground mt-1">Schedule automated API checks</p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Monitor
          </Button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          </div>
        )}

        {/* Empty */}
        {!loading && monitors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-foreground">No monitors yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Create a monitor to schedule automated API testing</p>
            <Button onClick={() => setModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Create monitor
            </Button>
          </div>
        )}

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {monitors.map((monitor) => {
            const lastResult = monitor.last_result as { success?: boolean; error?: string } | undefined
            const success = lastResult?.success

            return (
              <div key={monitor.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{monitor.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">{monitor.schedule}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {lastResult != null && (
                      success
                        ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                        : <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className={cn('w-2 h-2 rounded-full', monitor.is_active ? 'bg-emerald-400' : 'bg-zinc-600')} />
                  </div>
                </div>

                {monitor.last_run_at && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Last run: {new Date(monitor.last_run_at).toLocaleString()}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRun(monitor.id)}
                    disabled={running === monitor.id}
                    className="gap-1.5"
                  >
                    {running === monitor.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Play className="w-3.5 h-3.5" />
                    }
                    Run now
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteId(monitor.id)}
                    className="text-red-400 hover:text-red-400 hover:bg-red-500/10 gap-1.5 ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Create modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New monitor</DialogTitle>
            <DialogDescription>Schedule automated collection runs</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="p-6 pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Production health check" autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label>Collection *</Label>
              <Select value={form.collection_id} onValueChange={(v) => setForm((f) => ({ ...f, collection_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select collection" /></SelectTrigger>
                <SelectContent>
                  {collections.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Schedule</Label>
              <Select value={form.schedule} onValueChange={(v) => setForm((f) => ({ ...f, schedule: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SCHEDULES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!form.name || !form.collection_id}>Create monitor</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete monitor?</AlertDialogTitle>
            <AlertDialogDescription>This monitor will be permanently deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
