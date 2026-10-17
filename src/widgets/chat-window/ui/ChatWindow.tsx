import { Fragment, useEffect, useRef } from 'react'
import { chatPhone, MessageBubble, useActiveChat, useChatsStore } from '@/entities/chat'
import { useChatHistory } from '@/features/load-history'
import { MessageComposer, RetryButton } from '@/features/send-message'
import { formatDay, formatPhone } from '@/shared/lib'
import { Avatar } from '@/shared/ui'

export function ChatWindow() {
  const chat = useActiveChat()
  const openChat = useChatsStore((s) => s.openChat)
  const { loading } = useChatHistory(chat?.phone ?? null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const messagesCount = chat?.messages.length ?? 0
  const phone = chat && chatPhone(chat) ? formatPhone(chat.phone) : null

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [chat?.phone, messagesCount])

  if (!chat) {
    return (
      <section className="chat chat--empty">
        <p className="chat__placeholder">Выберите чат или создайте новый</p>
      </section>
    )
  }

  return (
    <section className="chat">
      <header className="chat__header">
        <button
          type="button"
          className="icon-button chat__back"
          onClick={() => openChat(null)}
          title="Назад"
        >
          ←
        </button>
        <Avatar title={chat.title} seed={chat.phone} src={chat.avatar} />
        <div>
          <div className="chat__title">{chat.title}</div>
          {phone && chat.title !== phone && <div className="chat__subtitle">{phone}</div>}
        </div>
      </header>

      <div className="chat__messages">
        {chat.messages.length === 0 && (
          <p className="chat__placeholder">{loading ? 'Загружаем историю…' : 'Напишите первое сообщение'}</p>
        )}
        {chat.messages.map((message, i) => {
          const day = formatDay(message.timestamp)
          const showDay = i === 0 || formatDay(chat.messages[i - 1].timestamp) !== day
          return (
            <Fragment key={message.id}>
              {showDay && <div className="chat__day">{day}</div>}
              <MessageBubble
                message={message}
                action={message.status === 'failed' && <RetryButton chat={chat} message={message} />}
              />
            </Fragment>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <MessageComposer key={chat.phone} chat={chat} />
    </section>
  )
}
