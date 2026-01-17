import { HugeiconsIcon } from '@hugeicons/react'
import { Globe02Icon } from '@hugeicons/core-free-icons'

import { useTranslation } from '@/lib/i18n'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

import { SUPPORTED_LANGUAGES } from '@/lib/i18n/config'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="[&_svg]:size-5">
          <HugeiconsIcon icon={Globe02Icon} />
          <span className="sr-only">
            {t('settings.language.changeLanguage')}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={i18n.language}
          onValueChange={i18n.changeLanguage}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <DropdownMenuRadioItem key={lang} value={lang}>
              {t(`language.${lang}`)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
