import { createFileRoute } from "@tanstack/react-router";

import { ChartPieDonutText } from "@/components/charts/chart-pie-donut-text";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TIME_RANGES } from "@/lib/constants";
import { useTranslation } from "@/lib/i18n";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
});

function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 p-4">
      <Card className="flex flex-col" size="sm">
        <CardHeader className="items-center pb-0">
          <Tabs>
            <TabsList>
              {TIME_RANGES.map((range) => (
                <TabsTrigger key={range} value={range}>
                  {t(`timeRanges.${range}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartPieDonutText total="104,25 $" />
        </CardContent>
      </Card>
    </div>
  );
}
