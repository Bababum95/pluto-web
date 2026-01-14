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
import { useTheme } from "@/lib/hooks/useTheme";
import { useTranslation } from "@/lib/i18n";

type ThemeOption = {
  value: "light" | "dark" | "system";
  label: string;
  icon: typeof Sun02Icon;
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const themes: ThemeOption[] = [
    { value: "light", label: t("settings.theme.light"), icon: Sun02Icon },
    { value: "dark", label: t("settings.theme.dark"), icon: Moon02Icon },
    { value: "system", label: t("settings.theme.system"), icon: ComputerIcon },
  ];

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
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) =>
            setTheme(value as "light" | "dark" | "system")
          }
        >
          {themes.map((themeOption) => (
            <DropdownMenuRadioItem
              key={themeOption.value}
              value={themeOption.value}
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={themeOption.icon} className="size-4" />
                <span>{themeOption.label}</span>
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
