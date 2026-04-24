import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/living-dex/')({
  component: LivingDexPage,
})

function LivingDexPage() {
  return (
    <div>
      <h1>Living Form Dex</h1>
      <p>Living dex grid coming in Phase 4.</p>
    </div>
  )
}
