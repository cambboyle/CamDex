import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getTeams, getTeam, createTeam, updateTeam, deleteTeam,
  upsertTeamMember, clearTeamSlot,
} from '@/api/teams'
import type { CreateTeamDto, UpdateTeamDto, UpsertTeamMemberDto } from '@/types/teams'

export const TEAM_KEYS = {
  all: ['teams'] as const,
  detail: (id: string) => ['teams', id] as const,
}

export function useTeamsQuery() {
  return useQuery({
    queryKey: TEAM_KEYS.all,
    queryFn: getTeams,
  })
}

export function useTeamQuery(id: string) {
  return useQuery({
    queryKey: TEAM_KEYS.detail(id),
    queryFn: () => getTeam(id),
    enabled: !!id,
  })
}

export function useCreateTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateTeamDto) => createTeam(dto),
    onSuccess: () => void qc.invalidateQueries({ queryKey: TEAM_KEYS.all }),
  })
}

export function useUpdateTeam(teamId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: UpdateTeamDto) => updateTeam(teamId, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: TEAM_KEYS.all })
      void qc.invalidateQueries({ queryKey: TEAM_KEYS.detail(teamId) })
    },
  })
}

export function useDeleteTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTeam(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: TEAM_KEYS.all }),
  })
}

export function useUpsertTeamMember(teamId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ slot, dto }: { slot: number; dto: UpsertTeamMemberDto }) =>
      upsertTeamMember(teamId, slot, dto),
    onSuccess: () => void qc.invalidateQueries({ queryKey: TEAM_KEYS.detail(teamId) }),
  })
}

export function useClearTeamMember(teamId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (slot: number) => clearTeamSlot(teamId, slot),
    onSuccess: () => void qc.invalidateQueries({ queryKey: TEAM_KEYS.detail(teamId) }),
  })
}
