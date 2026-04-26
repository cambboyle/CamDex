import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useDexPageQuery, useDexStatsQuery, useToggleCaught } from '@/hooks/useDexQuery'
import { DEX_TYPE_MAP, GAME_MAP, HOME_GAME } from '@/lib/gameConfig'
import styles from './$dexId.module.css'

export const Route = createFileRoute('/_app/dex/$dexId')({
  component: DexBoxPage,
})

const PAGE_SIZE = 5 * 6 // 30 — 5 rows × 6 cols, matches HOME layout

function SlotSkeleton() {
  return <div className={styles.slotSkeleton} />
}

function DexBoxPage() {
  const { dexId } = Route.useParams()
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, error } = useDexPageQuery(dexId, page)
  const { data: stats } = useDexStatsQuery(dexId)
  const toggle = useToggleCaught(dexId, page)

  const dexInfo = data?.dex
  const entries = data?.entries ?? []
  const totalPages = data?.totalPages ?? 1

  const gameConfig = dexInfo?.game === 'home'
    ? HOME_GAME
    : (dexInfo?.game ? GAME_MAP[dexInfo.game] : null)
  const typeConfig = dexInfo?.dexType ? DEX_TYPE_MAP[dexInfo.dexType] : null
  const isShiny = typeConfig?.isShiny ?? false

  // Pad entries to full grid
  const slots = Array.from({ length: PAGE_SIZE }, (_, i) => entries[i] ?? null)

  const pct = stats?.completionPercent ?? 0
  const caught = stats?.caught ?? 0
  const total = stats?.total ?? 0

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
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
          {/* Completion ring */}
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

      {/* ── Progress bar ── */}
      <div className={styles.progressBar}>
        <div
          className={`${styles.progressFill} ${isShiny ? styles.progressShiny : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* ── Box navigation ── */}
      <div className={styles.boxNav}>
        <button
          className={styles.navBtn}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          ‹
        </button>
        <span className={styles.boxLabel}>Box {page} of {totalPages}</span>
        <button
          className={styles.navBtn}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          ›
        </button>
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

      {/* ── Grid ── */}
      {!isError && (
      <div className={styles.box}>
        {isLoading
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SlotSkeleton key={i} />)
          : slots.map((entry, i) => {
              if (!entry) {
                return <div key={i} className={styles.slotEmpty} />
              }

              const caught = entry.caughtAt !== null
              const spriteUrl = isShiny
                ? (entry.spriteShinyUrl ?? entry.spriteFrontUrl ?? entry.spriteUrl)
                : (entry.spriteUrl ?? entry.spriteFrontUrl)

              return (
                <button
                  key={entry.formId}
                  className={`${styles.slot} ${caught ? styles.slotCaught : styles.slotUncaught}`}
                  onClick={() => toggle.mutate({ formId: entry.formId, caught: !caught })}
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
                  {/* Name tooltip on hover */}
                  <span className={styles.slotName} aria-hidden="true">
                    {entry.displayName}
                  </span>
                </button>
              )
            })}
      </div>

      )}

      {/* ── Bottom pagination ── */}
      <div className={styles.bottomNav}>
        <button
          className={styles.navBtnLg}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          ← Previous box
        </button>
        <span className={styles.pageInfo}>Box {page} / {totalPages}</span>
        <button
          className={styles.navBtnLg}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          Next box →
        </button>
      </div>
    </div>
  )
}
