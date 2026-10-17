import { useState, type FormEvent } from 'react'
import { useSessionStore } from '@/entities/session'
import { defaultApiUrl, getStateInstance, GreenApiError, type InstanceCredentials } from '@/shared/api/green-api'

export function LoginForm() {
  const login = useSessionStore((s) => s.login)
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [apiUrl, setApiUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const credentials: InstanceCredentials = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
      apiUrl: apiUrl.trim() || defaultApiUrl(idInstance),
    }

    setLoading(true)
    setError(null)
    try {
      const state = await getStateInstance(credentials)
      if (state?.stateInstance !== 'authorized') {
        setError(
          `Инстанс не авторизован (состояние: ${state?.stateInstance ?? 'неизвестно'}). Авторизуйте его в личном кабинете GREEN-API.`,
        )
        return
      }
      login(credentials)
    } catch (e) {
      if (e instanceof GreenApiError && (e.status === 401 || e.status === 403)) {
        setError('Неверный idInstance или apiTokenInstance')
      } else {
        setError(`Не удалось подключиться: ${e instanceof Error ? e.message : String(e)}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>idInstance</span>
        <input
          value={idInstance}
          onChange={(e) => setIdInstance(e.target.value)}
          inputMode="numeric"
          placeholder="4100123456"
          required
          autoFocus
        />
      </label>
      <label className="field">
        <span>apiTokenInstance</span>
        <input
          value={apiTokenInstance}
          onChange={(e) => setApiTokenInstance(e.target.value)}
          type="password"
          autoComplete="off"
          required
        />
      </label>
      <label className="field">
        <span>apiUrl (необязательно)</span>
        <input
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          type="url"
          placeholder={idInstance ? defaultApiUrl(idInstance) : 'https://4100.api.green-api.com'}
        />
      </label>

      {error && <p className="login-form__error">{error}</p>}

      <button className="button" type="submit" disabled={loading}>
        {loading ? 'Проверяем…' : 'Войти'}
      </button>
    </form>
  )
}
