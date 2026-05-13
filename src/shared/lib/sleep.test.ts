import { describe, expect, it, vi, afterEach } from 'vitest'

import { sleep } from './sleep'

describe('sleep utility', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('resolves after the requested delay', async () => {
    vi.useFakeTimers()
    const spy = vi.fn()

    const promise = sleep(50).then(spy)
    expect(spy).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(49)
    expect(spy).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    await promise
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
