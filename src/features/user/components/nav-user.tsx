import { Link } from '@tanstack/react-router'
import { selectUser } from '@/store/slices/user'
import { useAppSelector } from '@/store'

import { UserAvatar } from './user-avatar'

export const NavUser = () => {
  const user = useAppSelector(selectUser)

  return (
    <Link
      to="/profile"
      className="flex gap-3 items-center"
      viewTransition={{ types: ['slide-left'] }}
    >
      <UserAvatar />
      <div className="grid flex-1 text-left leading-tight gap-0.5">
        <p className="truncate font-medium text-sm">{user?.name}</p>
        <p className="truncate text-xs font-normal text-muted-foreground">
          {user?.email}
        </p>
      </div>
    </Link>
  )
}
