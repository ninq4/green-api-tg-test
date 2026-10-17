import { Fragment, useEffect, useRef } from 'react'
import { chatPhone, MessageBubble, useActiveChat, useChatsStore } from '@/entities/chat'
import { useChatHistory } from '@/features/load-history'
import { MessageComposer, RetryButton } from '@/features/send-message'
import { cn, formatDay, formatPhone } from '@/shared/lib'
import { Avatar, IconButton } from '@/shared/ui'
import styles from './ChatWindow.module.scss'

export function ChatWindow({ className }: { className?: string }) {
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
      <section className={cn(styles.chat, styles.empty, className)}>
        <p className={styles.placeholder}>Выберите чат или создайте новый</p>
      </section>
    )
  }

  return (
    <section className={cn(styles.chat, className)}>
      <header className={styles.header}>
        <IconButton className={styles.back} onClick={() => openChat(null)} title="Назад">
          ←
        </IconButton>
        <Avatar title={chat.title} seed={chat.phone} src={chat.avatar} size="sm" />
        <div>
          <div className={styles.title}>{chat.title}</div>
          {phone && chat.title !== phone && <div className={styles.subtitle}>{phone}</div>}
        </div>
      </header>

      <div className={styles.messages}>
        {chat.messages.length === 0 && (
          <p className={styles.placeholder}>{loading ? 'Загружаем историю…' : 'Напишите первое сообщение'}</p>
        )}
        {chat.messages.map((message, i) => {
          const day = formatDay(message.timestamp)
          const showDay = i === 0 || formatDay(chat.messages[i - 1].timestamp) !== day
          return (
            <Fragment key={message.id}>
              {showDay && <div className={styles.day}>{day}</div>}
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
