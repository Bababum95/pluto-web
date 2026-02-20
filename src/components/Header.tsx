import dayjs from 'dayjs'
import { Link, useRouter } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { Menu01Icon, ArrowLeft02Icon } from '@hugeicons/core-free-icons'
import type { FC } from 'react'

import Logo from '@/assets/logo.svg?react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useTranslation } from '@/lib/i18n'
import { MENU_ITEMS } from '@/lib/constants'
import { cn } from '@/lib/utils'

type Props = {
  title?: React.ReactNode
  actions?: React.ReactNode
  showBackButton?: boolean
}

export const Header: FC<Props> = ({ title, actions, showBackButton }) => {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4 gap-2 relative">
        {showBackButton ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.navigate({
                to: '..',
                viewTransition: { types: ['slide-right'] },
              })
            }
            className="[&_svg]:size-6"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} />
            <span className="sr-only">{t('common.back')}</span>
          </Button>
        ) : (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="[&_svg]:size-6">
                <HugeiconsIcon icon={Menu01Icon} />
                <span className="sr-only">{t('common.toggleMenu')}</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <SheetHeader>
                <SheetTitle>
                  <Logo className="h-6 w-auto" />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col h-full pb-safe">
                {MENU_ITEMS.map(({ label, to, icon }) => (
                  <Link
                    to={to}
                    key={to}
                    viewTransition={{ types: ['slide-left'] }}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2 text-base transition-colors',
                      'data-[status=active]:text-primary data-[status=active]:bg-muted'
                    )}
                  >
                    <HugeiconsIcon icon={icon ?? Menu01Icon} size={20} />
                    {t(label)}
                  </Link>
                ))}
                <div className="mt-auto text-xs text-muted-foreground px-4 pb-4">
                  v{__APP_VERSION__} ·{' '}
                  {dayjs(__BUILD_DATE__).format('DD.MM.YYYY')}
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
