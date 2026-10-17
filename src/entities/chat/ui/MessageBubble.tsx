import type { ReactNode } from 'react'
import { formatTime } from '@/shared/lib'
import type { Message, MessageStatus } from '../model/types'

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
    <div className={`message message--${message.direction}${message.status ? ` message--${message.status}` : ''}`}>
      <span className="message__text">{message.text}</span>
      <span className="message__meta">
        {formatTime(message.timestamp)}
        {status && (
          <span className="message__status" title={status.title}>
            {status.icon}
          </span>
        )}
      </span>
      {action}
    </div>
  )
}
