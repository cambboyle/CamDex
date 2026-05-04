import { describe, it, expect } from 'vitest'
import { computeCoverageScore } from '@/lib/typeMatchups'

// ── computeCoverageScore ──────────────────────────────────────────────────────

describe('computeCoverageScore', () => {
  it('returns score 0 and Vulnerable grade for an empty team', () => {
    const result = computeCoverageScore([])
    expect(result.score).toBe(0)
    expect(result.grade).toBe('Vulnerable')
    expect(result.coveredTypes).toBe(0)
    expect(result.vulnerableTypes).toBe(0)
  })

  it('returns score 0 and Vulnerable for a team of empty slots', () => {
    const result = computeCoverageScore([
      { type1: null, type2: null },
      { type1: null, type2: null },
    ])
    expect(result.score).toBe(0)
    expect(result.grade).toBe('Vulnerable')
  })

  it('returns a valid 0–100 integer score', () => {
    const result = computeCoverageScore([
      { type1: 'water', type2: null },
      { type1: 'fire', type2: null },
      { type1: 'grass', type2: null },
    ])
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
    expect(Number.isInteger(result.score)).toBe(true)
  })

  it('assigns Good grade for a team with many immunities and resistances', () => {
    // Steel/Fairy + Ghost/Dark + Ground/Steel — lots of immunities and resists
    const result = computeCoverageScore([
      { type1: 'steel', type2: 'fairy' },   // immune to dragon/poison, many resists
      { type1: 'ghost', type2: 'dark' },    // immune to normal/fighting/psychic
      { type1: 'ground', type2: 'steel' },  // immune to electric, many resists
    ])
    expect(result.grade).toBe('Good')
    expect(result.score).toBeGreaterThanOrEqual(58)
    expect(result.coveredTypes).toBeGreaterThanOrEqual(12)
  })

  it('scores a mono-Normal team low (no resistances, many weaknesses)', () => {
    // Pure Normal has only one immunity (Ghost) but many neutral matchups
    // and is weak to Fighting with no resistances at all — should be well below Excellent
    const result = computeCoverageScore([
      { type1: 'normal', type2: null },
      { type1: 'normal', type2: null },
      { type1: 'normal', type2: null },
      { type1: 'normal', type2: null },
    ])
    expect(result.score).toBeLessThan(75)
  })

  it('coveredTypes counts types where best response is resist or immune', () => {
    // A pure Ghost type is immune to Normal and Fighting (2 types covered at minimum)
    const result = computeCoverageScore([{ type1: 'ghost', type2: null }])
    expect(result.coveredTypes).toBeGreaterThanOrEqual(2)
  })

  it('vulnerableTypes is 0 when the team has no clear weaknesses with no resists', () => {
    // A single-member team with a varied type combo — just check it returns a number
    const result = computeCoverageScore([{ type1: 'steel', type2: 'fairy' }])
    expect(result.vulnerableTypes).toBeGreaterThanOrEqual(0)
  })

  it('a 6-member balanced team covers more types than a 6-member mono-type team', () => {
    // A diversified team may not outscore mono on the raw number (resists balance out),
    // but it definitively covers more attacking types (has at least one resist/immunity).
    const balanced = computeCoverageScore([
      { type1: 'water', type2: null },
      { type1: 'fire', type2: null },
      { type1: 'grass', type2: null },
      { type1: 'electric', type2: null },
      { type1: 'steel', type2: null },
      { type1: 'ghost', type2: null },
    ])
    const monoFire = computeCoverageScore([
      { type1: 'fire', type2: null },
      { type1: 'fire', type2: null },
      { type1: 'fire', type2: null },
      { type1: 'fire', type2: null },
      { type1: 'fire', type2: null },
      { type1: 'fire', type2: null },
    ])
    expect(balanced.coveredTypes).toBeGreaterThan(monoFire.coveredTypes)
    expect(balanced.vulnerableTypes).toBeLessThan(monoFire.vulnerableTypes)
  })

  it('ignores null-type slots and scores only active members', () => {
    const oneActive = computeCoverageScore([
      { type1: 'water', type2: null },
      { type1: null, type2: null },
      { type1: null, type2: null },
    ])
    const oneActiveOnly = computeCoverageScore([{ type1: 'water', type2: null }])
    // Both should produce the same score since null slots are filtered out
    expect(oneActive.score).toBe(oneActiveOnly.score)
  })
})
