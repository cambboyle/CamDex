import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useTeamsQuery, useCreateTeam, useDeleteTeam } from '@/hooks/useTeamsQuery'
import { GAMES, GAME_MAP } from '@/lib/gameConfig'
import { PokemonSprite } from '@/components/common/PokemonSprite'
import styles from './index.module.css'

export const Route = createFileRoute('/_app/teams/')({
  component: TeamsPage,
})

function NewTeamModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [game, setGame] = useState('champions')
  const [battleFormat, setBattleFormat] = useState('singles')
  const createTeam = useCreateTeam()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await createTeam.mutateAsync({ name: name.trim(), game, battleFormat })
    onClose()
  }

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>New Team</h2>
        <form onSubmit={(e) => void handleSubmit(e)} className={styles.form}>
          <label className={styles.label}>
            Team Name
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Team"
              maxLength={50}
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
              {GAMES.map((g) => (
                <option key={g.key} value={g.key}>{g.label}</option>
              ))}
            </select>
          </label>

          <label className={styles.label}>
            Format
            <select
              className={styles.select}
              value={battleFormat}
              onChange={(e) => setBattleFormat(e.target.value)}
            >
              <option value="singles">Singles</option>
              <option value="doubles">Doubles</option>
              <option value="casual">Casual</option>
            </select>
          </label>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className={styles.createBtn}
              disabled={!name.trim() || createTeam.isPending}
            >
              {createTeam.isPending ? 'Creating…' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TeamsPage() {
  const { data: teams, isLoading } = useTeamsQuery()
  const deleteTeam = useDeleteTeam()
  const [showNew, setShowNew] = useState(false)

  const filledSlots = (members: { slot: number }[]) =>
    members.filter((m) => m).length

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Teams</h1>
        <button className={styles.newBtn} onClick={() => setShowNew(true)}>
          + New Team
        </button>
      </div>

      {isLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : teams?.length === 0 ? (
        <div className={styles.empty}>
          <p>No teams yet.</p>
          <button className={styles.newBtn} onClick={() => setShowNew(true)}>
            Create your first team
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {teams?.map((team) => {
            const config = GAME_MAP[team.game]
            const filled = filledSlots(team.members)
            return (
              <Link
                key={team.id}
                to="/teams/$teamId"
                params={{ teamId: team.id }}
                className={styles.card}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.cardName}>{team.name}</span>
                  <span className={styles.gameBadge}>{config?.shortLabel ?? team.game}</span>
                </div>

                <div className={styles.sprites}>
                  {Array.from({ length: 6 }).map((_, i) => {
                    const member = team.members.find((m) => m.slot === i + 1)
                    const url = member?.isShiny
                      ? (member.form?.spriteShinyUrl ?? member.form?.spriteFrontUrl ?? member.form?.spriteUrl)
                      : (member?.form?.spriteFrontUrl ?? member?.form?.spriteUrl)
                    return (
                      <div key={i} className={styles.spriteSlot}>
                        {member?.form ? (
                          <PokemonSprite
                            url={url ?? null}
                            alt={member.form.displayName}
                            size={48}
                          />
                        ) : (
                          <div className={styles.emptySlot} />
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.slotCount}>{filled}/6 Pokémon</span>
                  <span className={styles.format}>{team.battleFormat}</span>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => {
                      e.preventDefault()
                      if (confirm(`Delete "${team.name}"?`)) {
                        void deleteTeam.mutate(team.id)
                      }
                    }}
                    aria-label={`Delete ${team.name}`}
                  >
                    ✕
                  </button>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {showNew && <NewTeamModal onClose={() => setShowNew(false)} />}
    </div>
  )
}
