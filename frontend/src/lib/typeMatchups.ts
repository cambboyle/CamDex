export type PokemonType =
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy'

export const ALL_TYPES: PokemonType[] = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
]

// effectiveness[attackingType][defendingType] = multiplier (0, 0.5, 1, 2)
export const effectiveness: Record<PokemonType, Record<PokemonType, number>> = {
  normal:   { normal:1, fire:1, water:1, electric:1, grass:1, ice:1, fighting:1, poison:1, ground:1, flying:1, psychic:1, bug:1, rock:0.5, ghost:0, dragon:1, dark:1, steel:0.5, fairy:1 },
  fire:     { normal:1, fire:0.5, water:0.5, electric:1, grass:2, ice:2, fighting:1, poison:1, ground:1, flying:1, psychic:1, bug:2, rock:0.5, ghost:1, dragon:0.5, dark:1, steel:2, fairy:1 },
  water:    { normal:1, fire:2, water:0.5, electric:1, grass:0.5, ice:1, fighting:1, poison:1, ground:2, flying:1, psychic:1, bug:1, rock:2, ghost:1, dragon:0.5, dark:1, steel:1, fairy:1 },
  electric: { normal:1, fire:1, water:2, electric:0.5, grass:0.5, ice:1, fighting:1, poison:1, ground:0, flying:2, psychic:1, bug:1, rock:1, ghost:1, dragon:0.5, dark:1, steel:1, fairy:1 },
  grass:    { normal:1, fire:0.5, water:2, electric:1, grass:0.5, ice:1, fighting:1, poison:0.5, ground:2, flying:0.5, psychic:1, bug:0.5, rock:2, ghost:1, dragon:0.5, dark:1, steel:0.5, fairy:1 },
  ice:      { normal:1, fire:0.5, water:0.5, electric:1, grass:2, ice:0.5, fighting:1, poison:1, ground:2, flying:2, psychic:1, bug:1, rock:1, ghost:1, dragon:2, dark:1, steel:0.5, fairy:1 },
  fighting: { normal:2, fire:1, water:1, electric:1, grass:1, ice:2, fighting:1, poison:0.5, ground:1, flying:0.5, psychic:0.5, bug:0.5, rock:2, ghost:0, dragon:1, dark:2, steel:2, fairy:0.5 },
  poison:   { normal:1, fire:1, water:1, electric:1, grass:2, ice:1, fighting:1, poison:0.5, ground:0.5, flying:1, psychic:1, bug:1, rock:0.5, ghost:0.5, dragon:1, dark:1, steel:0, fairy:2 },
  ground:   { normal:1, fire:2, water:1, electric:2, grass:0.5, ice:1, fighting:1, poison:2, ground:1, flying:0, psychic:1, bug:0.5, rock:2, ghost:1, dragon:1, dark:1, steel:2, fairy:1 },
  flying:   { normal:1, fire:1, water:1, electric:0.5, grass:2, ice:1, fighting:2, poison:1, ground:1, flying:1, psychic:1, bug:2, rock:0.5, ghost:1, dragon:1, dark:1, steel:0.5, fairy:1 },
  psychic:  { normal:1, fire:1, water:1, electric:1, grass:1, ice:1, fighting:2, poison:2, ground:1, flying:1, psychic:0.5, bug:1, rock:1, ghost:1, dragon:1, dark:0, steel:0.5, fairy:1 },
  bug:      { normal:1, fire:0.5, water:1, electric:1, grass:2, ice:1, fighting:0.5, poison:0.5, ground:1, flying:0.5, psychic:2, bug:1, rock:1, ghost:0.5, dragon:1, dark:2, steel:0.5, fairy:0.5 },
  rock:     { normal:1, fire:2, water:1, electric:1, grass:1, ice:2, fighting:0.5, poison:1, ground:0.5, flying:2, psychic:1, bug:2, rock:1, ghost:1, dragon:1, dark:1, steel:0.5, fairy:1 },
  ghost:    { normal:0, fire:1, water:1, electric:1, grass:1, ice:1, fighting:1, poison:1, ground:1, flying:1, psychic:2, bug:1, rock:1, ghost:2, dragon:1, dark:0.5, steel:1, fairy:1 },
  dragon:   { normal:1, fire:1, water:1, electric:1, grass:1, ice:1, fighting:1, poison:1, ground:1, flying:1, psychic:1, bug:1, rock:1, ghost:1, dragon:2, dark:1, steel:0.5, fairy:0 },
  dark:     { normal:1, fire:1, water:1, electric:1, grass:1, ice:1, fighting:0.5, poison:1, ground:1, flying:1, psychic:2, bug:1, rock:1, ghost:2, dragon:1, dark:0.5, steel:1, fairy:0.5 },
  steel:    { normal:1, fire:0.5, water:0.5, electric:0.5, grass:1, ice:2, fighting:1, poison:1, ground:1, flying:1, psychic:1, bug:1, rock:2, ghost:1, dragon:1, dark:1, steel:0.5, fairy:2 },
  fairy:    { normal:1, fire:0.5, water:1, electric:1, grass:1, ice:1, fighting:2, poison:0.5, ground:1, flying:1, psychic:1, bug:1, rock:1, ghost:1, dragon:2, dark:2, steel:0.5, fairy:1 },
}

export function getDefensiveMultiplier(
  attackingType: PokemonType,
  defType1: PokemonType,
  defType2: PokemonType | null,
): number {
  const m1 = effectiveness[attackingType][defType1]
  const m2 = defType2 ? effectiveness[attackingType][defType2] : 1
  return m1 * m2
}

/** Convert a defensive multiplier to a signed coverage point value. */
function multiplierPoints(m: number): number {
  if (m === 0)    return  2    // immune — best possible
  if (m === 0.25) return  1.5  // quarter damage
  if (m === 0.5)  return  1    // resist
  if (m === 1)    return  0    // neutral
  if (m === 2)    return -1    // weak
  return                 -2    // double weak (×4)
}

export interface CoverageScore {
  /** 0–100 rounded integer. */
  score: number
  /** "Excellent" | "Good" | "Average" | "Weak" | "Vulnerable" */
  grade: string
  /** Number of types where the team's best response is resist or immune. */
  coveredTypes: number
  /** Number of types where multiple members are weak with no resists. */
  vulnerableTypes: number
}

/**
 * Compute a 0–100 defensive coverage score for a team.
 *
 * For each of the 18 attacking types:
 *  - Every member scores points based on their defensive multiplier.
 *  - Scores are normalized to [0, 1] accounting for team size.
 * The overall score is the mean across all 18 types, scaled to 100.
 */
export function computeCoverageScore(
  members: { type1: string | null; type2: string | null }[],
): CoverageScore {
  const active = members.filter((m) => m.type1 !== null)
  if (active.length === 0) return { score: 0, grade: 'Vulnerable', coveredTypes: 0, vulnerableTypes: 0 }

  const n = active.length
  const maxPerType = n * 2   // all immune
  const minPerType = n * -2  // all double-weak

  let totalNorm = 0
  let coveredTypes = 0
  let vulnerableTypes = 0

  for (const attacker of ALL_TYPES) {
    const multipliers = active.map((m) =>
      getDefensiveMultiplier(
        attacker,
        m.type1 as PokemonType,
        m.type2 as PokemonType | null,
      ),
    )

    const raw = multipliers.reduce((sum, m) => sum + multiplierPoints(m), 0)
    const norm = (raw - minPerType) / (maxPerType - minPerType) // [0, 1]
    totalNorm += norm

    const bestMultiplier = Math.min(...multipliers)
    const weakCount = multipliers.filter((m) => m > 1).length
    const resistCount = multipliers.filter((m) => m < 1).length

    if (bestMultiplier <= 0.5) coveredTypes++
    if (weakCount >= Math.ceil(n / 2) && resistCount === 0) vulnerableTypes++
  }

  const score = Math.round((totalNorm / ALL_TYPES.length) * 100)

  let grade: string
  if (score >= 75) grade = 'Excellent'
  else if (score >= 58) grade = 'Good'
  else if (score >= 42) grade = 'Average'
  else if (score >= 25) grade = 'Weak'
  else grade = 'Vulnerable'

  return { score, grade, coveredTypes, vulnerableTypes }
}
