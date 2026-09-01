export const RUNNING_START_WARN_AFTER = 6

export function shouldWarnRunningStart(runningCountBeforeStart: number): boolean {
  return runningCountBeforeStart >= RUNNING_START_WARN_AFTER
}
