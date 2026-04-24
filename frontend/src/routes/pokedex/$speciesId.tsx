import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pokedex/$speciesId')({
  component: SpeciesDetailPage,
})

function SpeciesDetailPage() {
  const { speciesId } = Route.useParams()
  return (
    <div>
      <h1>Species {speciesId}</h1>
      <p>Species detail coming in Phase 3.</p>
    </div>
  )
}
