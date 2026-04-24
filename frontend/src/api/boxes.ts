import { api } from './client'
import type { Box, BoxSlot } from '@/types/collection'

export function getBoxes(): Promise<Box[]> {
  return api.get<Box[]>('/boxes')
}

export function createBox(dto: { name: string; wallpaper?: string }): Promise<Box> {
  return api.post<Box>('/boxes', dto)
}

export function updateBox(id: string, dto: { name?: string; wallpaper?: string }): Promise<Box> {
  return api.patch<Box>(`/boxes/${id}`, dto)
}

export function deleteBox(id: string): Promise<void> {
  return api.delete<void>(`/boxes/${id}`)
}

export function getBoxSlots(boxId: string): Promise<BoxSlot[]> {
  return api.get<BoxSlot[]>(`/boxes/${boxId}/slots`)
}

export function placePokemon(boxId: string, dto: { userPokemonId: string; slotPosition: number }): Promise<BoxSlot> {
  return api.post<BoxSlot>(`/boxes/${boxId}/slots`, dto)
}

export function removeFromSlot(boxId: string, slotPosition: number): Promise<void> {
  return api.delete<void>(`/boxes/${boxId}/slots/${slotPosition}`)
}
