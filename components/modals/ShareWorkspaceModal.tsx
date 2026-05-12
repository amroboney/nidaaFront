'use client'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { workspacesApi, groupsApi } from '@/lib/api'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { Workspace, Group } from '@/lib/types'

interface Props {
  workspace: Workspace | null
  onClose: () => void
}

export function ShareWorkspaceModal({ workspace, onClose }: Props) {
  const [groups, setGroups] = useState<Group[]>([])
  const [groupId, setGroupId] = useState('')
  const [permission, setPermission] = useState('read')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!workspace) return
    groupsApi.list().then(({ data }) => setGroups(data.data ?? data)).catch(() => {})
  }, [workspace])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspace || !groupId) return
    setLoading(true)
    try {
      await workspacesApi.share(workspace.id, { group_id: Number(groupId), permission })
      toast.success(`Workspace shared with group`)
      onClose()
    } catch {
      toast.error('Failed to share workspace')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={!!workspace} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share "{workspace?.name}"</DialogTitle>
          <DialogDescription>Share this workspace with a group</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Group</Label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Select a group…</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Permission</Label>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="read">Read</option>
              <option value="write">Write</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!groupId || loading}>
              {loading ? 'Sharing…' : 'Share workspace'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
