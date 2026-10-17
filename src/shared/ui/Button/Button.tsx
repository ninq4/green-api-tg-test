import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib'
import styles from './Button.module.scss'

type Props = ButtonHTMLAttributes<HTMLButtonElement>

export function Button({ className, type = 'button', ...props }: Props) {
  return <button type={type} className={cn(styles.button, className)} {...props} />
}
