import type { Chat, Message } from '@/entities/chat'
import { useSendMessage } from '../model/useSendMessage'
import styles from './RetryButton.module.scss'

interface Props {
  chat: Chat
  message: Message
}

export function RetryButton({ chat, message }: Props) {
  const { retry } = useSendMessage()

  return (
    <button type="button" className={styles.retry} onClick={() => retry(chat, message)}>
      Не отправлено. Повторить
    </button>
  )
}
