import type { ReactNode } from 'react'
import { cn, formatTime } from '@/shared/lib'
import type { Message, MessageStatus } from '../model/types'
import styles from './MessageBubble.module.scss'

const STATUS_ICON: Record<MessageStatus, { icon: string; title: string }> = {
  sending: { icon: '🕓', title: 'Отправляется' },
  sent: { icon: '✓', title: 'Отправлено' },
  delivered: { icon: '✓✓', title: 'Доставлено' },
  read: { icon: '✓✓', title: 'Прочитано' },
  failed: { icon: '!', title: 'Не отправлено' },
}

interface Props {
  message: Message
  action?: ReactNode
}

export function MessageBubble({ message, action }: Props) {
  const status = message.status && STATUS_ICON[message.status]

  return (
    <div
      className={cn(
        styles.message,
        message.direction === 'in' ? styles.incoming : styles.outgoing,
        message.status === 'failed' && styles.failed,
        message.status === 'read' && styles.read,
      )}
    >
      <span className={styles.text}>{message.text}</span>
      <span className={styles.meta}>
        {formatTime(message.timestamp)}
        {status && (
          <span className={styles.status} title={status.title}>
            {status.icon}
          </span>
        )}
      </span>
      {action}
    </div>
  )
}
