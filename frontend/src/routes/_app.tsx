import { createFileRoute, redirect } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/AppShell'
import { RouteError } from '@/components/common/RouteError'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: AppShell,
  errorComponent: ({ error }) => <RouteError error={error} />,
})
