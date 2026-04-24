export function toTitleCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function formatStatName(stat: string): string {
  const map: Record<string, string> = {
    hp: 'HP',
    attack: 'Atk',
    defense: 'Def',
    'special-attack': 'SpA',
    'special-defense': 'SpD',
    speed: 'Spe',
  }
  return map[stat] ?? toTitleCase(stat)
}

export function formatNature(nature: string): string {
  return toTitleCase(nature)
}

export function formatBall(ball: string): string {
  return toTitleCase(ball.replace('-ball', '')) + ' Ball'
}
