import { formatChatTime } from '@/shared/lib'
import { Avatar } from '@/shared/ui'
import type { Chat } from '../model/types'

interface Props {
  chat: Chat
  active: boolean
  onClick: () => void
}

export function ChatListItem({ chat, active, onClick }: Props) {
  const last = chat.messages.at(-1)

  return (
    <button type="button" className={`chat-item${active ? ' chat-item--active' : ''}`} onClick={onClick}>
      <Avatar title={chat.title} seed={chat.phone} src={chat.avatar} />
      <div className="chat-item__body">
        <div className="chat-item__row">
          <span className="chat-item__title">{chat.title}</span>
          {last && <span className="chat-item__time">{formatChatTime(last.timestamp)}</span>}
        </div>
        <div className="chat-item__row">
          <span className="chat-item__preview">
            {last ? `${last.direction === 'out' ? 'Вы: ' : ''}${last.text}` : 'Нет сообщений'}
          </span>
          {chat.unread > 0 && <span className="chat-item__badge">{chat.unread}</span>}
        </div>
      </div>
    </button>
  )
}
