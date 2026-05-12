'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'sonner'
import {
  workspacesApi, collectionsApi, foldersApi, requestsApi,
  environmentsApi, proxyApi, historyApi,
} from '@/lib/api'
import { kvToObject, resolveVars } from '@/lib/utils'
import type {
  Workspace, Collection, Environment, RequestHistory,
  ApiRequest, Folder, Tab, HttpMethod, KVPair, AuthConfig,
} from '@/lib/types'

function removeFolderRequest(folders: Folder[], requestId: number): Folder[] {
  return folders.map((f) => ({
    ...f,
    requests: (f.requests ?? []).filter((r) => r.id !== requestId),
    folders: f.folders ? removeFolderRequest(f.folders, requestId) : [],
  }))
}

function reorderFolderRequests(
  folders: Folder[],
  folderId: number,
  reorderFn: (reqs: ApiRequest[]) => ApiRequest[]
): Folder[] {
  return folders.map((f) => {
    if (f.id === folderId) return { ...f, requests: reorderFn(f.requests ?? []) }
    return { ...f, folders: f.folders ? reorderFolderRequests(f.folders, folderId, reorderFn) : [] }
  })
}

function updateInFolder(folders: Folder[], folderId: number, req: ApiRequest): Folder[] {
  return folders.map((f) => {
    if (f.id === folderId) {
      return { ...f, requests: (f.requests ?? []).map((r) => (r.id === req.id ? req : r)) }
    }
    return { ...f, folders: f.folders ? updateInFolder(f.folders, folderId, req) : [] }
  })
}

function addToFolder(folders: Folder[], folderId: number, req: ApiRequest): Folder[] {
  return folders.map((f) => {
    if (f.id === folderId) {
      const without = (f.requests ?? []).filter((r) => r.id !== req.id)
      return { ...f, requests: [...without, req] }
    }
    return { ...f, folders: f.folders ? addToFolder(f.folders, folderId, req) : [] }
  })
}

function makeTab(req: Partial<ApiRequest> & { _isNew?: boolean }): Tab {
  return {
    id: req.id ?? `new-${Date.now()}`,
    name: req.name ?? 'New Request',
    method: (req.method as HttpMethod) ?? 'GET',
    url: req.url ?? '',
    collection_id: req.collection_id,
    folder_id: req.folder_id,
    headers: req.headers ?? [],
    params: req.params ?? [],
    auth: req.auth ?? { type: 'none' },
    body: req.body ?? '',
    body_type: req.body_type ?? 'none',
    pre_script: req.pre_script ?? '',
    test_script: req.test_script ?? '',
    description: req.description ?? '',
    _dirty: false,
    _sending: false,
    _response: null,
    _error: null,
    _isNew: req._isNew ?? false,
  }
}

interface AppState {
  // Data
  workspaces: Workspace[]
  collections: Collection[]
  environments: Environment[]
  history: RequestHistory[]
  // Active state
  activeWorkspaceId: number | null
  activeEnvId: number | null
  // Tabs
  tabs: Tab[]
  activeTabId: string | number | null
  // Sidebar
  sidebarTab: 'collections' | 'environments' | 'history'
  sidebarSearch: string
  // Loading
  isInitializing: boolean

  // Init
  init: () => Promise<void>
  // Workspaces
  setActiveWorkspace: (id: number) => Promise<void>
  createWorkspace: (name: string) => Promise<Workspace>
  // Collections
  createCollection: (data: Partial<Collection>) => Promise<Collection>
  updateCollection: (id: number, data: Partial<Collection>) => Promise<void>
  deleteCollection: (id: number) => Promise<void>
  duplicateCollection: (id: number) => Promise<void>
  // Folders
  createFolder: (collectionId: number, data: Partial<Folder>) => Promise<Folder>
  updateFolder: (collectionId: number, folderId: number, data: Partial<Folder>) => Promise<void>
  deleteFolder: (collectionId: number, folderId: number) => Promise<void>
  // Requests
  createRequest: (collectionId: number, data: Partial<ApiRequest>) => Promise<ApiRequest>
  updateRequest: (collectionId: number, requestId: number, data: Partial<ApiRequest>) => Promise<void>
  deleteRequest: (collectionId: number, requestId: number) => Promise<void>
  moveRequest: (requestId: number, fromCollectionId: number, toCollectionId: number, toFolderId: number | null) => Promise<void>
  reorderRequests: (collectionId: number, folderId: number | null, orderedIds: number[]) => Promise<void>
  reorderFolders: (collectionId: number, orderedIds: number[]) => Promise<void>
  // Environments
  createEnvironment: (data: Partial<Environment>) => Promise<void>
  updateEnvironment: (id: number, data: Partial<Environment>) => Promise<void>
  deleteEnvironment: (id: number) => Promise<void>
  activateEnvironment: (id: number) => Promise<void>
  // Tabs
  openTab: (req: ApiRequest) => void
  openNewTab: () => void
  closeTab: (id: string | number) => void
  setActiveTab: (id: string | number) => void
  updateTab: (id: string | number, patch: Partial<Tab>) => void
  saveTab: (id: string | number) => Promise<void>
  sendRequest: (id: string | number) => Promise<void>
  // Sidebar
  setSidebarTab: (tab: AppState['sidebarTab']) => void
  setSidebarSearch: (q: string) => void
  fetchHistory: () => Promise<void>
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      collections: [],
      environments: [],
      history: [],
      activeWorkspaceId: null,
      activeEnvId: null,
      tabs: [],
      activeTabId: null,
      sidebarTab: 'collections',
      sidebarSearch: '',
      isInitializing: false,

      init: async () => {
        set({ isInitializing: true })
        try {
          const [wsRes, envRes] = await Promise.all([
            workspacesApi.list(),
            environmentsApi.list(),
          ])
          const workspaces = wsRes.data.data
          const environments = envRes.data.data
          const activeWorkspaceId = get().activeWorkspaceId ?? workspaces[0]?.id ?? null
          const activeEnvId = get().activeEnvId ?? environments.find((e: Environment) => e.is_active)?.id ?? null

          let collections: Collection[] = []
          if (activeWorkspaceId) {
            const colRes = await collectionsApi.list(activeWorkspaceId)
            collections = colRes.data.data
          }

          set({ workspaces, collections, environments, activeWorkspaceId, activeEnvId, isInitializing: false })
        } catch {
          set({ isInitializing: false })
          toast.error('Failed to load workspace data')
        }
      },

      setActiveWorkspace: async (id) => {
        set({ activeWorkspaceId: id, isInitializing: true })
        try {
          const { data } = await collectionsApi.list(id)
          set({ collections: data.data, isInitializing: false })
        } catch {
          set({ isInitializing: false })
          toast.error('Failed to load collections')
        }
      },

      createWorkspace: async (name) => {
        const { data } = await workspacesApi.create({ name })
        set((s) => ({ workspaces: [...s.workspaces, data] }))
        return data
      },

      createCollection: async (data) => {
        const wsId = get().activeWorkspaceId
        const { data: col } = await collectionsApi.create({ ...data, workspace_id: wsId ?? undefined })
        set((s) => ({ collections: [...s.collections, col] }))
        return col
      },

      updateCollection: async (id, data) => {
        const { data: updated } = await collectionsApi.update(id, data)
        set((s) => ({
          collections: s.collections.map((c) => (c.id === id ? updated : c)),
        }))
      },

      deleteCollection: async (id) => {
        await collectionsApi.delete(id)
        set((s) => ({ collections: s.collections.filter((c) => c.id !== id) }))
      },

      duplicateCollection: async (id) => {
        const { data } = await collectionsApi.duplicate(id)
        set((s) => ({ collections: [...s.collections, data] }))
      },

      createFolder: async (collectionId, data) => {
        const { data: folder } = await foldersApi.create(collectionId, data)
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId
              ? { ...c, folders: [...(c.folders ?? []), folder] }
              : c
          ),
        }))
        return folder
      },

      updateFolder: async (collectionId, folderId, data) => {
        const { data: updated } = await foldersApi.update(collectionId, folderId, data)
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId
              ? { ...c, folders: (c.folders ?? []).map((f) => (f.id === folderId ? { ...f, ...updated } : f)) }
              : c
          ),
        }))
      },

      deleteFolder: async (collectionId, folderId) => {
        await foldersApi.delete(collectionId, folderId)
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId
              ? { ...c, folders: (c.folders ?? []).filter((f) => f.id !== folderId) }
              : c
          ),
        }))
      },

      createRequest: async (collectionId, data) => {
        const { data: res } = await requestsApi.create(collectionId, data)
        const req: ApiRequest = (res as any).data ?? res
        set((s) => ({
          collections: s.collections.map((c) => {
            if (c.id !== collectionId) return c
            const updatedFolders = req.folder_id
              ? addToFolder(c.folders ?? [], req.folder_id, req)
              : c.folders ?? []
            return { ...c, requests: [...(c.requests ?? []), req], folders: updatedFolders }
          }),
        }))
        return req
      },

      updateRequest: async (collectionId, requestId, data) => {
        const { data: res } = await requestsApi.update(collectionId, requestId, data)
        const updated: ApiRequest = (res as any).data ?? res
        set((s) => ({
          collections: s.collections.map((c) => {
            if (c.id !== collectionId) return c
            const updatedFolders = updated.folder_id
              ? updateInFolder(c.folders ?? [], updated.folder_id, updated)
              : c.folders ?? []
            return {
              ...c,
              requests: (c.requests ?? []).map((r) => (r.id === requestId ? updated : r)),
              folders: updatedFolders,
            }
          }),
        }))
      },

      deleteRequest: async (collectionId, requestId) => {
        await requestsApi.delete(collectionId, requestId)
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId
              ? { ...c, requests: (c.requests ?? []).filter((r) => r.id !== requestId) }
              : c
          ),
          tabs: s.tabs.filter((t) => t.id !== requestId),
          activeTabId: s.activeTabId === requestId ? (s.tabs.find((t) => t.id !== requestId)?.id ?? null) : s.activeTabId,
        }))
      },

      moveRequest: async (requestId, fromCollectionId, toCollectionId, toFolderId) => {
        const { data } = await requestsApi.update(fromCollectionId, requestId, {
          collection_id: toCollectionId,
          folder_id: toFolderId ?? undefined,
        })
        const updatedReq: ApiRequest = { ...((data as any).data ?? data), folder_id: toFolderId }

        set((s) => ({
          collections: s.collections.map((c) => {
            if (c.id === fromCollectionId && fromCollectionId !== toCollectionId) {
              return {
                ...c,
                requests: (c.requests ?? []).filter((r) => r.id !== requestId),
                folders: removeFolderRequest(c.folders ?? [], requestId),
              }
            }
            if (c.id === toCollectionId) {
              // Update flat requests list
              const flatWithout = (c.requests ?? []).filter((r) => r.id !== requestId)
              // Update nested folder requests
              let updatedFolders = removeFolderRequest(c.folders ?? [], requestId)
              if (toFolderId) {
                updatedFolders = addToFolder(updatedFolders, toFolderId, updatedReq)
              }
              return {
                ...c,
                requests: [...flatWithout, updatedReq],
                folders: updatedFolders,
              }
            }
            return c
          }),
        }))
      },

      reorderRequests: async (collectionId, folderId, orderedIds) => {
        const items = orderedIds.map((id, i) => ({ id, sort_order: i }))
        await requestsApi.reorder(collectionId, items)
        set((s) => ({
          collections: s.collections.map((c) => {
            if (c.id !== collectionId) return c
            const reorderList = (reqs: ApiRequest[]) =>
              [...reqs].sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id))
            if (folderId === null) {
              return { ...c, requests: reorderList(c.requests ?? []) }
            }
            return {
              ...c,
              folders: reorderFolderRequests(c.folders ?? [], folderId, reorderList),
            }
          }),
        }))
      },

      reorderFolders: async (collectionId, orderedIds) => {
        const items = orderedIds.map((id, i) => ({ id, sort_order: i }))
        await foldersApi.reorder(collectionId, items)
        set((s) => ({
          collections: s.collections.map((c) => {
            if (c.id !== collectionId) return c
            const sorted = [...(c.folders ?? [])].sort(
              (a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id)
            )
            return { ...c, folders: sorted }
          }),
        }))
      },

      createEnvironment: async (data) => {
        const wsId = get().activeWorkspaceId
        const { data: env } = await environmentsApi.create({ ...data, workspace_id: wsId ?? undefined })
        set((s) => ({ environments: [...s.environments, env] }))
      },

      updateEnvironment: async (id, data) => {
        const { data: updated } = await environmentsApi.update(id, data)
        set((s) => ({ environments: s.environments.map((e) => (e.id === id ? updated : e)) }))
      },

      deleteEnvironment: async (id) => {
        await environmentsApi.delete(id)
        set((s) => ({
          environments: s.environments.filter((e) => e.id !== id),
          activeEnvId: s.activeEnvId === id ? null : s.activeEnvId,
        }))
      },

      activateEnvironment: async (id) => {
        await environmentsApi.activate(id)
        set((s) => ({
          activeEnvId: id,
          environments: s.environments.map((e) => ({ ...e, is_active: e.id === id })),
        }))
      },

      openTab: (req) => {
        const existing = get().tabs.find((t) => t.id === req.id)
        if (existing) {
          set({ activeTabId: req.id })
          return
        }
        const tab = makeTab(req)
        set((s) => ({ tabs: [...s.tabs, tab], activeTabId: tab.id }))
      },

      openNewTab: () => {
        const tab = makeTab({ _isNew: true })
        set((s) => ({ tabs: [...s.tabs, tab], activeTabId: tab.id }))
      },

      closeTab: (id) => {
        set((s) => {
          const idx = s.tabs.findIndex((t) => t.id === id)
          const newTabs = s.tabs.filter((t) => t.id !== id)
          const newActiveId =
            s.activeTabId === id
              ? newTabs[Math.max(0, idx - 1)]?.id ?? null
              : s.activeTabId
          return { tabs: newTabs, activeTabId: newActiveId }
        })
      },

      setActiveTab: (id) => set({ activeTabId: id }),

      updateTab: (id, patch) => {
        set((s) => ({
          tabs: s.tabs.map((t) =>
            t.id === id ? { ...t, ...patch, _dirty: true } : t
          ),
        }))
      },

      saveTab: async (id) => {
        const tab = get().tabs.find((t) => t.id === id)
        if (!tab) return
        const payload: Partial<ApiRequest> = {
          name: tab.name,
          method: tab.method,
          url: tab.url,
          headers: tab.headers,
          params: tab.params,
          auth: tab.auth,
          body: tab.body,
          body_type: tab.body_type,
          pre_script: tab.pre_script,
          test_script: tab.test_script,
          description: tab.description,
          folder_id: tab.folder_id,
        }
        if (tab._isNew || typeof id === 'string') {
          if (!tab.collection_id) return
          const saved = await get().createRequest(tab.collection_id, payload)
          set((s) => ({
            tabs: s.tabs.map((t) =>
              t.id === id ? { ...t, id: saved.id, _dirty: false, _isNew: false } : t
            ),
            activeTabId: saved.id,
          }))
        } else {
          if (!tab.collection_id) return
          await get().updateRequest(tab.collection_id, id as number, payload)
          set((s) => ({
            tabs: s.tabs.map((t) => (t.id === id ? { ...t, _dirty: false } : t)),
          }))
        }
      },

      sendRequest: async (id) => {
        const tab = get().tabs.find((t) => t.id === id)
        if (!tab) return

        const envVars = (() => {
          const { activeEnvId, environments } = get()
          return environments.find((e) => e.id === activeEnvId)?.variables ?? []
        })()

        const resolvedUrl = resolveVars(tab.url, envVars)
        const headers = kvToObject(
          tab.headers.map((h) => ({ ...h, value: resolveVars(h.value, envVars) }))
        )
        const params = kvToObject(
          tab.params.map((p) => ({ ...p, value: resolveVars(p.value, envVars) }))
        )
        const body = resolveVars(tab.body, envVars)

        set((s) => ({
          tabs: s.tabs.map((t) =>
            t.id === id ? { ...t, _sending: true, _error: null, _response: null } : t
          ),
        }))

        try {
          const { data } = await proxyApi.send({
            method: tab.method,
            url: resolvedUrl,
            headers,
            params,
            body: tab.body_type !== 'none' ? body : undefined,
            body_type: tab.body_type,
            auth: tab.auth as unknown as Record<string, unknown>,
          })
          set((s) => ({
            tabs: s.tabs.map((t) =>
              t.id === id ? { ...t, _sending: false, _response: data } : t
            ),
          }))
          get().fetchHistory()
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Request failed'
          set((s) => ({
            tabs: s.tabs.map((t) =>
              t.id === id ? { ...t, _sending: false, _error: msg } : t
            ),
          }))
        }
      },

      setSidebarTab: (tab) => set({ sidebarTab: tab }),
      setSidebarSearch: (q) => set({ sidebarSearch: q }),

      fetchHistory: async () => {
        try {
          const { data } = await historyApi.list()
          set({ history: data.data })
        } catch {}
      },
    }),
    {
      name: 'app-store',
      partialize: (s) => ({
        activeWorkspaceId: s.activeWorkspaceId,
        activeEnvId: s.activeEnvId,
        sidebarTab: s.sidebarTab,
      }),
    }
  )
)
