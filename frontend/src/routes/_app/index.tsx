import { createFileRoute, Link } from '@tanstack/react-router'
import { useLivingDexQuery } from '@/hooks/useLivingDexQuery'
import styles from './index.module.css'

export const Route = createFileRoute('/_app/')({
  component: Dashboard,
})

interface CompletionRingProps {
  percent: number
  size?: number
  stroke?: number
}

function CompletionRing({ percent, size = 120, stroke = 10 }: CompletionRingProps) {
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - percent / 100)

  return (
    <svg width={size} height={size} aria-label={`${percent}% complete`} role="img">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={stroke}
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#22c55e"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      {/* Label */}
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="1.3rem"
        fontWeight="700"
        fill="#1f2937"
      >
        {percent}%
      </text>
    </svg>
  )
}

function Dashboard() {
  const { data, isLoading } = useLivingDexQuery()

  const quickLinks = [
    { to: '/pokedex/' as const, label: 'Pokédex', desc: 'Browse all species and forms' },
    { to: '/boxes/' as const, label: 'PC Boxes', desc: 'Organise your caught Pokémon' },
    { to: '/teams/' as const, label: 'Teams', desc: 'Build competitive teams' },
  ]

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={styles.topRow}>
        {/* Living Dex completion card */}
        <div className={styles.dexCard}>
          <h2 className={styles.cardTitle}>Living Form Dex</h2>

          {isLoading ? (
            <div className={styles.skeleton} />
          ) : data ? (
            <div className={styles.dexCardBody}>
              <CompletionRing percent={data.stats.completionPercent} />
              <div className={styles.dexStats}>
                <p className={styles.stat}>
                  <span className={styles.statVal}>{data.stats.caughtForms}</span>
                  <span className={styles.statLabel}>/ {data.stats.totalForms} forms</span>
                </p>
                {data.stats.shinyCaught > 0 && (
                  <p className={styles.shinyStat}>✨ {data.stats.shinyCaught} shiny</p>
                )}
              </div>
            </div>
          ) : (
            <p className={styles.empty}>Start catching Pokémon!</p>
          )}

          <Link to="/living-dex/" className={styles.cardLink}>Open Living Dex →</Link>
        </div>

        {/* Quick link cards */}
        <div className={styles.quickLinks}>
          {quickLinks.map(({ to, label, desc }) => (
            <Link key={to} to={to} className={styles.quickCard}>
              <span className={styles.quickLabel}>{label}</span>
              <span className={styles.quickDesc}>{desc}</span>
              <span className={styles.quickArrow}>→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
