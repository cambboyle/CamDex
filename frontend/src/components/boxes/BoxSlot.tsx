import { useDraggable, useDroppable } from '@dnd-kit/core'
import type { BoxSlot as BoxSlotType } from '@/types/collection'
import styles from './BoxSlot.module.css'

interface BoxSlotProps {
  slot: BoxSlotType | undefined
  slotPosition: number
  onRightClick?: (slotPosition: number, pokemonId: string | null) => void
}

export function BoxSlot({ slot, slotPosition, onRightClick }: BoxSlotProps) {
  const pokemon = slot?.pokemon ?? null
  const draggableId = `slot-${slotPosition}`

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: draggableId })
  const {
    setNodeRef: setDragRef,
    attributes,
    listeners,
    isDragging,
  } = useDraggable({
    id: draggableId,
    disabled: !pokemon,
    data: { slotPosition, pokemonId: slot?.userPokemonId },
  })

  const sprite = pokemon
    ? pokemon.isShiny
      ? (pokemon.form.spriteShinyUrl ?? pokemon.form.spriteFrontUrl ?? pokemon.form.spriteUrl)
      : (pokemon.form.spriteFrontUrl ?? pokemon.form.spriteUrl)
    : null

  const setRef = (node: HTMLElement | null) => {
    setDropRef(node)
    setDragRef(node)
  }

  return (
    <div
      ref={setRef}
      className={`${styles.slot} ${isOver ? styles.over : ''} ${isDragging ? styles.dragging : ''} ${pokemon ? styles.filled : styles.empty}`}
      onContextMenu={(e) => {
        e.preventDefault()
        onRightClick?.(slotPosition, slot?.userPokemonId ?? null)
      }}
      {...(pokemon ? { ...attributes, ...listeners } : {})}
    >
      {pokemon && sprite ? (
        <img
          src={sprite}
          alt={pokemon.nickname ?? pokemon.form.displayName}
          className={styles.sprite}
          width={40}
          height={40}
          draggable={false}
        />
      ) : pokemon ? (
        <div className={styles.noSprite}>?</div>
      ) : null}
      {pokemon?.isShiny && <span className={styles.shinyDot} aria-hidden>✨</span>}
    </div>
  )
}
