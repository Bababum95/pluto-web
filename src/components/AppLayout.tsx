import type { FC } from 'react'

import { Header, type HeaderProps } from '@/components/Header'
import { cn } from '@/lib/utils'

type Props = HeaderProps & {
  children: React.ReactNode
  className?: string
}

export const AppLayout: FC<Props> = ({
  children,
  className,
  ...headerProps
}) => {
  return (
    <>
      <Header {...headerProps} />
      <main className={cn('flex flex-1 flex-col gap-2 p-4', className)}>
        {children}
      </main>
    </>
  )
}
