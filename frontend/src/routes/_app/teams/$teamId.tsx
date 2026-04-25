import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { useTeamQuery, useUpsertTeamMember, useClearTeamMember, useUpdateTeam } from '@/hooks/useTeamsQuery'
import { usePokedexInfiniteQuery } from '@/hooks/usePokedexQuery'
import { getGameConfig, GAMES, NATURES, EV_STATS, STAT_LABELS } from '@/lib/gameConfig'
import { PokemonSprite } from '@/components/common/PokemonSprite'
import { TypeBadge } from '@/components/common/TypeBadge'
import { TeamTypeCoverage } from '@/components/teams/TeamTypeCoverage'
import type { TeamMember, UpsertTeamMemberDto } from '@/types/teams'
import type { PokemonSpecies } from '@/types/pokemon'
import styles from './$teamId.module.css'

export const Route = createFileRoute('/_app/teams/$teamId')({
  component: TeamDetailPage,
})

// ── Pokémon picker ───────────────────────────────────────────────────────────

function PokemonPicker({
  game,
  onSelect,
  onClose,
}: {
  game: string
  onSelect: (species: PokemonSpecies, formIndex: number) => void
  onClose: () => void
}) {
  const config = getGameConfig(game)
  const [search, setSearch] = useState('')
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    usePokedexInfiniteQuery({ search, ...config.speciesFilter })

  const species = data?.pages.flatMap((p) => p.data) ?? []

  return (
    <div className={styles.pickerBackdrop} onClick={onClose}>
      <div className={styles.picker} onClick={(e) => e.stopPropagation()}>
        <div className={styles.pickerHeader}>
          <h3 className={styles.pickerTitle}>Choose Pokémon</h3>
          <input
            className={styles.pickerSearch}
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <button className={styles.pickerClose} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.pickerGrid}>
          {isLoading
            ? Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className={styles.pickerSkeleton} />
              ))
            : species.map((s) =>
                s.forms.map((form, fi) => {
                  const url = form.spriteFrontUrl ?? form.spriteUrl
                  return (
                    <button
                      key={form.id}
                      className={styles.pickerItem}
                      onClick={() => { onSelect(s, fi); onClose() }}
                    >
                      <PokemonSprite url={url} alt={form.displayName} size={52} />
                      <span className={styles.pickerName}>{form.displayName}</span>
                      <div className={styles.pickerTypes}>
                        {form.type1 && <TypeBadge type={form.type1} size="sm" />}
                        {form.type2 && <TypeBadge type={form.type2} size="sm" />}
                      </div>
                    </button>
                  )
                }),
              )}
        </div>

        {hasNextPage && (
          <div className={styles.pickerMore}>
            <button
              className={styles.loadMoreBtn}
              onClick={() => void fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Member editor panel ──────────────────────────────────────────────────────

function MemberEditor({
  member,
  slot,
  teamId,
  game,
  onClose,
}: {
  member: TeamMember | null
  slot: number
  teamId: string
  game: string
  onClose: () => void
}) {
  const config = getGameConfig(game)
  const upsert = useUpsertTeamMember(teamId)
  const clear = useClearTeamMember(teamId)
  const [showPicker, setShowPicker] = useState(!member?.formId)

  const evMax = config.spSystem ? 32 : 252
  const evTotal = config.spSystem ? 66 : 508
  const evLabel = config.spSystem ? 'SP' : 'EV'

  const [formData, setFormData] = useState<UpsertTeamMemberDto>({
    formId: member?.formId ?? null,
    nickname: member?.nickname ?? null,
    isShiny: member?.isShiny ?? false,
    heldItem: member?.heldItem ?? null,
    ability: member?.ability ?? null,
    nature: member?.nature ?? null,
    move1: member?.move1 ?? null,
    move2: member?.move2 ?? null,
    move3: member?.move3 ?? null,
    move4: member?.move4 ?? null,
    evHp: member?.evHp ?? 0,
    evAtk: member?.evAtk ?? 0,
    evDef: member?.evDef ?? 0,
    evSpa: member?.evSpa ?? 0,
    evSpd: member?.evSpd ?? 0,
    evSpe: member?.evSpe ?? 0,
    ivHp: member?.ivHp ?? 31,
    ivAtk: member?.ivAtk ?? 31,
    ivDef: member?.ivDef ?? 31,
    ivSpa: member?.ivSpa ?? 31,
    ivSpd: member?.ivSpd ?? 31,
    ivSpe: member?.ivSpe ?? 31,
    teraType: member?.teraType ?? null,
    megaStone: member?.megaStone ?? null,
    zCrystal: member?.zCrystal ?? null,
    dynamaxLevel: member?.dynamaxLevel ?? null,
  })

  const [selectedForm, setSelectedForm] = useState(member?.form ?? null)

  const evUsed =
    (formData.evHp ?? 0) + (formData.evAtk ?? 0) + (formData.evDef ?? 0) +
    (formData.evSpa ?? 0) + (formData.evSpd ?? 0) + (formData.evSpe ?? 0)
  const evRemaining = evTotal - evUsed

  function handleEvChange(key: keyof UpsertTeamMemberDto, value: number) {
    const current = (formData[key] as number) ?? 0
    const delta = value - current
    if (evRemaining - delta < 0) return
    setFormData((f) => ({ ...f, [key]: value }))
  }

  function handlePickerSelect(species: PokemonSpecies, formIndex: number) {
    const picked = species.forms[formIndex]
    if (!picked) return
    setSelectedForm({
      id: picked.id,
      displayName: picked.displayName,
      type1: picked.type1,
      type2: picked.type2,
      spriteUrl: picked.spriteUrl,
      spriteFrontUrl: picked.spriteFrontUrl,
      spriteShinyUrl: picked.spriteShinyUrl,
      species: {
        id: species.id,
        displayName: species.displayName,
        nationalDexNumber: species.nationalDexNumber,
      },
    })
    setFormData((f) => ({ ...f, formId: picked.id }))
  }

  async function handleSave() {
    await upsert.mutateAsync({ slot, dto: formData })
    onClose()
  }

  async function handleClear() {
    await clear.mutateAsync(slot)
    onClose()
  }

  const spriteUrl = formData.isShiny
    ? (selectedForm?.spriteShinyUrl ?? selectedForm?.spriteFrontUrl ?? selectedForm?.spriteUrl)
    : (selectedForm?.spriteFrontUrl ?? selectedForm?.spriteUrl)

  const TERA_TYPES = ['Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison',
    'Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel','Fairy','Stellar']

  return (
    <>
      <div className={styles.editorBackdrop} onClick={onClose}>
        <div className={styles.editor} onClick={(e) => e.stopPropagation()}>
          <div className={styles.editorHeader}>
            <span className={styles.editorTitle}>Slot {slot}</span>
            <button className={styles.editorClose} onClick={onClose} aria-label="Close">✕</button>
          </div>

          <div className={styles.editorBody}>
            {/* Pokémon chooser */}
            <div className={styles.editorPoke}>
              <button className={styles.changePokeBtn} onClick={() => setShowPicker(true)}>
                {selectedForm ? (
                  <>
                    <PokemonSprite url={spriteUrl ?? null} alt={selectedForm.displayName} size={72} />
                    <div className={styles.pokeInfo}>
                      <span className={styles.pokeName}>{selectedForm.displayName}</span>
                      <div className={styles.pokeTypes}>
                        {selectedForm.type1 && <TypeBadge type={selectedForm.type1} size="sm" />}
                        {selectedForm.type2 && <TypeBadge type={selectedForm.type2} size="sm" />}
                      </div>
                    </div>
                    <span className={styles.changeHint}>Change</span>
                  </>
                ) : (
                  <span className={styles.choosePoke}>+ Choose Pokémon</span>
                )}
              </button>
              {selectedForm && (
                <label className={styles.shinyLabel}>
                  <input
                    type="checkbox"
                    checked={formData.isShiny ?? false}
                    onChange={(e) => setFormData((f) => ({ ...f, isShiny: e.target.checked }))}
                  />
                  ✨ Shiny
                </label>
              )}
            </div>

            {/* Core fields */}
            <div className={styles.editorGrid2}>
              <label className={styles.fieldLabel}>
                Nickname
                <input
                  className={styles.fieldInput}
                  value={formData.nickname ?? ''}
                  onChange={(e) => setFormData((f) => ({ ...f, nickname: e.target.value || null }))}
                  maxLength={12}
                  placeholder="Optional"
                />
              </label>
              <label className={styles.fieldLabel}>
                Nature{config.spSystem ? ' / Stat Alignment' : ''}
                <select
                  className={styles.fieldInput}
                  value={formData.nature ?? ''}
                  onChange={(e) => setFormData((f) => ({ ...f, nature: e.target.value || null }))}
                >
                  <option value="">— None —</option>
                  {NATURES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <label className={styles.fieldLabel}>
                Ability
                <input
                  className={styles.fieldInput}
                  value={formData.ability ?? ''}
                  onChange={(e) => setFormData((f) => ({ ...f, ability: e.target.value || null }))}
                  placeholder="e.g. Intimidate"
                />
              </label>
              <label className={styles.fieldLabel}>
                Held Item
                <input
                  className={styles.fieldInput}
                  value={formData.heldItem ?? ''}
                  onChange={(e) => setFormData((f) => ({ ...f, heldItem: e.target.value || null }))}
                  placeholder="e.g. Choice Scarf"
                />
              </label>
            </div>

            {/* Moves */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Moves</h4>
              <div className={styles.editorGrid2}>
                {(['move1', 'move2', 'move3', 'move4'] as const).map((m, i) => (
                  <label key={m} className={styles.fieldLabel}>
                    Move {i + 1}
                    <input
                      className={styles.fieldInput}
                      value={formData[m] ?? ''}
                      onChange={(e) => setFormData((f) => ({ ...f, [m]: e.target.value || null }))}
                      placeholder="—"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Game mechanic */}
            {config.mechanic && (
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>
                  {config.mechanic === 'tera' && 'Tera Type'}
                  {(config.mechanic === 'mega' || config.mechanic === 'omni-ring') && 'Mega'}
                  {config.mechanic === 'zmove' && 'Z-Move'}
                  {config.mechanic === 'dynamax' && 'Dynamax'}
                </h4>
                {config.mechanic === 'tera' && (
                  <select
                    className={styles.fieldInput}
                    value={formData.teraType ?? ''}
                    onChange={(e) => setFormData((f) => ({ ...f, teraType: e.target.value || null }))}
                  >
                    <option value="">— None —</option>
                    {TERA_TYPES.map((t) => <option key={t} value={t.toLowerCase()}>{t}</option>)}
                  </select>
                )}
                {(config.mechanic === 'mega' || config.mechanic === 'omni-ring') && (
                  <input
                    className={styles.fieldInput}
                    value={formData.megaStone ?? ''}
                    onChange={(e) => setFormData((f) => ({ ...f, megaStone: e.target.value || null }))}
                    placeholder={config.mechanic === 'omni-ring' ? 'Omni Ring or Charizardite X…' : 'e.g. Charizardite X'}
                  />
                )}
                {config.mechanic === 'zmove' && (
                  <input
                    className={styles.fieldInput}
                    value={formData.zCrystal ?? ''}
                    onChange={(e) => setFormData((f) => ({ ...f, zCrystal: e.target.value || null }))}
                    placeholder="e.g. Firium Z"
                  />
                )}
                {config.mechanic === 'dynamax' && (
                  <div className={styles.evRow}>
                    <span className={styles.evLabel}>Level</span>
                    <input
                      type="range" min={0} max={10}
                      value={formData.dynamaxLevel ?? 10}
                      onChange={(e) => setFormData((f) => ({ ...f, dynamaxLevel: Number(e.target.value) }))}
                      className={styles.evSlider}
                    />
                    <input
                      type="number" min={0} max={10}
                      value={formData.dynamaxLevel ?? 10}
                      onChange={(e) => setFormData((f) => ({ ...f, dynamaxLevel: Number(e.target.value) }))}
                      className={styles.evInput}
                    />
                  </div>
                )}
              </div>
            )}

            {/* EVs / SP */}
            <div className={styles.section}>
              <div className={styles.evHeader}>
                <h4 className={styles.sectionTitle}>{evLabel}s</h4>
                <span className={styles.evRemaining}>{evRemaining} / {evTotal} remaining</span>
              </div>
              <div className={styles.evGrid}>
                {EV_STATS.map((stat) => {
                  const key = `ev${stat.charAt(0).toUpperCase()}${stat.slice(1)}` as keyof UpsertTeamMemberDto
                  const val = (formData[key] as number) ?? 0
                  return (
                    <div key={stat} className={styles.evRow}>
                      <span className={styles.evLabel}>{STAT_LABELS[stat]}</span>
                      <input
                        type="range" min={0} max={evMax} step={config.spSystem ? 1 : 4}
                        value={val}
                        onChange={(e) => handleEvChange(key, Number(e.target.value))}
                        className={styles.evSlider}
                      />
                      <input
                        type="number" min={0} max={evMax}
                        value={val}
                        onChange={(e) => handleEvChange(key, Math.min(evMax, Number(e.target.value)))}
                        className={styles.evInput}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* IVs — hidden for Champions */}
            {!config.fixedIvs && (
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>IVs</h4>
                <div className={styles.evGrid}>
                  {EV_STATS.map((stat) => {
                    const key = `iv${stat.charAt(0).toUpperCase()}${stat.slice(1)}` as keyof UpsertTeamMemberDto
                    const val = (formData[key] as number | null) ?? 31
                    return (
                      <div key={stat} className={styles.evRow}>
                        <span className={styles.evLabel}>{STAT_LABELS[stat]}</span>
                        <input
                          type="range" min={0} max={31}
                          value={val}
                          onChange={(e) => setFormData((f) => ({ ...f, [key]: Number(e.target.value) }))}
                          className={styles.evSlider}
                        />
                        <input
                          type="number" min={0} max={31}
                          value={val}
                          onChange={(e) => setFormData((f) => ({ ...f, [key]: Math.min(31, Number(e.target.value)) }))}
                          className={styles.evInput}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className={styles.editorFooter}>
            {member?.formId && (
              <button className={styles.clearBtn} onClick={() => void handleClear()} disabled={clear.isPending}>
                Remove
              </button>
            )}
            <button
              className={styles.saveBtn}
              onClick={() => void handleSave()}
              disabled={!formData.formId || upsert.isPending}
            >
              {upsert.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {showPicker && (
        <PokemonPicker game={game} onSelect={handlePickerSelect} onClose={() => setShowPicker(false)} />
      )}
    </>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

function TeamDetailPage() {
  const { teamId } = Route.useParams()
  const { data: team, isLoading } = useTeamQuery(teamId)
  const updateTeam = useUpdateTeam(teamId)
  const [editingSlot, setEditingSlot] = useState<number | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')

  const handleNameSave = useCallback(async () => {
    if (!nameInput.trim() || !team || nameInput.trim() === team.name) {
      setEditingName(false)
      return
    }
    await updateTeam.mutateAsync({ name: nameInput.trim() })
    setEditingName(false)
  }, [nameInput, team, updateTeam])

  if (isLoading) return <div className={styles.page}><div className={styles.skeleton} /></div>
  if (!team) return <div className={styles.page}><p className={styles.notFound}>Team not found.</p></div>

  const config = getGameConfig(team.game)
  const editingMember = editingSlot ? (team.members.find((m) => m.slot === editingSlot) ?? null) : null

  const memberTypes = Array.from({ length: 6 }, (_, i) => {
    const m = team.members.find((mem) => mem.slot === i + 1)
    return { type1: m?.form?.type1 ?? null, type2: m?.form?.type2 ?? null }
  })

  return (
    <div className={styles.page}>
      <Link to="/teams/" className={styles.back}>← Back to Teams</Link>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {editingName ? (
            <input
              className={styles.nameInput}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={() => void handleNameSave()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleNameSave()
                if (e.key === 'Escape') setEditingName(false)
              }}
              autoFocus
              maxLength={50}
            />
          ) : (
            <h1
              className={styles.teamName}
              onClick={() => { setNameInput(team.name); setEditingName(true) }}
              title="Click to rename"
            >
              {team.name}
            </h1>
          )}

          <div className={styles.headerMeta}>
            <span className={styles.gameBadge}>{config.shortLabel}</span>
            <span className={styles.formatBadge}>{team.battleFormat}</span>
            {config.itemClause && <span className={styles.clauseBadge} title="No two Pokémon may hold the same item">Item Clause</span>}
            {config.spSystem && <span className={styles.spBadge} title="66 SP total / 32 max per stat">SP</span>}
            {config.fixedIvs && <span className={styles.ivBadge} title="All IVs treated as 31">No IVs</span>}
          </div>
        </div>

        {/* Game switcher */}
        <select
          className={styles.gameSelect}
          value={team.game}
          onChange={(e) => void updateTeam.mutateAsync({ game: e.target.value })}
          aria-label="Switch game"
        >
          {GAMES.map((g) => (
            <option key={g.key} value={g.key}>{g.label}</option>
          ))}
        </select>
      </div>

      {/* Team slots */}
      <div className={styles.slots}>
        {Array.from({ length: 6 }, (_, i) => {
          const slot = i + 1
          const member = team.members.find((m) => m.slot === slot)
          const url = member?.isShiny
            ? (member.form?.spriteShinyUrl ?? member.form?.spriteFrontUrl ?? member.form?.spriteUrl)
            : (member?.form?.spriteFrontUrl ?? member?.form?.spriteUrl)

          return (
            <button
              key={slot}
              className={`${styles.slot} ${member?.form ? styles.slotFilled : styles.slotEmpty}`}
              onClick={() => setEditingSlot(slot)}
              aria-label={member?.form ? `Edit slot ${slot}: ${member.form.displayName}` : `Add Pokémon to slot ${slot}`}
            >
              <span className={styles.slotNum}>{slot}</span>
              {member?.form ? (
                <>
                  <PokemonSprite url={url ?? null} alt={member.form.displayName} size={72} />
                  <div className={styles.slotInfo}>
                    <span className={styles.slotName}>{member.nickname ?? member.form.displayName}</span>
                    <div className={styles.slotTypes}>
                      {member.form.type1 && <TypeBadge type={member.form.type1} size="sm" />}
                      {member.form.type2 && <TypeBadge type={member.form.type2} size="sm" />}
                    </div>
                    {member.nature && <span className={styles.slotNature}>{member.nature}</span>}
                    {member.heldItem && <span className={styles.slotItem}>⊙ {member.heldItem}</span>}
                    {member.megaStone && <span className={styles.slotItem}>◎ {member.megaStone}</span>}
                    {member.teraType && <span className={styles.slotItem}>◇ {member.teraType}</span>}
                  </div>
                </>
              ) : (
                <div className={styles.slotAdd}>
                  <span className={styles.slotPlus}>+</span>
                  <span className={styles.slotAddLabel}>Add Pokémon</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Type coverage */}
      <div className={styles.coverage}>
        <h2 className={styles.coverageTitle}>Defensive Type Coverage</h2>
        <TeamTypeCoverage members={memberTypes} />
      </div>

      {editingSlot !== null && (
        <MemberEditor
          member={editingMember}
          slot={editingSlot}
          teamId={teamId}
          game={team.game}
          onClose={() => setEditingSlot(null)}
        />
      )}
    </div>
  )
}
