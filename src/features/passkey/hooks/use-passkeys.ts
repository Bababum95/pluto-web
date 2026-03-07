import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useTranslation } from '@/lib/i18n'

import { fetchPasskeys, deletePasskey } from '../api'
import { PASSKEYS_QUERY_KEY } from './use-passkey-registration'

export function usePasskeys() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: PASSKEYS_QUERY_KEY,
    queryFn: fetchPasskeys,
  })

  const deleteMutation = useMutation({
    mutationFn: deletePasskey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PASSKEYS_QUERY_KEY })
      toast.success(t('passkey.deleted'))
    },
  })

  return {
    passkeys: query.data?.passkeys ?? [],
    isLoading: query.isLoading,
    remove: (id: string) => deleteMutation.mutateAsync(id),
    isDeleting: deleteMutation.isPending,
  }
}
