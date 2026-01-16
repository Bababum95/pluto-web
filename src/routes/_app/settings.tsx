import { createFileRoute } from "@tanstack/react-router";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/features/theme";
import { useTranslation } from "@/lib/i18n";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.title")}</CardTitle>
          <CardDescription>{t("settings.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium">
                  {t("settings.language.title")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("settings.language.description")}
                </p>
              </div>
              <LanguageSwitcher />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium">
                  {t("settings.theme.title")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("settings.theme.description")}
                </p>
              </div>
              <ThemeSwitcher />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
