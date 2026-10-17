import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib'
import styles from './IconButton.module.scss'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'accent'
}

export function IconButton({ variant = 'ghost', className, type = 'button', ...props }: Props) {
  return <button type={type} className={cn(styles.iconButton, styles[variant], className)} {...props} />
}
