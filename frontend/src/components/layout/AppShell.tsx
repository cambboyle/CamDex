import { Outlet, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import styles from './AppShell.module.css'

const NAV_ITEMS = [
  { to: '/' as const, label: 'Dashboard' },
  { to: '/living-dex/' as const, label: 'Living Dex' },
  { to: '/pokedex/' as const, label: 'Pokédex' },
  { to: '/boxes/' as const, label: 'PC Boxes' },
  { to: '/teams/' as const, label: 'Teams' },
]

export function AppShell() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  async function handleSignOut() {
    await signOut()
    await navigate({ to: '/auth/login' })
  }

  return (
    <div className={styles.shell}>
      {/* Mobile top bar */}
      <header className={styles.topBar}>
        <button
          className={styles.hamburger}
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={sidebarOpen}
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>
        <span className={styles.topBarLogo}>CamDex</span>
      </header>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <nav className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`} aria-label="Main navigation">
        <div className={styles.logo}>CamDex</div>
        <ul className={styles.navList}>
          {NAV_ITEMS.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={styles.navLink}
                activeProps={{ className: styles.navLinkActive }}
                onClick={() => setSidebarOpen(false)}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.userSection}>
          <span className={styles.userEmail} title={user?.email}>{user?.email}</span>
          <button className={styles.signOutButton} onClick={handleSignOut}>Sign out</button>
        </div>
      </nav>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
