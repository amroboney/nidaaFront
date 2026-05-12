'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight, Loader2, Code2 } from 'lucide-react'
import { toast } from 'sonner'
import { mockServersApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import type { MockServer } from '@/lib/types'

export default function MocksPage() {
  const [servers, setServers] = useState<MockServer[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', base_path: '' })

  useEffect(() => {
    mockServersApi.list().then(({ data }) => setServers(data.data ?? data)).catch(() => toast.error('Failed to load mock servers')).finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data } = await mockServersApi.create({ name: form.name, base_path: form.base_path, is_active: true, responses: [] })
      setServers((s) => [...s, data.data ?? data])
      toast.success('Mock server created')
      setModalOpen(false)
      setForm({ name: '', base_path: '' })
    } catch {
      toast.error('Failed to create mock server')
    }
  }

  const toggleActive = async (server: MockServer) => {
    try {
      const { data } = await mockServersApi.update(server.id, { is_active: !server.is_active })
      setServers((s) => s.map((x) => (x.id === server.id ? (data.data ?? data) : x)))
    } catch {
      toast.error('Failed to update')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await mockServersApi.delete(id)
      setServers((s) => s.filter((x) => x.id !== id))
      toast.success('Mock server deleted')
    } catch {
      toast.error('Failed to delete')
    }
    setDeleteId(null)
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mock Servers</h1>
            <p className="text-sm text-muted-foreground mt-1">Simulate API responses for development</p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Mock Server
          </Button>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
          </div>
        )}

        {!loading && servers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-3xl mb-4">🎭</div>
            <h3 className="text-lg font-semibold text-foreground">No mock servers</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Create a mock server to simulate API responses</p>
            <Button onClick={() => setModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Create mock server
            </Button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {servers.map((server) => (
            <div key={server.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{server.name}</h3>
                  <code className="text-xs text-muted-foreground mt-0.5 block font-mono">/{server.base_path}</code>
                </div>
                <Badge variant={server.is_active ? 'default' : 'secondary'}>
                  {server.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Code2 className="w-3.5 h-3.5" />
                {server.responses?.length ?? 0} response{(server.responses?.length ?? 0) !== 1 ? 's' : ''} configured
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleActive(server)}
                  className="gap-1.5"
                >
                  {server.is_active
                    ? <><ToggleRight className="w-3.5 h-3.5 text-emerald-400" /> Disable</>
                    : <><ToggleLeft className="w-3.5 h-3.5" /> Enable</>
                  }
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteId(server.id)}
                  className="text-red-400 hover:text-red-400 hover:bg-red-500/10 ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New mock server</DialogTitle>
            <DialogDescription>Create a server to simulate API responses</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="p-6 pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Payment API Mock" autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label>Base path *</Label>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground">/</span>
                <Input
                  value={form.base_path}
                  onChange={(e) => setForm((f) => ({ ...f, base_path: e.target.value.replace(/^\//, '') }))}
                  placeholder="payments-v1"
                  className="font-mono"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!form.name || !form.base_path}>Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete mock server?</AlertDialogTitle>
            <AlertDialogDescription>All configured responses will be lost.</AlertDialogDescription>
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
