import { ChatListItem, useActiveChat, useChatsStore, useSortedChats } from '@/entities/chat'
import { LogoutButton } from '@/features/auth'
import { CreateChatForm } from '@/features/create-chat'
import { ImportChatsButton } from '@/features/import-chats'
import { cn } from '@/shared/lib'
import styles from './ChatSidebar.module.scss'

export function ChatSidebar({ className }: { className?: string }) {
  const chats = useSortedChats()
  const activeChat = useActiveChat()
  const openChat = useChatsStore((s) => s.openChat)

  return (
    <aside className={cn(styles.sidebar, className)}>
      <header className={styles.header}>
        <h2 className={styles.title}>Чаты</h2>
        <LogoutButton />
      </header>

      <CreateChatForm />
      <ImportChatsButton />

      <nav className={styles.list}>
        {chats.length === 0 ? (
          <p className={styles.empty}>Введите номер телефона, чтобы начать новый чат</p>
        ) : (
          chats.map((chat) => (
            <ChatListItem
              key={chat.phone}
              chat={chat}
              active={chat.phone === activeChat?.phone}
              onClick={() => openChat(chat.phone)}
            />
          ))
        )}
      </nav>
    </aside>
  )
}
