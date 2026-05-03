import { createFileRoute, Link } from '@tanstack/react-router'
import { useDexesQuery } from '@/hooks/useDexQuery'
import type { DexConfig } from '@/types/dex'
import styles from './index.module.css'

export const Route = createFileRoute('/_app/')({
  component: Dashboard,
})

// ── CompletionRing ─────────────────────────────────────────────────────────

interface CompletionRingProps {
  percent: number
  size?: number
  stroke?: number
  color?: string
}

function CompletionRing({
  percent,
  size = 96,
  stroke = 8,
  color = '#22c55e',
}: CompletionRingProps) {
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - percent / 100)

  return (
    <svg width={size} height={size} aria-label={`${percent}% complete`} role="img">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="1.1rem"
        fontWeight="700"
        fill="#1f2937"
      >
        {percent}%
      </text>
    </svg>
  )
}

// ── DexCard ────────────────────────────────────────────────────────────────

const GAME_LABELS: Record<string, string> = {
  home: 'Pokémon HOME',
  champions: 'Pokémon Champions',
  'scarlet-violet': 'Scarlet & Violet',
  'sword-shield': 'Sword & Shield',
  'brilliant-diamond-shining-pearl': 'Brilliant Diamond & Shining Pearl',
  'legends-arceus': 'Legends: Arceus',
  'ultra-sun-ultra-moon': 'Ultra Sun & Ultra Moon',
  'sun-moon': 'Sun & Moon',
  'omega-ruby-alpha-sapphire': 'Omega Ruby & Alpha Sapphire',
  'x-y': 'X & Y',
  'black-2-white-2': 'Black 2 & White 2',
  'black-white': 'Black & White',
  'heartgold-soulsilver': 'HeartGold & SoulSilver',
  'diamond-pearl-platinum': 'Diamond, Pearl & Platinum',
  'firered-leafgreen': 'FireRed & LeafGreen',
  'ruby-sapphire-emerald': 'Ruby, Sapphire & Emerald',
  'gold-silver-crystal': 'Gold, Silver & Crystal',
  'red-blue-yellow': 'Red, Blue & Yellow',
}

function DexCard({ dex }: { dex: DexConfig }) {
  const stats = dex.stats
  const ringColor = dex.isShiny ? '#f59e0b' : '#22c55e'

  return (
    <Link to="/dex/$dexId" params={{ dexId: dex.id }} className={styles.dexCard}>
      <div className={styles.dexCardTop}>
        <div className={styles.dexCardInfo}>
          <span className={styles.dexName}>{dex.name}</span>
          <span className={styles.dexGame}>
            {GAME_LABELS[dex.game] ?? dex.game}
            {dex.isShiny && ' ✨'}
          </span>
          {stats && (
            <span className={styles.dexCount}>
              {stats.caught.toLocaleString()} / {stats.total.toLocaleString()} forms
            </span>
          )}
        </div>
        {stats ? (
          <CompletionRing percent={stats.completionPercent} color={ringColor} />
        ) : (
          <div className={styles.ringSkeleton} />
        )}
      </div>

      <div className={styles.dexCardFooter}>
        <span className={styles.dexCardLink}>Open dex →</span>
      </div>
    </Link>
  )
}

// ── Dashboard ──────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  { to: '/pokedex/' as const, label: 'Pokédex', desc: 'Browse all species and forms' },
  { to: '/boxes/' as const, label: 'PC Boxes', desc: 'Organise your caught Pokémon' },
  { to: '/teams/' as const, label: 'Teams', desc: 'Build competitive teams' },
] as const

function Dashboard() {
  const { data: dexes, isLoading } = useDexesQuery()

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Dashboard</h1>

      {/* ── Dex trackers section ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Your Dexes</h2>
          <Link to="/dex/" className={styles.sectionLink}>
            Manage →
          </Link>
        </div>

        {isLoading ? (
          <div className={styles.dexGrid}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={styles.dexCardSkeleton} />
            ))}
          </div>
        ) : dexes && dexes.length > 0 ? (
          <div className={styles.dexGrid}>
            {dexes.map((dex) => (
              <DexCard key={dex.id} dex={dex} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>No dexes yet.</p>
            <Link to="/dex/" className={styles.emptyLink}>
              Create your first dex →
            </Link>
          </div>
        )}
      </section>

      {/* ── Quick links section ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Access</h2>
        <div className={styles.quickLinks}>
          {QUICK_LINKS.map(({ to, label, desc }) => (
            <Link key={to} to={to} className={styles.quickCard}>
              <span className={styles.quickLabel}>{label}</span>
              <span className={styles.quickDesc}>{desc}</span>
              <span className={styles.quickArrow}>→</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
