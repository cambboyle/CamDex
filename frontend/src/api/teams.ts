import { api } from './client'
import type { Team, TeamMember, UpsertTeamMemberDto } from '@/types/teams'

export function getTeams(): Promise<Team[]> {
  return api.get<Team[]>('/teams')
}

export function createTeam(dto: { name: string; format?: string; notes?: string }): Promise<Team> {
  return api.post<Team>('/teams', dto)
}

export function updateTeam(id: string, dto: { name?: string; format?: string; notes?: string }): Promise<Team> {
  return api.patch<Team>(`/teams/${id}`, dto)
}

export function deleteTeam(id: string): Promise<void> {
  return api.delete<void>(`/teams/${id}`)
}

export function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  return api.get<TeamMember[]>(`/teams/${teamId}/members`)
}

export function upsertTeamMember(teamId: string, slot: number, dto: UpsertTeamMemberDto): Promise<TeamMember> {
  return api.put<TeamMember>(`/teams/${teamId}/members/${slot}`, dto)
}

export function clearTeamSlot(teamId: string, slot: number): Promise<void> {
  return api.delete<void>(`/teams/${teamId}/members/${slot}`)
}
