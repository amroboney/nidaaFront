export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-blue-500/5 pointer-events-none" />
      <div className="relative z-10 w-full max-w-md px-4">{children}</div>
    </div>
  )
}
