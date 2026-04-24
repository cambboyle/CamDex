import { useState } from 'react'
import styles from './PokemonSprite.module.css'

interface PokemonSpriteProps {
  url: string | null
  alt: string
  size?: number
}

export function PokemonSprite({ url, alt, size = 96 }: PokemonSpriteProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  if (!url || error) {
    return (
      <div
        className={styles.fallback}
        style={{ width: size, height: size }}
        aria-label={alt}
      >
        ?
      </div>
    )
  }

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      {!loaded && <div className={styles.skeleton} style={{ width: size, height: size }} />}
      <img
        src={url}
        alt={alt}
        width={size}
        height={size}
        className={`${styles.img} ${loaded ? styles.visible : styles.hidden}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  )
}
