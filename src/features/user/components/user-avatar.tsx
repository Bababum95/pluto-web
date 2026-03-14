import { useMemo, type FC } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { User02Icon } from '@hugeicons/core-free-icons'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type Props = {
  url?: string
  name?: string
}

export const UserAvatar: FC<Props> = ({ url, name }) => {
  const fallback = useMemo(() => {
    if (!name) {
      return <HugeiconsIcon icon={User02Icon} />
    }

    return name.charAt(0)
  }, [name])

  return (
    <Avatar size="lg">
      <AvatarImage src={url} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  )
}
