'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { AuthConfig } from '@/lib/types'

interface Props {
  auth: AuthConfig
  onChange: (auth: AuthConfig) => void
}

export function AuthEditor({ auth, onChange }: Props) {
  const update = (patch: Partial<AuthConfig>) => onChange({ ...auth, ...patch })

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1.5">
        <Label>Auth type</Label>
        <Select value={auth.type} onValueChange={(v) => update({ type: v as AuthConfig['type'] })}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Auth</SelectItem>
            <SelectItem value="bearer">Bearer Token</SelectItem>
            <SelectItem value="basic">Basic Auth</SelectItem>
            <SelectItem value="api_key">API Key</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {auth.type === 'bearer' && (
        <div className="space-y-1.5">
          <Label>Token</Label>
          <Input
            value={auth.token ?? ''}
            onChange={(e) => update({ token: e.target.value })}
            placeholder="Bearer token"
            className="font-mono text-xs"
          />
        </div>
      )}

      {auth.type === 'basic' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Username</Label>
            <Input
              value={auth.username ?? ''}
              onChange={(e) => update({ username: e.target.value })}
              placeholder="Username"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input
              type="password"
              value={auth.password ?? ''}
              onChange={(e) => update({ password: e.target.value })}
              placeholder="Password"
            />
          </div>
        </div>
      )}

      {auth.type === 'api_key' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Key name</Label>
            <Input
              value={auth.key ?? ''}
              onChange={(e) => update({ key: e.target.value })}
              placeholder="e.g. X-API-Key"
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Value</Label>
            <Input
              value={auth.value ?? ''}
              onChange={(e) => update({ value: e.target.value })}
              placeholder="API key value"
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Add to</Label>
            <Select value={auth.in ?? 'header'} onValueChange={(v) => update({ in: v as 'header' | 'query' })}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="header">Header</SelectItem>
                <SelectItem value="query">Query params</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {auth.type === 'none' && (
        <p className="text-sm text-muted-foreground">No authentication will be applied to this request.</p>
      )}
    </div>
  )
}
