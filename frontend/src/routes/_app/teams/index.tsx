import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/teams/')({
  component: TeamsPage,
})

function TeamsPage() {
  return (
    <div>
      <h1>Teams</h1>
      <p>Team list coming in Phase 6.</p>
    </div>
  )
}
