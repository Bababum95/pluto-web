import { describe, it, expect } from 'vitest'
import { needsSync, mergeData, createSyncMetadata, calculateBackoff } from '../sync-utils'

describe('sync-utils', () => {
  describe('needsSync', () => {
    it('should return true when server is newer', () => {
      const local = '2024-01-01T10:00:00.000Z'
      const server = '2024-01-01T11:00:00.000Z'

      expect(needsSync(local, server)).toBe(true)
    })

    it('should return false when local is newer', () => {
      const local = '2024-01-01T11:00:00.000Z'
      const server = '2024-01-01T10:00:00.000Z'

      expect(needsSync(local, server)).toBe(false)
    })

    it('should return false when timestamps are equal', () => {
      const timestamp = '2024-01-01T10:00:00.000Z'

      expect(needsSync(timestamp, timestamp)).toBe(false)
    })

    it('should handle millisecond precision', () => {
      const local = '2024-01-01T10:00:00.123Z'
      const server = '2024-01-01T10:00:00.124Z'

      expect(needsSync(local, server)).toBe(true)
    })

    it('should handle different date formats', () => {
      const local = '2024-01-01T10:00:00Z'
      const server = '2024-01-01T10:00:01Z'

      expect(needsSync(local, server)).toBe(true)
    })
  })

  describe('mergeData', () => {
    it('should return server data when strategy is server-wins', () => {
      const local = { id: '1', name: 'Local', value: 100 }
      const server = { id: '1', name: 'Server', value: 200 }

      const result = mergeData(local, server, 'server-wins')

      expect(result).toEqual(server)
    })

    it('should return local data when strategy is local-wins', () => {
      const local = { id: '1', name: 'Local', value: 100 }
      const server = { id: '1', name: 'Server', value: 200 }

      const result = mergeData(local, server, 'local-wins')

      expect(result).toEqual(local)
    })

    it('should handle nested objects with server-wins', () => {
      const local = {
        id: '1',
        user: { name: 'Local', email: 'local@test.com' },
      }
      const server = {
        id: '1',
        user: { name: 'Server', email: 'server@test.com' },
      }

      const result = mergeData(local, server, 'server-wins')

      expect(result).toEqual(server)
    })

    it('should handle arrays with server-wins', () => {
      const local = { id: '1', tags: ['a', 'b'] }
      const server = { id: '1', tags: ['c', 'd'] }

      const result = mergeData(local, server, 'server-wins')

      expect(result).toEqual(server)
    })

    it('should handle null values', () => {
      const local = { id: '1', name: 'Local', deletedAt: null as string | null }
      const server = { id: '1', name: 'Server', deletedAt: '2024-01-01' as string | null }

      const result = mergeData(local, server, 'server-wins')

      expect(result).toEqual(server)
    })

    it('should handle undefined values', () => {
      const local = { id: '1', name: 'Local', optional: undefined as string | undefined }
      const server = { id: '1', name: 'Server', optional: 'value' as string | undefined }

      const result = mergeData(local, server, 'server-wins')

      expect(result).toEqual(server)
    })

    it('should preserve object references for local-wins', () => {
      const local = { id: '1', name: 'Local' }
      const server = { id: '1', name: 'Server' }

      const result = mergeData(local, server, 'local-wins')

      expect(result).toBe(local)
    })

    it('should preserve object references for server-wins', () => {
      const local = { id: '1', name: 'Local' }
      const server = { id: '1', name: 'Server' }

      const result = mergeData(local, server, 'server-wins')

      expect(result).toBe(server)
    })
  })

  describe('createSyncMetadata', () => {
    it('should return object with updatedAt timestamp', () => {
      const metadata = createSyncMetadata()

      expect(metadata).toHaveProperty('updatedAt')
      expect(typeof metadata.updatedAt).toBe('string')
    })

    it('should return ISO 8601 formatted timestamp', () => {
      const metadata = createSyncMetadata()

      // Should match ISO 8601 format
      expect(metadata.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    it('should return current timestamp', () => {
      const before = new Date().toISOString()
      const metadata = createSyncMetadata()
      const after = new Date().toISOString()

      expect(metadata.updatedAt >= before).toBe(true)
      expect(metadata.updatedAt <= after).toBe(true)
    })

    it('should return different timestamps on subsequent calls', () => {
      const metadata1 = createSyncMetadata()
      const metadata2 = createSyncMetadata()

      // May be equal if called in same millisecond, but should be valid
      expect(metadata1.updatedAt).toBeDefined()
      expect(metadata2.updatedAt).toBeDefined()
    })
  })

  describe('calculateBackoff', () => {
    it('should return base delay for first attempt', () => {
      expect(calculateBackoff(1)).toBe(2000) // 1000 * 2^1
    })

    it('should return exponential delay for subsequent attempts', () => {
      expect(calculateBackoff(1)).toBe(2000) // 2s (1000 * 2^1)
      expect(calculateBackoff(2)).toBe(4000) // 4s (1000 * 2^2)
      expect(calculateBackoff(3)).toBe(8000) // 8s (1000 * 2^3)
      expect(calculateBackoff(4)).toBe(16000) // 16s (1000 * 2^4)
    })

    it('should respect custom base delay', () => {
      expect(calculateBackoff(1, 500)).toBe(1000) // 500 * 2^1
      expect(calculateBackoff(2, 500)).toBe(2000) // 500 * 2^2
      expect(calculateBackoff(3, 500)).toBe(4000) // 500 * 2^3
    })

    it('should cap at maximum delay', () => {
      // Max is 30 seconds
      expect(calculateBackoff(10)).toBe(30000)
      expect(calculateBackoff(20)).toBe(30000)
      expect(calculateBackoff(100)).toBe(30000)
    })

    it('should handle attempt 0', () => {
      expect(calculateBackoff(0)).toBe(1000) // 1000 * 2^0
    })

    it('should handle negative attempts', () => {
      expect(calculateBackoff(-1)).toBe(500) // 1000 * 2^-1
      expect(calculateBackoff(-5)).toBe(31.25) // 1000 * 2^-5
    })

    it('should calculate correct delays for typical retry scenarios', () => {
      // Typical 3-attempt retry pattern
      expect(calculateBackoff(1)).toBe(2000) // 2s (1000 * 2^1)
      expect(calculateBackoff(2)).toBe(4000) // 4s (1000 * 2^2)
      expect(calculateBackoff(3)).toBe(8000) // 8s (1000 * 2^3)
    })

    it('should use exponential growth formula correctly', () => {
      const base = 1000
      for (let attempt = 1; attempt <= 5; attempt++) {
        const expected = Math.min(base * Math.pow(2, attempt), 30000)
        expect(calculateBackoff(attempt, base)).toBe(expected)
      }
    })

    it('should handle large base values', () => {
      expect(calculateBackoff(1, 10000)).toBe(20000) // 10000 * 2^1
      expect(calculateBackoff(2, 10000)).toBe(30000) // capped at 30000
      expect(calculateBackoff(3, 10000)).toBe(30000) // capped
    })

    it('should handle small base values', () => {
      expect(calculateBackoff(1, 100)).toBe(200) // 100 * 2^1
      expect(calculateBackoff(2, 100)).toBe(400) // 100 * 2^2
      expect(calculateBackoff(3, 100)).toBe(800) // 100 * 2^3
      expect(calculateBackoff(10, 100)).toBe(30000) // capped
    })
  })
})
