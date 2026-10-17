import { useState } from 'react'

const COLORS = ['#ff6b6b', '#f59f00', '#37b24d', '#1c7ed6', '#7048e8', '#e64980', '#0ca678']

interface Props {
  title: string
  seed: string
  src?: string
}

export function Avatar({ title, seed, src }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const hash = [...seed].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const letter = title.replace(/^\+/, '').charAt(0).toUpperCase() || '?'

  if (src && src !== failedSrc) {
    return <img className="avatar" src={src} alt="" onError={() => setFailedSrc(src)} />
  }

  return (
    <div className="avatar" style={{ background: COLORS[hash % COLORS.length] }}>
      {letter}
    </div>
  )
}
