import { createFileRoute, Link } from '@tanstack/react-router'
import { useLivingDexQuery } from '@/hooks/useLivingDexQuery'
import styles from './index.module.css'

export const Route = createFileRoute('/_app/')({
  component: Dashboard,
})

function Dashboard() {
  const { data, isLoading } = useLivingDexQuery()

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={styles.cards}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Living Form Dex</h2>
          {isLoading ? (
            <div className={styles.skeleton} />
          ) : data ? (
            <>
              <p className={styles.big}>{data.stats.completionPercent}%</p>
              <p className={styles.sub}>
                {data.stats.caughtForms} / {data.stats.totalForms} forms caught
              </p>
              {data.stats.shinyCaught > 0 && (
                <p className={styles.sub}>✨ {data.stats.shinyCaught} shiny</p>
              )}
              <div className={styles.track}>
                <div
                  className={styles.fill}
                  style={{ width: `${data.stats.completionPercent}%` }}
                />
              </div>
            </>
          ) : (
            <p className={styles.sub}>Start catching Pokémon!</p>
          )}
          <Link to="/living-dex/" className={styles.link}>Open Living Dex →</Link>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Pokédex</h2>
          <p className={styles.sub}>Browse all species and forms</p>
          <Link to="/pokedex/" className={styles.link}>Open Pokédex →</Link>
        </div>
      </div>
    </div>
  )
}
