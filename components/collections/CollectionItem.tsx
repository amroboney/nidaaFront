'use client'
import { useState, useRef } from 'react'
import { toast } from 'sonner'
import {
  ChevronRight, ChevronDown, MoreHorizontal, Trash2,
  Copy, FolderPlus, Edit2, Download, Folder, Plus, FolderOpen,
} from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { cn, getMethodBg } from '@/lib/utils'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { FolderModal } from '@/components/modals/FolderModal'
import type { Collection, ApiRequest, Folder as FolderType } from '@/lib/types'

interface DragData {
  requestId: number
  collectionId: number
  folderId: number | null
}

// Drop indicator line between items
function DropLine({ visible }: { visible: boolean }) {
  return (
    <div className={cn(
      'h-0.5 rounded-full mx-1 transition-all duration-100',
      visible ? 'bg-brand-600 opacity-100' : 'opacity-0'
    )} />
  )
}

// Sortable requests list — handles both reorder (same container) and cross-container moves
function SortableRequestList({
  requests,
  collectionId,
  folderId,
}: {
  requests: ApiRequest[]
  collectionId: number
  folderId: number | null
}) {
  const { reorderRequests, moveRequest } = useAppStore()
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const dragIndexRef = useRef<number | null>(null)

  const getDropIndex = (e: React.DragEvent, itemIndex: number) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    return e.clientY < midY ? itemIndex : itemIndex + 1
  }

  const handleDragOver = (e: React.DragEvent, itemIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    setDropIndex(getDropIndex(e, itemIndex))
  }

  const handleDrop = async (e: React.DragEvent, itemIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    const di = getDropIndex(e, itemIndex)
    setDropIndex(null)

    try {
      const data: DragData = JSON.parse(e.dataTransfer.getData('application/json'))
      const isSameContainer = data.collectionId === collectionId && data.folderId === folderId

      if (isSameContainer) {
        // Reorder within same list
        const srcIdx = requests.findIndex((r) => r.id === data.requestId)
        if (srcIdx === -1 || srcIdx === di || srcIdx + 1 === di) return
        const reordered = [...requests]
        const [moved] = reordered.splice(srcIdx, 1)
        reordered.splice(di > srcIdx ? di - 1 : di, 0, moved)
        await reorderRequests(collectionId, folderId, reordered.map((r) => r.id))
      } else {
        // Move to this container
        await moveRequest(data.requestId, data.collectionId, collectionId, folderId)
        toast.success(folderId ? 'Moved to folder' : 'Moved to collection root')
      }
    } catch {
      toast.error('Failed to move request')
    }
  }

  return (
    <div
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropIndex(null)
      }}
    >
      <DropLine visible={dropIndex === 0} />
      {requests.map((r, i) => (
        <div
          key={`request-${r.id}`}
          onDragOver={(e) => handleDragOver(e, i)}
          onDrop={(e) => handleDrop(e, i)}
        >
          <RequestRow req={r} collectionId={collectionId} />
          <DropLine visible={dropIndex === i + 1} />
        </div>
      ))}
    </div>
  )
}

function RequestRow({ req, collectionId }: { req: ApiRequest; collectionId: number }) {
  const { openTab, deleteRequest, updateRequest } = useAppStore()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(req.name)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragStart = (e: React.DragEvent) => {
    if (isRenaming) { e.preventDefault(); return }
    const data: DragData = { requestId: req.id, collectionId, folderId: req.folder_id ?? null }
    e.dataTransfer.setData('application/json', JSON.stringify(data))
    e.dataTransfer.effectAllowed = 'move'
  }

  const startRename = (e: React.MouseEvent) => {
    e.stopPropagation()
    setRenameValue(req.name)
    setIsRenaming(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const commitRename = async () => {
    setIsRenaming(false)
    const trimmed = renameValue.trim()
    if (!trimmed || trimmed === req.name) return
    try {
      await updateRequest(collectionId, req.id, { name: trimmed })
    } catch {
      toast.error('Failed to rename request')
    }
  }

  return (
    <>
      <div
        draggable={!isRenaming}
        onDragStart={handleDragStart}
        onClick={() => !isRenaming && openTab(req)}
        onDoubleClick={startRename}
        className="group flex items-center gap-2 px-2 py-1 rounded-md cursor-grab active:cursor-grabbing hover:bg-accent transition-colors"
      >
        <span className={cn('text-[9px] font-mono font-bold px-1 py-0.5 rounded border shrink-0', getMethodBg(req.method ?? 'GET'))}>
          {(req.method ?? 'GET').slice(0, 3)}
        </span>
        {isRenaming ? (
          <input
            ref={inputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename()
              if (e.key === 'Escape') { setRenameValue(req.name); setIsRenaming(false) }
              e.stopPropagation()
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-input border border-ring rounded px-1.5 py-0.5 text-xs text-foreground focus:outline-none min-w-0"
            autoFocus
          />
        ) : (
          <span className="text-xs text-foreground truncate flex-1">{req.name || req.url}</span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all shrink-0"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete request?</AlertDialogTitle>
            <AlertDialogDescription>&quot;{req.name}&quot; will be permanently deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { try { await deleteRequest(collectionId, req.id); toast.success('Request deleted') } catch { toast.error('Failed to delete request') } }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// Sortable folder list — handles folder reordering
function SortableFolderList({
  folders,
  collectionId,
}: {
  folders: FolderType[]
  collectionId: number
}) {
  const { reorderFolders } = useAppStore()
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const [draggingId, setDraggingId] = useState<number | null>(null)

  const getDropIndex = (e: React.DragEvent, itemIndex: number) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    return e.clientY < rect.top + rect.height / 2 ? itemIndex : itemIndex + 1
  }

  return (
    <div
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropIndex(null)
      }}
    >
      <DropLine visible={dropIndex === 0} />
      {folders.map((f, i) => (
        <div
          key={`folder-${f.id}`}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('folder-id', String(f.id))
            e.dataTransfer.effectAllowed = 'move'
            setDraggingId(f.id)
          }}
          onDragEnd={() => setDraggingId(null)}
          onDragOver={(e) => {
            if (e.dataTransfer.types.includes('folder-id')) {
              e.preventDefault()
              e.stopPropagation()
              setDropIndex(getDropIndex(e, i))
            }
          }}
          onDrop={(e) => {
            const fid = e.dataTransfer.getData('folder-id')
            if (!fid) return
            e.preventDefault()
            e.stopPropagation()
            const di = getDropIndex(e, i)
            setDropIndex(null)
            const srcIdx = folders.findIndex((x) => x.id === Number(fid))
            if (srcIdx === -1 || srcIdx === di || srcIdx + 1 === di) return
            const reordered = [...folders]
            const [moved] = reordered.splice(srcIdx, 1)
            reordered.splice(di > srcIdx ? di - 1 : di, 0, moved)
            reorderFolders(collectionId, reordered.map((x) => x.id)).catch(() =>
              toast.error('Failed to reorder folders')
            )
          }}
          className={cn(draggingId === f.id && 'opacity-40')}
        >
          <FolderRow folder={f} collectionId={collectionId} />
          <DropLine visible={dropIndex === i + 1} />
        </div>
      ))}
    </div>
  )
}

function FolderRow({ folder, collectionId }: { folder: FolderType; collectionId: number }) {
  const [open, setOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(folder.name)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const renameRef = useRef<HTMLInputElement>(null)
  const { createRequest, openTab, updateFolder, deleteFolder } = useAppStore()
  const requests = folder.requests ?? []

  const handleAddRequest = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      const req = await createRequest(collectionId, {
        name: 'New Request', method: 'GET', url: '', folder_id: folder.id,
      })
      setOpen(true)
      openTab(req)
    } catch {
      toast.error('Failed to create request')
    }
  }

  const handleRename = async () => {
    setIsRenaming(false)
    const trimmed = renameValue.trim()
    if (!trimmed || trimmed === folder.name) { setRenameValue(folder.name); return }
    try {
      await updateFolder(collectionId, folder.id, { name: trimmed })
      toast.success('Folder renamed')
    } catch {
      toast.error('Failed to rename folder')
      setRenameValue(folder.name)
    }
  }

  return (
    <>
      <div className="rounded-md">
        <div className="group flex items-center">
          <button
            onClick={() => setOpen(!open)}
            className="flex-1 flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent transition-colors text-left min-w-0"
          >
            {open
              ? <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
              : <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />}
            {open
              ? <FolderOpen className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              : <Folder className="w-3.5 h-3.5 text-yellow-400 shrink-0" />}
            {isRenaming ? (
              <input
                ref={renameRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename()
                  if (e.key === 'Escape') { setRenameValue(folder.name); setIsRenaming(false) }
                  e.stopPropagation()
                }}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 bg-input border border-ring rounded px-1.5 py-0.5 text-xs text-foreground focus:outline-none min-w-0"
                autoFocus
              />
            ) : (
              <span className="text-xs text-foreground truncate flex-1">{folder.name}</span>
            )}
            {!isRenaming && <span className="text-[10px] text-muted-foreground ml-auto pr-1">{requests.length}</span>}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); handleAddRequest() }}
            title="Add request"
            className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-all shrink-0"
          >
            <Plus className="w-3 h-3" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-all rounded shrink-0"
              >
                <MoreHorizontal className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onSelect={() => handleAddRequest()}>
                <Plus className="w-3.5 h-3.5 mr-2" /> Add request
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => {
                setRenameValue(folder.name)
                setIsRenaming(true)
                setTimeout(() => renameRef.current?.select(), 0)
              }}>
                <Edit2 className="w-3.5 h-3.5 mr-2" /> Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setDeleteOpen(true)}
                className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {open && (
          <div className="ml-4 mt-0.5 border-l border-border pl-2 pb-1">
            <SortableRequestList
              requests={requests}
              collectionId={collectionId}
              folderId={folder.id}
            />
            {folder.folders?.map((sf) => (
              <FolderRow key={`folder-${sf.id}`} folder={sf} collectionId={collectionId} />
            ))}
            {requests.length === 0 && (!folder.folders || folder.folders.length === 0) && (
              <p className="text-[10px] text-muted-foreground px-2 py-1">Empty folder</p>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete folder?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{folder.name}&quot; and all its requests will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              try { await deleteFolder(collectionId, folder.id); toast.success('Folder deleted') }
              catch { toast.error('Failed to delete folder') }
            }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function CollectionItem({ collection }: { collection: Collection }) {
  const [open, setOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(collection.name)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [folderModalOpen, setFolderModalOpen] = useState(false)
  const renameRef = useRef<HTMLInputElement>(null)

  const { updateCollection, deleteCollection, duplicateCollection, createRequest, openTab } = useAppStore()

  const rootRequests = (collection.requests ?? []).filter((r) => !r.folder_id)
  const folders = collection.folders ?? []
  const totalCount = (collection.requests ?? []).length
  const color = collection.color ?? '#6366f1'

  const handleRename = async () => {
    if (newName.trim() && newName !== collection.name) {
      try {
        await updateCollection(collection.id, { name: newName.trim() })
        toast.success('Renamed')
      } catch {
        toast.error('Failed to rename collection')
        setNewName(collection.name)
      }
    }
    setIsRenaming(false)
  }

  const handleAddRequest = async () => {
    try {
      const req = await createRequest(collection.id, { name: 'New Request', method: 'GET', url: '' })
      setOpen(true)
      openTab(req)
    } catch {
      toast.error('Failed to create request')
    }
  }

  const handleExport = async () => {
    try {
      const { collectionsApi } = await import('@/lib/api')
      const { data } = await collectionsApi.export(collection.id)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `${collection.name}.json`; a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Export failed')
    }
  }

  return (
    <>
      <div className="rounded-md overflow-hidden">
        {/* Header */}
        <div className="group flex items-center gap-1.5 px-2 py-1.5 hover:bg-accent rounded-md transition-colors cursor-pointer">
          <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 flex-1 min-w-0">
            {open
              ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
            {isRenaming ? (
              <input
                ref={renameRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename()
                  if (e.key === 'Escape') { setNewName(collection.name); setIsRenaming(false) }
                }}
                className="flex-1 bg-input border border-ring rounded px-1.5 py-0.5 text-xs text-foreground focus:outline-none"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-xs font-medium text-foreground truncate flex-1 text-left">{collection.name}</span>
            )}
          </button>

          <span className="text-[10px] text-muted-foreground">{totalCount}</span>

          <button
            onClick={(e) => { e.stopPropagation(); handleAddRequest() }}
            title="Add request"
            className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-foreground transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity rounded p-0.5"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onSelect={handleAddRequest}>
                <Plus className="w-3.5 h-3.5 mr-2" /> Add request
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { setIsRenaming(true); setOpen(true) }}>
                <Edit2 className="w-3.5 h-3.5 mr-2" /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={async () => { try { await duplicateCollection(collection.id); toast.success('Duplicated') } catch { toast.error('Failed to duplicate collection') } }}>
                <Copy className="w-3.5 h-3.5 mr-2" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setFolderModalOpen(true)}>
                <FolderPlus className="w-3.5 h-3.5 mr-2" /> Add folder
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleExport}>
                <Download className="w-3.5 h-3.5 mr-2" /> Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setDeleteOpen(true)}
                className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        {open && (
          <div className="ml-5 mt-0.5 border-l border-border pl-2 pb-1">
            <SortableFolderList folders={folders} collectionId={collection.id} />
            <SortableRequestList
              requests={rootRequests}
              collectionId={collection.id}
              folderId={null}
            />
            {rootRequests.length === 0 && folders.length === 0 && (
              <p className="text-[10px] text-muted-foreground px-2 py-1.5">No requests</p>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete collection?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{collection.name}&quot; and all its requests will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { try { await deleteCollection(collection.id); toast.success('Collection deleted') } catch { toast.error('Failed to delete collection') } }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FolderModal
        open={folderModalOpen}
        collectionId={collection.id}
        onClose={() => setFolderModalOpen(false)}
      />
    </>
  )
}
