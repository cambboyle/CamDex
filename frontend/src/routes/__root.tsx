import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import { RouteError } from '@/components/common/RouteError'
import { setupGlobalErrorTracking } from '@/lib/logger'

setupGlobalErrorTracking()

function NotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', textAlign: 'center',
      padding: '40px 24px', background: '#f5f5f7',
    }}>
      <div style={{ fontSize: '4rem', marginBottom: 12 }}>404</div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', margin: '0 0 8px' }}>
        Page not found
      </h1>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}>
        ← Back to Dashboard
      </Link>
    </div>
  )
}

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Analytics />
    </>
  ),
  errorComponent: ({ error }) => <RouteError error={error} />,
  notFoundComponent: NotFound,
})
