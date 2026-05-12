export interface User {
  id: number
  name: string
  email: string
  created_at: string
}

export interface Workspace {
  id: number
  name: string
  user_id: number
  created_at: string
  updated_at: string
}

export interface Collection {
  id: number
  name: string
  description?: string
  color?: string
  user_id: number
  workspace_id: number
  requests?: ApiRequest[]
  folders?: Folder[]
  created_at: string
  updated_at: string
}

export interface Folder {
  id: number
  name: string
  collection_id: number
  parent_id?: number
  requests?: ApiRequest[]
  folders?: Folder[]
  created_at: string
  updated_at: string
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export interface KVPair {
  key: string
  value: string
  enabled?: boolean
  type?: 'text' | 'file'
}

export interface AuthConfig {
  type: 'none' | 'bearer' | 'basic' | 'api_key'
  token?: string
  username?: string
  password?: string
  key?: string
  value?: string
  in?: 'header' | 'query'
}

export interface ApiRequest {
  id: number
  collection_id: number
  folder_id?: number
  name: string
  method: HttpMethod
  url: string
  headers?: KVPair[]
  params?: KVPair[]
  auth?: AuthConfig
  body?: string
  body_type?: 'json' | 'form' | 'raw' | 'none'
  pre_script?: string
  test_script?: string
  description?: string
  sort_order?: number
  created_at: string
  updated_at: string
}

export interface Environment {
  id: number
  name: string
  workspace_id: number
  variables: KVPair[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RequestHistory {
  id: number
  api_request_id?: number
  collection_id?: number
  url: string
  method: HttpMethod
  request_headers?: Record<string, string>
  request_body?: string
  status_code?: number
  response_headers?: Record<string, string>
  response_body?: string
  duration_ms?: number
  size_bytes?: number
  error_message?: string
  created_at: string
}

export interface Monitor {
  id: number
  name: string
  collection_id: number
  schedule: string
  is_active: boolean
  last_result?: Record<string, unknown>
  last_run_at?: string
  created_at: string
  updated_at: string
}

export interface MockServer {
  id: number
  name: string
  base_path: string
  is_active: boolean
  responses: MockResponse[]
  created_at: string
  updated_at: string
}

export interface MockResponse {
  method: HttpMethod
  path: string
  status_code: number
  body: string
  headers?: Record<string, string>
}

export interface Group {
  id: number
  name: string
  users?: User[]
  created_at: string
  updated_at: string
}

export interface ProxyResponse {
  status: number
  status_text: string
  headers: Record<string, string>
  body: string
  duration_ms: number
  size_bytes: number
}

export interface Tab {
  id: string | number
  name: string
  method: HttpMethod
  url: string
  collection_id?: number
  folder_id?: number
  headers: KVPair[]
  params: KVPair[]
  auth: AuthConfig
  body: string
  body_type: 'json' | 'form' | 'raw' | 'none'
  pre_script: string
  test_script: string
  description: string
  _dirty: boolean
  _sending: boolean
  _response?: ProxyResponse | null
  _error?: string | null
  _isNew?: boolean
}
