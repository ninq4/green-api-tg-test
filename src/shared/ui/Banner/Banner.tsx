import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib'
import styles from './Banner.module.scss'

interface BannerProps {
  variant?: 'warning' | 'success'
  role?: 'alert' | 'status'
  children: ReactNode
}

export function Banner({ variant = 'warning', role, children }: BannerProps) {
  return (
    <div className={cn(styles.banner, styles[variant])} role={role}>
      {children}
    </div>
  )
}

interface ActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  secondary?: boolean
}

export function BannerAction({ secondary, className, type = 'button', ...props }: ActionProps) {
  return (
    <button type={type} className={cn(styles.action, secondary && styles.secondary, className)} {...props} />
  )
}
