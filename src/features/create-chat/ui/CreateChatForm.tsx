import { useState, type FormEvent } from 'react'
import { maskPhoneInput, normalizePhone } from '@/shared/lib'
import { IconButton } from '@/shared/ui'
import { useCreateChat } from '../model/useCreateChat'
import styles from './CreateChatForm.module.scss'

export function CreateChatForm() {
  const createChat = useCreateChat()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const normalized = normalizePhone(phone)
    if (normalized.length < 10) {
      setError('Введите номер в международном формате, например +7 (900) 123-45-67')
      return
    }
    createChat(normalized)
    setPhone('')
    setError(null)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <input
          className={styles.input}
          value={phone}
          onChange={(e) => setPhone(maskPhoneInput(e.target.value, phone))}
          type="tel"
          inputMode="tel"
          placeholder="+7 (900) 123-45-67"
          aria-label="Номер телефона получателя"
        />
        <IconButton variant="accent" type="submit" title="Создать чат">
          +
        </IconButton>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </form>
  )
}
