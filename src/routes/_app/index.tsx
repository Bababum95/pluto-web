import { createFileRoute } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { useState, type FC } from "react";

import dayjs from "@/lib/dayjs";
import { ChartPieDonutText } from "@/components/charts/chart-pie-donut-text";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TIME_RANGES } from "@/lib/constants";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
});

type TimeRange = (typeof TIME_RANGES)[number];

type TimeRangeDateLabelProps = {
  timeRange: Exclude<TimeRange, "period">;
  timeRangeIndex: number;
};

const TimeRangeDateLabel: FC<TimeRangeDateLabelProps> = ({
  timeRange,
  timeRangeIndex,
}) => {
  const { i18n } = useTranslation();

  if (timeRange === "week") {
    const start = dayjs().subtract(timeRangeIndex, "week").startOf("isoWeek");
    const end = start.endOf("isoWeek");

    return (
      <span className="text-sm font-medium">
        {start.locale(i18n.language).format("DD MMM")}
        {" – "}
        {end.locale(i18n.language).format("DD MMM")}
      </span>
    );
  }

  if (timeRange === "month") {
    return (
      <span className="text-sm font-medium">
        {dayjs()
          .subtract(timeRangeIndex, "month")
          .locale(i18n.language)
          .format("MMMM YYYY")}
      </span>
    );
  }

  if (timeRange === "year") {
    return (
      <span className="text-sm font-medium">
        {dayjs().subtract(timeRangeIndex, "year").format("YYYY")}
      </span>
    );
  }

  return (
    <span className="text-sm font-medium">
      {dayjs()
        .subtract(timeRangeIndex, timeRange)
        .locale(i18n.language)
        .format("DD MMMM")}
    </span>
  );
};

function HomePage() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<TimeRange>(TIME_RANGES[0]);
  const [timeRangeIndex, setTimeRangeIndex] = useState<number>(0);

  return (
    <div className="flex flex-col gap-4 p-4">
      <Card className="flex flex-col" size="sm">
        <CardHeader className="items-center pb-0">
          <Tabs
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
            className="items-center"
          >
            <TabsList>
              {TIME_RANGES.map((range) => (
                <TabsTrigger key={range} value={range}>
                  {t(`timeRanges.${range}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex gap-2 items-center justify-between">
            {timeRange !== "period" ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTimeRangeIndex(timeRangeIndex + 1)}
                  className="[&_svg]:size-5"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} />
                </Button>
                <TimeRangeDateLabel
                  timeRange={timeRange}
                  timeRangeIndex={timeRangeIndex}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="[&_svg]:size-5"
                  disabled={timeRangeIndex === 0}
                  onClick={() =>
                    setTimeRangeIndex(Math.max(0, timeRangeIndex - 1))
                  }
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} />
                </Button>
              </>
            ) : (
              <span className="text-sm font-medium">
                {t(`timeRanges.${timeRange}`)}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartPieDonutText total="104,25 $" />
        </CardContent>
      </Card>
    </div>
  );
}
