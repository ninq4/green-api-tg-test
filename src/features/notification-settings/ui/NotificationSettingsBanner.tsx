import { Banner, BannerAction } from '@/shared/ui'
import { useNotificationSettings } from '../model/useNotificationSettings'

export function NotificationSettingsBanner() {
  const { status, check, enable, dismiss } = useNotificationSettings()

  switch (status.type) {
    case 'checking':
    case 'ok':
      return null
    case 'problem':
      return (
        <Banner role="alert">
          <span>Ответы собеседников не будут приходить: {status.problems.join('; ')}.</span>
          <BannerAction onClick={enable}>Включить</BannerAction>
        </Banner>
      )
    case 'saving':
      return <Banner>Сохраняем настройки инстанса…</Banner>
    case 'saved':
      return (
        <Banner variant="success" role="status">
          <span>Уведомления включены. Инстанс перезапустится, настройки применятся в течение ~5 минут.</span>
          <BannerAction onClick={dismiss}>OK</BannerAction>
        </Banner>
      )
    case 'error':
      return (
        <Banner role="alert">
          <span>Не удалось проверить настройки инстанса: {status.message}</span>
          <BannerAction onClick={check}>Повторить</BannerAction>
          <BannerAction secondary onClick={dismiss}>
            Скрыть
          </BannerAction>
        </Banner>
      )
  }
}
