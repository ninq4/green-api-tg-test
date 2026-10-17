import { cn, formatChatTime } from '@/shared/lib'
import { Avatar } from '@/shared/ui'
import type { Chat } from '../model/types'
import styles from './ChatListItem.module.scss'

interface Props {
  chat: Chat
  active: boolean
  onClick: () => void
}

export function ChatListItem({ chat, active, onClick }: Props) {
  const last = chat.messages.at(-1)

  return (
    <button type="button" className={cn(styles.item, active && styles.active)} onClick={onClick}>
      <Avatar title={chat.title} seed={chat.phone} src={chat.avatar} />
      <div className={styles.body}>
        <div className={styles.row}>
          <span className={styles.title}>{chat.title}</span>
          {last && <span className={styles.time}>{formatChatTime(last.timestamp)}</span>}
        </div>
        <div className={styles.row}>
          <span className={styles.preview}>
            {last ? `${last.direction === 'out' ? 'Вы: ' : ''}${last.text}` : 'Нет сообщений'}
          </span>
          {chat.unread > 0 && <span className={styles.badge}>{chat.unread}</span>}
        </div>
      </div>
    </button>
  )
}
