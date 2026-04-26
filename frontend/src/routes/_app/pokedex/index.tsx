import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback } from 'react'
import { usePokedexInfiniteQuery, useTypesQuery } from '@/hooks/usePokedexQuery'
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

  // Debounce search 300ms
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = usePokedexInfiniteQuery({ search, type, gen })

  const { data: types } = useTypesQuery()

  // Flatten all pages into one list
  const species = data?.pages.flatMap((p) => p.data) ?? []
  const total = data?.pages[0]?.total ?? 0

  // Intersection observer sentinel for infinite scroll
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  )

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(onIntersect, { rootMargin: '200px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [onIntersect])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Pokédex</h1>
        {!isLoading && (
          <span className={styles.count}>{species.length} / {total}</span>
        )}
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

        <select
          className={styles.select}
          value={gen ?? ''}
          onChange={(e) => setGen(e.target.value ? Number(e.target.value) : undefined)}
          aria-label="Filter by generation"
        >
          <option value="">All gens</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
            <option key={g} value={g}>Gen {g}</option>
          ))}
        </select>
      </div>

      <SpeciesGrid species={species} loading={isLoading} />

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />

      {isFetchingNextPage && (
        <div className={styles.loadingMore} aria-live="polite">Loading more…</div>
      )}

      {!hasNextPage && !isLoading && species.length > 0 && (
        <p className={styles.allLoaded}>All {total} Pokémon loaded</p>
      )}
    </div>
  )
}
