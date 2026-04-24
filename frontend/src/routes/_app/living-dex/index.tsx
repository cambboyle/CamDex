import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useLivingDexQuery } from '@/hooks/useLivingDexQuery'
import { FormDexCell } from '@/components/living-dex/FormDexCell'
import { CatchModal } from '@/components/living-dex/CatchModal'
import type { LivingDexEntry } from '@/types/collection'
import styles from './index.module.css'

export const Route = createFileRoute('/_app/living-dex/')({
  component: LivingDexPage,
})

function LivingDexPage() {
  const { data, isLoading, isError } = useLivingDexQuery()
  const [selected, setSelected] = useState<LivingDexEntry | null>(null)

  if (isLoading) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Living Form Dex</h1>
        <div className={styles.statsBar}>
          <div className={styles.statSkeleton} />
        </div>
        <div className={styles.grid}>
          {Array.from({ length: 80 }).map((_, i) => (
            <div key={i} className={styles.cellSkeleton} />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Living Form Dex</h1>
        <p className={styles.error}>Failed to load living dex. Is the backend running?</p>
      </div>
    )
  }

  const { entries, stats } = data

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Living Form Dex</h1>
        <div className={styles.statsBar}>
          <span className={styles.stat}>
            <strong>{stats.caughtForms}</strong> / {stats.totalForms} caught
          </span>
          <span className={styles.stat}>
            ✨ <strong>{stats.shinyCaught}</strong> shiny
          </span>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${stats.completionPercent}%` }}
            />
          </div>
          <span className={styles.percent}>{stats.completionPercent}%</span>
        </div>
      </div>

      <div className={styles.grid}>
        {entries.map((entry) => (
          <FormDexCell
            key={entry.formId}
            entry={entry}
            onClick={setSelected}
          />
        ))}
      </div>

      {selected && (
        <CatchModal
          entry={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
