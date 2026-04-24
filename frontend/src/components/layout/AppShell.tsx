import { Outlet, Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import styles from './AppShell.module.css'

export function AppShell() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    await navigate({ to: '/auth/login' })
  }

  return (
    <div className={styles.shell}>
      <nav className={styles.sidebar}>
        <div className={styles.logo}>CamDex</div>
        <ul className={styles.navList}>
          <li><Link to="/" className={styles.navLink} activeProps={{ className: styles.navLinkActive }}>Dashboard</Link></li>
          <li><Link to="/living-dex/" className={styles.navLink} activeProps={{ className: styles.navLinkActive }}>Living Dex</Link></li>
          <li><Link to="/pokedex/" className={styles.navLink} activeProps={{ className: styles.navLinkActive }}>Pokédex</Link></li>
          <li><Link to="/boxes/" className={styles.navLink} activeProps={{ className: styles.navLinkActive }}>PC Boxes</Link></li>
          <li><Link to="/teams/" className={styles.navLink} activeProps={{ className: styles.navLinkActive }}>Teams</Link></li>
        </ul>
        <div className={styles.userSection}>
          <span className={styles.userEmail}>{user?.email}</span>
          <button className={styles.signOutButton} onClick={handleSignOut}>Sign out</button>
        </div>
      </nav>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
