import { useState } from 'react'
import { cn } from '@/shared/lib'
import styles from './Avatar.module.scss'

const COLORS = ['#ff6b6b', '#f59f00', '#37b24d', '#1c7ed6', '#7048e8', '#e64980', '#0ca678']

interface Props {
  title: string
  seed: string
  src?: string
  size?: 'md' | 'sm'
}

export function Avatar({ title, seed, src, size = 'md' }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const hash = [...seed].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const letter = title.replace(/^\+/, '').charAt(0).toUpperCase() || '?'
  const className = cn(styles.avatar, styles[size])

  if (src && src !== failedSrc) {
    return <img className={className} src={src} alt="" onError={() => setFailedSrc(src)} />
  }

  return (
    <div className={className} style={{ background: COLORS[hash % COLORS.length] }}>
      {letter}
    </div>
  )
}
