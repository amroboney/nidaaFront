'use client'
import { useState } from 'react'
import { Plus, Pencil, Trash2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useAppStore } from '@/stores/appStore'
import { Button } from '@/components/ui/button'
import { EnvironmentModal } from '@/components/modals/EnvironmentModal'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import type { Environment } from '@/lib/types'

export function EnvironmentList() {
  const { environments, activeEnvId, activateEnvironment, deleteEnvironment } = useAppStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editEnv, setEditEnv] = useState<Environment | undefined>()
  const [deleteEnv, setDeleteEnv] = useState<Environment | null>(null)

  return (
    <>
      <div className="space-y-1">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-xs font-medium text-muted-foreground">Environments</span>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => { setEditEnv(undefined); setModalOpen(true) }}
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>

        {environments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm font-medium text-foreground">No environments</p>
            <p className="text-xs text-muted-foreground mt-1">Click + to create one</p>
          </div>
        )}

        {environments.map((env) => (
          <div
            key={env.id}
            className={cn(
              'group flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors cursor-pointer',
              env.id === activeEnvId && 'bg-accent/50'
            )}
            onClick={async () => { try { await activateEnvironment(env.id) } catch { toast.error('Failed to activate environment') } }}
          >
            <span className={cn('w-2 h-2 rounded-full shrink-0', env.id === activeEnvId ? 'bg-emerald-400' : 'bg-zinc-600')} />
            <span className="text-xs text-foreground truncate flex-1">{env.name}</span>
            {env.id === activeEnvId && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
            <button
              onClick={(e) => { e.stopPropagation(); setEditEnv(env); setModalOpen(true) }}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setDeleteEnv(env) }}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      <EnvironmentModal
        open={modalOpen}
        environment={editEnv}
        onClose={() => { setModalOpen(false); setEditEnv(undefined) }}
      />

      <AlertDialog open={!!deleteEnv} onOpenChange={(open) => !open && setDeleteEnv(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete environment?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleteEnv?.name}&quot; will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (deleteEnv) {
                try { await deleteEnvironment(deleteEnv.id); toast.success('Environment deleted') }
                catch { toast.error('Failed to delete environment') }
              }
              setDeleteEnv(null)
            }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
