export const TEMP_ID_PREFIX = 'temp-'

/**
 * Generates a client-side temporary entity id for optimistic local-first creates.
 * Format: `TEMP_ID_PREFIX + <uuid>` (see docs/LOCAL_FIRST.md).
 */
export function generateTempEntityId(): string {
  return `${TEMP_ID_PREFIX}${crypto.randomUUID()}`
}

export function isTempEntityId(id: string): boolean {
  return id.startsWith(TEMP_ID_PREFIX)
}
