import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { LOCAL_DATA_MODE } from '@/shared/lib/local-storage/config'
import { syncCoordinator } from '@/shared/lib/local-storage/sync-coordinator'

const SYNC_ERROR_TOAST_ID = 'sync-coordinator-error'

/**
 * Shows a deduplicated toast when background sync fails (dexie mode only).
 */
export function SyncErrorNotifier(): null {
  const { t } = useTranslation()
  const prevErrorRef = useRef<string | null>(null)

  useEffect(() => {
    if (LOCAL_DATA_MODE !== 'dexie') return undefined

    return syncCoordinator.onSyncStateChange((state) => {
      if (!state.error) {
        prevErrorRef.current = null
        toast.dismiss(SYNC_ERROR_TOAST_ID)
        return
      }

      if (prevErrorRef.current !== state.error) {
        prevErrorRef.current = state.error
        toast.error(t('sync.failed', { message: state.error }), {
          id: SYNC_ERROR_TOAST_ID,
        })
      }
    })
  }, [t])

  return null
}
