import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getBoxes,
  createBox,
  updateBox,
  deleteBox,
  getBoxSlots,
  placePokemon,
  removeFromSlot,
} from '@/api/boxes'

export const BOX_KEYS = {
  all: ['boxes'] as const,
  slots: (boxId: string) => ['boxes', boxId, 'slots'] as const,
}

export function useBoxesQuery() {
  return useQuery({
    queryKey: BOX_KEYS.all,
    queryFn: getBoxes,
  })
}

export function useBoxSlotsQuery(boxId: string | null) {
  return useQuery({
    queryKey: BOX_KEYS.slots(boxId ?? ''),
    queryFn: () => getBoxSlots(boxId!),
    enabled: !!boxId,
  })
}

export function useCreateBox() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: { name: string; wallpaper?: string }) => createBox(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: BOX_KEYS.all }),
  })
}

export function useUpdateBox() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { name?: string; wallpaper?: string } }) =>
      updateBox(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: BOX_KEYS.all }),
  })
}

export function useDeleteBox() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBox(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: BOX_KEYS.all }),
  })
}

export function usePlacePokemon(boxId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: { userPokemonId: string | null; slotPosition: number }) =>
      placePokemon(boxId, dto as { userPokemonId: string; slotPosition: number }),
    onSuccess: () => qc.invalidateQueries({ queryKey: BOX_KEYS.slots(boxId) }),
  })
}

export function useClearSlot(boxId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (slotPosition: number) => removeFromSlot(boxId, slotPosition),
    onSuccess: () => qc.invalidateQueries({ queryKey: BOX_KEYS.slots(boxId) }),
  })
}
