export function needsSync(
  localUpdatedAt: string,
  serverUpdatedAt: string
): boolean {
  const localTime = new Date(localUpdatedAt).getTime()
  const serverTime = new Date(serverUpdatedAt).getTime()

  return serverTime > localTime
}

export function mergeData<T>(
  local: T,
  server: T,
  strategy: 'server-wins' | 'local-wins' = 'server-wins'
): T {
  if (strategy === 'server-wins') {
    return server
  }

  return local
}

export function createSyncMetadata(): { updatedAt: string } {
  return {
    updatedAt: new Date().toISOString(),
  }
}

export function calculateBackoff(
  attempt: number,
  baseMs: number = 1000
): number {
  return Math.min(baseMs * Math.pow(2, attempt), 30000)
}
