import { describe, expect, it } from 'vitest'
import { isAccountPartition, partitionForAccount } from './partition'

describe('partition', () => {
  it('uses a persistent name bound to the account id, not a list index', () => {
    const first = partitionForAccount('acc-stable')
    const again = partitionForAccount('acc-stable')
    expect(first).toBe('persist:opsource-account-acc-stable')
    expect(again).toBe(first)
    expect(first.includes('0')).toBe(false)
    expect(isAccountPartition(first)).toBe(true)
  })

  it('does not collide across accounts', () => {
    expect(partitionForAccount('a')).not.toBe(partitionForAccount('b'))
  })
})
