import { Outlet, Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import styles from './AppShell.module.css'

const NAV_ITEMS = [
  {
    to: '/' as const,
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    to: '/dex/' as const,
    label: 'My Dexes',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    to: '/pokedex/' as const,
    label: 'Pokédex',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    to: '/teams/' as const,
    label: 'Teams',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="7" r="3" />
        <path d="M3 20v-1a6 6 0 0 1 6-6" />
        <circle cx="17" cy="7" r="3" />
        <path d="M13 14a6 6 0 0 1 8 5.5" />
      </svg>
    ),
  },
]

export function AppShell() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    await navigate({ to: '/auth/login' })
  }

  return (
    <div className={styles.shell}>
      {/* ── Desktop / tablet sidebar ── */}
      <nav className={styles.sidebar} aria-label="Main navigation">
        <div className={styles.logo}>CamDex</div>
        <ul className={styles.navList}>
          {NAV_ITEMS.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={styles.navLink}
                activeProps={{ className: styles.navLinkActive }}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.userSection}>
          <span className={styles.userEmail} title={user?.email}>{user?.email}</span>
          <button className={styles.signOutButton} onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className={styles.main}>
        <Outlet />
      </main>

      {/* ── Mobile bottom tab bar ── */}
      <nav className={styles.bottomNav} aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className={styles.bottomTab}
            activeProps={{ className: styles.bottomTabActive }}
          >
            <span className={styles.bottomTabIcon}>{icon}</span>
            <span className={styles.bottomTabLabel}>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
