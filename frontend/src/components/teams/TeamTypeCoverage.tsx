/**
 * TeamTypeCoverage — defensive type coverage for a team.
 *
 * For each of the 18 attacking types, shows how many Pokémon on the team
 * are weak (×2 / ×4), neutral (×1), resistant (×½ / ×¼), or immune (×0).
 * Computed entirely from the team members' types — no network call needed.
 */
import { useState } from 'react'
import { ALL_TYPES, getDefensiveMultiplier, computeCoverageScore } from '@/lib/typeMatchups'
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

const GRADE_COLOURS: Record<string, string> = {
  Excellent: '#16a34a',
  Good:      '#4f46e5',
  Average:   '#d97706',
  Weak:      '#ea580c',
  Vulnerable:'#dc2626',
}

export function TeamTypeCoverage({ members }: TeamTypeCoverageProps) {
  const active = members.filter((m) => m.type1 !== null)
  const [showInfo, setShowInfo] = useState(false)

  if (active.length === 0) {
    return <p className={styles.empty}>Add Pokémon to see type coverage.</p>
  }

  const { score, grade, coveredTypes, vulnerableTypes } = computeCoverageScore(members)
  const gradeColour = GRADE_COLOURS[grade] ?? '#6b7280'

  return (
    <>
      {/* ── Coverage score card ── */}
      <div className={styles.scoreCard}>
        <div className={styles.scoreLeft}>
          <span className={styles.scoreNum} style={{ color: gradeColour }}>{score}</span>
          <span className={styles.scoreOutOf}>/100</span>
          <span className={styles.scoreBadge} style={{ background: gradeColour }}>{grade}</span>
        </div>
        <div className={styles.scoreRight}>
          <div className={styles.scoreBar}>
            <div
              className={styles.scoreBarFill}
              style={{ width: `${score}%`, background: gradeColour }}
            />
          </div>
          <div className={styles.scoreStats}>
            <span className={styles.scoreStat}>
              <span className={styles.scoreStatDot} style={{ background: '#16a34a' }} />
              {coveredTypes} type{coveredTypes !== 1 ? 's' : ''} covered
            </span>
            {vulnerableTypes > 0 && (
              <span className={styles.scoreStat}>
                <span className={styles.scoreStatDot} style={{ background: '#dc2626' }} />
                {vulnerableTypes} type{vulnerableTypes !== 1 ? 's' : ''} vulnerable
              </span>
            )}
          </div>
        </div>
        <button
          className={styles.infoBtn}
          onClick={() => setShowInfo((v) => !v)}
          aria-expanded={showInfo}
          aria-label="How is this score calculated?"
          title="How is this calculated?"
        >
          ?
        </button>
      </div>

      {/* ── Scoring explanation panel ── */}
      {showInfo && (
        <div className={styles.infoPanel}>
          <button className={styles.infoPanelClose} onClick={() => setShowInfo(false)} aria-label="Close">✕</button>
          <h4 className={styles.infoPanelTitle}>How the score is calculated</h4>
          <p className={styles.infoPanelText}>
            For each of the <strong>18 attack types</strong>, every team member earns points based on how well their typing handles that attack:
          </p>
          <table className={styles.infoPanelTable}>
            <tbody>
              <tr><td className={styles.infoCellImm}>Immune ×0</td><td>+2 pts</td></tr>
              <tr><td className={styles.infoCellRes}>Quarter resist ×¼</td><td>+1.5 pts</td></tr>
              <tr><td className={styles.infoCellRes}>Resist ×½</td><td>+1 pt</td></tr>
              <tr><td className={styles.infoCellNeu}>Neutral ×1</td><td>0 pts</td></tr>
              <tr><td className={styles.infoCellWk}>Weak ×2</td><td>−1 pt</td></tr>
              <tr><td className={styles.infoCellDbl}>Double weak ×4</td><td>−2 pts</td></tr>
            </tbody>
          </table>
          <p className={styles.infoPanelText}>
            Each type's raw points are normalised against the theoretical best and worst your team could score, giving a value between 0 and 1. The <strong>final score</strong> is the average across all 18 types, multiplied by 100.
          </p>
          <p className={styles.infoPanelText}>
            A type is <strong>covered</strong> if at least one member resists or is immune to it. A type is <strong>vulnerable</strong> if the majority of your team is weak to it with no members resisting.
          </p>
          <div className={styles.infoPanelGrades}>
            <span style={{ color: '#16a34a' }}>■</span> Excellent (75+) &nbsp;
            <span style={{ color: '#4f46e5' }}>■</span> Good (58+) &nbsp;
            <span style={{ color: '#d97706' }}>■</span> Average (42+) &nbsp;
            <span style={{ color: '#ea580c' }}>■</span> Weak (25+) &nbsp;
            <span style={{ color: '#dc2626' }}>■</span> Vulnerable
          </div>
        </div>
      )}

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
    </>
  )
}
