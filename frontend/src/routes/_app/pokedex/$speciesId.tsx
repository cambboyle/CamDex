import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useSpeciesDetailQuery } from '@/hooks/usePokedexQuery'
import { TypeBadge } from '@/components/common/TypeBadge'
import { StatBar } from '@/components/common/StatBar'
import { PokemonSprite } from '@/components/common/PokemonSprite'
import { TypeMatchupChart } from '@/components/pokedex/TypeMatchupChart'
import type { PokemonForm } from '@/types/pokemon'
import styles from './$speciesId.module.css'

export const Route = createFileRoute('/_app/pokedex/$speciesId')({
  component: SpeciesDetailPage,
})

const STAT_LABELS: {
  key: keyof Pick<PokemonForm, 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe'>
  label: string
}[] = [
  { key: 'hp', label: 'HP' },
  { key: 'atk', label: 'Attack' },
  { key: 'def', label: 'Defense' },
  { key: 'spa', label: 'Sp. Atk' },
  { key: 'spd', label: 'Sp. Def' },
  { key: 'spe', label: 'Speed' },
]

const VERSION_LABELS: Record<string, string> = {
  'red': 'Red', 'blue': 'Blue', 'yellow': 'Yellow',
  'gold': 'Gold', 'silver': 'Silver', 'crystal': 'Crystal',
  'ruby': 'Ruby', 'sapphire': 'Sapphire', 'emerald': 'Emerald',
  'firered': 'FireRed', 'leafgreen': 'LeafGreen',
  'diamond': 'Diamond', 'pearl': 'Pearl', 'platinum': 'Platinum',
  'heartgold': 'HeartGold', 'soulsilver': 'SoulSilver',
  'black': 'Black', 'white': 'White',
  'black-2': 'Black 2', 'white-2': 'White 2',
  'x': 'X', 'y': 'Y',
  'omega-ruby': 'Omega Ruby', 'alpha-sapphire': 'Alpha Sapphire',
  'sun': 'Sun', 'moon': 'Moon',
  'ultra-sun': 'Ultra Sun', 'ultra-moon': 'Ultra Moon',
  'sword': 'Sword', 'shield': 'Shield',
  'scarlet': 'Scarlet', 'violet': 'Violet',
  'legends-arceus': 'Legends: Arceus',
  'lets-go-pikachu': "Let's Go Pikachu",
  'lets-go-eevee': "Let's Go Eevee",
}

function formatVersion(slug: string): string {
  return VERSION_LABELS[slug] ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function SpeciesDetailPage() {
  const { speciesId } = Route.useParams()
  const { data: species, isLoading, isError } = useSpeciesDetailQuery(speciesId)
  const [activeFormIndex, setActiveFormIndex] = useState(0)
  const [showShiny, setShowShiny] = useState(false)

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Link to="/pokedex/" className={styles.back}>← Pokédex</Link>
        <div className={styles.skeleton} />
      </div>
    )
  }

  if (isError || !species) {
    return (
      <div className={styles.page}>
        <Link to="/pokedex/" className={styles.back}>← Pokédex</Link>
        <p className={styles.error}>Species not found.</p>
      </div>
    )
  }

  const activeForm = species.forms[activeFormIndex] ?? species.forms[0]
  const spriteUrl = showShiny
    ? (activeForm?.spriteShinyUrl ?? activeForm?.spriteUrl)
    : activeForm?.spriteUrl
  const hasShiny = !!(activeForm?.spriteShinyUrl)

  const statValues = STAT_LABELS.map(({ key }) => activeForm?.[key] ?? 0)
  const statTotal = statValues.reduce((a, b) => a + b, 0)

  return (
    <div className={styles.page}>
      <div className={styles.topNav}>
        <Link to="/pokedex/" className={styles.back}>← Pokédex</Link>
        <Link to="/dex/" className={styles.dexCta}>Track in dex →</Link>
      </div>

      <div className={styles.layout}>
        {/* ── Left panel ── */}
        <div className={styles.leftPanel}>
          <span className={styles.dexNumber}>
            #{String(species.nationalDexNumber).padStart(4, '0')}
          </span>

          <PokemonSprite url={spriteUrl ?? null} alt={activeForm?.displayName ?? species.displayName} size={200} />

          <h1 className={styles.name}>{activeForm?.displayName ?? species.displayName}</h1>

          <div className={styles.types}>
            {activeForm?.type1 && <TypeBadge type={activeForm.type1} />}
            {activeForm?.type2 && <TypeBadge type={activeForm.type2} />}
          </div>

          {hasShiny && (
            <button
              className={`${styles.shinyToggle} ${showShiny ? styles.shinyToggleActive : ''}`}
              onClick={() => setShowShiny((v) => !v)}
            >
              {showShiny ? '✨ Shiny' : '✨ View Shiny'}
            </button>
          )}

          {species.forms.length > 1 && (
            <div className={styles.formTabs}>
              {species.forms.map((form, i) => (
                <button
                  key={form.id}
                  className={`${styles.formTab} ${i === activeFormIndex ? styles.formTabActive : ''}`}
                  onClick={() => { setActiveFormIndex(i); setShowShiny(false) }}
                >
                  {form.displayName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right panel ── */}
        <div className={styles.rightPanel}>

          {/* Base Stats */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Base Stats</h2>
            <div className={styles.sectionBody}>
              {STAT_LABELS.map(({ key, label }) => {
                const val = activeForm?.[key]
                return val != null ? (
                  <StatBar key={key} label={label} value={val} />
                ) : null
              })}
              <div className={styles.statTotal}>
                <span>Total</span>
                <span className={styles.statTotalVal}>{statTotal}</span>
              </div>
            </div>
          </div>

          {/* Type Effectiveness */}
          {activeForm?.type1 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Type Effectiveness</h2>
              <div className={styles.sectionBody}>
                <TypeMatchupChart
                  type1={activeForm.type1}
                  type2={activeForm.type2}
                />
              </div>
            </div>
          )}

          {/* Pokédex Entries */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Pokédex Entries</h2>
            <div className={styles.sectionBody}>
              {species.flavorTexts && species.flavorTexts.length > 0 ? (
                <div className={styles.flavorEntries}>
                  {species.flavorTexts.map(({ version, text }) => (
                    <div key={version} className={styles.flavorEntry}>
                      <span className={styles.flavorVersion}>{formatVersion(version)}</span>
                      <p className={styles.flavorText}>{text}</p>
                    </div>
                  ))}
                </div>
              ) : species.flavorText ? (
                <p className={styles.flavorSingle}>{species.flavorText}</p>
              ) : (
                <p className={styles.flavorSingle}>No Pokédex entry available.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
