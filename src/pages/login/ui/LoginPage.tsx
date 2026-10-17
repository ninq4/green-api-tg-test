import { LoginForm } from '@/features/auth'
import styles from './LoginPage.module.scss'

export function LoginPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>✉</div>
        <h1 className={styles.title}>Вход в чат</h1>
        <p className={styles.hint}>Введите данные инстанса из личного кабинета GREEN-API</p>
        <LoginForm />
      </div>
    </main>
  )
}
