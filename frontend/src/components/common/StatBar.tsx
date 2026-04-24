import styles from './StatBar.module.css'

interface StatBarProps {
  label: string
  value: number
  max?: number
}

function getBarColor(value: number): string {
  if (value < 50) return '#ef4444'
  if (value < 80) return '#f97316'
  if (value < 100) return '#eab308'
  return '#22c55e'
}

export function StatBar({ label, value, max = 255 }: StatBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const color = getBarColor(value)

  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${pct}%`, backgroundColor: color }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  )
}
