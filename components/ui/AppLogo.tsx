'use client'
import Image from 'next/image'

interface Props {
  height?: number
  className?: string
}

export function AppLogo({ height = 100, className = '' }: Props) {
  return (
    <span className={`inline-flex ${className}`}>
      <Image
        src="/images/logo.png"
        alt="Nidaa"
        width={Math.round(height * 2.8)}
        height={height}
        className="block dark:hidden"
        style={{ height, width: 'auto' }}
        priority
      />
      <Image
        src="/images/logo.png"
        alt="Nidaa"
        width={Math.round(height * 2.8)}
        height={height}
        className="hidden dark:block"
        style={{ height, width: 'auto' }}
        priority
      />
    </span>
  )
}
