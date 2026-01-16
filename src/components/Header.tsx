import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n";

import Logo from "@/assets/logo.svg?react";
import { MENU_ITEMS } from "@/lib/constants";

export function Header() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4 gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="[&_svg]:size-6">
              <HugeiconsIcon icon={Menu01Icon} />
              <span className="sr-only">{t("common.toggleMenu")}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" onOpenAutoFocus={(e) => e.preventDefault()}>
            <SheetHeader>
              <SheetTitle>
                <Logo className="h-6 w-auto" />
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 px-4">
              {MENU_ITEMS.map(({ label, to }) => (
                <Link
                  to={to}
                  key={to}
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  {t(label)}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 flex-1">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-6 w-auto" />
          </Link>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
