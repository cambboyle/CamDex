import { describe, it, expect } from 'vitest'
import { toTitleCase, formatStatName, formatBall } from '@/lib/formatters'

describe('toTitleCase', () => {
  it('capitalises single word', () => {
    expect(toTitleCase('pikachu')).toBe('Pikachu')
  })

  it('capitalises hyphenated words', () => {
    expect(toTitleCase('alolan-raichu')).toBe('Alolan Raichu')
  })
})

describe('formatStatName', () => {
  it('maps known stat slugs', () => {
    expect(formatStatName('special-attack')).toBe('SpA')
    expect(formatStatName('hp')).toBe('HP')
    expect(formatStatName('speed')).toBe('Spe')
  })
})

describe('formatBall', () => {
  it('formats ball names', () => {
    expect(formatBall('poke-ball')).toBe('Poke Ball')
    expect(formatBall('master-ball')).toBe('Master Ball')
  })
})
