import { LoginForm } from '@/features/auth'

export function LoginPage() {
  return (
    <main className="login-page">
      <div className="login-page__card">
        <div className="login-page__logo">✉</div>
        <h1 className="login-page__title">Вход в чат</h1>
        <p className="login-page__hint">Введите данные инстанса из личного кабинета GREEN-API</p>
        <LoginForm />
      </div>
    </main>
  )
}
