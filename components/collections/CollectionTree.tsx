'use client'
import { useAppStore } from '@/stores/appStore'
import { CollectionItem } from './CollectionItem'

export function CollectionTree() {
  const { collections, sidebarSearch } = useAppStore()

  const filtered = sidebarSearch
    ? collections.filter(
        (c) =>
          c.name.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
          c.requests?.some((r) => r.name.toLowerCase().includes(sidebarSearch.toLowerCase()))
      )
    : collections

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
          <span className="text-2xl">📁</span>
        </div>
        <p className="text-sm font-medium text-foreground">No collections</p>
        <p className="text-xs text-muted-foreground mt-1">Click + to create one</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {filtered.map((col) => (
        <CollectionItem key={col.id} collection={col} />
      ))}
    </div>
  )
}
