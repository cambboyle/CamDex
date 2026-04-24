import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/pokedex/')({
  component: PokedexPage,
})

function PokedexPage() {
  return (
    <div>
      <h1>Pokédex</h1>
      <p>Species browser coming in Phase 3.</p>
    </div>
  )
}
