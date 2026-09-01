import { describe, expect, it } from 'vitest'
import { RUNNING_START_WARN_AFTER, shouldWarnRunningStart } from './metricsDisplay'

describe('shouldWarnRunningStart', () => {
  it('is silent for a normal 0–5 farm', () => {
    for (const count of [0, 1, 2, 3, 4, 5]) {
      expect(shouldWarnRunningStart(count), String(count)).toBe(false)
    }
  })

  it('warns when the start would be the 7th or later', () => {
    expect(RUNNING_START_WARN_AFTER).toBe(6)
    expect(shouldWarnRunningStart(6)).toBe(true)
    expect(shouldWarnRunningStart(7)).toBe(true)
  })
})
