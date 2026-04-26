/**
 * TeamTypeCoverage — defensive type coverage for a team.
 *
 * For each of the 18 attacking types, shows how many Pokémon on the team
 * are weak (×2 / ×4), neutral (×1), resistant (×½ / ×¼), or immune (×0).
 * Computed entirely from the team members' types — no network call needed.
 */
import { ALL_TYPES, getDefensiveMultiplier } from '@/lib/typeMatchups'
import type { PokemonType } from '@/lib/typeMatchups'
import { TypeBadge } from '@/components/common/TypeBadge'
import styles from './TeamTypeCoverage.module.css'

interface MemberTypes {
  type1: string | null
  type2: string | null
}

interface TeamTypeCoverageProps {
  members: MemberTypes[]
}

function scoreToBucket(m: number): 'immune' | 'resist' | 'neutral' | 'weak' | 'dblweak' {
  if (m === 0) return 'immune'
  if (m < 1) return 'resist'
  if (m === 1) return 'neutral'
  if (m === 2) return 'weak'
  return 'dblweak'
}

export function TeamTypeCoverage({ members }: TeamTypeCoverageProps) {
  const active = members.filter((m) => m.type1 !== null)

  if (active.length === 0) {
    return <p className={styles.empty}>Add Pokémon to see type coverage.</p>
  }

  return (
    <div className={styles.table}>
      <div className={styles.headerRow}>
        <div className={styles.typeCol} />
        {active.map((m, i) => (
          <div key={i} className={styles.memberCol}>
            <TypeBadge type={m.type1!} size="sm" />
            {m.type2 && <TypeBadge type={m.type2} size="sm" />}
          </div>
        ))}
      </div>

      {ALL_TYPES.map((attacker) => {
        const cells = active.map((m) =>
          getDefensiveMultiplier(
            attacker,
            m.type1 as PokemonType,
            m.type2 as PokemonType | null,
          ),
        )

        const weakCount = cells.filter((m) => m > 1).length
        const resistCount = cells.filter((m) => m < 1).length

        return (
          <div key={attacker} className={styles.row}>
            <div className={styles.typeCol}>
              <TypeBadge type={attacker} size="sm" />
            </div>
            {cells.map((m, i) => {
              const bucket = scoreToBucket(m)
              const label = m === 0 ? '0' : m === 0.25 ? '¼' : m === 0.5 ? '½' : m === 2 ? '2' : m === 4 ? '4' : '1'
              return (
                <div
                  key={i}
                  className={`${styles.cell} ${styles[bucket]}`}
                  title={`×${label}`}
                  aria-label={`×${label}`}
                >
                  {m !== 1 && <span className={styles.multiplier}>×{label}</span>}
                </div>
              )
            })}
            <div className={styles.summary}>
              {weakCount > 0 && (
                <span className={styles.weakCount}>{weakCount}✗</span>
              )}
              {resistCount > 0 && (
                <span className={styles.resistCount}>{resistCount}✓</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
