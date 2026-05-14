import { clearUser, userRepository } from '@/entities/user'
import type { AppDispatch } from '@/app/store'
import { LOCAL_DATA_MODE } from '@/shared/lib/local-storage/config'
import { sessionRepository } from '@/shared/lib/local-storage/session-repository'
import { db } from '@/shared/lib/local-storage/db'

import { removeAccessToken } from './access-token'

/**
 * Clears access token, Redux user, and (in dexie mode) local user session data.
 * Used by AuthProvider.logout and by the API layer on 401 with a sent Bearer token.
 */
export async function clearClientSession(dispatch: AppDispatch): Promise<void> {
  removeAccessToken()
  dispatch(clearUser())

  if (LOCAL_DATA_MODE === 'dexie') {
    await userRepository.clear()
    await sessionRepository.clear()
    await db.outbox.where('entity').equals('user').delete()
  }
}
