import { createFileRoute } from "@tanstack/react-router";

import { ChartPieDonutText } from "@/components/charts/chart-pie-donut-text";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TIME_RANGES } from "@/lib/constants";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Card className="flex flex-col" size="sm">
        <CardHeader className="items-center pb-0">
          <Tabs>
            <TabsList>
              {TIME_RANGES.map((r) => (
                <TabsTrigger key={r.value} value={r.value}>
                  {r.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartPieDonutText total="104,25 $" />
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 leading-none font-medium">
            Trending up by 5.2% this month
          </div>
          <div className="text-muted-foreground leading-none">
            Showing total visitors for the last 6 months
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
