import { useState } from 'react'
import type { LivingDexEntry } from '@/types/collection'
import { useAddToCollection, useReleasePokemon } from '@/hooks/useLivingDexQuery'
import { PokemonSprite } from '@/components/common/PokemonSprite'
import { TypeBadge } from '@/components/common/TypeBadge'
import { ApiError } from '@/api/client'
import styles from './CatchModal.module.css'

interface CatchModalProps {
  entry: LivingDexEntry
  onClose: () => void
}

export function CatchModal({ entry, onClose }: CatchModalProps) {
  const [isShiny, setIsShiny] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addMutation = useAddToCollection()
  const releaseMutation = useReleasePokemon()

  const isCaught = isShiny ? entry.caughtShinyId !== null : entry.caughtId !== null
  const caughtId = isShiny ? entry.caughtShinyId : entry.caughtId

  const spriteUrl = isShiny ? (entry.spriteShinyUrl ?? entry.spriteUrl) : entry.spriteUrl

  async function handleCatch() {
    setError(null)
    try {
      await addMutation.mutateAsync({ formId: entry.formId, isShiny })
      onClose()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Something went wrong')
      }
    }
  }

  async function handleRelease() {
    if (!caughtId) return
    setError(null)
    try {
      await releaseMutation.mutateAsync(caughtId)
      onClose()
    } catch {
      setError('Failed to release')
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal aria-label={`Catch ${entry.displayName}`}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Close">✕</button>

        <div className={styles.header}>
          <PokemonSprite url={spriteUrl} alt={entry.displayName} size={96} />
          <div>
            <p className={styles.dexNumber}>#{String(entry.nationalDexNumber).padStart(4, '0')}</p>
            <h2 className={styles.name}>{entry.displayName}</h2>
            <div className={styles.types}>
              {entry.type1 && <TypeBadge type={entry.type1} />}
              {entry.type2 && <TypeBadge type={entry.type2} />}
            </div>
          </div>
        </div>

        <div className={styles.shinyToggle}>
          <button
            className={`${styles.variantBtn} ${!isShiny ? styles.variantActive : ''}`}
            onClick={() => setIsShiny(false)}
          >
            Regular {entry.caughtId ? '✓' : ''}
          </button>
          <button
            className={`${styles.variantBtn} ${isShiny ? styles.variantActive : ''}`}
            onClick={() => setIsShiny(true)}
          >
            ✨ Shiny {entry.caughtShinyId ? '✓' : ''}
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          {isCaught ? (
            <button
              className={styles.releaseBtn}
              onClick={() => void handleRelease()}
              disabled={releaseMutation.isPending}
            >
              {releaseMutation.isPending ? 'Releasing…' : 'Release'}
            </button>
          ) : (
            <button
              className={styles.catchBtn}
              onClick={() => void handleCatch()}
              disabled={addMutation.isPending}
            >
              {addMutation.isPending ? 'Catching…' : `Mark as caught`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
