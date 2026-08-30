import { describe, expect, it } from 'vitest'
import {
  reduceUpdateStatus,
  type UpdateEvent,
  type UpdateStatus
} from './updateStatus'

const idle: UpdateStatus = { phase: 'idle' }
const getting: UpdateStatus = { phase: 'getting' }
const ready: UpdateStatus = { phase: 'ready', version: '1.2.3' }
const later: UpdateStatus = { phase: 'later', version: '1.2.3' }

const phases: UpdateStatus[] = [idle, getting, ready, later]

describe('reduceUpdateStatus', () => {
  it('moves idle to getting on checking, available, or progress', () => {
    expect(reduceUpdateStatus(idle, { type: 'checking' })).toEqual(getting)
    expect(reduceUpdateStatus(idle, { type: 'available', version: '1.2.3' })).toEqual(getting)
    expect(reduceUpdateStatus(idle, { type: 'progress' })).toEqual(getting)
  })

  it('moves getting to ready on downloaded with a version', () => {
    expect(reduceUpdateStatus(getting, { type: 'downloaded', version: '1.2.3' })).toEqual(ready)
  })

  it('moves ready to later with the same version', () => {
    expect(reduceUpdateStatus(ready, { type: 'later' })).toEqual(later)
  })

  it('keeps later when the same version is downloaded again', () => {
    expect(reduceUpdateStatus(later, { type: 'downloaded', version: '1.2.3' })).toEqual(later)
  })

  it('clears later to idle on reset', () => {
    expect(reduceUpdateStatus(later, { type: 'reset' })).toEqual(idle)
  })

  it('fail-closes every phase to idle on error, not-available, and reset', () => {
    const closing: UpdateEvent[] = [{ type: 'error' }, { type: 'not-available' }, { type: 'reset' }]
    for (const status of phases) {
      for (const event of closing) {
        expect(reduceUpdateStatus(status, event)).toEqual(idle)
      }
    }
  })

  it('does not treat later as a reduce from idle or getting', () => {
    expect(reduceUpdateStatus(idle, { type: 'later' })).toEqual(idle)
    expect(reduceUpdateStatus(getting, { type: 'later' })).toEqual(getting)
  })

  it('keeps getting while check/progress events continue', () => {
    expect(reduceUpdateStatus(getting, { type: 'checking' })).toEqual(getting)
    expect(reduceUpdateStatus(getting, { type: 'available', version: '9.0.0' })).toEqual(getting)
    expect(reduceUpdateStatus(getting, { type: 'progress' })).toEqual(getting)
  })

  it('does not regress ready or later into getting', () => {
    expect(reduceUpdateStatus(ready, { type: 'checking' })).toEqual(ready)
    expect(reduceUpdateStatus(ready, { type: 'progress' })).toEqual(ready)
    expect(reduceUpdateStatus(later, { type: 'checking' })).toEqual(later)
    expect(reduceUpdateStatus(later, { type: 'progress' })).toEqual(later)
  })

  it('promotes later to ready when a different version is downloaded', () => {
    expect(reduceUpdateStatus(later, { type: 'downloaded', version: '1.3.0' })).toEqual({
      phase: 'ready',
      version: '1.3.0'
    })
  })
})
