import { Link } from '@tanstack/react-router'
import type { PokemonSpecies } from '@/types/pokemon'
import { TypeBadge } from '@/components/common/TypeBadge'
import { PokemonSprite } from '@/components/common/PokemonSprite'
import styles from './SpeciesCard.module.css'

interface SpeciesCardProps {
  species: PokemonSpecies
}

export function SpeciesCard({ species }: SpeciesCardProps) {
  const defaultForm = species.forms.find((f) => f.isDefault) ?? species.forms[0]
  const spriteUrl = defaultForm?.spriteUrl ?? defaultForm?.spriteFrontUrl ?? null

  return (
    <Link to="/pokedex/$speciesId" params={{ speciesId: species.id }} className={styles.card}>
      <PokemonSprite
        url={spriteUrl}
        alt={species.displayName}
        size={80}
      />
      <div className={styles.info}>
        <span className={styles.dexNumber}>
          #{String(species.nationalDexNumber).padStart(4, '0')}
        </span>
        <span className={styles.name}>{species.displayName}</span>
        <div className={styles.types}>
          {defaultForm?.type1 && <TypeBadge type={defaultForm.type1} size="sm" />}
          {defaultForm?.type2 && <TypeBadge type={defaultForm.type2} size="sm" />}
        </div>
      </div>
    </Link>
  )
}
