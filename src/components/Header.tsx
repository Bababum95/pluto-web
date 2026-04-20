import { Link, useRouter } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { Menu01Icon, ArrowLeft02Icon } from '@hugeicons/core-free-icons'
import type { FC } from 'react'

import dayjs from '@/lib/dayjs'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { NavUser } from '@/features/user'
import { useTranslation } from '@/lib/i18n'
import { MENU_ITEMS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export type HeaderProps = {
  title?: React.ReactNode
  actions?: React.ReactNode
  showBackButton?: boolean
  backPath?: string
}

export const Header: FC<HeaderProps> = ({
  title,
  actions,
  showBackButton,
  backPath,
}) => {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 backdrop-blur-lg">
      <div className="container flex h-14 items-center px-2 gap-2 relative">
        {showBackButton ? (
          <Button
            variant="ghost"
            size="icon"
            className="[&_svg]:size-6"
            onClick={() => {
              if (backPath) {
                router.navigate({
                  to: backPath,
                  viewTransition: { types: ['slide-right'] },
                })
              } else if (document.startViewTransition) {
                document.startViewTransition({
                  types: ['slide-right'],
                  update: () => router.history.back(),
                })
              } else {
                router.history.back()
              }
            }}
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} />
            <span className="sr-only">{t('common.navigation.back')}</span>
          </Button>
        ) : (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="[&_svg]:size-6">
                <HugeiconsIcon icon={Menu01Icon} />
                <span className="sr-only">
                  {t('common.navigation.toggleMenu')}
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              variant="liquid"
              onOpenAutoFocus={(e) => e.preventDefault()}
              aria-describedby={undefined}
              closable={false}
            >
              <SheetHeader className="pb-1">
                <SheetTitle>
                  <NavUser />
                </SheetTitle>
              </SheetHeader>
              <Separator className="bg-white/20 dark:bg-white/10" />
              <nav className="flex flex-col h-full">
                {MENU_ITEMS.map(({ label, to, icon }) => (
                  <Link
                    to={to}
                    key={to}
                    viewTransition={{ types: ['slide-left'] }}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2 text-base transition-colors',
                      'data-[status=active]:text-primary'
                    )}
                  >
                    <HugeiconsIcon icon={icon ?? Menu01Icon} size={20} />
                    {t(label)}
                  </Link>
                ))}
                <div className="mt-auto text-xs text-muted-foreground px-4 pb-4">
                  {`v ${__APP_VERSION__} · ${dayjs(__BUILD_DATE__).format('DD.MM.YYYY')}`}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        )}
        <div className="absolute left-1/2 -translate-x-1/2">{title}</div>
        <div className="ml-auto">{actions}</div>
      </div>
    </header>
  )
}
