import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  useBoxesQuery,
  useBoxSlotsQuery,
  useCreateBox,
  useUpdateBox,
  useDeleteBox,
  usePlacePokemon,
  useClearSlot,
} from '@/hooks/useBoxesQuery'
import { BoxHeader } from '@/components/boxes/BoxHeader'
import { BoxGrid } from '@/components/boxes/BoxGrid'
import styles from './index.module.css'

export const Route = createFileRoute('/_app/boxes/')({
  component: BoxesPage,
})

function BoxesPage() {
  const { data: boxes, isLoading, isError } = useBoxesQuery()
  const [activeBoxId, setActiveBoxId] = useState<string | null>(null)

  const effectiveBoxId = activeBoxId ?? boxes?.[0]?.id ?? null
  const { data: slots = [] } = useBoxSlotsQuery(effectiveBoxId)

  const createBox = useCreateBox()
  const updateBox = useUpdateBox()
  const deleteBox = useDeleteBox()
  const placePokemon = usePlacePokemon(effectiveBoxId ?? '')
  const clearSlot = useClearSlot(effectiveBoxId ?? '')

  if (isLoading) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>PC Boxes</h1>
        <div className={styles.skeleton} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>PC Boxes</h1>
        <p className={styles.error}>Failed to load boxes.</p>
      </div>
    )
  }

  const handleNew = async () => {
    const boxNum = (boxes?.length ?? 0) + 1
    const result = await createBox.mutateAsync({ name: `Box ${boxNum}` })
    setActiveBoxId(result.id)
  }

  const handleRename = (id: string, name: string) => {
    updateBox.mutate({ id, dto: { name } })
  }

  const handleDelete = (id: string) => {
    deleteBox.mutate(id, {
      onSuccess: () => {
        // Move to first box after deletion
        const remaining = (boxes ?? []).filter((b) => b.id !== id)
        setActiveBoxId(remaining[0]?.id ?? null)
      },
    })
  }

  const handleMove = (_fromSlot: number, toSlot: number, pokemonId: string) => {
    placePokemon.mutate({ userPokemonId: pokemonId, slotPosition: toSlot })
  }

  const handleClear = (slotPosition: number) => {
    clearSlot.mutate(slotPosition)
  }

  const isEmpty = !boxes || boxes.length === 0

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>PC Boxes</h1>

      {isEmpty ? (
        <div className={styles.empty}>
          <p>You don't have any boxes yet.</p>
          <button className={styles.newBtn} onClick={handleNew}>
            Create your first box
          </button>
        </div>
      ) : (
        <>
          <BoxHeader
            boxes={boxes}
            activeBoxId={effectiveBoxId}
            onSelect={setActiveBoxId}
            onRename={handleRename}
            onDelete={handleDelete}
            onNew={handleNew}
          />
          <div className={styles.content}>
            <BoxGrid slots={slots} onMove={handleMove} onClear={handleClear} />
            <div className={styles.hint}>
              <p>Drag Pokémon between slots to rearrange. Right-click to remove from box.</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
