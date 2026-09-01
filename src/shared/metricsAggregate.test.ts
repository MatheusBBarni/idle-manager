import { describe, expect, it } from 'vitest'
import { hasGpuMetrics, summarizeAppMetrics, type AppMetricRow } from './metricsAggregate'

function row(type: string, percentCPUUsage: number, workingSetSize: number): AppMetricRow {
  return { type, cpu: { percentCPUUsage }, memory: { workingSetSize } }
}

describe('summarizeAppMetrics', () => {
  it('includes every process in totals and copies the GPU row when present', () => {
    const totals = summarizeAppMetrics([
      row('Browser', 1.5, 1000),
      row('Tab', 4, 2000),
      row('GPU', 2.25, 4000)
    ])
    expect(totals.cpu).toBe(7.75)
    expect(totals.memoryBytes).toBe((1000 + 2000 + 4000) * 1024)
    expect(totals.gpuCpu).toBe(2.25)
    expect(totals.gpuMemoryBytes).toBe(4000 * 1024)
  })

  it('sets gpu fields to null when no GPU process exists, not 0', () => {
    const totals = summarizeAppMetrics([row('Browser', 3, 512), row('Tab', 0, 256)])
    expect(totals.cpu).toBe(3)
    expect(totals.memoryBytes).toBe((512 + 256) * 1024)
    expect(totals.gpuCpu).toBeNull()
    expect(totals.gpuMemoryBytes).toBeNull()
    expect(totals.gpuCpu).not.toBe(0)
    expect(totals.gpuMemoryBytes).not.toBe(0)
    expect(hasGpuMetrics(totals)).toBe(false)
  })

  it('treats GPU as present only when both gpu fields are numbers', () => {
    expect(hasGpuMetrics({ gpuCpu: 1, gpuMemoryBytes: 2 })).toBe(true)
    expect(hasGpuMetrics({ gpuCpu: 0, gpuMemoryBytes: 0 })).toBe(true)
    expect(hasGpuMetrics({ gpuCpu: null, gpuMemoryBytes: 1 })).toBe(false)
    expect(hasGpuMetrics({ gpuCpu: 1, gpuMemoryBytes: null })).toBe(false)
  })
})
