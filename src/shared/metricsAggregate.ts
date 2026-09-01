export type AppMetricRow = {
  type: string
  cpu: { percentCPUUsage: number }
  memory: { workingSetSize: number }
}

export type AggregateMetricTotals = {
  cpu: number
  memoryBytes: number
  gpuCpu: number | null
  gpuMemoryBytes: number | null
}

export function hasGpuMetrics(
  totals: Pick<AggregateMetricTotals, 'gpuCpu' | 'gpuMemoryBytes'>
): totals is { gpuCpu: number; gpuMemoryBytes: number } {
  return totals.gpuCpu != null && totals.gpuMemoryBytes != null
}

export function summarizeAppMetrics(rows: readonly AppMetricRow[]): AggregateMetricTotals {
  let cpu = 0
  let memoryBytes = 0
  let gpuCpu: number | null = null
  let gpuMemoryBytes: number | null = null

  for (const row of rows) {
    const rowCpu = row.cpu.percentCPUUsage
    const rowMem = row.memory.workingSetSize * 1024
    cpu += rowCpu
    memoryBytes += rowMem
    if (row.type === 'GPU') {
      gpuCpu = (gpuCpu ?? 0) + rowCpu
      gpuMemoryBytes = (gpuMemoryBytes ?? 0) + rowMem
    }
  }

  return { cpu, memoryBytes, gpuCpu, gpuMemoryBytes }
}
