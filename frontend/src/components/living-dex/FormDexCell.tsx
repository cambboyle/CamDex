import type { LivingDexEntry } from '@/types/collection'
import styles from './FormDexCell.module.css'

interface FormDexCellProps {
  entry: LivingDexEntry
  onClick: (entry: LivingDexEntry) => void
}

export function FormDexCell({ entry, onClick }: FormDexCellProps) {
  const isCaught = entry.caughtId !== null
  const isShinyCaught = entry.caughtShinyId !== null

  return (
    <button
      className={`${styles.cell} ${isCaught ? styles.caught : ''}`}
      onClick={() => onClick(entry)}
      title={`${entry.displayName}${isCaught ? ' ✓' : ''}${isShinyCaught ? ' ✨' : ''}`}
      aria-label={`${entry.displayName}${isCaught ? ', caught' : ', not caught'}${isShinyCaught ? ', shiny caught' : ''}`}
    >
      {entry.spriteUrl ? (
        <img
          src={entry.spriteUrl}
          alt={entry.displayName}
          className={styles.sprite}
          loading="lazy"
          width={40}
          height={40}
        />
      ) : (
        <div className={styles.noSprite}>?</div>
      )}
      {isCaught && <div className={styles.caughtOverlay} />}
      {isShinyCaught && <span className={styles.shinyBadge} aria-hidden>✨</span>}
    </button>
  )
}
