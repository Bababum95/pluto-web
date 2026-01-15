import { HugeiconsIcon } from "@hugeicons/react";
import {
  Moon02Icon,
  Sun02Icon,
  ComputerIcon,
} from "@hugeicons/core-free-icons";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/features/theme";
import { useTranslation } from "@/lib/i18n";

import type { Theme } from "../types";

type ThemeOption = {
  value: Theme;
  icon: typeof Sun02Icon;
};

const themes: ThemeOption[] = [
  { value: "light", icon: Sun02Icon },
  { value: "dark", icon: Moon02Icon },
  { value: "system", icon: ComputerIcon },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const currentTheme = themes.find((t) => t.value === theme) || themes[2];
  const CurrentIcon = currentTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="[&_svg]:size-5">
          <HugeiconsIcon icon={CurrentIcon} />
          <span className="sr-only">{t("settings.theme.changeTheme")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-42">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => setTheme(value as Theme)}
        >
          {themes.map((themeOption) => (
            <DropdownMenuRadioItem
              key={themeOption.value}
              value={themeOption.value}
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={themeOption.icon} className="size-4" />
                <span>{t(`settings.theme.${themeOption.value}`)}</span>
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
