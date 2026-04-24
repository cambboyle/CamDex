import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/')({
  component: Dashboard,
})

function Dashboard() {
  return (
    <div>
      <h1>CamDex Dashboard</h1>
      <p>Living dex progress coming soon.</p>
    </div>
  )
}
