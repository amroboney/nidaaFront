'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAppStore } from '@/stores/appStore'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { KVEditor } from '@/components/request/KVEditor'
import type { Environment, KVPair } from '@/lib/types'

interface Props {
  open: boolean
  environment?: Environment
  onClose: () => void
}

export function EnvironmentModal({ open, environment, onClose }: Props) {
  const { createEnvironment, updateEnvironment } = useAppStore()
  const [name, setName] = useState('')
  const [variables, setVariables] = useState<KVPair[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (environment) {
      setName(environment.name)
      setVariables(environment.variables ?? [])
    } else {
      setName('')
      setVariables([])
    }
  }, [environment, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      if (environment) {
        await updateEnvironment(environment.id, { name: name.trim(), variables })
        toast.success('Environment updated')
      } else {
        await createEnvironment({ name: name.trim(), variables })
        toast.success(`Environment "${name}" created`)
      }
      onClose()
    } catch {
      toast.error('Failed to save environment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{environment ? 'Edit environment' : 'New environment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Production, Staging, Local…"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Variables</Label>
            <div className="border border-border rounded-lg overflow-hidden bg-secondary/30 p-1">
              <KVEditor
                pairs={variables}
                onChange={setVariables}
                keyPlaceholder="Variable name"
                valuePlaceholder="Value"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!name.trim() || loading}>
              {loading ? 'Saving…' : environment ? 'Save changes' : 'Create environment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
