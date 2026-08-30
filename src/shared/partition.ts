const PREFIX = 'persist:opsource-account-'

export function partitionForAccount(accountId: string): string {
  if (!accountId) {
    throw new Error('account id is required for a session partition')
  }
  return `${PREFIX}${accountId}`
}

export function isAccountPartition(partition: string): boolean {
  return partition.startsWith(PREFIX)
}
