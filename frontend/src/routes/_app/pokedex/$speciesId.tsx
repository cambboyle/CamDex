import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useSpeciesDetailQuery } from '@/hooks/usePokedexQuery'
import { TypeBadge } from '@/components/common/TypeBadge'
import { StatBar } from '@/components/common/StatBar'
import { PokemonSprite } from '@/components/common/PokemonSprite'
import type { PokemonForm } from '@/types/pokemon'
import styles from './$speciesId.module.css'

export const Route = createFileRoute('/_app/pokedex/$speciesId')({
  component: SpeciesDetailPage,
})

const STAT_LABELS: { key: keyof Pick<PokemonForm, 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe'>; label: string }[] = [
  { key: 'hp', label: 'HP' },
  { key: 'atk', label: 'Attack' },
  { key: 'def', label: 'Defense' },
  { key: 'spa', label: 'Sp. Atk' },
  { key: 'spd', label: 'Sp. Def' },
  { key: 'spe', label: 'Speed' },
]

function SpeciesDetailPage() {
  const { speciesId } = Route.useParams()
  const { data: species, isLoading, isError } = useSpeciesDetailQuery(speciesId)
  const [activeFormIndex, setActiveFormIndex] = useState(0)

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeleton} />
      </div>
    )
  }

  if (isError || !species) {
    return (
      <div className={styles.page}>
        <Link to="/pokedex/" className={styles.back}>← Back to Pokédex</Link>
        <p className={styles.error}>Species not found.</p>
      </div>
    )
  }

  const activeForm = species.forms[activeFormIndex] ?? species.forms[0]
  const spriteUrl = activeForm?.spriteUrl ?? activeForm?.spriteFrontUrl ?? null

  return (
    <div className={styles.page}>
      <Link to="/pokedex/" className={styles.back}>← Back to Pokédex</Link>

      <div className={styles.header}>
        <PokemonSprite url={spriteUrl} alt={species.displayName} size={200} />
        <div className={styles.meta}>
          <span className={styles.dexNumber}>
            #{String(species.nationalDexNumber).padStart(4, '0')}
          </span>
          <h1 className={styles.name}>{activeForm?.displayName ?? species.displayName}</h1>
          <div className={styles.types}>
            {activeForm?.type1 && <TypeBadge type={activeForm.type1} />}
            {activeForm?.type2 && <TypeBadge type={activeForm.type2} />}
          </div>
          {species.flavorText && (
            <p className={styles.flavor}>{species.flavorText}</p>
          )}
        </div>
      </div>

      {species.forms.length > 1 && (
        <div className={styles.formTabs}>
          {species.forms.map((form, i) => (
            <button
              key={form.id}
              className={`${styles.formTab} ${i === activeFormIndex ? styles.formTabActive : ''}`}
              onClick={() => setActiveFormIndex(i)}
            >
              {form.displayName}
            </button>
          ))}
        </div>
      )}

      <div className={styles.stats}>
        <h2 className={styles.statsTitle}>Base Stats</h2>
        {STAT_LABELS.map(({ key, label }) => {
          const val = activeForm?.[key]
          return val != null ? (
            <StatBar key={key} label={label} value={val} />
          ) : null
        })}
      </div>
    </div>
  )
}
