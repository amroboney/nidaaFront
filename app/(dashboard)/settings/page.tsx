'use client'
import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import { User, Palette, Send, Code2, Bell, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn, extractErrorMessage } from '@/lib/utils'

const sections = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'appearance',    label: 'Appearance',    icon: Palette },
  { id: 'requests',      label: 'Requests',      icon: Send },
  { id: 'editor',        label: 'Editor',        icon: Code2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
        checked ? 'bg-violet-600' : 'bg-muted'
      )}
    >
      <span className={cn(
        'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
        checked ? 'translate-x-4' : 'translate-x-0'
      )} />
    </button>
  )
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="ml-8 shrink-0">{children}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-0">
      <h2 className="text-base font-semibold text-foreground mb-2">{title}</h2>
      {children}
    </div>
  )
}

function AppearanceSection() {
  const { theme, setTheme } = useTheme()
  const { logoUrl, setLogoUrl } = useSettingsStore()
  const { user } = useAuthStore()
  const isAdmin = user?.email === 'amroboney@gmail.com'
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return }
    const reader = new FileReader()
    reader.onload = () => setLogoUrl(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <Section title="Appearance">
      <Row label="Theme" description="Choose your preferred color scheme">
        <div className="flex gap-2">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium border transition-colors capitalize',
                theme === t
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </Row>
      {isAdmin && <Row label="App logo" description="Replaces the default icon in the header (PNG, JPG, SVG — max 2MB)">
        <div className="flex items-center gap-3">
          {logoUrl && (
            <Image src={logoUrl} alt="Logo preview" width={32} height={32} className="w-8 h-8 rounded-md object-contain border border-border" />
          )}
          <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            {logoUrl ? 'Change' : 'Upload'}
          </Button>
          {logoUrl && (
            <Button size="sm" variant="ghost" onClick={() => setLogoUrl(null)} className="text-muted-foreground hover:text-red-400 gap-1.5">
              <X className="w-3.5 h-3.5" /> Remove
            </Button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
        </div>
      </Row>}
    </Section>
  )
}

export default function SettingsPage() {
  const { user, updateProfile } = useAuthStore()
  const settings = useSettingsStore()

  const [active, setActive] = useState('profile')

  // Profile form state
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password && password !== passwordConfirm) {
      toast.error('Passwords do not match')
      return
    }
    setProfileLoading(true)
    try {
      const payload: Record<string, string> = {}
      if (name !== user?.name) payload.name = name
      if (email !== user?.email) payload.email = email
      if (password) { payload.password = password; payload.password_confirmation = passwordConfirm }
      if (!Object.keys(payload).length) { toast.info('No changes to save'); setProfileLoading(false); return }
      await updateProfile(payload)
      setPassword('')
      setPasswordConfirm('')
      toast.success('Profile updated')
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to update profile'))
    } finally {
      setProfileLoading(false)
    }
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account and app preferences</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar nav */}
          <nav className="w-44 shrink-0 space-y-0.5">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                  active === id
                    ? 'bg-accent text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 space-y-5 min-w-0">

            {active === 'profile' && (
              <Section title="Profile">
                <form onSubmit={handleProfileSave} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label>Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>New password</Label>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Confirm new password</Label>
                    <Input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="Repeat new password" />
                  </div>
                  <div className="pt-2">
                    <Button type="submit" disabled={profileLoading}>
                      {profileLoading ? 'Saving…' : 'Save changes'}
                    </Button>
                  </div>
                </form>
              </Section>
            )}

            {active === 'appearance' && (
              <AppearanceSection />
            )}

            {active === 'requests' && (
              <Section title="Requests">
                <Row label="Request timeout" description="Maximum time to wait for a response (ms)">
                  <Input
                    type="number"
                    min={1000}
                    max={300000}
                    step={1000}
                    value={settings.requestTimeout}
                    onChange={(e) => settings.setRequestTimeout(Number(e.target.value))}
                    className="w-28 text-right"
                  />
                </Row>
                <Row label="Follow redirects" description="Automatically follow HTTP redirects">
                  <Toggle checked={settings.followRedirects} onChange={settings.setFollowRedirects} />
                </Row>
                <Row label="SSL verification" description="Verify SSL certificates on HTTPS requests">
                  <Toggle checked={settings.sslVerification} onChange={settings.setSslVerification} />
                </Row>
                <Row label="Default Content-Type" description="Default header for request bodies">
                  <select
                    value={settings.defaultContentType}
                    onChange={(e) => settings.setDefaultContentType(e.target.value)}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="application/json">application/json</option>
                    <option value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</option>
                    <option value="multipart/form-data">multipart/form-data</option>
                    <option value="text/plain">text/plain</option>
                  </select>
                </Row>
              </Section>
            )}

            {active === 'editor' && (
              <Section title="Editor">
                <Row label="Font size" description="Code editor font size in pixels">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => settings.setFontSize(Math.max(12, settings.fontSize - 1))}
                      className="w-6 h-6 rounded border border-border text-muted-foreground hover:text-foreground flex items-center justify-center text-sm"
                    >−</button>
                    <span className="text-sm w-6 text-center">{settings.fontSize}</span>
                    <button
                      onClick={() => settings.setFontSize(Math.min(20, settings.fontSize + 1))}
                      className="w-6 h-6 rounded border border-border text-muted-foreground hover:text-foreground flex items-center justify-center text-sm"
                    >+</button>
                  </div>
                </Row>
                <Row label="Tab size" description="Number of spaces per indentation level">
                  <div className="flex gap-2">
                    {([2, 4] as const).map((n) => (
                      <button
                        key={n}
                        onClick={() => settings.setTabSize(n)}
                        className={cn(
                          'px-3 py-1 rounded-md text-xs font-medium border transition-colors',
                          settings.tabSize === n
                            ? 'bg-violet-600 text-white border-violet-600'
                            : 'border-border text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {n} spaces
                      </button>
                    ))}
                  </div>
                </Row>
                <Row label="Word wrap" description="Wrap long lines in the editor">
                  <Toggle checked={settings.wordWrap} onChange={settings.setWordWrap} />
                </Row>
              </Section>
            )}

            {active === 'notifications' && (
              <Section title="Notifications">
                <Row label="Monitor failure alerts" description="Get notified when a monitor run fails">
                  <Toggle checked={settings.monitorAlerts} onChange={settings.setMonitorAlerts} />
                </Row>
              </Section>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
