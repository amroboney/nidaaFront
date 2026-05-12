'use client'
import { useState, useEffect } from 'react'
import { Plus, Users, UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { groupsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import type { Group } from '@/lib/types'

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [addUserOpen, setAddUserOpen] = useState<Group | null>(null)
  const [name, setName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    groupsApi.list().then(({ data }) => setGroups(data.data)).catch(() => toast.error('Failed to load groups')).finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data } = await groupsApi.create({ name })
      setGroups((g) => [...g, data])
      toast.success('Group created')
      setCreateOpen(false)
      setName('')
    } catch {
      toast.error('Failed to create group')
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addUserOpen) return
    try {
      await groupsApi.addUser(addUserOpen.id, { email: userEmail })
      toast.success('User added')
      setAddUserOpen(null)
      setUserEmail('')
    } catch {
      toast.error('Failed to add user')
    }
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Groups</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage team collaboration</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Group
          </Button>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
          </div>
        )}

        {!loading && groups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-3xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-foreground">No groups yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Create groups to share workspaces with your team</p>
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Create group
            </Button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <div key={group.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-600/10 border border-violet-600/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{group.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {group.users?.length ?? 0} member{(group.users?.length ?? 0) !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {group.users && group.users.length > 0 && (
                <div className="flex -space-x-2">
                  {group.users.slice(0, 5).map((user) => (
                    <div
                      key={user.id}
                      className="w-7 h-7 rounded-full bg-violet-600/20 border-2 border-card flex items-center justify-center text-xs font-bold text-violet-400"
                      title={user.name}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {(group.users?.length ?? 0) > 5 && (
                    <div className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs text-muted-foreground">
                      +{(group.users?.length ?? 0) - 5}
                    </div>
                  )}
                </div>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => setAddUserOpen(group)}
                className="w-full gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" /> Add member
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Create group */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New group</DialogTitle>
            <DialogDescription>Create a team group for sharing workspaces</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="p-6 pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label>Group name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Frontend Team" autoFocus />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!name.trim()}>Create group</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add user */}
      <Dialog open={!!addUserOpen} onOpenChange={(o) => !o && setAddUserOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add member to {addUserOpen?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="p-6 pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label>Email address</Label>
              <Input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="teammate@example.com"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setAddUserOpen(null)}>Cancel</Button>
              <Button type="submit" disabled={!userEmail.trim()}>Add member</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
