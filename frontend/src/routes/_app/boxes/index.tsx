import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/boxes/')({
  component: BoxesPage,
})

function BoxesPage() {
  return (
    <div>
      <h1>PC Boxes</h1>
      <p>Box management coming in Phase 5.</p>
    </div>
  )
}
