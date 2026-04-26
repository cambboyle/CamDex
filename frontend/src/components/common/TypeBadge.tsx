import styles from './TypeBadge.module.css'

const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
}

interface TypeBadgeProps {
  type: string
  size?: 'sm' | 'md'
}

export function TypeBadge({ type, size = 'md' }: TypeBadgeProps) {
  const color = TYPE_COLORS[type.toLowerCase()] ?? '#888'
  return (
    <span
      className={`${styles.badge} ${size === 'sm' ? styles.sm : styles.md}`}
      style={{ backgroundColor: color }}
    >
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  )
}
