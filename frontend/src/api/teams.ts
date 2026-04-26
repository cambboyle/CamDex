import { api } from './client'
import type { Team, TeamMember, CreateTeamDto, UpdateTeamDto, UpsertTeamMemberDto } from '@/types/teams'

export function getTeams(): Promise<Team[]> {
  return api.get<Team[]>('/teams')
}

export function getTeam(id: string): Promise<Team> {
  return api.get<Team>(`/teams/${id}`)
}

export function createTeam(dto: CreateTeamDto): Promise<Team> {
  return api.post<Team>('/teams', dto)
}

export function updateTeam(id: string, dto: UpdateTeamDto): Promise<Team> {
  return api.patch<Team>(`/teams/${id}`, dto)
}

export function deleteTeam(id: string): Promise<void> {
  return api.delete<void>(`/teams/${id}`)
}

export function upsertTeamMember(
  teamId: string,
  slot: number,
  dto: UpsertTeamMemberDto,
): Promise<TeamMember> {
  return api.put<TeamMember>(`/teams/${teamId}/members/${slot}`, dto)
}

export function clearTeamSlot(teamId: string, slot: number): Promise<void> {
  return api.delete<void>(`/teams/${teamId}/members/${slot}`)
}
