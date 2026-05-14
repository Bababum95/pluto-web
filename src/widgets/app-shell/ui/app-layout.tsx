import { Header, type HeaderProps } from '@/widgets/header'
import { cn } from '@/shared/lib'

export type AppLayoutProps = HeaderProps & {
  children: React.ReactNode
  className?: string
}

export function AppLayout({
  children,
  className,
  ...headerProps
}: AppLayoutProps) {
  return (
    <>
      <Header {...headerProps} />
      <main className={cn('flex flex-1 flex-col gap-2 p-4', className)}>
        {children}
      </main>
    </>
  )
}
