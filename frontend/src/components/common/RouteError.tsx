import { Link, useRouter } from '@tanstack/react-router'
import styles from './RouteError.module.css'

interface RouteErrorProps {
  error?: unknown
}

export function RouteError({ error }: RouteErrorProps) {
  const router = useRouter()
  const message =
    error instanceof Error ? error.message : 'Something went wrong.'

  return (
    <div className={styles.container}>
      <div className={styles.icon} aria-hidden="true">⚠️</div>
      <h2 className={styles.title}>Oops!</h2>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <button
          className={styles.btn}
          onClick={() => router.invalidate()}
        >
          Try again
        </button>
        <Link to="/" className={styles.link}>Go to Dashboard</Link>
      </div>
    </div>
  )
}
