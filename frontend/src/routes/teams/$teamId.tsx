import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/teams/$teamId')({
  component: TeamDetailPage,
})

function TeamDetailPage() {
  const { teamId } = Route.useParams()
  return (
    <div>
      <h1>Team {teamId}</h1>
      <p>Team builder coming in Phase 6.</p>
    </div>
  )
}
