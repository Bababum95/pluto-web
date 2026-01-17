import type { FC } from 'react'

import { Header } from '@/components/Header'
import { cn } from '@/lib/utils'

type Props = {
  children: React.ReactNode
  title?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export const AppLayout: FC<Props> = ({
  children,
  className,
  title,
  actions,
}) => {
  return (
    <>
      <Header title={title} actions={actions} />
      <main className={cn('flex flex-col gap-2 p-4', className)}>
        {children}
      </main>
    </>
  )
}
