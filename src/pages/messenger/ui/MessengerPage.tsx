import { useEffect } from 'react'
import { useActiveChat, useChatsStore } from '@/entities/chat'
import { useCredentials } from '@/entities/session'
import { NotificationSettingsBanner } from '@/features/notification-settings'
import { useReceiveMessages } from '@/features/receive-messages'
import { ChatSidebar } from '@/widgets/chat-sidebar'
import { cn } from '@/shared/lib'
import { Banner } from '@/shared/ui'
import { ChatWindow } from '@/widgets/chat-window'
import styles from './MessengerPage.module.scss'

function MessengerLayout() {
  const connectionError = useReceiveMessages()
  const activeChat = useActiveChat()

  return (
    <div className={styles.page}>
      <NotificationSettingsBanner />
      {connectionError && (
        <Banner role="alert">Нет связи с GREEN-API, переподключаемся… ({connectionError})</Banner>
      )}
      <main className={cn(styles.messenger, activeChat && styles.chatOpen)}>
        <ChatSidebar className={styles.sidebar} />
        <ChatWindow className={styles.chat} />
      </main>
    </div>
  )
}

export function MessengerPage() {
  const { idInstance } = useCredentials()
  const loadedInstance = useChatsStore((s) => s.instanceId)
  const loadInstance = useChatsStore((s) => s.loadInstance)

  useEffect(() => {
    loadInstance(idInstance)
  }, [idInstance, loadInstance])

  return loadedInstance === idInstance ? <MessengerLayout /> : null
}
