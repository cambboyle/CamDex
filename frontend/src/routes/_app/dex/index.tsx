import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useDexesQuery, useCreateDex, useDeleteDex } from '@/hooks/useDexQuery'
import { DEX_GAMES, GAME_MAP, HOME_GAME } from '@/lib/gameConfig'
import styles from './index.module.css'

export const Route = createFileRoute('/_app/dex/')({
  component: DexListPage,
})

function NewDexModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [game, setGame] = useState('home')
  const [isShiny, setIsShiny] = useState(false)
  const [includeForms, setIncludeForms] = useState(false)
  const [includeCosmeticForms, setIncludeCosmeticForms] = useState(false)
  const create = useCreateDex()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await create.mutateAsync({
      name: name.trim(),
      game,
      isShiny,
      includeForms,
      // cosmetic forms only apply when alternate forms are also enabled
      includeCosmeticForms: includeForms && includeCosmeticForms,
    })
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

          <fieldset className={styles.checkboxGroup}>
            <legend className={styles.checkboxLegend}>Tracking options</legend>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isShiny}
                onChange={(e) => setIsShiny(e.target.checked)}
              />
              <span>
                <strong>✨ Shiny dex</strong>
                <span className={styles.checkboxHint}>Track shiny forms instead of normal</span>
              </span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={includeForms}
                onChange={(e) => {
                  setIncludeForms(e.target.checked)
                  if (!e.target.checked) setIncludeCosmeticForms(false)
                }}
              />
              <span>
                <strong>Track alternate forms</strong>
                <span className={styles.checkboxHint}>
                  Include regional variants, Mega evolutions, G-Max forms, etc.
                </span>
              </span>
            </label>

            <label className={`${styles.checkboxLabel} ${!includeForms ? styles.checkboxDisabled : ''}`}>
              <input
                type="checkbox"
                checked={includeCosmeticForms}
                disabled={!includeForms}
                onChange={(e) => setIncludeCosmeticForms(e.target.checked)}
              />
              <span>
                <strong>Track cosmetic forms</strong>
                <span className={styles.checkboxHint}>
                  Also include purely visual variants — Unown letters, Vivillon
                  wing patterns, Alcremie cream colours, Furfrou trims, etc.
                </span>
              </span>
            </label>
          </fieldset>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
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
            const pct = dex.stats?.completionPercent ?? 0
            const caught = dex.stats?.caught ?? 0
            const total = dex.stats?.total ?? 0

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
                      {dex.isShiny && (
                        <span className={styles.shinyBadge}>✨ Shiny</span>
                      )}
                      {dex.includeForms && (
                        <span className={styles.typeBadge}>
                          {dex.includeCosmeticForms ? 'All forms' : 'Alt forms'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.ringWrap}>
                    <svg width={60} height={60} aria-label={`${pct}% complete`}>
                      <circle cx={30} cy={30} r={24} fill="none" stroke="#e5e7eb" strokeWidth={6} />
                      <circle
                        cx={30} cy={30} r={24}
                        fill="none"
                        stroke={dex.isShiny ? '#f59e0b' : '#22c55e'}
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
                    className={`${styles.progressFill} ${dex.isShiny ? styles.progressShiny : ''}`}
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
