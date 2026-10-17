import { ChatListItem, useActiveChat, useChatsStore, useSortedChats } from '@/entities/chat'
import { LogoutButton } from '@/features/auth'
import { CreateChatForm } from '@/features/create-chat'
import { ImportChatsButton } from '@/features/import-chats'

export function ChatSidebar() {
  const chats = useSortedChats()
  const activeChat = useActiveChat()
  const openChat = useChatsStore((s) => s.openChat)

  return (
    <aside className="sidebar">
      <header className="sidebar__header">
        <h2 className="sidebar__title">Чаты</h2>
        <LogoutButton />
      </header>

      <CreateChatForm />
      <ImportChatsButton />

      <nav className="sidebar__list">
        {chats.length === 0 ? (
          <p className="sidebar__empty">Введите номер телефона, чтобы начать новый чат</p>
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
