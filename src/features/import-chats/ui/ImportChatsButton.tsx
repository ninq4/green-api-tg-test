import { cn } from '@/shared/lib'
import { useImportChats } from '../model/useImportChats'
import styles from './ImportChatsButton.module.scss'

export function ImportChatsButton() {
  const { state, importChats } = useImportChats()

  return (
    <div className={styles.importChats}>
      <button type="button" className={styles.button} onClick={importChats} disabled={state.type === 'loading'}>
        {state.type === 'loading' ? 'Загружаем…' : 'Загрузить чаты из Telegram'}
      </button>
      {state.type === 'done' && <span className={styles.status}>Личных чатов: {state.count}</span>}
      {state.type === 'error' && (
        <span className={cn(styles.status, styles.error)}>{state.message}</span>
      )}
    </div>
  )
}
