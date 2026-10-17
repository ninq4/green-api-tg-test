import { useState, type FormEvent } from 'react'
import { maskPhoneInput, normalizePhone } from '@/shared/lib'
import { useCreateChat } from '../model/useCreateChat'

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
    <form className="create-chat" onSubmit={handleSubmit}>
      <div className="create-chat__row">
        <input
          className="create-chat__input"
          value={phone}
          onChange={(e) => setPhone(maskPhoneInput(e.target.value, phone))}
          type="tel"
          inputMode="tel"
          placeholder="+7 (900) 123-45-67"
          aria-label="Номер телефона получателя"
        />
        <button className="icon-button icon-button--accent" type="submit" title="Создать чат">
          +
        </button>
      </div>
      {error && <p className="create-chat__error">{error}</p>}
    </form>
  )
}
