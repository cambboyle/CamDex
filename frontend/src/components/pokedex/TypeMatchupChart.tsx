import { ALL_TYPES, getDefensiveMultiplier } from '@/lib/typeMatchups'
import type { PokemonType } from '@/lib/typeMatchups'
import { TypeBadge } from '@/components/common/TypeBadge'
import styles from './TypeMatchupChart.module.css'

interface TypeMatchupChartProps {
  type1: string
  type2: string | null
}

interface MultiplierGroup {
  label: string
  multiplier: string
  className: string
  types: string[]
}

export function TypeMatchupChart({ type1, type2 }: TypeMatchupChartProps) {
  const groups = new Map<number, string[]>()

  for (const attacker of ALL_TYPES) {
    const m = getDefensiveMultiplier(
      attacker,
      type1 as PokemonType,
      type2 as PokemonType | null,
    )
    if (m !== 1) {
      if (!groups.has(m)) groups.set(m, [])
      groups.get(m)!.push(attacker)
    }
  }

  const ordered: MultiplierGroup[] = [
    { multiplier: '×4', label: 'Weak ×4', className: styles.x4, types: groups.get(4) ?? [] },
    { multiplier: '×2', label: 'Weak ×2', className: styles.x2, types: groups.get(2) ?? [] },
    { multiplier: '×½', label: 'Resistant ×½', className: styles.half, types: groups.get(0.5) ?? [] },
    { multiplier: '×¼', label: 'Resistant ×¼', className: styles.quarter, types: groups.get(0.25) ?? [] },
    { multiplier: '×0', label: 'Immune', className: styles.immune, types: groups.get(0) ?? [] },
  ].filter((g) => g.types.length > 0)

  if (ordered.length === 0) {
    return <p className={styles.none}>No notable type interactions.</p>
  }

  return (
    <div className={styles.chart}>
      {ordered.map((group) => (
        <div key={group.multiplier} className={styles.row}>
          <span className={`${styles.multiplier} ${group.className}`}>
            {group.multiplier}
          </span>
          <div className={styles.badges}>
            {group.types.map((t) => (
              <TypeBadge key={t} type={t} size="sm" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
