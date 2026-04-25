import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useDexesQuery, useCreateDex, useDeleteDex } from '@/hooks/useDexQuery'
import { DEX_GAMES, DEX_TYPES, DEX_TYPE_MAP, GAME_MAP, HOME_GAME } from '@/lib/gameConfig'
import styles from './index.module.css'

export const Route = createFileRoute('/_app/dex/')({
  component: DexListPage,
})

function NewDexModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [game, setGame] = useState('home')
  const [dexType, setDexType] = useState('living-form')
  const create = useCreateDex()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await create.mutateAsync({ name: name.trim(), game, dexType })
    onClose()
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>New Dex Tracker</h2>
        <form onSubmit={(e) => void handleSubmit(e)} className={styles.form}>
          <label className={styles.label}>
            Name
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Living Dex"
              maxLength={60}
              autoFocus
              required
            />
          </label>

          <label className={styles.label}>
            Game
            <select
              className={styles.select}
              value={game}
              onChange={(e) => setGame(e.target.value)}
            >
              {DEX_GAMES.map((g) => (
                <option key={g.key} value={g.key}>{g.label}</option>
              ))}
            </select>
          </label>

          <label className={styles.label}>
            Dex Type
            <select
              className={styles.select}
              value={dexType}
              onChange={(e) => setDexType(e.target.value)}
            >
              {DEX_TYPES.map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          </label>

          {DEX_TYPE_MAP[dexType] && (
            <p className={styles.hint}>{DEX_TYPE_MAP[dexType].description}</p>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className={styles.createBtn}
              disabled={!name.trim() || create.isPending}
            >
              {create.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DexListPage() {
  const { data: dexes, isLoading } = useDexesQuery()
  const deleteDex = useDeleteDex()
  const [showNew, setShowNew] = useState(false)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Dexes</h1>
        <button className={styles.newBtn} onClick={() => setShowNew(true)}>
          + New Dex
        </button>
      </div>

      {isLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : dexes?.length === 0 ? (
        <div className={styles.empty}>
          <p>No dex trackers yet.</p>
          <button className={styles.newBtn} onClick={() => setShowNew(true)}>
            Create your first dex
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {dexes?.map((dex) => {
            const gameConfig = dex.game === 'home' ? HOME_GAME : GAME_MAP[dex.game]
            const typeConfig = DEX_TYPE_MAP[dex.dexType]
            const pct = dex.stats?.completionPercent ?? 0
            const caught = dex.stats?.caught ?? 0
            const total = dex.stats?.total ?? 0
            const isShiny = typeConfig?.isShiny ?? false

            return (
              <Link
                key={dex.id}
                to="/dex/$dexId"
                params={{ dexId: dex.id }}
                className={styles.card}
              >
                <div className={styles.cardTop}>
                  <div className={styles.cardLeft}>
                    <span className={styles.cardName}>{dex.name}</span>
                    <div className={styles.cardBadges}>
                      <span className={styles.gameBadge}>
                        {gameConfig?.shortLabel ?? dex.game}
                      </span>
                      {isShiny && <span className={styles.shinyBadge}>✨ Shiny</span>}
                      <span className={styles.typeBadge}>{typeConfig?.label ?? dex.dexType}</span>
                    </div>
                  </div>
                  <div className={styles.ringWrap}>
                    <svg width={60} height={60} aria-label={`${pct}% complete`}>
                      <circle cx={30} cy={30} r={24} fill="none" stroke="#e5e7eb" strokeWidth={6} />
                      <circle
                        cx={30} cy={30} r={24}
                        fill="none"
                        stroke={isShiny ? '#f59e0b' : '#22c55e'}
                        strokeWidth={6}
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 24}
                        strokeDashoffset={2 * Math.PI * 24 * (1 - pct / 100)}
                        transform="rotate(-90 30 30)"
                        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                      />
                      <text x={30} y={30} textAnchor="middle" dominantBaseline="middle" fontSize="0.7rem" fontWeight="700" fill="#1f2937">
                        {pct}%
                      </text>
                    </svg>
                  </div>
                </div>

                <div className={styles.progressBar}>
                  <div
                    className={`${styles.progressFill} ${isShiny ? styles.progressShiny : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.catchCount}>{caught} / {total} caught</span>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => {
                      e.preventDefault()
                      if (confirm(`Delete "${dex.name}"?`)) void deleteDex.mutate(dex.id)
                    }}
                    aria-label={`Delete ${dex.name}`}
                  >
                    ✕
                  </button>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {showNew && <NewDexModal onClose={() => setShowNew(false)} />}
    </div>
  )
}
