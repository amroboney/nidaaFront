'use client'
import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Mail, Loader2, ArrowLeft } from 'lucide-react'
import { authApi } from '@/lib/api'
import { extractErrorMessage } from '@/lib/utils'
import { AppLogo } from '@/components/ui/AppLogo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Failed to send reset link'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
      <div className="mb-8 flex justify-center">
        <AppLogo height={80} />
      </div>

      {sent ? (
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We sent a password reset link to <span className="text-foreground font-medium">{email}</span>.
            Check your inbox (and spam folder).
          </p>
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 font-medium transition mt-2">
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-foreground mb-1">Forgot password?</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-secondary border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 font-medium transition">
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
          </p>
        </>
      )}
    </div>
  )
}
