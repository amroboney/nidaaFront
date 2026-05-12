import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { HttpMethod, KVPair } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

export function getMethodColor(method: HttpMethod): string {
  const colors: Record<HttpMethod, string> = {
    GET: 'text-emerald-400',
    POST: 'text-blue-400',
    PUT: 'text-yellow-400',
    PATCH: 'text-purple-400',
    DELETE: 'text-red-400',
    HEAD: 'text-cyan-400',
    OPTIONS: 'text-pink-400',
  }
  return colors[method] ?? 'text-zinc-400'
}

export function getMethodBg(method: HttpMethod): string {
  const colors: Record<HttpMethod, string> = {
    GET: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    POST: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    PUT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    PATCH: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
    HEAD: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    OPTIONS: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  }
  return colors[method] ?? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
}

export function getStatusColor(status: number): string {
  if (status >= 500) return 'text-red-400'
  if (status >= 400) return 'text-yellow-400'
  if (status >= 300) return 'text-blue-400'
  if (status >= 200) return 'text-emerald-400'
  return 'text-zinc-400'
}

export function getStatusBg(status: number): string {
  if (status >= 500) return 'bg-red-500/10 text-red-400 border-red-500/20'
  if (status >= 400) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
  if (status >= 300) return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  if (status >= 200) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
}

export function kvToObject(pairs: KVPair[]): Record<string, string> {
  return pairs
    .filter((p) => p.enabled !== false && p.key)
    .reduce((acc, p) => ({ ...acc, [p.key]: p.value }), {})
}

export function tryPrettyJson(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2)
  } catch {
    return str
  }
}

export function isJson(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

export function resolveVars(text: string, vars: KVPair[]): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const found = vars.find((v) => v.key === key)
    return found ? found.value : `{{${key}}}`
  })
}

export const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

export const COMMON_HEADERS = [
  'Content-Type',
  'Accept',
  'Authorization',
  'X-API-Key',
  'Cache-Control',
  'User-Agent',
  'X-Request-ID',
  'X-Correlation-ID',
]

export function extractErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  const res = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data
  if (res?.message) return res.message
  if (res?.errors) {
    const first = Object.values(res.errors)[0]
    if (first?.length) return first[0]
  }
  if (err instanceof Error) return err.message
  return fallback
}

export const CONTENT_TYPES = [
  'application/json',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain',
  'text/html',
  'text/xml',
  'application/xml',
]
