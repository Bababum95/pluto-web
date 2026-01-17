import { createFileRoute } from '@tanstack/react-router'

import { AppLayout } from '@/components/AppLayout'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from '@/lib/i18n'
import { useHomePage, TABS, HomePageContent } from '@/features/home'
import { TimeRangeProvider } from '@/features/time-range'

export const Route = createFileRoute('/_app/')({
  component: HomePage,
})

function HomePage() {
  const { t } = useTranslation()
  const { activeTab, onTabChange } = useHomePage()

  return (
    <AppLayout className="pb-20">
      <TimeRangeProvider>
        <HomePageContent />
      </TimeRangeProvider>
      <Tabs
        value={activeTab}
        onValueChange={onTabChange}
        className="w-full fixed bottom-0 left-0 right-0 z-50 border-t bg-background"
      >
        <TabsList className="w-full h-12 rounded-none border-0 bg-background">
          {TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="flex-1 text-base">
              {t(`home.tabs.${tab}`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </AppLayout>
  )
}
