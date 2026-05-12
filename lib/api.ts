import axios from 'axios'
import type {
  User, Workspace, Collection, Folder, ApiRequest,
  Environment, RequestHistory, Monitor, MockServer, Group, ProxyResponse
} from './types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ access_token: string; user: User }>('/auth/login', { email, password }),
  register: (name: string, email: string, password: string, password_confirmation: string) =>
    api.post<{ access_token: string; user: User }>('/auth/register', { name, email, password, password_confirmation }),
  me: () => api.get<User>('/auth/me'),
  updateProfile: (data: { name?: string; email?: string; password?: string; password_confirmation?: string }) =>
    api.put<{ data: User }>('/auth/profile', data),
  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; email: string; password: string; password_confirmation: string }) =>
    api.post<{ message: string }>('/auth/reset-password', data),
  logout: () => api.post('/auth/logout'),
}

export const workspacesApi = {
  list: () => api.get<{ data: Workspace[] }>('/workspaces'),
  get: (id: number) => api.get<Workspace>(`/workspaces/${id}`),
  create: (data: { name: string }) => api.post<Workspace>('/workspaces', data),
  update: (id: number, data: { name: string }) => api.put<Workspace>(`/workspaces/${id}`, data),
  delete: (id: number) => api.delete(`/workspaces/${id}`),
  share: (id: number, data: { group_id: number; permission: string }) =>
    api.post(`/workspaces/${id}/share`, data),
}

export const collectionsApi = {
  list: (workspaceId?: number) =>
    api.get<{ data: Collection[] }>('/collections', { params: workspaceId ? { workspace_id: workspaceId } : undefined }),
  get: (id: number) => api.get<Collection>(`/collections/${id}`),
  create: (data: Partial<Collection>) => api.post<Collection>('/collections', data),
  update: (id: number, data: Partial<Collection>) => api.put<Collection>(`/collections/${id}`, data),
  delete: (id: number) => api.delete(`/collections/${id}`),
  duplicate: (id: number) => api.post<Collection>(`/collections/${id}/duplicate`),
  export: (id: number) => api.get(`/collections/${id}/export`),
  share: (id: number, data: { user_id: number; permission: string }) =>
    api.post(`/collections/${id}/share`, data),
}

export const foldersApi = {
  list: (collectionId: number) => api.get<Folder[]>(`/collections/${collectionId}/folders`),
  create: (collectionId: number, data: Partial<Folder>) =>
    api.post<Folder>(`/collections/${collectionId}/folders`, data),
  update: (collectionId: number, folderId: number, data: Partial<Folder>) =>
    api.put<Folder>(`/collections/${collectionId}/folders/${folderId}`, data),
  delete: (collectionId: number, folderId: number) =>
    api.delete(`/collections/${collectionId}/folders/${folderId}`),
  reorder: (collectionId: number, items: { id: number; sort_order: number }[]) =>
    api.post(`/collections/${collectionId}/reorder-folders`, { items }),
}

export const requestsApi = {
  list: (collectionId: number) => api.get<ApiRequest[]>(`/collections/${collectionId}/requests`),
  create: (collectionId: number, data: Partial<ApiRequest>) =>
    api.post<ApiRequest>(`/collections/${collectionId}/requests`, data),
  update: (collectionId: number, requestId: number, data: Partial<ApiRequest>) =>
    api.put<ApiRequest>(`/collections/${collectionId}/requests/${requestId}`, data),
  delete: (collectionId: number, requestId: number) =>
    api.delete(`/collections/${collectionId}/requests/${requestId}`),
  duplicate: (collectionId: number, requestId: number) =>
    api.post<ApiRequest>(`/collections/${collectionId}/requests/${requestId}/duplicate`),
  reorder: (collectionId: number, items: { id: number; sort_order: number }[]) =>
    api.post(`/collections/${collectionId}/reorder-requests`, { items }),
}

export const environmentsApi = {
  list: () => api.get<{ data: Environment[] }>('/environments'),
  create: (data: Partial<Environment>) => api.post<Environment>('/environments', data),
  update: (id: number, data: Partial<Environment>) => api.put<Environment>(`/environments/${id}`, data),
  delete: (id: number) => api.delete(`/environments/${id}`),
  activate: (id: number) => api.post(`/environments/${id}/activate`),
}

export const proxyApi = {
  send: (data: {
    method: string
    url: string
    headers?: Record<string, string>
    params?: Record<string, string>
    body?: string
    body_type?: string
    auth?: Record<string, unknown>
  }) => api.post<ProxyResponse>('/proxy/send', data),
}

export const monitorsApi = {
  list: () => api.get<{ data: Monitor[] }>('/monitors'),
  create: (data: Partial<Monitor>) => api.post<{ data: Monitor }>('/monitors', data),
  update: (id: number, data: Partial<Monitor>) => api.put<{ data: Monitor }>(`/monitors/${id}`, data),
  delete: (id: number) => api.delete(`/monitors/${id}`),
  run: (id: number) => api.post(`/monitors/${id}/run`),
  results: (id: number) => api.get(`/monitors/${id}/results`),
}

export const mockServersApi = {
  list: () => api.get<{ data: MockServer[] }>('/mock-servers'),
  create: (data: Partial<MockServer>) => api.post<{ data: MockServer }>('/mock-servers', data),
  update: (id: number, data: Partial<MockServer>) => api.put<{ data: MockServer }>(`/mock-servers/${id}`, data),
  delete: (id: number) => api.delete(`/mock-servers/${id}`),
}

export const groupsApi = {
  list: () => api.get<{ data: Group[] }>('/groups'),
  get: (id: number) => api.get<Group>(`/groups/${id}`),
  create: (data: { name: string }) => api.post<Group>('/groups', data),
  addUser: (groupId: number, data: { email: string }) => api.post(`/groups/${groupId}/users`, data),
}

export const historyApi = {
  list: () => api.get<{ data: RequestHistory[] }>('/history'),
}

export default api
