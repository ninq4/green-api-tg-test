import { useState, type FormEvent, type KeyboardEvent } from 'react'
import type { Chat } from '@/entities/chat'
import { useSendMessage } from '../model/useSendMessage'
import styles from './MessageComposer.module.scss'

const MAX_LENGTH = 4096

export function MessageComposer({ chat }: { chat: Chat }) {
  const { send } = useSendMessage()
  const [text, setText] = useState('')

  function submit() {
    const message = text.trim()
    if (!message) return
    send(chat, message)
    setText('')
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    submit()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <textarea
        className={styles.input}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Сообщение"
        maxLength={MAX_LENGTH}
        rows={1}
        autoFocus
      />
      <button className={styles.send} type="submit" disabled={!text.trim()} title="Отправить">
        ➤
      </button>
    </form>
  )
}
