import { createRootRoute, Outlet, redirect } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    if (location.pathname === '/auth/login') return
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      throw redirect({ to: '/auth/login', search: { redirect: location.pathname } })
    }
  },
  component: () => <Outlet />,
})
