import { createFileRoute, Link } from '@tanstack/react-router'
import { useDexAllQuery, useDexStatsQuery, useToggleCaught } from '@/hooks/useDexQuery'
import { DEX_TYPE_MAP, GAME_MAP, HOME_GAME } from '@/lib/gameConfig'
import type { DexPageEntry } from '@/types/dex'
import styles from './$dexId.module.css'

export const Route = createFileRoute('/_app/dex/$dexId')({
  component: DexBoxPage,
})

const BOX_SIZE = 30 // 6 cols × 5 rows — matches HOME layout

/** Split an array into consecutive chunks of `size`. */
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function SlotSkeleton() {
  return <div className={styles.slotSkeleton} />
}

/** A single 6×5 box of Pokémon slots. */
function Box({
  entries,
  boxIndex,
  total,
  isShiny,
  onToggle,
}: {
  entries: (DexPageEntry | null)[]
  boxIndex: number
  total: number
  isShiny: boolean
  onToggle: (formId: string, caught: boolean) => void
}) {
  const start = boxIndex * BOX_SIZE + 1
  const end = Math.min(start + entries.filter(Boolean).length - 1, total)

  return (
    <section className={styles.boxSection}>
      <div className={styles.boxHeader}>
        <span className={styles.boxLabel}>Box {boxIndex + 1}</span>
        <span className={styles.boxRange}>#{start}–#{end}</span>
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
                    (e.target as HTMLImageElement).style.display = 'none'
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

  const { data, isLoading, isError, error } = useDexAllQuery(dexId)
  const { data: stats } = useDexStatsQuery(dexId)
  const toggle = useToggleCaught(dexId)

  const dexInfo = data?.dex
  const entries = data?.entries ?? []

  const gameConfig = dexInfo?.game === 'home'
    ? HOME_GAME
    : (dexInfo?.game ? GAME_MAP[dexInfo.game] : null)
  const typeConfig = dexInfo?.dexType ? DEX_TYPE_MAP[dexInfo.dexType] : null
  const isShiny = typeConfig?.isShiny ?? false

  // Split into boxes of 30; pad last box to full grid
  const boxes = chunk(entries, BOX_SIZE).map((b) => {
    const padded: (DexPageEntry | null)[] = [...b]
    while (padded.length < BOX_SIZE) padded.push(null)
    return padded
  })

  // While loading: show 3 placeholder box skeletons
  const skeletonBoxes = isLoading ? Array.from({ length: 3 }) : []

  const pct = stats?.completionPercent ?? 0
  const caught = stats?.caught ?? 0
  const total = stats?.total ?? 0

  return (
    <div className={styles.page}>
      {/* ── Sticky header ── */}
      <div className={styles.stickyHeader}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Link to="/dex/" className={styles.backLink}>← My Dexes</Link>
            <h1 className={styles.title}>{dexInfo?.name ?? '…'}</h1>
            <div className={styles.badges}>
              {gameConfig && (
                <span className={styles.gameBadge}>{gameConfig.shortLabel}</span>
              )}
              {isShiny && <span className={styles.shinyBadge}>✨ Shiny</span>}
              {typeConfig && <span className={styles.typeBadge}>{typeConfig.label}</span>}
            </div>
          </div>

          <div className={styles.headerRight}>
            <svg width={70} height={70} aria-label={`${pct}% complete`}>
              <circle cx={35} cy={35} r={28} fill="none" stroke="#e5e7eb" strokeWidth={7} />
              <circle
                cx={35} cy={35} r={28}
                fill="none"
                stroke={isShiny ? '#f59e0b' : '#22c55e'}
                strokeWidth={7}
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - pct / 100)}
                transform="rotate(-90 35 35)"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
              <text x={35} y={35} textAnchor="middle" dominantBaseline="middle" fontSize="0.72rem" fontWeight="700" fill="#1f2937">
                {pct}%
              </text>
            </svg>
            <div className={styles.countLabel}>{caught} / {total}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className={styles.progressBar}>
          <div
            className={`${styles.progressFill} ${isShiny ? styles.progressShiny : ''}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* ── Error state ── */}
      {isError && (
        <div className={styles.errorBox}>
          <p className={styles.errorTitle}>Could not load Pokémon</p>
          <p className={styles.errorMsg}>
            {(error as Error)?.message ?? 'Unknown error'}
          </p>
          <p className={styles.errorHint}>
            Make sure the backend is running and migrations have been applied
            (<code>bun run migration:run</code>).
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
                  total={total}
                  isShiny={isShiny}
                  onToggle={(formId, newCaught) =>
                    toggle.mutate({ formId, caught: newCaught })
                  }
                />
              ))}
        </div>
      )}
    </div>
  )
}
