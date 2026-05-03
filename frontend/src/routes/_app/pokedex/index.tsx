import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { usePokedexAllQuery, useTypesQuery } from '@/hooks/usePokedexQuery'
import { SpeciesGrid } from '@/components/pokedex/SpeciesGrid'
import type { PokemonSpecies } from '@/types/pokemon'
import styles from './index.module.css'

export const Route = createFileRoute('/_app/pokedex/')({
  component: PokedexPage,
})

const GEN_META: Record<number, { label: string; region: string }> = {
  1: { label: 'Generation I',    region: 'Kanto'         },
  2: { label: 'Generation II',   region: 'Johto'         },
  3: { label: 'Generation III',  region: 'Hoenn'         },
  4: { label: 'Generation IV',   region: 'Sinnoh'        },
  5: { label: 'Generation V',    region: 'Unova'         },
  6: { label: 'Generation VI',   region: 'Kalos'         },
  7: { label: 'Generation VII',  region: 'Alola'         },
  8: { label: 'Generation VIII', region: 'Galar / Hisui' },
  9: { label: 'Generation IX',   region: 'Paldea'        },
}

const GEN_ROMAN: Record<number, string> = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
  6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX',
}

function PokedexPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')

  // Debounce search 300 ms
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data, isLoading } = usePokedexAllQuery({ search, type })
  const { data: types } = useTypesQuery()

  const allSpecies = data?.data ?? []
  const total = data?.total ?? 0

  // Group by generation, preserving national dex order within each gen
  const byGen = allSpecies.reduce<Record<number, PokemonSpecies[]>>((acc, s) => {
    const g = s.generation
    if (!acc[g]) acc[g] = []
    acc[g].push(s)
    return acc
  }, {})

  const activeGens = Object.keys(byGen).map(Number).sort((a, b) => a - b)
  const filtersActive = !!search || !!type

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Pokédex</h1>
          {!isLoading && (
            <span className={styles.count}>{total.toLocaleString()} species</span>
          )}
        </div>
        <Link to="/dex/" className={styles.dexLink}>
          My Dexes →
        </Link>
      </div>

      <div className={styles.filters}>
        <input
          className={styles.search}
          type="search"
          placeholder="Search Pokémon…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search Pokémon"
        />
        <select
          className={styles.select}
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label="Filter by type"
        >
          <option value="">All types</option>
          {types?.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Jump-to-gen nav — hidden when filters are active */}
      {!filtersActive && !isLoading && (
        <nav className={styles.genNav} aria-label="Jump to generation">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
            <a
              key={g}
              href={`#gen-${g}`}
              className={styles.genNavLink}
              aria-label={`Jump to Generation ${GEN_ROMAN[g]}`}
            >
              {GEN_ROMAN[g]}
            </a>
          ))}
        </nav>
      )}

      {isLoading ? (
        <div className={styles.sections}>
          {[1, 2, 3].map((g) => (
            <section key={g} className={styles.genSection}>
              <div className={styles.genHeaderSkeleton} />
              <SpeciesGrid species={[]} loading={true} />
            </section>
          ))}
        </div>
      ) : allSpecies.length === 0 ? (
        <p className={styles.empty}>No Pokémon match your search.</p>
      ) : (
        <div className={styles.sections}>
          {activeGens.map((gen) => {
            const meta = GEN_META[gen] ?? { label: `Generation ${gen}`, region: '' }
            const species = byGen[gen]
            return (
              <section key={gen} id={`gen-${gen}`} className={styles.genSection}>
                <div className={styles.genHeader}>
                  <div className={styles.genHeaderLeft}>
                    <span className={styles.genLabel}>{meta.label}</span>
                    <span className={styles.genRegion}>{meta.region}</span>
                  </div>
                  <span className={styles.genCount}>{species.length} Pokémon</span>
                </div>
                <SpeciesGrid species={species} loading={false} />
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
