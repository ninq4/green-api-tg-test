import { useImportChats } from '../model/useImportChats'

export function ImportChatsButton() {
  const { state, importChats } = useImportChats()

  return (
    <div className="import-chats">
      <button type="button" className="import-chats__button" onClick={importChats} disabled={state.type === 'loading'}>
        {state.type === 'loading' ? 'Загружаем…' : 'Загрузить чаты из Telegram'}
      </button>
      {state.type === 'done' && <span className="import-chats__status">Личных чатов: {state.count}</span>}
      {state.type === 'error' && (
        <span className="import-chats__status import-chats__status--error">{state.message}</span>
      )}
    </div>
  )
}
