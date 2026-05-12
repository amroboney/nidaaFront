'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { User, Mail, Lock, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { AppLogo } from '@/components/ui/AppLogo'

export default function RegisterPage() {
  const router = useRouter()
  const register = useAuthStore((s) => s.register)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await register(name, email, password, confirm)
      router.push('/workspace')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const Field = ({
    icon: Icon,
    label,
    type,
    value,
    onChange,
    placeholder,
  }: {
    icon: React.ElementType
    label: string
    type: string
    value: string
    onChange: (v: string) => void
    placeholder: string
  }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className="w-full bg-secondary border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
        />
      </div>
    </div>
  )

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
      <div className="mb-8">
        <AppLogo height={36} />
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-1">Create account</h1>
      <p className="text-muted-foreground text-sm mb-6">Start testing APIs in seconds</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field icon={User} label="Name" type="text" value={name} onChange={setName} placeholder="Your name" />
        <Field icon={Mail} label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <Field icon={Lock} label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
        <Field icon={Lock} label="Confirm password" type="password" value={confirm} onChange={setConfirm} placeholder="••••••••" />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition">
          Sign in
        </Link>
      </p>
    </div>
  )
}
