import type { PokemonSpecies } from '@/types/pokemon'
import { SpeciesCard } from './SpeciesCard'
import styles from './SpeciesGrid.module.css'

interface SpeciesGridProps {
  species: PokemonSpecies[]
  loading: boolean
}

export function SpeciesGrid({ species, loading }: SpeciesGridProps) {
  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className={styles.skeleton} />
        ))}
      </div>
    )
  }

  if (species.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No Pokémon found.</p>
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {species.map((s) => (
        <SpeciesCard key={s.id} species={s} />
      ))}
    </div>
  )
}
