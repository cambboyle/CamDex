import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { usePokedexQuery, useTypesQuery } from '@/hooks/usePokedexQuery'
import { SpeciesGrid } from '@/components/pokedex/SpeciesGrid'
import styles from './index.module.css'

export const Route = createFileRoute('/_app/pokedex/')({
  component: PokedexPage,
})

function PokedexPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [gen, setGen] = useState<number | undefined>()
  const [page, setPage] = useState(1)

  // Debounce search 300ms
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data, isLoading } = usePokedexQuery({ search, type, gen, page })
  const { data: types } = useTypesQuery()

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Pokédex</h1>

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
          onChange={(e) => { setType(e.target.value); setPage(1) }}
          aria-label="Filter by type"
        >
          <option value="">All types</option>
          {types?.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={gen ?? ''}
          onChange={(e) => { setGen(e.target.value ? Number(e.target.value) : undefined); setPage(1) }}
          aria-label="Filter by generation"
        >
          <option value="">All gens</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
            <option key={g} value={g}>Gen {g}</option>
          ))}
        </select>
      </div>

      <SpeciesGrid species={data?.data ?? []} loading={isLoading} />

      {!isLoading && totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
          >
            ← Prev
          </button>
          <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
