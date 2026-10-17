import { useNotificationSettings } from '../model/useNotificationSettings'

export function NotificationSettingsBanner() {
  const { status, check, enable, dismiss } = useNotificationSettings()

  switch (status.type) {
    case 'checking':
    case 'ok':
      return null
    case 'problem':
      return (
        <div className="banner banner--warning" role="alert">
          <span>Ответы собеседников не будут приходить: {status.problems.join('; ')}.</span>
          <button type="button" className="banner__action" onClick={enable}>
            Включить
          </button>
        </div>
      )
    case 'saving':
      return <div className="banner banner--warning">Сохраняем настройки инстанса…</div>
    case 'saved':
      return (
        <div className="banner banner--success" role="status">
          <span>Уведомления включены. Инстанс перезапустится, настройки применятся в течение ~5 минут.</span>
          <button type="button" className="banner__action" onClick={dismiss}>
            OK
          </button>
        </div>
      )
    case 'error':
      return (
        <div className="banner banner--warning" role="alert">
          <span>Не удалось проверить настройки инстанса: {status.message}</span>
          <button type="button" className="banner__action" onClick={check}>
            Повторить
          </button>
          <button type="button" className="banner__action banner__action--secondary" onClick={dismiss}>
            Скрыть
          </button>
        </div>
      )
  }
}
