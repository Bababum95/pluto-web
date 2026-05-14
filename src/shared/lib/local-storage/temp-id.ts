/**
 * Generates a client-side temporary entity id for optimistic local-first creates.
 * Format: `temp-<uuid>` (see docs/LOCAL_FIRST.md).
 */
export function generateTempEntityId(): string {
  return `temp-${crypto.randomUUID()}`
}
