import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import type { BoxSlot as BoxSlotType } from '@/types/collection'
import { BoxSlot } from './BoxSlot'
import styles from './BoxGrid.module.css'

interface BoxGridProps {
  slots: BoxSlotType[]
  onMove: (fromSlot: number, toSlot: number, pokemonId: string) => void
  onClear: (slotPosition: number) => void
}

export function BoxGrid({ slots, onMove, onClear }: BoxGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  // Build a map of slotPosition → slot for quick lookup
  const slotMap = new Map<number, BoxSlotType>()
  for (const s of slots) {
    slotMap.set(s.slotPosition, s)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const fromSlot = Number(String(active.id).replace('slot-', ''))
    const toSlot = Number(String(over.id).replace('slot-', ''))
    const pokemonId = (active.data.current as { pokemonId?: string })?.pokemonId

    if (!pokemonId) return
    onMove(fromSlot, toSlot, pokemonId)
  }

  const handleRightClick = (slotPosition: number, pokemonId: string | null) => {
    if (pokemonId) onClear(slotPosition)
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className={styles.grid}>
        {Array.from({ length: 30 }, (_, i) => (
          <BoxSlot
            key={i}
            slotPosition={i}
            slot={slotMap.get(i)}
            onRightClick={handleRightClick}
          />
        ))}
      </div>
    </DndContext>
  )
}
