import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { useDexAllQuery, useDexStatsQuery, useToggleCaught } from '@/hooks/useDexQuery'
import { GAME_MAP, HOME_GAME } from '@/lib/gameConfig'
import type { DexPageEntry } from '@/types/dex'
import styles from './$dexId.module.css'

export const Route = createFileRoute('/_app/dex/$dexId')({
  component: DexBoxPage,
})

const BOX_SIZE = 30

type FilterMode = 'all' | 'caught' | 'uncaught'

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function SlotSkeleton() {
  return <div className={styles.slotSkeleton} />
}

function Box({
  entries,
  boxIndex,
  totalEntries,
  isShiny,
  onToggle,
}: {
  entries: (DexPageEntry | null)[]
  boxIndex: number
  totalEntries: number
  isShiny: boolean
  onToggle: (formId: string, caught: boolean) => void
}) {
  const start = boxIndex * BOX_SIZE + 1
  const end = Math.min(start + entries.filter(Boolean).length - 1, totalEntries)

  return (
    <section id={`box-${boxIndex}`} className={styles.boxSection}>
      <div className={styles.boxHeader}>
        <span className={styles.boxLabel}>Box {boxIndex + 1}</span>
        <span className={styles.boxRange}>
          #{String(start).padStart(3, '0')}–#{String(end).padStart(3, '0')}
        </span>
      </div>
      <div className={styles.box}>
        {entries.map((entry, i) => {
          if (!entry) return <div key={i} className={styles.slotEmpty} />

          const caught = entry.caughtAt !== null
          const spriteUrl = isShiny
            ? (entry.spriteShinyUrl ?? entry.spriteFrontUrl ?? entry.spriteUrl)
            : (entry.spriteUrl ?? entry.spriteFrontUrl)

          return (
            <button
              key={entry.formId}
              className={`${styles.slot} ${caught ? styles.slotCaught : styles.slotUncaught}`}
              onClick={() => onToggle(entry.formId, !caught)}
              aria-label={`${caught ? 'Unmark' : 'Mark'} ${entry.displayName} as caught`}
              aria-pressed={caught}
            >
              {spriteUrl ? (
                <img
                  src={spriteUrl}
                  alt={entry.displayName}
                  className={styles.sprite}
                  loading="lazy"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <span className={styles.spriteNo}>?</span>
              )}
              <span className={styles.slotNum}>
                #{String(entry.nationalDexNumber).padStart(3, '0')}
              </span>
              {caught && <span className={styles.caughtDot} aria-hidden="true" />}
              <span className={styles.slotName} aria-hidden="true">
                {entry.displayName}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function DexBoxPage() {
  const { dexId } = Route.useParams()
  const [filter, setFilter] = useState<FilterMode>('all')

  const { data, isLoading, isError, error } = useDexAllQuery(dexId)
  const { data: stats } = useDexStatsQuery(dexId)
  const toggle = useToggleCaught(dexId)

  const dexInfo = data?.dex
  const allEntries = data?.entries ?? []

  const gameConfig =
    dexInfo?.game === 'home' ? HOME_GAME : dexInfo?.game ? GAME_MAP[dexInfo.game] : null
  const isShiny = dexInfo?.isShiny ?? false

  // Apply filter: replace non-matching slots with null to preserve box positions
  const filteredEntries = allEntries.map((e): DexPageEntry | null => {
    if (filter === 'caught' && e.caughtAt === null) return null
    if (filter === 'uncaught' && e.caughtAt !== null) return null
    return e
  })

  const boxes = chunk(filteredEntries, BOX_SIZE).map((b) => {
    const padded: (DexPageEntry | null)[] = [...b]
    while (padded.length < BOX_SIZE) padded.push(null)
    return padded
  })

  const skeletonBoxes = isLoading ? Array.from({ length: 3 }) : []

  const pct = stats?.completionPercent ?? 0
  const caught = stats?.caught ?? 0
  const total = stats?.total ?? 0

  const jumpToBox = useCallback((boxIndex: number) => {
    document.getElementById(`box-${boxIndex}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <div className={styles.page}>
      {/* ── Sticky header ── */}
      <div className={styles.stickyHeader}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Link to="/dex/" className={styles.backLink}>
              ← My Dexes
            </Link>
            <h1 className={styles.title}>{dexInfo?.name ?? '…'}</h1>
            <div className={styles.badges}>
              {gameConfig && <span className={styles.gameBadge}>{gameConfig.shortLabel}</span>}
              {isShiny && <span className={styles.shinyBadge}>✨ Shiny</span>}
              {dexInfo?.includeForms && (
                <span className={styles.typeBadge}>
                  {dexInfo.includeCosmeticForms ? 'All forms' : 'Alt forms'}
                </span>
              )}
            </div>
          </div>

          <div className={styles.headerRight}>
            <svg width={70} height={70} aria-label={`${pct}% complete`}>
              <circle cx={35} cy={35} r={28} fill="none" stroke="#e5e7eb" strokeWidth={7} />
              <circle
                cx={35}
                cy={35}
                r={28}
                fill="none"
                stroke={isShiny ? '#f59e0b' : '#22c55e'}
                strokeWidth={7}
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - pct / 100)}
                transform="rotate(-90 35 35)"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
              <text
                x={35}
                y={35}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="0.72rem"
                fontWeight="700"
                fill="#1f2937"
              >
                {pct}%
              </text>
            </svg>
            <div className={styles.countLabel}>
              {caught} / {total}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className={styles.progressBar}>
          <div
            className={`${styles.progressFill} ${isShiny ? styles.progressShiny : ''}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* ── Filter bar ── */}
        <div className={styles.filterBar}>
          <div className={styles.filterPills} role="group" aria-label="Filter Pokémon">
            {(['all', 'caught', 'uncaught'] as const).map((mode) => (
              <button
                key={mode}
                className={`${styles.pill} ${filter === mode ? styles.pillActive : ''}`}
                onClick={() => setFilter(mode)}
                aria-pressed={filter === mode}
              >
                {mode === 'all' ? 'All' : mode === 'caught' ? '✓ Caught' : '○ Uncaught'}
              </button>
            ))}
          </div>

          {boxes.length > 1 && (
            <select
              className={styles.jumpSelect}
              defaultValue=""
              onChange={(e) => {
                const idx = parseInt(e.target.value, 10)
                if (!isNaN(idx)) jumpToBox(idx)
                e.target.value = ''
              }}
              aria-label="Jump to box"
            >
              <option value="" disabled>
                Jump to box…
              </option>
              {boxes.map((_, bi) => (
                <option key={bi} value={bi}>
                  Box {bi + 1}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ── Error state ── */}
      {isError && (
        <div className={styles.errorBox}>
          <p className={styles.errorTitle}>Could not load Pokémon</p>
          <p className={styles.errorMsg}>{(error as Error)?.message ?? 'Unknown error'}</p>
          <p className={styles.errorHint}>
            Make sure the backend is running and migrations have been applied (
            <code>bun run migration:run</code>).
          </p>
        </div>
      )}

      {/* ── All boxes ── */}
      {!isError && (
        <div className={styles.allBoxes}>
          {isLoading
            ? skeletonBoxes.map((_, bi) => (
                <section key={bi} className={styles.boxSection}>
                  <div className={styles.boxHeader}>
                    <span className={styles.boxLabel}>Box {bi + 1}</span>
                  </div>
                  <div className={styles.box}>
                    {Array.from({ length: BOX_SIZE }).map((_, i) => (
                      <SlotSkeleton key={i} />
                    ))}
                  </div>
                </section>
              ))
            : boxes.map((boxEntries, bi) => (
                <Box
                  key={bi}
                  entries={boxEntries}
                  boxIndex={bi}
                  totalEntries={total}
                  isShiny={isShiny}
                  onToggle={(formId, newCaught) => toggle.mutate({ formId, caught: newCaught })}
                />
              ))}
        </div>
      )}
    </div>
  )
}
