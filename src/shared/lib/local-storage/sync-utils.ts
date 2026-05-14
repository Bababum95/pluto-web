export function needsSync(
  localUpdatedAt: string,
  serverUpdatedAt: string
): boolean {
  const localTime = new Date(localUpdatedAt).getTime()
  const serverTime = new Date(serverUpdatedAt).getTime()

  return serverTime > localTime
}

export function calculateBackoff(
  attempt: number,
  baseMs: number = 1000
): number {
  return Math.min(baseMs * Math.pow(2, attempt), 30000)
}
